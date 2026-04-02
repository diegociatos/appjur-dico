
import React, { useState } from 'react';
import { 
  X, Receipt, DollarSign, Clock, Layers, CheckCircle2, AlertCircle, 
  Download, FileText, Send, ArrowRight, Wallet, TrendingUp, Plus,
  ShieldCheck, History, Printer, CreditCard
} from 'lucide-react';
import { MonthlyBillingEntry, UserProfile } from '../types';

interface BillingInvoiceMirrorProps {
  isOpen: boolean;
  onClose: () => void;
  entry: MonthlyBillingEntry;
  onConfirmBilling: () => void;
  onMarkAsPaid: () => void;
  onRequestCorrection: (reason: string) => void;
  currentUser: UserProfile;
}

const BillingInvoiceMirror: React.FC<BillingInvoiceMirrorProps> = ({ 
  isOpen, onClose, entry, onConfirmBilling, onMarkAsPaid, onRequestCorrection, currentUser 
}) => {
  const [isCorrectionFormOpen, setIsCorrectionFormOpen] = useState(false);
  const [reason, setReason] = useState('');

  const isFinanceiro = currentUser.cargo === 'Financeiro' || currentUser.cargo === 'Administrador';

  if (!isOpen) return null;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return alert("Informe o motivo da correção.");
    onRequestCorrection(reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1500] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col font-serif-elegant">
        
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
              <Receipt size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">Espelho da Fatura Jurídica</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conferência de Lançamentos — Ref: {entry.month}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide bg-gray-50/20">
           
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Printer size={120}/></div>
              
              <div className="flex justify-between items-start">
                 <div>
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Cliente</span>
                    <h3 className="text-2xl font-serif font-black text-[#2D3748]">{entry.clientName}</h3>
                 </div>
                 <div className="text-right">
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Status de Faturamento</span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border 
                      ${entry.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : entry.status === 'ENVIADO' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                       {entry.isPaid ? 'LIQUIDADO / PAGO' : entry.status === 'ENVIADO' ? 'AGUARDANDO COBRANÇA' : 'COBRADO / PROCESSADO'}
                    </span>
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-[11px] font-black text-[#8B1538] uppercase tracking-widest border-b border-gray-50 pb-2">Composição dos Honorários</h4>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                       <div className="flex items-center gap-3">
                          <Wallet size={16} className="text-gray-400"/>
                          <span className="text-sm font-bold text-gray-600">Mensalidade Fixa (Plano)</span>
                       </div>
                       <span className="text-sm font-black text-gray-700">{formatCurrency(entry.fixedMonthlyValue)}</span>
                    </div>

                    <div className="flex justify-between items-center group">
                       <div className="flex items-center gap-3">
                          <Layers size={16} className="text-purple-400"/>
                          <span className="text-sm font-bold text-gray-600">Processos Excedentes ({entry.billableProcessCount} unid.)</span>
                       </div>
                       <span className="text-sm font-black text-gray-700">{formatCurrency(entry.billableProcessValue)}</span>
                    </div>

                    <div className="flex justify-between items-center group">
                       <div className="flex items-center gap-3">
                          <Clock size={16} className="text-blue-400"/>
                          <span className="text-sm font-bold text-gray-600">Horas Consultivas ({entry.totalExecutedHours}h — {entry.hourlyRateType})</span>
                       </div>
                       <span className="text-sm font-black text-gray-700">{formatCurrency(entry.totalHoursValue)}</span>
                    </div>

                    <div className="flex justify-between items-center group">
                       <div className="flex items-center gap-3">
                          <TrendingUp size={16} className="text-green-500"/>
                          <span className="text-sm font-bold text-gray-600">Honorários de Êxito / Performance</span>
                       </div>
                       <span className="text-sm font-black text-gray-700">{formatCurrency(entry.performanceFeeValue)}</span>
                    </div>

                    {entry.otherFees !== 0 && (
                      <div className="flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            <Plus size={16} className="text-amber-500"/>
                            <div>
                               <span className="text-sm font-bold text-gray-600">Outros Ajustes / Reembolsos</span>
                               <p className="text-[10px] text-gray-400 font-serif italic">Motivo: {entry.otherFeesReason}</p>
                            </div>
                        </div>
                        <span className="text-sm font-black text-gray-700">{formatCurrency(entry.otherFees)}</span>
                      </div>
                    )}
                 </div>

                 <div className="pt-8 mt-8 border-t-2 border-gray-50 flex justify-between items-end">
                    <div>
                       <span className="block text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Relator (Gestora)</span>
                       <span className="text-xs font-bold text-gray-500">{entry.createdBy}</span>
                    </div>
                    <div className="text-right">
                       <span className="block text-[11px] font-black text-[#8B1538] uppercase tracking-[0.3em] mb-2">Total Consolidado</span>
                       <span className="text-5xl font-serif font-black text-[#8B1538] leading-none">{formatCurrency(entry.totalAmount)}</span>
                    </div>
                 </div>
              </div>
           </div>

           {isCorrectionFormOpen && (
             <form onSubmit={handleCorrectionSubmit} className="animate-in slide-in-from-top-4 bg-red-50 p-8 rounded-[2.5rem] border border-red-100 space-y-6">
                <div className="flex items-center gap-3 text-red-600">
                   <AlertCircle size={20}/>
                   <h4 className="text-[11px] font-black uppercase tracking-widest">Solicitação de Ajuste de Lançamento</h4>
                </div>
                <textarea 
                  required value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Informe detalhadamente qual inconsistência foi encontrada (ex: valor de êxito incorreto, horas duplicadas...)"
                  className="w-full bg-white border border-red-200 rounded-2xl p-6 text-sm h-32 outline-none focus:ring-4 focus:ring-red-500/5 transition-all font-serif"
                />
                <div className="flex gap-4">
                   <button type="button" onClick={() => setIsCorrectionFormOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-red-400 hover:underline">Cancelar</button>
                   <button type="submit" className="flex-[2] py-4 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
                      <Send size={16}/> Enviar Devolução para Gestora
                   </button>
                </div>
             </form>
           )}
        </div>

        <div className="p-10 border-t border-gray-100 bg-white flex flex-col md:flex-row gap-6">
          {!isCorrectionFormOpen && !entry.isPaid && (
            <>
              <button 
                onClick={() => setIsCorrectionFormOpen(true)}
                className="flex-1 py-5 border-2 border-red-100 text-red-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-3"
              >
                 <AlertCircle size={18}/> Solicitar Correção
              </button>
              
              {isFinanceiro && entry.status === 'ENVIADO' && (
                <button 
                  onClick={onConfirmBilling}
                  className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                >
                   <Send size={18}/> Confirmar Cobrança
                </button>
              )}

              {isFinanceiro && entry.status === 'FINALIZADO' && (
                <button 
                  onClick={onMarkAsPaid}
                  className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                   <CheckCircle2 size={20} fill="white"/> Confirmar Recebimento (Liquidar)
                </button>
              )}
            </>
          )}
          {entry.isPaid && (
            <div className="w-full p-6 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center justify-center gap-3">
               <ShieldCheck size={24}/>
               <span className="font-serif font-bold">Esta fatura já foi liquidada financeiramente.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingInvoiceMirror;
