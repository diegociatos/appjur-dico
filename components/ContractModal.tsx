
import React, { useState, useEffect } from 'react';
import { 
  X, FileText, DollarSign, Clock, Layers, Plus, Trash2, Save, Info, 
  Target, ShieldCheck, ChevronDown, Calendar, CreditCard, Scale,
  Settings2, Zap, Gem, ListPlus, TrendingUp
} from 'lucide-react';
import { ClientContract, Client, UserProfile, ProcessPricingBand, PerformanceFeeBand, PlanType } from '../types';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: ClientContract) => void;
  contractToEdit?: ClientContract | null;
  clients: Client[];
  currentUser: UserProfile;
}

const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, onSave, contractToEdit, clients, currentUser }) => {
  const [formData, setFormData] = useState<Omit<ClientContract, 'id'>>({
    clientId: '',
    clientName: '',
    planName: '',
    planType: 'VALOR_FIXO',
    billingDay: 10,
    monthlyFee: 0,
    processPricingTable: [],
    performanceFeeBands: [],
    hourlyRates: { senior: 450, pleno: 250, junior: 150 },
    planIncludes: { hoursIncluded: 0, processesIncluded: 0 },
    signatureDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    indiceReajuste: 'IPCA',
    currency: 'BRL',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (contractToEdit) {
        setFormData({ ...contractToEdit });
      } else {
        setFormData({
          clientId: '', clientName: '', planName: '', planType: 'VALOR_FIXO',
          billingDay: 10, monthlyFee: 0,
          processPricingTable: [
            { min: 1, max: 5, pricePerProcess: 250 }, 
            { min: 6, max: 100, pricePerProcess: 200 }
          ],
          performanceFeeBands: [
            { maxValue: 100000, percentage: 20 }, 
            { maxValue: 200000, percentage: 8 }
          ],
          hourlyRates: { senior: 450, pleno: 250, junior: 150 },
          planIncludes: { hoursIncluded: 0, processesIncluded: 0 },
          signatureDate: new Date().toISOString().split('T')[0],
          expirationDate: '', indiceReajuste: 'IPCA', currency: 'BRL', notes: ''
        });
      }
    }
  }, [isOpen, contractToEdit]);

  if (!isOpen) return null;

  const handlePlanTypeChange = (type: PlanType) => {
    setFormData(prev => ({
      ...prev,
      planType: type,
      monthlyFee: type === 'PAGUE_PELO_USO' ? 0 : prev.monthlyFee,
      planIncludes: type === 'PAGUE_PELO_USO' ? { hoursIncluded: 0, processesIncluded: 0 } : prev.planIncludes
    }));
  };

  const updateProcessBand = (idx: number, field: keyof ProcessPricingBand, val: number) => {
    const table = [...formData.processPricingTable];
    table[idx] = { ...table[idx], [field]: val };
    setFormData({ ...formData, processPricingTable: table });
  };

  const addProcessBand = () => {
    const lastBand = formData.processPricingTable[formData.processPricingTable.length - 1];
    setFormData({
      ...formData,
      processPricingTable: [...formData.processPricingTable, { min: (lastBand?.max || 0) + 1, max: (lastBand?.max || 0) + 10, pricePerProcess: 0 }]
    });
  };

  const updatePerformanceBand = (idx: number, field: keyof PerformanceFeeBand, val: number) => {
    const bands = [...formData.performanceFeeBands];
    bands[idx] = { ...bands[idx], [field]: val };
    setFormData({ ...formData, performanceFeeBands: bands });
  };

  const addPerformanceBand = () => {
    setFormData({
      ...formData,
      performanceFeeBands: [...formData.performanceFeeBands, { maxValue: 0, percentage: 0 }]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return alert("Selecione um cliente");
    if (!formData.planName) return alert("Dê um nome ao plano");
    if (!formData.signatureDate) return alert("A data de assinatura é obrigatória para controle de reajustes.");
    
    onSave({
      ...formData,
      id: contractToEdit ? contractToEdit.id : `cont_${Date.now()}`
    } as ClientContract);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col font-serif-elegant">
        
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B1538]/5 rounded-2xl flex items-center justify-center text-[#8B1538]">
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">Arquitetura de Contrato & Reajustes</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuração Comercial & Governança Anual</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
          
          <section className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Cliente Vinculado *</label>
                   <select 
                    required value={formData.clientId} 
                    onChange={e => {
                      const c = clients.find(cl => cl.id === e.target.value);
                      setFormData({...formData, clientId: e.target.value, clientName: c?.nome || ''});
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5"
                   >
                      <option value="">Selecione o Cliente...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nome do Plano Comercial *</label>
                   <input 
                    type="text" required value={formData.planName} onChange={e => setFormData({...formData, planName: e.target.value})}
                    placeholder="Ex: Plano Corporate Plus 2026"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none"
                   />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#8B1538]/5 p-8 rounded-[2rem] border border-[#8B1538]/10">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-[#8B1538] uppercase tracking-widest block ml-1 flex items-center gap-2">
                     <Calendar size={14}/> Data de Início / Assinatura *
                   </label>
                   <input 
                    type="date" required value={formData.signatureDate} 
                    onChange={e => setFormData({...formData, signatureDate: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none shadow-sm"
                   />
                   <span className="text-[9px] text-gray-400 italic">O sistema notificará o reajuste a cada 12 meses nesta data.</span>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-[#8B1538] uppercase tracking-widest block ml-1 flex items-center gap-2">
                     <TrendingUp size={14}/> Índice de Reajuste Anual
                   </label>
                   <select 
                    value={formData.indiceReajuste} onChange={e => setFormData({...formData, indiceReajuste: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none shadow-sm"
                   >
                      <option value="IPCA">IPCA (IBGE)</option>
                      <option value="IGPM">IGP-M (FGV)</option>
                      <option value="FIXO_5">Fixo 5%</option>
                      <option value="FIXO_10">Fixo 10%</option>
                      <option value="NEGOCIADO">Livre Negociação</option>
                   </select>
                </div>
             </div>
          </section>

          <section className="space-y-4">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Modalidade de Cobrança</label>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'VALOR_FIXO', label: 'Valor Fixo', desc: 'Preço fechado conforme franquia contratada.' },
                  { id: 'PERSONALIZADO', label: 'Personalizado', desc: 'Base fixa + cobrança de excedentes por uso.' },
                  { id: 'PAGUE_PELO_USO', label: 'Pague pelo Uso', desc: '100% Variável baseada na tabela e taxas.' },
                ].map(type => (
                  <button 
                   key={type.id} type="button" 
                   onClick={() => handlePlanTypeChange(type.id as PlanType)}
                   className={`p-6 rounded-2xl border-2 text-left transition-all group ${formData.planType === type.id ? 'bg-[#8B1538] border-[#8B1538] text-white shadow-xl' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200'}`}
                  >
                     <h4 className={`text-xs font-black uppercase mb-1 ${formData.planType === type.id ? 'text-white' : 'text-gray-700'}`}>{type.label}</h4>
                     <p className={`text-[10px] font-serif italic ${formData.planType === type.id ? 'text-white/60' : 'text-gray-400'}`}>{type.desc}</p>
                  </button>
                ))}
             </div>
          </section>

          {(formData.planType === 'VALOR_FIXO' || formData.planType === 'PERSONALIZADO') && (
            <section className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100 space-y-8">
               <div className="flex items-center gap-3">
                  <DollarSign className="text-amber-600" size={18}/>
                  <h3 className="text-sm font-black uppercase text-amber-800 tracking-widest">Valor Base & Franquias</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">Mensalidade Atual (R$)</label>
                     <input 
                        type="number" value={formData.monthlyFee} onChange={e => setFormData({...formData, monthlyFee: Number(e.target.value)})}
                        className="w-full bg-white border border-amber-200 rounded-xl px-5 py-4 text-sm font-bold outline-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">Franquia Horas/Mês</label>
                     <input 
                        type="number" value={formData.planIncludes.hoursIncluded} onChange={e => setFormData({...formData, planIncludes: {...formData.planIncludes, hoursIncluded: Number(e.target.value)}})}
                        className="w-full bg-white border border-amber-200 rounded-xl px-5 py-4 text-sm font-bold outline-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">Franquia Processos/Mês</label>
                     <input 
                        type="number" value={formData.planIncludes.processesIncluded} onChange={e => setFormData({...formData, planIncludes: {...formData.planIncludes, processesIncluded: Number(e.target.value)}})}
                        className="w-full bg-white border border-amber-200 rounded-xl px-5 py-4 text-sm font-bold outline-none"
                     />
                  </div>
               </div>
            </section>
          )}

          <section className="space-y-8">
             <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <Clock className="text-[#8B1538]" size={18}/>
                <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Tabela de Honorários por Hora</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Sênior (R$/h)</label>
                   <input type="number" value={formData.hourlyRates.senior} onChange={e => setFormData({...formData, hourlyRates: {...formData.hourlyRates, senior: Number(e.target.value)}})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Pleno (R$/h)</label>
                   <input type="number" value={formData.hourlyRates.pleno} onChange={e => setFormData({...formData, hourlyRates: {...formData.hourlyRates, pleno: Number(e.target.value)}})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Jurídico/Júnior (R$/h)</label>
                   <input type="number" value={formData.hourlyRates.junior} onChange={e => setFormData({...formData, hourlyRates: {...formData.hourlyRates, junior: Number(e.target.value)}})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none" />
                </div>
             </div>
          </section>

          <section className="bg-blue-50/30 p-8 rounded-[2.5rem] border border-blue-100 space-y-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Layers className="text-blue-600" size={18}/>
                   <h3 className="text-sm font-black uppercase text-blue-800 tracking-widest">Escalonamento de Preço por Processo</h3>
                </div>
                <button type="button" onClick={addProcessBand} className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm hover:scale-105 transition-all">
                   <ListPlus size={14}/> Nova Faixa
                </button>
             </div>
             
             <div className="space-y-4">
                {formData.processPricingTable.map((band, idx) => (
                   <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-6">
                      <div className="flex-1 grid grid-cols-3 gap-6">
                         <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase">A partir de</label>
                            <input type="number" value={band.min} onChange={e => updateProcessBand(idx, 'min', Number(e.target.value))} className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-xs font-bold" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase">Até</label>
                            <input type="number" value={band.max} onChange={e => updateProcessBand(idx, 'max', Number(e.target.value))} className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-xs font-bold" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-black text-blue-600 uppercase">Valor/unidade</label>
                            <div className="relative">
                               <input type="number" value={band.pricePerProcess} onChange={e => updateProcessBand(idx, 'pricePerProcess', Number(e.target.value))} className="w-full bg-gray-50 border-none rounded-lg pl-8 pr-3 py-2 text-xs font-bold" />
                               <DollarSign size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
                            </div>
                         </div>
                      </div>
                      <button type="button" onClick={() => setFormData({...formData, processPricingTable: formData.processPricingTable.filter((_, i) => i !== idx)})} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                   </div>
                ))}
             </div>
          </section>

          <section className="space-y-8">
             <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                   <Gem className="text-green-600" size={18}/>
                   <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Honorários de Êxito Progressivos</h3>
                </div>
                <button type="button" onClick={addPerformanceBand} className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-4 py-2 rounded-xl shadow-sm hover:bg-green-100 transition-all border border-green-100">
                   <Plus size={14}/> Nova Faixa Êxito
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.performanceFeeBands.map((band, idx) => (
                   <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between gap-6 group">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-gray-400 uppercase">Até valor bruto de:</label>
                            <div className="relative">
                               <input type="number" value={band.maxValue} onChange={e => updatePerformanceBand(idx, 'maxValue', Number(e.target.value))} className="w-full bg-white border border-gray-100 rounded-lg pl-8 py-2 text-xs font-bold" />
                               <DollarSign size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
                            </div>
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-gray-400 uppercase">Percentual (%)</label>
                            <input type="number" value={band.percentage} onChange={e => updatePerformanceBand(idx, 'percentage', Number(e.target.value))} className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-green-600" />
                         </div>
                      </div>
                      <button type="button" onClick={() => setFormData({...formData, performanceFeeBands: formData.performanceFeeBands.filter((_, i) => i !== idx)})} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                   </div>
                ))}
             </div>
          </section>

        </form>

        <div className="p-10 border-t border-gray-100 bg-gray-50 flex gap-6">
          <button type="button" onClick={onClose} className="flex-1 py-5 border-2 border-gray-200 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-white transition-all active:scale-95">Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all active:scale-95 flex items-center justify-center gap-3">
            <Save size={18}/> {contractToEdit ? 'Atualizar Contrato' : 'Publicar e Ativar Plano'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractModal;
