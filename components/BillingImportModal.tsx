
import React, { useState } from 'react';
import { 
  X, Upload, FileText, Download, ShieldCheck, AlertCircle, CheckCircle2, 
  ChevronRight, Info, Database, Layers, ArrowRight, History
} from 'lucide-react';
import { ClientContract, MonthlyBillingEntry, UserProfile, ProcessPricingBand } from '../types';
import { calculateMonthlyBilling } from '../utils/billingEngine';

interface BillingImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (contracts: ClientContract[], entries: MonthlyBillingEntry[]) => void;
  currentEntries: MonthlyBillingEntry[];
  currentContracts: ClientContract[];
  currentUser: UserProfile;
}

const BillingImportModal: React.FC<BillingImportModalProps> = ({ 
  isOpen, onClose, onConfirm, currentEntries, currentContracts, currentUser 
}) => {
  const [csvText, setCsvText] = useState('');
  const [targetMonth, setTargetMonth] = useState('2026-02');
  const [step, setStep] = useState<'input' | 'preview' | 'finished'>('input');
  const [importResult, setImportResult] = useState<{
    newContracts: ClientContract[];
    updatedContracts: ClientContract[];
    newEntries: MonthlyBillingEntry[];
  } | null>(null);

  if (!isOpen) return null;

  // --- ANALISADORES DE EXCEL (PROTOTYPE) ---
  
  const parsePricingTable = (str: string): ProcessPricingBand[] => {
    // Exemplo esperado: "1-10: 150, 11-50: 120"
    const bands: ProcessPricingBand[] = [];
    const parts = str.split(',').map(p => p.trim());
    parts.forEach(p => {
      const match = p.match(/(\d+)-(\d+):\s*(\d+)/);
      if (match) {
        bands.push({ min: Number(match[1]), max: Number(match[2]), pricePerProcess: Number(match[3]) });
      }
    });
    return bands;
  };

  const parseHourlyRates = (str: string) => {
    // Exemplo: "ADV SÊNIOR=450,00/ PLENO=200,00/ADV JUNIOR=150,00"
    const senior = str.match(/SÊNIOR=(\d+)/)?.[1] || "450";
    const pleno = str.match(/PLENO=(\d+)/)?.[1] || "200";
    const junior = str.match(/JUNIOR=(\d+)/)?.[1] || "150";
    return { senior: Number(senior), pleno: Number(pleno), junior: Number(junior) };
  };

  const processData = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return alert("Planilha vazia ou inválida.");

    const headers = lines[0].split(';'); // Separador padrão CSV Excel PT-BR
    const newContracts: ClientContract[] = [];
    const updatedContracts: ClientContract[] = [];
    const newEntries: MonthlyBillingEntry[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';');
      if (cols.length < 5) continue;

      const clientName = cols[0].trim();
      const billingDay = Number(cols[1]) || 10;
      const monthlyFee = Number(cols[2].replace(',', '.')) || 0;
      const pricingStr = cols[3] || "";
      const hourlyStr = cols[4] || "";
      
      const totalProc = Number(cols[5]) || 0;
      const totalHours = Number(cols[6].replace(',', '.')) || 0;

      // 1. Lógica de Contrato (Merge ou New)
      let contract = currentContracts.find(c => c.clientName.toLowerCase() === clientName.toLowerCase());
      const isNew = !contract;

      const contractData: ClientContract = {
        id: contract?.id || `cont_imp_${Date.now()}_${i}`,
        clientId: contract?.clientId || `cli_imp_${Date.now()}_${i}`,
        clientName,
        planName: contract?.planName || `Plano ${clientName}`,
        planType: contract?.planType || 'VALOR_FIXO',
        billingDay,
        monthlyFee,
        processPricingTable: pricingStr ? parsePricingTable(pricingStr) : (contract?.processPricingTable || []),
        performanceFeeBands: contract?.performanceFeeBands || [],
        hourlyRates: hourlyStr ? parseHourlyRates(hourlyStr) : (contract?.hourlyRates || { senior: 450, pleno: 200, junior: 150 }),
        planIncludes: contract?.planIncludes || { hoursIncluded: 5, processesIncluded: 0 },
        signatureDate: contract?.signatureDate || new Date().toISOString(),
        expirationDate: contract?.expirationDate || '',
        // Fix: Added missing indiceReajuste property to match ClientContract type
        indiceReajuste: contract?.indiceReajuste || 'IPCA',
        currency: 'BRL'
      };

      if (isNew) newContracts.push(contractData);
      else updatedContracts.push(contractData);

      // 2. Lógica de Lançamento Mensal
      const calcResult = calculateMonthlyBilling({
        totalReportedProcesses: totalProc,
        totalExecutedHours: totalHours
      }, contractData);

      newEntries.push({
        id: `bill_imp_${Date.now()}_${i}`,
        contractId: contractData.id,
        clientId: contractData.clientId,
        clientName: contractData.clientName,
        month: targetMonth,
        fixedMonthlyValue: contractData.monthlyFee,
        totalReportedProcesses: totalProc,
        billableProcessCount: totalProc - contractData.planIncludes.processesIncluded,
        billableProcessValue: calcResult.processes.valor,
        // Fix: Added missing hours detail properties to satisfy MonthlyBillingEntry type
        hoursSenior: 0,
        hoursPleno: totalHours,
        hoursJunior: 0,
        totalExecutedHours: totalHours,
        hourlyRateType: 'pleno',
        hourlyRateUsed: contractData.hourlyRates.pleno,
        totalHoursValue: calcResult.hours.valor,
        performanceBaseValue: 0,
        performancePercentage: 0,
        performanceFeeValue: 0,
        otherFees: 0,
        totalAmount: calcResult.total,
        status: 'RASCUNHO',
        attachments: [],
        createdBy: `Importação Excel (${currentUser.nome})`,
        createdAt: new Date().toISOString()
      });
    }

    setImportResult({ newContracts, updatedContracts, newEntries });
    setStep('preview');
  };

  const handleApply = () => {
    if (!importResult) return;

    // --- BACKUP AUTOMÁTICO ANTES DE APLICAR ---
    const backup = {
      timestamp: new Date().toISOString(),
      contracts: currentContracts,
      entries: currentEntries
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ciatos_Backup_Financeiro_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    // Aplica alterações no App
    onConfirm([...importResult.newContracts, ...importResult.updatedContracts], importResult.newEntries);
    setStep('finished');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col font-serif-elegant">
        
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">Migração Estratégica de Dados</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Processamento massivo de planilhas táticas</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          {step === 'input' ? (
            <div className="space-y-8">
               <div className="bg-blue-50 p-6 rounded-[1.5rem] border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Info className="text-blue-500" size={24}/>
                     <div>
                        <p className="text-sm font-bold text-blue-900">Mapeamento Automático Ativo</p>
                        <p className="text-[10px] text-blue-700 italic">Coluna A: Cliente; B: Dia Venc.; C: Mensalidade; D: Faixas; E: Taxas Hora; F: Proc. Mês; G: Horas Mês.</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Período de Destino para Lançamentos</label>
                  <input type="month" value={targetMonth} onChange={e => setTargetMonth(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none" />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Dados Brutos (CSV/Ponto-e-vírgula)</label>
                  <textarea 
                    value={csvText} onChange={e => setCsvText(e.target.value)}
                    placeholder="Cole aqui os dados da sua planilha Excel..."
                    className="w-full h-64 bg-gray-50 border border-gray-100 rounded-[2.5rem] p-8 text-xs font-mono outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all"
                  />
               </div>
            </div>
          ) : step === 'preview' ? (
            <div className="space-y-10 animate-in fade-in">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                     <span className="block text-[9px] font-black text-gray-400 uppercase mb-1">Novos Contratos</span>
                     <span className="text-3xl font-bold text-blue-600">{importResult?.newContracts.length}</span>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                     <span className="block text-[9px] font-black text-gray-400 uppercase mb-1">Contratos Mesclados</span>
                     <span className="text-3xl font-bold text-amber-600">{importResult?.updatedContracts.length}</span>
                  </div>
                  <div className="bg-[#8B1538]/5 p-6 rounded-3xl border border-[#8B1538]/10">
                     <span className="block text-[9px] font-black text-[#8B1538] uppercase mb-1">Entradas Mensais</span>
                     <span className="text-3xl font-bold text-[#8B1538]">{importResult?.newEntries.length}</span>
                  </div>
               </div>

               <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 flex items-center gap-4">
                  <History className="text-amber-500" size={24}/>
                  <p className="text-xs font-serif italic text-amber-900 leading-relaxed">
                     <strong>Protocolo de Segurança:</strong> Ao clicar em aplicar, o sistema realizará um download de <strong>Backup (JSON)</strong> do seu estado atual antes de mesclar os novos dados.
                  </p>
               </div>

               <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-inner">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase">Prévia dos Lançamentos</div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                       <tbody className="divide-y divide-gray-50">
                          {importResult?.newEntries.map((e, i) => (
                            <tr key={i}>
                               <td className="px-6 py-3 font-bold text-gray-700">{e.clientName}</td>
                               <td className="px-6 py-3 text-gray-400">{e.totalReportedProcesses}p / {e.totalExecutedHours}h</td>
                               <td className="px-6 py-3 text-right font-black text-[#8B1538]">R$ {e.totalAmount.toFixed(2)}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
               </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-8 animate-in zoom-in">
               <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 size={48} />
               </div>
               <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-800">Importação Concluída!</h2>
                  <p className="text-sm text-gray-400 font-serif italic">Os contratos e lançamentos foram integrados com sucesso à base da Ciatos.</p>
               </div>
               <button onClick={onClose} className="px-12 py-4 bg-[#8B1538] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Retornar ao Faturamento</button>
            </div>
          )}
        </div>

        {step !== 'finished' && (
          <div className="p-10 border-t border-gray-100 bg-gray-50 flex gap-6">
            <button 
              type="button" onClick={onClose}
              className="flex-1 py-5 border-2 border-gray-200 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-white transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button 
              onClick={step === 'input' ? processData : handleApply}
              className="flex-1 py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[11px] uppercase shadow-xl shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {step === 'input' ? <><ChevronRight size={18}/> Analisar Planilha</> : <><ShieldCheck size={18}/> Aplicar e Salvar Backup</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingImportModal;
