
import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, Search, Filter, MessageSquare, Phone, CheckCircle2, 
  Clock, Calendar, DollarSign, ArrowRight, Eye, History, Mail, 
  TrendingDown, ChevronRight, ShieldAlert, Users, Layers, ArrowUpRight,
  ArrowLeft, FileText, ExternalLink, CalendarDays, Calculator, TrendingUp,
  Info, Percent, Download
} from 'lucide-react';
import { MonthlyBillingEntry, ClientContract, UserProfile, AuditLog } from '../types';
import { createAuditLog, downloadFile } from '../utils/exportUtils';

interface InadimplenciaViewProps {
  entries: MonthlyBillingEntry[];
  contracts: ClientContract[];
  onUpdateEntry: (entry: MonthlyBillingEntry) => void;
  currentUser: UserProfile;
  onLogAudit: (log: AuditLog) => void;
}

const InadimplenciaView: React.FC<InadimplenciaViewProps> = ({ 
  entries, contracts = [], onUpdateEntry, currentUser, onLogAudit 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cliente' | 'fatura'>('cliente');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState<string>('Todos');
  
  const SYSTEM_DATE = new Date(2026, 1, 28); 
  const currentMonthStr = '2026-02'; 

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const calculateCorrection = (nominal: number, invoiceMonth: string, billingDay: number = 10) => {
    const [invYear, invMonth] = invoiceMonth.split('-').map(Number);
    const dueDate = new Date(invYear, invMonth - 1, billingDay);
    
    if (SYSTEM_DATE <= dueDate) {
      return { total: nominal, multa: 0, juros: 0, diasAtraso: 0, isVencida: false };
    }

    const multa = nominal * 0.02;
    const diffTime = Math.abs(SYSTEM_DATE.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const juros = nominal * (0.01 / 30) * diffDays;
    const total = nominal + multa + juros;

    return { total, multa, juros, diasAtraso: diffDays, isVencida: true };
  };

  const allDelinquentEntries = useMemo(() => {
    return entries.filter(e => e.status === 'FINALIZADO' && !e.isPaid);
  }, [entries]);

  const getBillingDay = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    return contract?.billingDay || 10;
  };

  const handleExportFull = () => {
    const headers = "Cliente;Referencia;Vencimento;Dias Atraso;Valor Nominal;Multa (2%);Juros (1% am);Total Atualizado\n";
    const rows = allDelinquentEntries.map(e => {
        const billingDay = getBillingDay(e.contractId);
        const corr = calculateCorrection(e.totalAmount, e.month, billingDay);
        return [
            e.clientName,
            e.month,
            `${billingDay}/${e.month.split('-')[1]}/${e.month.split('-')[0]}`,
            corr.diasAtraso,
            e.totalAmount.toFixed(2),
            corr.multa.toFixed(2),
            corr.juros.toFixed(2),
            corr.total.toFixed(2)
        ].join(";");
    }).join("\n");

    downloadFile(headers + rows, `Relatorio_Inadimplencia_Detalhado_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    onLogAudit(createAuditLog(currentUser, 'EXPORT_CSV', 'INADIMPLENCIA', 'Exportação completa de débitos com encargos.'));
  };

  const clientAgrupation = useMemo(() => {
    const map: Record<string, { 
      clientId: string; 
      clientName: string; 
      totalDebtNominal: number;
      totalMulta: number;
      totalJuros: number;
      totalDebtUpdated: number;
      oldestInvoiceDate: string;
      invoiceCount: number;
      invoices: (MonthlyBillingEntry & { updatedValue: number; multa: number; juros: number; diasAtraso: number })[]
    }> = {};

    allDelinquentEntries.forEach(e => {
      if (!map[e.clientId]) {
        map[e.clientId] = {
          clientId: e.clientId,
          clientName: e.clientName,
          totalDebtNominal: 0,
          totalMulta: 0,
          totalJuros: 0,
          totalDebtUpdated: 0,
          oldestInvoiceDate: e.month,
          invoiceCount: 0,
          invoices: []
        };
      }

      const item = map[e.clientId];
      const billingDay = getBillingDay(e.contractId);
      const correction = calculateCorrection(e.totalAmount, e.month, billingDay);
      
      item.invoiceCount += 1;
      item.totalDebtNominal += e.totalAmount;
      item.totalMulta += correction.multa;
      item.totalJuros += correction.juros;
      item.totalDebtUpdated += correction.total;
      
      item.invoices.push({
        ...e,
        updatedValue: correction.total,
        multa: correction.multa,
        juros: correction.juros,
        diasAtraso: correction.diasAtraso || 0
      });

      if (e.month < item.oldestInvoiceDate) {
        item.oldestInvoiceDate = e.month;
      }
    });

    return Object.values(map).filter(c => 
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.totalDebtUpdated - a.totalDebtUpdated);
  }, [allDelinquentEntries, searchTerm, contracts]);

  const selectedClientData = useMemo(() => {
    if (!selectedClientId) return null;
    return clientAgrupation.find(c => c.clientId === selectedClientId);
  }, [clientAgrupation, selectedClientId]);

  const stats = useMemo(() => {
    const total = clientAgrupation.reduce((acc, c) => acc + c.totalDebtUpdated, 0);
    const mesNominal = allDelinquentEntries
      .filter(e => e.month === currentMonthStr)
      .reduce((acc, e) => acc + e.totalAmount, 0);
    
    return { total, mesNominal, clientCount: clientAgrupation.length };
  }, [clientAgrupation, allDelinquentEntries]);

  const handleWhatsApp = (clientData: any) => {
    const msg = `Olá, somos do financeiro da Ciatos Jurídico.\n\nConstatamos pendências em aberto no valor total atualizado de *${formatCurrency(clientData.totalDebtUpdated)}*.\n\n*Composição do débito:*\n- Valor Nominal: ${formatCurrency(clientData.totalDebtNominal)}\n- Multa de Mora (2%): ${formatCurrency(clientData.totalMulta)}\n- Juros de Mora (1% a.m.): ${formatCurrency(clientData.totalJuros)}\n\nPoderia nos auxiliar com a regularização?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleLiquidarFatura = (entry: MonthlyBillingEntry) => {
    const updated: MonthlyBillingEntry = { ...entry, status: 'PAGO', isPaid: true };
    onUpdateEntry(updated);
    onLogAudit(createAuditLog(currentUser, 'CONFIRM_PAYMENT', entry.id, `Liquidação: ${entry.clientName} (Mês ${entry.month})`));
  };

  if (selectedClientId && selectedClientData) {
    return (
      <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => setSelectedClientId(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-[#8B1538] font-black text-[10px] uppercase tracking-widest transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:border-[#8B1538] shadow-sm">
              <ArrowLeft size={16} />
            </div>
            Voltar para Listagem
          </button>
          <div className="flex gap-4">
             <button 
               onClick={() => handleWhatsApp(selectedClientData)}
               className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
             >
               <MessageSquare size={16}/> Notificar Cobrança Detalhada
             </button>
          </div>
        </div>

        <div className="bg-[#8B1538] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden mb-12">
           <div className="absolute top-0 right-0 p-10 opacity-10"><ShieldAlert size={200}/></div>
           <div className="relative z-10 space-y-10">
              <div>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-2">Detalhamento Financeiro</span>
                <h2 className="text-4xl font-serif font-bold">{selectedClientData.clientName}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                 <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                    <span className="block text-[10px] font-black text-white/40 uppercase mb-1">Dívida Total</span>
                    <span className="text-3xl font-black">{formatCurrency(selectedClientData.totalDebtUpdated)}</span>
                 </div>
                 <div className="p-6">
                    <span className="block text-[10px] font-black text-white/40 uppercase mb-1">Base Nominal</span>
                    <span className="text-xl font-bold opacity-60 line-through">{formatCurrency(selectedClientData.totalDebtNominal)}</span>
                 </div>
                 <div className="p-6">
                    <span className="block text-[10px] font-black text-white/40 uppercase mb-1">Multa Acumulada</span>
                    <span className="text-xl font-bold text-amber-400">+{formatCurrency(selectedClientData.totalMulta)}</span>
                 </div>
                 <div className="p-6">
                    <span className="block text-[10px] font-black text-white/40 uppercase mb-1">Juros Acumulados</span>
                    <span className="text-xl font-bold text-amber-400">+{formatCurrency(selectedClientData.totalJuros)}</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Memória de Cálculo</h3>
           </div>
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fatura</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Nominal</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Multa (2%)</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Juros (1% am)</th>
                    <th className="px-8 py-6 text-[10px] font-black text-[#8B1538] uppercase tracking-widest text-right">Total Corrigido</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-serif">
                 {selectedClientData.invoices.sort((a,b) => b.month.localeCompare(a.month)).map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50/30 transition-colors group">
                       <td className="px-10 py-6">
                          <div className="flex flex-col">
                             <span className="text-[15px] font-bold text-gray-700">{inv.month}</span>
                             <span className="text-[9px] text-red-500 font-black uppercase">Atraso: {inv.diasAtraso} dias</span>
                          </div>
                       </td>
                       <td className="px-6 py-6 text-center text-sm text-gray-400 line-through">{formatCurrency(inv.totalAmount)}</td>
                       <td className="px-6 py-6 text-center text-xs font-bold text-amber-600">+{formatCurrency(inv.multa)}</td>
                       <td className="px-6 py-6 text-center text-xs font-bold text-amber-600">+{formatCurrency(inv.juros)}</td>
                       <td className="px-8 py-6 text-right">
                          <span className="text-lg font-black text-[#8B1538]">{formatCurrency(inv.updatedValue)}</span>
                       </td>
                       <td className="px-10 py-6 text-right">
                          <button onClick={() => handleLiquidarFatura(inv)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 shadow-md">Liquidar</button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-[#8B1538] leading-tight flex items-center gap-4">
            <ShieldAlert className="text-red-500" size={40} />
            Gestão de Inadimplência
          </h1>
          <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">Recuperação de ativos com cálculo automático de encargos moratórios</p>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={handleExportFull}
                className="flex items-center gap-3 bg-white border-2 border-[#8B1538]/10 text-[#8B1538] px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#8B1538]/5 transition-all shadow-sm"
            >
                <Download size={18}/> Exportar Relatório com Encargos
            </button>
            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                <button onClick={() => setViewMode('cliente')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'cliente' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Por Cliente</button>
                <button onClick={() => setViewMode('fatura')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'fatura' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Por Fatura</button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-inner"><TrendingDown size={24}/></div>
            <div>
               <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Recuperável Corrigido</span>
               <span className="text-2xl font-bold text-red-600">{formatCurrency(stats.total)}</span>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner"><Calendar size={24}/></div>
            <div>
               <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Nominal Vencido</span>
               <span className="text-2xl font-bold text-amber-600">{formatCurrency(allDelinquentEntries.reduce((acc,e)=>acc+e.totalAmount,0))}</span>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner"><TrendingUp size={24}/></div>
            <div>
               <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Encargos Totais</span>
               <span className="text-2xl font-bold text-purple-600">{formatCurrency(stats.total - allDelinquentEntries.reduce((acc,e)=>acc+e.totalAmount,0))}</span>
            </div>
         </div>
         <div className="bg-[#8B1538] p-8 rounded-[2.5rem] shadow-xl shadow-[#8B1538]/20 flex flex-col justify-center relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Users size={80}/></div>
            <div className="relative z-10">
               <span className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Clientes Devedores</span>
               <span className="text-2xl font-bold">{stats.clientCount} clientes</span>
            </div>
         </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row gap-6">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input type="text" placeholder="Filtrar por nome do cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none" />
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identificação</th>
              <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Faturas</th>
              <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Multa (2%)</th>
              <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Juros (1% am)</th>
              <th className="px-8 py-6 text-[10px] font-black text-[#8B1538] uppercase tracking-widest text-right">Total Corrigido</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clientAgrupation.map(c => (
              <tr key={c.clientId} className="hover:bg-gray-50/20 transition-colors group">
                <td className="px-10 py-6">
                  <div className="flex flex-col">
                    <span className="text-[15px] font-serif font-bold text-[#2D3748]">{c.clientName}</span>
                    <span className="text-[9px] text-red-500 font-black uppercase tracking-tighter">Vencimento mais antigo: {c.oldestInvoiceDate}</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-center text-xs font-bold text-gray-500">{c.invoiceCount}</td>
                <td className="px-6 py-6 text-center text-xs font-bold text-amber-600">+{formatCurrency(c.totalMulta)}</td>
                <td className="px-6 py-6 text-center text-xs font-bold text-amber-600">+{formatCurrency(c.totalJuros)}</td>
                <td className="px-8 py-6 text-right">
                   <span className="text-lg font-serif font-black text-red-600">{formatCurrency(c.totalDebtUpdated)}</span>
                </td>
                <td className="px-10 py-6 text-right">
                    <button onClick={() => setSelectedClientId(c.clientId)} className="flex items-center gap-2 bg-[#8B1538]/5 text-[#8B1538] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-[#8B1538] hover:text-white transition-all">Detalhar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InadimplenciaView;
