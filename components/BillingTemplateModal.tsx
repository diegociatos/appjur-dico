
import React, { useState, useEffect } from 'react';
import { 
  X, RotateCcw, Zap, Save, Calendar, Info, ShieldCheck, 
  Settings, Briefcase, User, Layers
} from 'lucide-react';
import { BillingTemplate, ClientContract, RecurrencePattern } from '../types';

interface BillingTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: BillingTemplate) => void;
  templateToEdit?: BillingTemplate | null;
  contracts: ClientContract[];
}

const BillingTemplateModal: React.FC<BillingTemplateModalProps> = ({ isOpen, onClose, onSave, templateToEdit, contracts }) => {
  const [formData, setFormData] = useState<Omit<BillingTemplate, 'id'>>({
    contractId: '',
    clientName: '',
    name: 'Recorrência Padrão',
    pattern: 'MONTHLY',
    billingDay: 10,
    autoCreate: true,
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      if (templateToEdit) {
        setFormData({ ...templateToEdit });
      } else {
        setFormData({
          contractId: '', clientName: '', name: 'Recorrência Padrão',
          pattern: 'MONTHLY', billingDay: 10, autoCreate: true, isActive: true
        });
      }
    }
  }, [isOpen, templateToEdit]);

  if (!isOpen) return null;

  const handleContractChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    const contract = contracts.find(c => c.id === cid);
    if (contract) {
      setFormData({ 
        ...formData, 
        contractId: cid, 
        clientName: contract.clientName,
        billingDay: contract.billingDay 
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contractId) return alert("Selecione um contrato");
    
    onSave({
      ...formData,
      id: templateToEdit ? templateToEdit.id : `tpl_${Date.now()}`
    } as BillingTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col font-serif-elegant">
        
        {/* HEADER */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B1538]/5 rounded-2xl flex items-center justify-center text-[#8B1538]">
              <RotateCcw size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">
                {templateToEdit ? 'Configurar Automação' : 'Novo Template de Recorrência'}
              </h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inteligência de Agendamento Financeiro</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
           <section className="space-y-8">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                 <ShieldCheck className="text-[#8B1538]" size={18}/>
                 <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Gatilho de Contrato</h3>
              </div>
              
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Contrato de Origem *</label>
                 <select 
                   required value={formData.contractId} onChange={handleContractChange}
                   className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5"
                 >
                    <option value="">Vincular Contrato Vigente...</option>
                    {contracts.map(c => <option key={c.id} value={c.id}>{c.clientName} (Dia {c.billingDay})</option>)}
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nome Identificador do Template</label>
                 <input 
                   type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none"
                   placeholder="Ex: Mensalidade Fixa + Consultivo"
                 />
              </div>
           </section>

           <section className="bg-[#8B1538]/[0.02] p-8 rounded-[2.5rem] border border-[#8B1538]/10 space-y-8">
              <div className="flex items-center gap-3">
                 <Calendar className="text-[#8B1538]" size={18}/>
                 <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Ciclo & Periodicidade</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Frequência</label>
                    <select 
                      value={formData.pattern} onChange={e => setFormData({...formData, pattern: e.target.value as RecurrencePattern})}
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-xs font-bold outline-none"
                    >
                       <option value="MONTHLY">Todo Mês (Padrão)</option>
                       <option value="BIMONTHLY">A cada 2 Meses</option>
                       <option value="QUARTERLY">Trimestral</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Dia do provisionamento</label>
                    <div className="relative">
                       <input 
                        type="number" min="1" max="31" value={formData.billingDay} onChange={e => setFormData({...formData, billingDay: Number(e.target.value)})}
                        className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-300">TODO MÊS</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.autoCreate ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-300'}`}>
                       <Zap size={24} fill={formData.autoCreate ? 'currentColor' : 'none'}/>
                    </div>
                    <div>
                       <span className="block text-[11px] font-black text-gray-700 uppercase tracking-tight">Provisionamento Automático</span>
                       <span className="text-[9px] text-gray-400 font-serif italic">Criar rascunho de faturamento no início do ciclo</span>
                    </div>
                 </div>
                 <button 
                  type="button" onClick={() => setFormData({...formData, autoCreate: !formData.autoCreate})}
                  className={`w-14 h-7 rounded-full transition-all relative ${formData.autoCreate ? 'bg-[#8B1538]' : 'bg-gray-200'}`}
                 >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${formData.autoCreate ? 'left-8' : 'left-1'}`} />
                 </button>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                 <Info size={16} className="text-blue-500 shrink-0 mt-0.5"/>
                 <p className="text-[10px] font-serif font-medium text-blue-800 leading-relaxed italic">
                    Ao ativar a geração automática, o sistema criará um novo lançamento em status "Rascunho" no primeiro dia de cada ciclo, copiando o valor da mensalidade e franquias do contrato vinculado.
                 </p>
              </div>
           </section>
        </form>

        {/* FOOTER */}
        <div className="p-10 border-t border-gray-100 bg-white flex gap-6">
          <button 
            type="button" onClick={onClose}
            className="flex-1 py-5 border-2 border-gray-200 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[11px] uppercase shadow-xl shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Save size={18}/> {templateToEdit ? 'Atualizar Automação' : 'Ativar Ciclo de Faturamento'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingTemplateModal;
