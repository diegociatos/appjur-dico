
import React, { useState, useEffect } from 'react';
import { X, Scale, DollarSign, Percent, Info, AlertCircle, PlusCircle } from 'lucide-react';
import { Processo, ProcessType, ProcessStatus, Client, HonorarioType } from '../types';

interface NewProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (process: Omit<Processo, 'id' | 'data_cadastro' | 'timeline'>) => void;
  existingProcesses: Processo[];
  clients: Client[];
}

const LAWYERS = ["Renan Almeida", "Stephanie", "Bruna Silva", "Deisinay", "Sarah"];

const NewProcessModal: React.FC<NewProcessModalProps> = ({ isOpen, onClose, onSave, existingProcesses, clients }) => {
  const [formData, setFormData] = useState({
    numero_processo: '',
    cliente: '',
    clienteId: '',
    tipo_processo: 'Nível 1' as ProcessType,
    // Fix: added tipo_honorarios to match Processo type requirements
    tipo_honorarios: 'Nenhum' as HonorarioType,
    advogado_responsavel: '',
    valor_honorarios: 0,
    percentual_honorarios: 0,
    fase_processual: 'Conhecimento',
    tribunal: '',
    vara: '',
    observacoes_gestor: '',
    status: 'Ativo' as ProcessStatus
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    if (formData.numero_processo) {
      const duplicate = existingProcesses.some(p => p.numero_processo === formData.numero_processo);
      setIsDuplicate(duplicate);
    }
  }, [formData.numero_processo, existingProcesses]);

  if (!isOpen) return null;

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    const client = clients.find(c => c.id === cid);
    if (client) {
      setFormData({
        ...formData,
        clienteId: cid,
        cliente: client.nome,
        // Sugere o advogado responsável pelo cliente se houver
        advogado_responsavel: LAWYERS.find(l => l.toLowerCase().includes(client.responsavelId)) || formData.advogado_responsavel
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.numero_processo) newErrors.numero_processo = 'Obrigatório';
    if (isDuplicate) newErrors.numero_processo = 'Número já cadastrado';
    if (!formData.clienteId) newErrors.cliente = 'Selecione um cliente';
    if (!formData.advogado_responsavel) newErrors.advogado_responsavel = 'Obrigatório';
    
    if (formData.tipo_processo !== 'Nível 1' && formData.valor_honorarios <= 0) {
      newErrors.valor_honorarios = 'Valor obrigatório para honorários';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Fix: mapping tipo_processo to tipo_honorarios when saving
    onSave({
      ...formData,
      tipo_honorarios: formData.tipo_processo === 'Honorários Contratuais' ? 'Contratual' : 
                       formData.tipo_processo === 'Honorários Sucumbenciais' ? 'Sucumbencial' : 'Nenhum'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B1538]/5 rounded-2xl flex items-center justify-center text-[#8B1538]">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">Novo Processo Estratégico</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Abertura de Dossiê Jurídico</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#8B1538] p-2 hover:bg-gray-100 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Número do Processo (CNJ) *</label>
              <input 
                type="text" value={formData.numero_processo} onChange={(e) => setFormData({...formData, numero_processo: e.target.value})}
                placeholder="0000000-00.0000.0.00.0000"
                className={`w-full border rounded-xl px-5 py-4 text-sm font-mono shadow-sm outline-none transition-all ${errors.numero_processo ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-gray-100 bg-gray-50 focus:ring-[#8B1538]/5'}`}
              />
              {errors.numero_processo && <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1"><AlertCircle size={12}/> {errors.numero_processo}</span>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente da Base *</label>
                 <button type="button" className="text-[9px] font-black text-[#8B1538] flex items-center gap-1 hover:underline"><PlusCircle size={10}/> NOVO CLIENTE</button>
              </div>
              <select 
                value={formData.clienteId} onChange={handleClientChange}
                className={`w-full border rounded-xl px-5 py-4 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-[#8B1538]/5 ${errors.cliente ? 'border-red-300' : 'border-gray-100'}`}
              >
                <option value="">Selecione o Cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 space-y-6">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Processo</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Nível 1', 'Honorários Contratuais', 'Honorários Sucumbenciais'].map((type) => (
                  <button key={type} type="button" onClick={() => setFormData({...formData, tipo_processo: type as ProcessType})} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all text-center ${formData.tipo_processo === type ? 'bg-[#8B1538] text-white border-[#8B1538] shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-[#8B1538]/30'}`}>{type}</button>
                ))}
              </div>
            </div>

            {formData.tipo_processo !== 'Nível 1' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2"><label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest">Valor de Honorários (R$) *</label><div className="relative"><input type="number" value={formData.valor_honorarios} onChange={(e) => setFormData({...formData, valor_honorarios: Number(e.target.value)})} className="w-full border border-amber-100 bg-white rounded-xl px-12 py-4 text-sm font-bold outline-none" placeholder="0,00"/><DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} /></div></div>
                {formData.tipo_processo === 'Honorários Contratuais' && (<div className="space-y-2"><label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest">Percentual (%)</label><div className="relative"><input type="number" value={formData.percentual_honorarios} onChange={(e) => setFormData({...formData, percentual_honorarios: Number(e.target.value)})} className="w-full border border-amber-100 bg-white rounded-xl px-12 py-4 text-sm font-bold outline-none" placeholder="0"/><Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} /></div></div>)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Advogado Responsável *</label><select value={formData.advogado_responsavel} onChange={(e) => setFormData({...formData, advogado_responsavel: e.target.value})} className="w-full border border-gray-100 bg-gray-50 rounded-xl px-5 py-4 text-sm font-bold outline-none">{LAWYERS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
             <div className="space-y-2"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Fase Processual</label><select value={formData.fase_processual} onChange={(e) => setFormData({...formData, fase_processual: e.target.value})} className="w-full border border-gray-100 bg-gray-50 rounded-xl px-5 py-4 text-sm font-bold outline-none"><option value="Conhecimento">Conhecimento</option><option value="Recursal">Recursal</option><option value="Execução">Execução</option><option value="Arquivado">Arquivado</option></select></div>
          </div>

          <div className="space-y-2"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Observações do Gestor</label><textarea value={formData.observacoes_gestor} onChange={(e) => setFormData({...formData, observacoes_gestor: e.target.value})} className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-6 py-5 text-sm h-32 resize-none outline-none focus:ring-4 focus:ring-[#8B1538]/5" placeholder="Instruções específicas sobre o monitoramento deste processo..."/></div>
        </form>

        <div className="p-10 border-t border-gray-100 bg-gray-50 flex gap-6">
          <button type="button" onClick={onClose} className="flex-1 py-5 border-2 border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-white transition-all">Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-[#72112d] transition-all flex items-center justify-center gap-3">Salvar Processo no Sistema</button>
        </div>
      </div>
    </div>
  );
};

export default NewProcessModal;
