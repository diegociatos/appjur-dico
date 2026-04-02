
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Receipt, DollarSign, Clock, Layers, Save, CheckCircle2, AlertCircle, 
  Info, TrendingUp, Briefcase, FileCheck2, Calculator, ArrowRight, ShieldCheck,
  History, Percent, Wallet, Send, Plus, UserCheck, Paperclip, Trash2, FileText,
  Calendar, Upload
} from 'lucide-react';
import { MonthlyBillingEntry, ClientContract, Client, UserProfile, BillingStatus } from '../types';

interface BillingEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: MonthlyBillingEntry) => void;
  entryToEdit?: MonthlyBillingEntry | null;
  contracts: ClientContract[];
  clients: Client[];
  currentUser: UserProfile;
}

const BillingEntryModal: React.FC<BillingEntryModalProps> = ({ isOpen, onClose, onSave, entryToEdit, contracts, clients, currentUser }) => {
  const [formData, setFormData] = useState<Omit<MonthlyBillingEntry, 'id' | 'createdAt' | 'createdBy'>>({
    contractId: '',
    clientId: '',
    clientName: '',
    month: '2026-02',
    fixedMonthlyValue: 0,
    totalReportedProcesses: 0,
    billableProcessCount: 0,
    billableProcessValue: 0,
    hoursSenior: 0,
    hoursPleno: 0,
    hoursJunior: 0,
    totalExecutedHours: 0,
    hourlyRateType: 'pleno',
    hourlyRateUsed: 0,
    totalHoursValue: 0,
    performanceBaseValue: 0,
    performancePercentage: 0,
    performanceFeeValue: 0,
    otherFees: 0,
    otherFeesReason: '',
    totalAmount: 0,
    status: 'RASCUNHO',
    attachments: []
  });

  const [filterPlanType, setFilterPlanType] = useState<string>('Todos');

  const isLocked = entryToEdit?.status === 'ENVIADO' || entryToEdit?.status === 'PAGO';
  
  const selectedContract = useMemo(() => 
    contracts.find(c => c.id === formData.contractId), 
  [formData.contractId, contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => filterPlanType === 'Todos' || c.planType === filterPlanType);
  }, [contracts, filterPlanType]);

  // --- MOTOR DE CÁLCULO DINÂMICO ---
  const totals = useMemo(() => {
    if (!selectedContract) return { procExtra: 0, hoursExtra: 0, unitPrice: 0, subtotalProc: 0, subtotalHours: 0, subtotalPerf: 0, grandTotal: 0 };

    let subtotalProc = 0;
    let subtotalHours = 0;
    let procExtra = 0;
    let hoursExtra = 0;
    let unitPrice = 0;

    // 1. Lógica de Processos
    if (selectedContract.planType === 'PAGUE_PELO_USO') {
      const band = selectedContract.processPricingTable.find(b => 
        formData.totalReportedProcesses >= b.min && formData.totalReportedProcesses <= (b.max || Infinity)
      );
      unitPrice = band ? band.pricePerProcess : 0;
      subtotalProc = formData.totalReportedProcesses * unitPrice;
    } else {
      const includedProc = selectedContract.planIncludes.processesIncluded;
      procExtra = Math.max(0, formData.totalReportedProcesses - includedProc);
      const band = selectedContract.processPricingTable.find(b => 
        formData.totalReportedProcesses >= b.min && formData.totalReportedProcesses <= (b.max || Infinity)
      );
      unitPrice = band ? band.pricePerProcess : 0;
      subtotalProc = procExtra * unitPrice;
    }

    // 2. Lógica de Horas
    if (selectedContract.planType === 'PAGUE_PELO_USO') {
      subtotalHours = (formData.hoursSenior * selectedContract.hourlyRates.senior) +
                      (formData.hoursPleno * selectedContract.hourlyRates.pleno) +
                      (formData.hoursJunior * selectedContract.hourlyRates.junior);
    } else {
      const totalUsed = formData.totalExecutedHours;
      const includedHours = selectedContract.planIncludes.hoursIncluded;
      hoursExtra = Math.max(0, totalUsed - includedHours);
      subtotalHours = hoursExtra * formData.hourlyRateUsed;
    }

    // 3. Performance / Êxito
    const subtotalPerf = (formData.performanceBaseValue * formData.performancePercentage) / 100;

    // 4. Total Geral
    const grandTotal = (selectedContract.planType !== 'PAGUE_PELO_USO' ? formData.fixedMonthlyValue : 0) + 
                       subtotalProc + subtotalHours + subtotalPerf + formData.otherFees;

    return { procExtra, hoursExtra, unitPrice, subtotalProc, subtotalHours, subtotalPerf, grandTotal };
  }, [formData, selectedContract]);

  // Sincronizar dados do contrato quando selecionado
  useEffect(() => {
    if (selectedContract && !entryToEdit) {
      setFormData(prev => ({
        ...prev,
        fixedMonthlyValue: selectedContract.monthlyFee,
        hourlyRateUsed: selectedContract.hourlyRates.pleno,
        performancePercentage: selectedContract.performanceFeeBands[0]?.percentage || 0
      }));
    }
  }, [selectedContract, entryToEdit]);

  useEffect(() => {
    if (isOpen) {
      if (entryToEdit) {
        setFormData({ ...entryToEdit });
      } else {
        setFormData({
          contractId: '', clientId: '', clientName: '', month: '2026-02',
          fixedMonthlyValue: 0, totalReportedProcesses: 0, billableProcessCount: 0,
          billableProcessValue: 0, hoursSenior: 0, hoursPleno: 0, hoursJunior: 0,
          totalExecutedHours: 0, hourlyRateType: 'pleno', hourlyRateUsed: 0,
          totalHoursValue: 0, performanceBaseValue: 0, performancePercentage: 0,
          performanceFeeValue: 0, otherFees: 0, otherFeesReason: '',
          totalAmount: 0, status: 'RASCUNHO', attachments: []
        });
      }
    }
  }, [isOpen, entryToEdit]);

  if (!isOpen) return null;

  const handleSave = (finalStatus: BillingStatus) => {
    if (!formData.contractId) return alert("Selecione um contrato");
    
    onSave({
      ...formData,
      id: entryToEdit ? entryToEdit.id : `bill_${Date.now()}`,
      billableProcessCount: totals.procExtra,
      billableProcessValue: totals.subtotalProc,
      totalHoursValue: totals.subtotalHours,
      performanceFeeValue: totals.subtotalPerf,
      totalAmount: totals.grandTotal,
      status: finalStatus,
      createdBy: entryToEdit ? entryToEdit.createdBy : currentUser.nome,
      createdAt: entryToEdit ? entryToEdit.createdAt : new Date().toISOString(),
      sentToFinanceAt: finalStatus === 'ENVIADO' ? new Date().toISOString() : undefined
    });
    onClose();
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-7xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col font-serif-elegant">
        
        {/* HEADER ESTRUTURAL */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B1538]/5 rounded-2xl flex items-center justify-center text-[#8B1538]">
              <Calculator size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">Lançamento Mensal de Honorários</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interface da Gestora Jurídica — Apuração de Produção</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col xl:flex-row scrollbar-hide bg-gray-50/30">
          
          <div className="flex-1 p-10 space-y-10">
             
             {/* 01. SELEÇÃO DE CLIENTE E PERÍODO */}
             <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                   <Calendar className="text-[#8B1538]" size={18}/>
                   <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">1. Contexto do Lançamento</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Mês/Ano de Referência</label>
                      <input type="month" disabled={isLocked} value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 text-sm font-bold outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Filtrar Clientes por Plano</label>
                      <select value={filterPlanType} onChange={e => setFilterPlanType(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 text-sm font-bold outline-none">
                         <option value="Todos">Todos os Planos</option>
                         <option value="VALOR_FIXO">Plano Fixo</option>
                         <option value="PERSONALIZADO">Fixo + Franquia</option>
                         <option value="PAGUE_PELO_USO">Pague pelo Uso</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#8B1538] uppercase tracking-widest block ml-1">Selecionar Cliente Ativo *</label>
                      <select 
                        disabled={isLocked}
                        value={formData.contractId} 
                        onChange={e => {
                          const c = contracts.find(ct => ct.id === e.target.value);
                          setFormData({...formData, contractId: e.target.value, clientId: c?.clientId || '', clientName: c?.clientName || ''});
                        }}
                        className="w-full bg-white border-2 border-[#8B1538]/20 rounded-xl px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5"
                      >
                         <option value="">Buscar cliente...</option>
                         {filteredContracts.map(c => <option key={c.id} value={c.id}>{c.clientName} ({c.planName})</option>)}
                      </select>
                   </div>
                </div>
             </section>

             {/* 02. RESUMO VISUAL DO CONTRATO */}
             {selectedContract ? (
               <section className="bg-[#8B1538] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden animate-in slide-in-from-top-4">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck size={120}/></div>
                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-8">
                        <div>
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block mb-1">Resumo de Regras Contratuais</span>
                           <h4 className="text-xl font-serif font-bold">{selectedContract.planType.replace(/_/g, ' ')}</h4>
                        </div>
                        <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-right">
                           <span className="text-[10px] font-black text-white/40 uppercase block mb-1">Vencimento</span>
                           <span className="text-sm font-bold">Dia {selectedContract.billingDay}</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-8">
                        <div>
                           <span className="text-[9px] font-black text-white/40 uppercase block mb-1">Valor Base</span>
                           <span className="text-sm font-bold">{formatCurrency(selectedContract.monthlyFee)}</span>
                        </div>
                        <div className="relative group">
                           <span className="text-[9px] font-black text-white/40 uppercase block mb-1 flex items-center gap-1">Franquia Horas <Info size={10} /></span>
                           <span className="text-sm font-bold">{selectedContract.planIncludes.hoursIncluded}h inclusas</span>
                        </div>
                        <div className="relative group">
                           <span className="text-[9px] font-black text-white/40 uppercase block mb-1 flex items-center gap-1">Franquia Proc. <Info size={10} /></span>
                           <span className="text-sm font-bold">{selectedContract.planIncludes.processesIncluded}p inclusos</span>
                        </div>
                        <div>
                           <span className="text-[9px] font-black text-white/40 uppercase block mb-1">Taxa Pleno/Hora</span>
                           <span className="text-sm font-bold">{formatCurrency(selectedContract.hourlyRates.pleno)}</span>
                        </div>
                     </div>
                  </div>
               </section>
             ) : (
               <div className="p-10 border-2 border-dashed border-gray-200 rounded-[3rem] text-center flex flex-col items-center opacity-30">
                  <Receipt size={48} className="text-gray-300 mb-4"/>
                  <p className="text-sm font-serif italic">Selecione um cliente para visualizar os parâmetros de faturamento.</p>
               </div>
             )}

             {/* 03. FORMULÁRIO DE LANÇAMENTO DINÂMICO */}
             {selectedContract && (
               <div className="space-y-10 animate-in fade-in duration-500">
                  
                  {/* SEÇÃO: PROCESSOS (EXCETO PLANO FIXO PURO) */}
                  <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                     <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-3">
                           <Briefcase className="text-purple-500" size={18}/>
                           <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">2. Movimentação Processual</h3>
                        </div>
                        {selectedContract.planType !== 'PAGUE_PELO_USO' && totals.procExtra > 0 && (
                          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100 animate-bounce">
                             <AlertCircle size={14}/>
                             <span className="text-[9px] font-black uppercase">Ultrapassou {totals.procExtra} processos da franquia</span>
                          </div>
                        )}
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Total de Processos Relatados</label>
                           <input 
                             type="number" disabled={isLocked} value={formData.totalReportedProcesses} 
                             onChange={e => setFormData({...formData, totalReportedProcesses: Number(e.target.value)})}
                             className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-xl font-serif font-black outline-none focus:ring-4 focus:ring-[#8B1538]/5"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Custo Unitário (Contrato)</label>
                           <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold text-gray-400">
                              {formatCurrency(totals.unitPrice)}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-purple-600 uppercase tracking-widest block ml-1">Total Processos</label>
                           <div className="w-full bg-purple-50 border border-purple-100 rounded-xl px-5 py-4 text-sm font-black text-purple-700">
                              {formatCurrency(totals.subtotalProc)}
                           </div>
                        </div>
                     </div>
                  </section>

                  {/* SEÇÃO: HORAS (LÓGICA DIFERENTE P/ PAGUE PELO USO) */}
                  <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                     <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-3">
                           <Clock className="text-blue-500" size={18}/>
                           <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">3. Horas de Consultoria / Timesheet</h3>
                        </div>
                        {selectedContract.planType === 'PERSONALIZADO' && totals.hoursExtra > 0 && (
                          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 animate-pulse">
                             <AlertCircle size={14}/>
                             <span className="text-[9px] font-black uppercase">Excesso de {totals.hoursExtra} horas detectado</span>
                          </div>
                        )}
                     </div>

                     {selectedContract.planType === 'PAGUE_PELO_USO' ? (
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                             <label className="text-[9px] font-black text-gray-400 uppercase block ml-1">Horas Sênior ({formatCurrency(selectedContract.hourlyRates.senior)}/h)</label>
                             <input type="number" disabled={isLocked} value={formData.hoursSenior} onChange={e => setFormData({...formData, hoursSenior: Number(e.target.value)})} className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 text-sm font-bold outline-none" />
                          </div>
                          <div className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                             <label className="text-[9px] font-black text-gray-400 uppercase block ml-1">Horas Pleno ({formatCurrency(selectedContract.hourlyRates.pleno)}/h)</label>
                             <input type="number" disabled={isLocked} value={formData.hoursPleno} onChange={e => setFormData({...formData, hoursPleno: Number(e.target.value)})} className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 text-sm font-bold outline-none" />
                          </div>
                          <div className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                             <label className="text-[9px] font-black text-gray-400 uppercase block ml-1">Horas Júnior ({formatCurrency(selectedContract.hourlyRates.junior)}/h)</label>
                             <input type="number" disabled={isLocked} value={formData.hoursJunior} onChange={e => setFormData({...formData, hoursJunior: Number(e.target.value)})} className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 text-sm font-bold outline-none" />
                          </div>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-gray-400 uppercase block ml-1">Total de Horas Trabalhadas</label>
                             <input type="number" step="0.5" disabled={isLocked} value={formData.totalExecutedHours} onChange={e => setFormData({...formData, totalExecutedHours: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-black outline-none" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-gray-400 uppercase block ml-1">Nível Resp. (Para Excedentes)</label>
                             <select disabled={isLocked} value={formData.hourlyRateType} onChange={e => {
                                const type = e.target.value as any;
                                setFormData({...formData, hourlyRateType: type, hourlyRateUsed: selectedContract.hourlyRates[type]});
                             }} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-xs font-bold outline-none">
                                <option value="senior">Advogado Sênior</option>
                                <option value="pleno">Advogado Pleno</option>
                                <option value="junior">Advogado Júnior</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-blue-600 uppercase block ml-1">Subtotal Horas</label>
                             <div className="w-full bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm font-black text-blue-700">
                                {formatCurrency(totals.subtotalHours)}
                             </div>
                          </div>
                       </div>
                     )}
                  </section>

                  {/* SEÇÃO: PERFORMANCE E ANEXOS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                           <TrendingUp className="text-green-600" size={18}/>
                           <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">4. Honorários de Êxito</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase block ml-1">Valor Bruto Ganho (R$)</label>
                              <input type="number" value={formData.performanceBaseValue} onChange={e => setFormData({...formData, performanceBaseValue: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase block ml-1">% Contratual</label>
                              <input type="number" value={formData.performancePercentage} onChange={e => setFormData({...formData, performancePercentage: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                           </div>
                        </div>
                        <div className="w-full bg-green-50 border border-green-100 p-4 rounded-xl flex justify-between items-center">
                           <span className="text-[10px] font-black text-green-700 uppercase">Total Êxito</span>
                           <span className="text-lg font-black text-green-700">{formatCurrency(totals.subtotalPerf)}</span>
                        </div>
                     </section>

                     <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                           <Paperclip className="text-gray-400" size={18}/>
                           <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">5. Evidências e Comprovantes</h3>
                        </div>
                        <div className="border-2 border-dashed border-gray-100 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-[#8B1538]/20 transition-all">
                           <Upload size={24} className="text-gray-300 group-hover:text-[#8B1538] mb-3 transition-colors"/>
                           <span className="text-[10px] font-black text-gray-400 uppercase group-hover:text-gray-600">Arraste PDFs de movimentação aqui</span>
                        </div>
                     </section>
                  </div>
               </div>
             )}
          </div>

          {/* CHECKOUT SIDEBAR - RESUMO FINAL */}
          <div className="xl:w-[450px] p-10 bg-white border-l border-gray-100 flex flex-col justify-between shadow-2xl sticky top-20 h-[calc(100vh-80px)]">
             <div className="space-y-10">
                <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                   <Calculator className="text-[#8B1538]" size={24}/>
                   <h3 className="text-xl font-serif font-bold text-[#8B1538]">Resumo Consolidado</h3>
                </div>

                {selectedContract ? (
                   <div className="space-y-6 animate-in fade-in">
                      <div className="flex items-center justify-between group">
                         <div className="flex items-center gap-3">
                            <Wallet size={16} className="text-gray-400"/>
                            <span className="text-[11px] font-bold text-gray-500 uppercase">Base Mensal (Fixo)</span>
                         </div>
                         <span className="text-sm font-black text-gray-700">{formatCurrency(selectedContract.planType !== 'PAGUE_PELO_USO' ? formData.fixedMonthlyValue : 0)}</span>
                      </div>
                      <div className="flex items-center justify-between group">
                         <div className="flex items-center gap-3">
                            <Briefcase size={16} className="text-purple-400"/>
                            <span className="text-[11px] font-bold text-gray-500 uppercase">Variável Processos</span>
                         </div>
                         <span className="text-sm font-black text-gray-700">{formatCurrency(totals.subtotalProc)}</span>
                      </div>
                      <div className="flex items-center justify-between group">
                         <div className="flex items-center gap-3">
                            <Clock size={16} className="text-blue-400"/>
                            <span className="text-[11px] font-bold text-gray-500 uppercase">Consultivo Extra</span>
                         </div>
                         <span className="text-sm font-black text-gray-700">{formatCurrency(totals.subtotalHours)}</span>
                      </div>
                      <div className="flex items-center justify-between group">
                         <div className="flex items-center gap-3">
                            <TrendingUp size={16} className="text-green-400"/>
                            <span className="text-[11px] font-bold text-gray-500 uppercase">Êxito Apurado</span>
                         </div>
                         <span className="text-sm font-black text-gray-700">{formatCurrency(totals.subtotalPerf)}</span>
                      </div>

                      <div className="pt-10 mt-10 border-t-2 border-[#8B1538]/10 flex flex-col items-center justify-center space-y-3">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Total a Cobrar</span>
                         <span className="text-6xl font-serif font-black text-[#8B1538]">{formatCurrency(totals.grandTotal)}</span>
                      </div>
                   </div>
                ) : (
                  <div className="py-20 text-center opacity-20 italic font-serif">Aguardando dados...</div>
                )}
             </div>

             <div className="space-y-6 pt-10">
                {/* HISTÓRICO RÁPIDO */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><History size={14}/> Último Lançamento</h4>
                   <div className="flex items-center justify-between">
                      <span className="text-[11px] font-serif font-medium text-gray-500">Competência Jan/2026</span>
                      <span className="text-xs font-black text-gray-700">{formatCurrency(selectedContract ? 5420.50 : 0)}</span>
                   </div>
                </div>

                {!isLocked && (
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => handleSave('RASCUNHO')}
                      className="w-full py-5 border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                    >
                       <Save size={18}/> Salvar Rascunho
                    </button>
                    <button 
                      onClick={() => handleSave('ENVIADO')}
                      className="w-full py-6 bg-[#8B1538] text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-[#8B1538]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                       <Send size={20} fill="white"/> Enviar para Financeiro
                    </button>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingEntryModal;
