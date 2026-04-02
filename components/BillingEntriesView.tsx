
import React, { useState, useMemo } from 'react';
import { 
  Receipt, Plus, Search, Filter, Eye, Edit3, Download, Calendar, 
  ChevronRight, DollarSign, Clock, CheckCircle2, AlertCircle, FileText,
  Building2, ArrowRight, Wallet, Upload, CreditCard, Send, Lock, FileSpreadsheet,
  Zap, ListOrdered, RotateCcw
} from 'lucide-react';
import { MonthlyBillingEntry, Client, ClientContract, UserProfile, BillingStatus, AuditLog } from '../types';
import BillingEntryModal from './BillingEntryModal';
import BillingImportModal from './BillingImportModal';
import BillingInvoiceMirror from './BillingInvoiceMirror';
import { createAuditLog } from '../utils/exportUtils';

interface BillingEntriesViewProps {
  entries: MonthlyBillingEntry[];
  contracts: ClientContract[];
  clients: Client[];
  onAddEntry: (entry: MonthlyBillingEntry) => void;
  onUpdateEntry: (entry: MonthlyBillingEntry) => void;
  onBulkImport: (newContracts: ClientContract[], newEntries: MonthlyBillingEntry[]) => void;
  currentUser: UserProfile;
  onLogAudit: (log: AuditLog) => void;
  onNavigateToSimplified: () => void;
  onAutoProvision: (currentMonth: string, prevMonth: string) => void;
}

const BillingEntriesView: React.FC<BillingEntriesViewProps> = ({ 
  entries, contracts, clients, onAddEntry, onUpdateEntry, onBulkImport, currentUser, onLogAudit, onNavigateToSimplified, onAutoProvision 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMirrorOpen, setIsMirrorOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MonthlyBillingEntry | null>(null);
  const [selectedForMirror, setSelectedForMirror] = useState<MonthlyBillingEntry | null>(null);

  const isFinanceiro = currentUser.cargo === 'Financeiro';
  const isFinanceiroOrAdmin = currentUser.cargo === 'Administrador' || currentUser.cargo === 'Financeiro';

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = e.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'Todos' || e.status === filterStatus;
      
      if (isFinanceiro && e.status === 'RASCUNHO') return false;

      return matchesSearch && matchesStatus;
    });
  }, [entries, searchTerm, filterStatus, isFinanceiro]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getStatusBadge = (entry: MonthlyBillingEntry) => {
    if (entry.isPaid || entry.status === 'PAGO') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    
    switch (entry.status) {
      case 'FINALIZADO': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'ENVIADO': return 'bg-amber-50 text-amber-600 border-amber-100'; 
      case 'RASCUNHO': return 'bg-gray-50 text-gray-400 border-gray-100';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  const handleConfirmBilling = (entry: MonthlyBillingEntry) => {
    const updated: MonthlyBillingEntry = {
      ...entry,
      status: 'FINALIZADO',
      sentToFinanceAt: new Date().toISOString()
    };
    onUpdateEntry(updated);
    onLogAudit(createAuditLog(currentUser, 'API_EXPORT', entry.id, `Fatura marcada como Cobrada: ${entry.clientName}`));
    setIsMirrorOpen(false);
  };

  const handleMarkAsPaid = (entry: MonthlyBillingEntry) => {
    const updated: MonthlyBillingEntry = {
      ...entry,
      status: 'PAGO',
      isPaid: true
    };
    onUpdateEntry(updated);
    onLogAudit(createAuditLog(currentUser, 'CONFIRM_PAYMENT', entry.id, `Recebimento concluído: ${entry.clientName}`));
    setIsMirrorOpen(false);
    alert(`Recebimento de ${entry.clientName} confirmado com sucesso!`);
  };

  const handleRequestCorrection = (entry: MonthlyBillingEntry, reason: string) => {
    const updated: MonthlyBillingEntry = {
      ...entry,
      status: 'RASCUNHO',
      correctionRequestedAt: new Date().toISOString(),
      correctionReason: reason
    };
    onUpdateEntry(updated);
    onLogAudit(createAuditLog(currentUser, 'REQUEST_CORRECTION', entry.id, `Solicitação de correção financeira: ${reason}`));
    setIsMirrorOpen(false);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">
            {isFinanceiro ? 'Central de Cobrança' : 'Módulo de Faturamento'}
          </h1>
          <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">
            {isFinanceiro ? 'Processamento de recebíveis e liquidação de faturas' : 'Consolidação de produção e interface com financeiro'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {!isFinanceiro && (
            <>
              <button 
                onClick={() => onAutoProvision('2026-02', '2026-01')}
                className="flex items-center gap-3 bg-white border-2 border-[#8B1538]/10 text-[#8B1538] px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#8B1538]/5 transition-all shadow-sm"
                title="Clonar clientes faturados no mês anterior"
              >
                <RotateCcw size={18} /> Provisionar Mês Anterior
              </button>
              <button 
                onClick={onNavigateToSimplified}
                className="flex items-center gap-3 bg-amber-50 border-2 border-amber-100 text-amber-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all shadow-sm"
              >
                <ListOrdered size={18} /> Lançamento Simplificado
              </button>
              <button 
                onClick={() => { setEditingEntry(null); setIsModalOpen(true); }}
                className="flex items-center gap-3 bg-[#8B1538] text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={20} /> Novo Faturamento
              </button>
            </>
          )}
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner"><Clock size={24}/></div>
            <div>
               <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Aguardando Cobrança</span>
               <span className="text-2xl font-bold text-amber-600">{formatCurrency(entries.filter(e=>e.status==='ENVIADO').reduce((acc,e)=>acc+e.totalAmount, 0))}</span>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><FileSpreadsheet size={24}/></div>
            <div>
               <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Cobrado (Aguardando Pago)</span>
               <span className="text-2xl font-bold text-blue-600">{formatCurrency(entries.filter(e=>e.status==='FINALIZADO').reduce((acc,e)=>acc+e.totalAmount, 0))}</span>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner"><CheckCircle2 size={24}/></div>
            <div>
               <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Liquidado (Pago)</span>
               <span className="text-2xl font-bold text-emerald-600">{formatCurrency(entries.filter(e=>e.isPaid || e.status === 'PAGO').reduce((acc,e)=>acc+e.totalAmount, 0))}</span>
            </div>
         </div>
         <div className="bg-[#8B1538] p-8 rounded-[2.5rem] shadow-xl shadow-[#8B1538]/20 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Wallet size={80}/></div>
            <div className="relative z-10">
               <span className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Provisionamento Total</span>
               <span className="text-2xl font-bold text-white">{formatCurrency(entries.reduce((acc,e)=>acc+e.totalAmount, 0))}</span>
            </div>
         </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 flex flex-wrap gap-6 items-center">
         <div className="flex-1 relative min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" placeholder="Filtrar por cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all"
            />
         </div>
         <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer">
            <option value="Todos">Status: Todos</option>
            {!isFinanceiro && <option value="RASCUNHO">Rascunho</option>}
            <option value="ENVIADO">Aguardando Cobrança</option>
            <option value="FINALIZADO">Cobrado</option>
            <option value="PAGO">Liquidado (Pago)</option>
         </select>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente / Mês Ref.</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Valor Bruto</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Data Envio</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredEntries.map(entry => (
              <tr key={entry.id} className="hover:bg-gray-50/10 transition-colors group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-gray-100 ${entry.status === 'ENVIADO' ? 'text-amber-500' : (entry.isPaid || entry.status === 'PAGO') ? 'text-emerald-500' : 'text-blue-500'}`}>
                       {entry.status === 'ENVIADO' ? <Clock size={20}/> : (entry.isPaid || entry.status === 'PAGO') ? <CheckCircle2 size={20}/> : <CreditCard size={20}/>}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-serif font-bold text-[#2D3748]">{entry.clientName}</span>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{entry.month.split('-').reverse().join('/')}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                   <span className="text-lg font-serif font-black text-gray-700">{formatCurrency(entry.totalAmount)}</span>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="text-xs font-bold text-gray-400">
                    {entry.sentToFinanceAt ? new Date(entry.sentToFinanceAt).toLocaleDateString() : '—'}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight border ${getStatusBadge(entry)}`}>
                     {entry.isPaid || entry.status === 'PAGO' ? 'LIQUIDADO' : entry.status === 'FINALIZADO' ? 'COBRADO' : entry.status === 'ENVIADO' ? 'Aguard. Cobrança' : entry.status}
                  </span>
                </td>
                <td className="px-10 py-6 text-right">
                   <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isFinanceiroOrAdmin && (
                        <button 
                          onClick={() => { setSelectedForMirror(entry); setIsMirrorOpen(true); }}
                          className="flex items-center gap-2 bg-[#8B1538]/5 text-[#8B1538] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#8B1538] hover:text-white transition-all shadow-sm"
                        >
                           <Eye size={14}/> Ver Detalhes
                        </button>
                      )}
                      
                      {!isFinanceiro && entry.status === 'RASCUNHO' && (
                        <button 
                          onClick={() => { setEditingEntry(entry); setIsModalOpen(true); }}
                          className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                           <Edit3 size={18}/>
                        </button>
                      )}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <BillingEntryModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(entry) => {
            if (editingEntry) onUpdateEntry(entry);
            else onAddEntry(entry);
          }}
          entryToEdit={editingEntry}
          contracts={contracts}
          clients={clients}
          currentUser={currentUser}
        />
      )}

      {isMirrorOpen && selectedForMirror && (
        <BillingInvoiceMirror 
          isOpen={isMirrorOpen}
          entry={selectedForMirror}
          onClose={() => { setIsMirrorOpen(false); setSelectedForMirror(null); }}
          onConfirmBilling={() => handleConfirmBilling(selectedForMirror)}
          onMarkAsPaid={() => handleMarkAsPaid(selectedForMirror)}
          onRequestCorrection={(reason) => handleRequestCorrection(selectedForMirror, reason)}
          currentUser={currentUser}
        />
      )}

      <BillingImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirm={onBulkImport}
        currentEntries={entries}
        currentContracts={contracts}
        currentUser={currentUser}
      />
    </div>
  );
};

export default BillingEntriesView;
