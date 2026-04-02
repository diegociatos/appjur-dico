
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Save, Briefcase, Clock, Zap, Calculator, ShieldCheck, 
  TrendingUp, AlertCircle, CheckCircle2, ChevronRight, ListOrdered,
  DollarSign, Info, Search
} from 'lucide-react';
import { MonthlyBillingEntry, ClientContract, UserProfile } from '../types';

interface BillingSimplifiedListViewProps {
  entries: MonthlyBillingEntry[];
  contracts: ClientContract[];
  onUpdateEntries: (entries: MonthlyBillingEntry[]) => void;
  currentUser: UserProfile;
  onBack: () => void;
}

const BillingSimplifiedListView: React.FC<BillingSimplifiedListViewProps> = ({ 
  entries, contracts, onUpdateEntries, currentUser, onBack 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const currentMonth = '2026-02'; // Fixo para exemplo atual
  
  // Apenas rascunhos do mês atual para edição simplificada
  const [editableEntries, setEditableEntries] = useState<MonthlyBillingEntry[]>(
    entries.filter(e => e.month === currentMonth && e.status === 'RASCUNHO')
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const calculateRowTotal = (entry: MonthlyBillingEntry, contract: ClientContract) => {
    let subtotalProc = 0;
    let subtotalHours = 0;
    
    // Lógica Processos
    if (contract.planType === 'PAGUE_PELO_USO') {
      const band = contract.processPricingTable.find(b => 
        entry.totalReportedProcesses >= b.min && entry.totalReportedProcesses <= (b.max || Infinity)
      );
      subtotalProc = entry.totalReportedProcesses * (band?.pricePerProcess || 0);
    } else {
      const extra = Math.max(0, entry.totalReportedProcesses - contract.planIncludes.processesIncluded);
      const band = contract.processPricingTable.find(b => 
        entry.totalReportedProcesses >= b.min && entry.totalReportedProcesses <= (b.max || Infinity)
      );
      subtotalProc = extra * (band?.pricePerProcess || 0);
    }

    // Lógica Horas
    if (contract.planType === 'PAGUE_PELO_USO') {
      subtotalHours = entry.totalExecutedHours * contract.hourlyRates.pleno; // Simplificado para o grid
    } else {
      const extra = Math.max(0, entry.totalExecutedHours - contract.planIncludes.hoursIncluded);
      subtotalHours = extra * entry.hourlyRateUsed;
    }

    const perf = (entry.performanceBaseValue * entry.performancePercentage) / 100;
    
    return (contract.planType !== 'PAGUE_PELO_USO' ? entry.fixedMonthlyValue : 0) + 
           subtotalProc + subtotalHours + perf + entry.otherFees;
  };

  const handleInputChange = (id: string, field: keyof MonthlyBillingEntry, value: any) => {
    setEditableEntries(prev => prev.map(e => {
      if (e.id === id) {
        const contract = contracts.find(c => c.id === e.contractId);
        if (!contract) return e;
        
        const updated = { ...e, [field]: value };
        // Recalcular campos derivados
        const total = calculateRowTotal(updated, contract);
        return { ...updated, totalAmount: total };
      }
      return e;
    }));
  };

  const handleBulkSave = () => {
    onUpdateEntries(editableEntries);
    alert("Todos os rascunhos foram atualizados com sucesso!");
    onBack();
  };

  const filtered = editableEntries.filter(e => 
    e.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
           <button onClick={onBack} className="p-4 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-[#8B1538] shadow-sm transition-all"><ArrowLeft size={20}/></button>
           <div>
              <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">Esteira de Faturamento</h1>
              <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">Lançamento em lote para rascunhos provisionados</p>
           </div>
        </div>
        <button 
          onClick={handleBulkSave}
          className="flex items-center gap-3 bg-[#8B1538] text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-[#8B1538]/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Save size={20} /> Salvar Tudo
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 flex items-center gap-6">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" placeholder="Localizar cliente na esteira..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all"
            />
         </div>
         <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 flex items-center gap-3">
            <AlertCircle className="text-amber-500" size={18} />
            <span className="text-[10px] font-black text-amber-800 uppercase">Atenção aos Reajustes de Aniversário</span>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest sticky left-0 bg-gray-50/50 z-10">Cliente / Regra</th>
              <th className="px-6 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Fixo (R$)</th>
              <th className="px-6 py-6 text-[9px] font-black text-[#8B1538] uppercase tracking-widest text-center">Qtd Processos</th>
              <th className="px-6 py-6 text-[9px] font-black text-[#8B1538] uppercase tracking-widest text-center">Horas Consult.</th>
              <th className="px-6 py-6 text-[9px] font-black text-[#8B1538] uppercase tracking-widest text-center">Base Êxito (R$)</th>
              <th className="px-6 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Outros (R$)</th>
              <th className="px-10 py-6 text-[9px] font-black text-[#8B1538] uppercase tracking-widest text-right">Total Calculado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(entry => {
              const contract = contracts.find(c => c.id === entry.contractId);
              if (!contract) return null;
              
              // Alerta de reajuste (Exemplo: se a data de assinatura foi há 12, 24, 36 meses...)
              const sigDate = new Date(contract.signatureDate);
              const today = new Date();
              const isAnniversary = sigDate.getMonth() === today.getMonth();

              return (
                <tr key={entry.id} className="hover:bg-gray-50/10 transition-colors group">
                  <td className="px-8 py-6 sticky left-0 bg-white z-10 group-hover:bg-gray-50 transition-colors border-r border-gray-50">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-serif font-bold text-[#2D3748]">{entry.clientName}</span>
                        {isAnniversary && (
                          <div className="group/warn relative">
                            <TrendingUp size={14} className="text-amber-500 animate-pulse cursor-help" />
                            <div className="absolute left-full ml-2 top-0 w-48 p-3 bg-amber-600 text-white text-[9px] font-serif italic rounded-xl opacity-0 group-hover/warn:opacity-100 transition-opacity z-50 shadow-xl">
                              Aniversário do contrato detectado! Verifique se houve reajuste no valor fixo.
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{contract.planType.replace('_', ' ')}</span>
                    </div>
                  </td>

                  <td className="px-6 py-6 text-center">
                    <input 
                      type="number" 
                      value={entry.fixedMonthlyValue} 
                      onChange={e => handleInputChange(entry.id, 'fixedMonthlyValue', Number(e.target.value))}
                      className="w-24 bg-gray-50/50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-400 text-center focus:ring-2 focus:ring-[#8B1538]/10"
                    />
                  </td>

                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <input 
                        type="number" 
                        autoFocus
                        value={entry.totalReportedProcesses} 
                        onChange={e => handleInputChange(entry.id, 'totalReportedProcesses', Number(e.target.value))}
                        className="w-20 bg-white border-2 border-gray-100 rounded-xl px-3 py-3 text-sm font-black text-[#8B1538] text-center focus:border-[#8B1538] outline-none"
                      />
                      <span className="text-[8px] font-black text-gray-300 uppercase">Incluso: {contract.planIncludes.processesIncluded}</span>
                    </div>
                  </td>

                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <input 
                        type="number" step="0.5"
                        value={entry.totalExecutedHours} 
                        onChange={e => handleInputChange(entry.id, 'totalExecutedHours', Number(e.target.value))}
                        className="w-20 bg-white border-2 border-gray-100 rounded-xl px-3 py-3 text-sm font-black text-[#8B1538] text-center focus:border-[#8B1538] outline-none"
                      />
                      <span className="text-[8px] font-black text-gray-300 uppercase">Incluso: {contract.planIncludes.hoursIncluded}h</span>
                    </div>
                  </td>

                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                       <div className="relative">
                          <input 
                            type="number" 
                            value={entry.performanceBaseValue} 
                            onChange={e => handleInputChange(entry.id, 'performanceBaseValue', Number(e.target.value))}
                            className="w-32 bg-white border-2 border-gray-100 rounded-xl pl-8 pr-3 py-3 text-sm font-black text-[#8B1538] text-center focus:border-[#8B1538] outline-none"
                          />
                          <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"/>
                       </div>
                       <span className="text-[8px] font-black text-gray-300 uppercase">Taxa: {entry.performancePercentage}%</span>
                    </div>
                  </td>

                  <td className="px-6 py-6 text-center">
                    <input 
                      type="number" 
                      value={entry.otherFees} 
                      onChange={e => handleInputChange(entry.id, 'otherFees', Number(e.target.value))}
                      className="w-24 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-500 text-center"
                    />
                  </td>

                  <td className="px-10 py-6 text-right">
                    <div className="flex flex-col items-end">
                       <span className="text-lg font-serif font-black text-[#8B1538]">{formatCurrency(entry.totalAmount)}</span>
                       <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Rascunho Pendente</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
           <div className="p-32 text-center flex flex-col items-center opacity-30">
              <CheckCircle2 size={48} className="text-green-500 mb-4"/>
              <p className="font-serif italic text-lg">Nenhum rascunho pendente para faturar no período.</p>
           </div>
        )}
      </div>

      <div className="mt-12 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><Calculator size={28}/></div>
            <div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total da Esteira Atualizada</span>
               <span className="text-3xl font-serif font-bold text-[#2D3748]">
                  {formatCurrency(filtered.reduce((acc, e) => acc + e.totalAmount, 0))}
               </span>
            </div>
         </div>
         <div className="flex gap-4">
            <button onClick={onBack} className="px-10 py-4 border-2 border-gray-100 rounded-2xl font-black text-[10px] uppercase text-gray-400 hover:bg-gray-50 transition-all">Cancelar Lote</button>
            <button onClick={handleBulkSave} className="px-12 py-4 bg-[#8B1538] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all">Gravar e Finalizar Lote</button>
         </div>
      </div>
    </div>
  );
};

export default BillingSimplifiedListView;
