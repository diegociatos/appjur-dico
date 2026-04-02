
import React, { useState, useEffect } from 'react';
import { X, Scale, DollarSign, Save, AlertCircle, Building2, UserCircle2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Processo, ProcessType, HonorarioType, ProcessStatus, Client, UserProfile } from '../types';

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (process: any) => void;
  existingProcesses: Processo[];
  clients: Client[];
  users: UserProfile[];
  processToEdit?: Processo | null;
}

const ProcessModal: React.FC<ProcessModalProps> = ({ isOpen, onClose, onSave, existingProcesses, clients, users, processToEdit }) => {
  const [formData, setFormData] = useState({
    numero_processo: '',
    cliente: '',
    clienteId: '',
    tipo_processo: 'Nível 1' as ProcessType,
    tipo_honorarios: 'Nenhum' as HonorarioType,
    advogado_responsavel: '',
    valor_honorarios: 0,
    valor_sucumbencial: 0,
    fase_processual: 'Conhecimento',
    tribunal: '',
    vara: '',
    observacoes_gestor: '',
    status: 'Ativo' as ProcessStatus
  });

  const [hasContratual, setHasContratual] = useState(false);
  const [hasSucumbencial, setHasSucumbencial] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fix: changed 'Gestora' to 'Gestor' as it's the correct value for UserRole type
  const lawyers = users.filter(u => u.cargo === 'Advogado' || u.cargo === 'Administrador' || u.cargo === 'Gestor');

  useEffect(() => {
    if (isOpen) {
      if (processToEdit) {
        setFormData({
          numero_processo: processToEdit.numero_processo,
          cliente: processToEdit.cliente,
          clienteId: processToEdit.clienteId || '',
          tipo_processo: 'Nível 1',
          // Fix: cast string to HonorarioType
          tipo_honorarios: (processToEdit.tipo_honorarios as HonorarioType) || 'Nenhum',
          advogado_responsavel: processToEdit.advogado_responsavel,
          valor_honorarios: processToEdit.valor_honorarios,
          valor_sucumbencial: processToEdit.valor_sucumbencial || 0,
          fase_processual: processToEdit.fase_processual,
          tribunal: processToEdit.tribunal,
          vara: processToEdit.vara,
          observacoes_gestor: processToEdit.observacoes_gestor,
          // Fix: cast string to ProcessStatus
          status: (processToEdit.status as ProcessStatus) || 'Ativo'
        });
        setHasContratual(processToEdit.tipo_honorarios === 'Contratual' || processToEdit.tipo_honorarios === 'Ambos');
        setHasSucumbencial(processToEdit.tipo_honorarios === 'Sucumbencial' || processToEdit.tipo_honorarios === 'Ambos');
      } else {
        setFormData({
          numero_processo: '',
          cliente: '',
          clienteId: '',
          tipo_processo: 'Nível 1',
          tipo_honorarios: 'Nenhum',
          advogado_responsavel: '',
          valor_honorarios: 0,
          valor_sucumbencial: 0,
          fase_processual: 'Conhecimento',
          tribunal: '',
          vara: '',
          observacoes_gestor: '',
          status: 'Ativo'
        });
        setHasContratual(false);
        setHasSucumbencial(false);
      }
      setErrors({});
    }
  }, [isOpen, processToEdit]);

  if (!isOpen) return null;

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    const client = clients.find(c => c.id === cid);
    if (client) {
      setFormData({
        ...formData,
        clienteId: cid,
        cliente: client.nome,
        advogado_responsavel: lawyers.find(l => l.id === client.responsavelId)?.nome || formData.advogado_responsavel
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.numero_processo) newErrors.numero_processo = 'Obrigatório';
    if (!formData.clienteId) newErrors.cliente = 'Selecione um cliente';
    if (!formData.advogado_responsavel) newErrors.advogado_responsavel = 'Obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let finalTipoHon: HonorarioType = 'Nenhum';
    if (hasContratual && hasSucumbencial) finalTipoHon = 'Ambos';
    else if (hasContratual) finalTipoHon = 'Contratual';
    else if (hasSucumbencial) finalTipoHon = 'Sucumbencial';
    
    const finalData = { 
      ...(processToEdit || {}), 
      ...formData, 
      tipo_honorarios: finalTipoHon,
      valor_honorarios: hasContratual ? formData.valor_honorarios : 0,
      valor_sucumbencial: hasSucumbencial ? formData.valor_sucumbencial : 0
    };
      
    onSave(finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B1538]/5 rounded-2xl flex items-center justify-center text-[#8B1538]">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">
                {processToEdit ? 'Editar Processo Estratégico' : 'Novo Processo Estratégico'}
              </h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Controle de Portfólio Nível 1</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#8B1538] p-2 hover:bg-gray-100 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide font-serif-elegant">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Número do Processo (CNJ) *</label>
              <input 
                type="text" 
                value={formData.numero_processo} 
                onChange={(e) => setFormData({...formData, numero_processo: e.target.value})}
                placeholder="0000000-00.0000.0.00.0000"
                className={`w-full border rounded-xl px-5 py-4 text-sm font-mono shadow-sm outline-none transition-all border-gray-100 bg-gray-50 focus:ring-4 focus:ring-[#8B1538]/5 ${errors.numero_processo ? 'border-red-300' : ''}`}
              />
              {errors.numero_processo && <p className="text-[10px] text-red-500 font-bold">{errors.numero_processo}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Cliente Estratégico *</label>
              <select 
                value={formData.clienteId} onChange={handleClientChange}
                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5"
              >
                <option value="">Selecione o Cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-[#8B1538]/[0.02] p-8 rounded-[2rem] border border-[#8B1538]/10 space-y-10">
            {/* Nível do Processo - FIXO */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Classificação Operacional</label>
              <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-[#8B1538]/20 shadow-sm">
                 <ShieldCheck className="text-[#8B1538]" size={20}/>
                 <span className="text-sm font-serif font-black text-[#8B1538] uppercase">NÍVEL 1 – Processo Estratégico</span>
              </div>
            </div>

            {/* Tipo de Honorários - CHECKBOXES */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Modalidade de Honorários</label>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                  type="button" 
                  onClick={() => setHasContratual(!hasContratual)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${hasContratual ? 'bg-white border-[#8B1538] shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                 >
                    <span className="text-[10px] font-black uppercase">Honorário Contratual</span>
                    {hasContratual ? <CheckCircle2 className="text-[#8B1538]" size={18}/> : <div className="w-4 h-4 rounded-full border-2 border-gray-200"/>}
                 </button>

                 <button 
                  type="button" 
                  onClick={() => setHasSucumbencial(!hasSucumbencial)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${hasSucumbencial ? 'bg-white border-[#8B1538] shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                 >
                    <span className="text-[10px] font-black uppercase">Honorário Sucumbencial</span>
                    {hasSucumbencial ? <CheckCircle2 className="text-[#8B1538]" size={18}/> : <div className="w-4 h-4 rounded-full border-2 border-gray-200"/>}
                 </button>
              </div>
            </div>

            {/* CAMPOS CONDICIONAIS DE VALORES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {hasContratual && (
                <div className="animate-in slide-in-from-top-4 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Valor Contratual (R$)</label>
                   <div className="relative">
                      <input 
                        type="number" value={formData.valor_honorarios} onChange={(e) => setFormData({...formData, valor_honorarios: Number(e.target.value)})} 
                        className="w-full border border-gray-100 bg-white rounded-xl px-12 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5" 
                      />
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                   </div>
                </div>
              )}

              {hasSucumbencial && (
                <div className="animate-in slide-in-from-top-4 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Valor da Sucumbência (R$)</label>
                   <div className="relative">
                      <input 
                        type="number" value={formData.valor_sucumbencial} onChange={(e) => setFormData({...formData, valor_sucumbencial: Number(e.target.value)})} 
                        className="w-full border border-gray-100 bg-white rounded-xl px-12 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5" 
                      />
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                   </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Advogado Responsável *</label>
              <select 
                value={formData.advogado_responsavel} onChange={(e) => setFormData({...formData, advogado_responsavel: e.target.value})}
                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5"
              >
                <option value="">Selecione o Advogado...</option>
                {lawyers.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Comarca / Vara</label>
              <input 
                type="text" value={formData.vara} onChange={e => setFormData({...formData, vara: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Observações Estratégicas</label>
            <textarea 
              value={formData.observacoes_gestor} onChange={(e) => setFormData({...formData, observacoes_gestor: e.target.value})} 
              className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-6 py-5 text-sm h-32 resize-none outline-none focus:ring-4 focus:ring-[#8B1538]/5" 
              placeholder="Instruções para o monitoramento deste dossiê..."
            />
          </div>
        </form>

        <div className="p-10 border-t border-gray-100 bg-gray-50 flex gap-6">
          <button type="button" onClick={onClose} className="flex-1 py-5 border-2 border-gray-200 rounded-2xl font-black text-[10px] uppercase text-gray-400 hover:bg-white transition-all">Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
             <Save size={18}/> {processToEdit ? 'Salvar Alterações' : 'Cadastrar Processo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessModal;
