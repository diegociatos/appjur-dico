
import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Appointment, AppointmentStatus, AppointmentType } from '../types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, 'id'>) => void;
}

const LAWYERS = ['Stephanie', 'Bruna', 'Deisinay', 'Sarah', 'Renan Almeida'];

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    status: 'PENDENTE' as AppointmentStatus,
    tipo: 'Outros' as AppointmentType,
    descricao: '',
    processo: '',
    advogado: '',
    data: new Date().toISOString().split('T')[0],
    urgente: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.descricao) newErrors.descricao = 'Descrição é obrigatória';
    if (!formData.advogado) newErrors.advogado = 'Advogado é obrigatório';
    if (!formData.data) newErrors.data = 'Data é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      urgente: formData.status === 'URGENTE' || formData.urgente,
    });
    
    setFormData({
      status: 'PENDENTE',
      tipo: 'Outros',
      descricao: '',
      processo: '',
      advogado: '',
      data: new Date().toISOString().split('T')[0],
      urgente: false
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#8B1538] rounded-full"></div>
            <h2 className="text-xl font-bold text-[#8B1538]">Novo Compromisso</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#8B1538] transition-colors p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as AppointmentStatus})}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#8B1538]/10"
              >
                <option value="PENDENTE">PENDENTE</option>
                <option value="URGENTE">URGENTE</option>
                <option value="REAGENDADO">REAGENDADO</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tipo</label>
              <select 
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value as AppointmentType})}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#8B1538]/10"
              >
                <option value="Análise">Análise</option>
                <option value="Elaboração de Peça">Elaboração de Peça</option>
                <option value="Prazo Processual">Prazo Processual</option>
                <option value="Audiência">Audiência</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descrição *</label>
            <textarea 
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              className={`w-full border ${errors.descricao ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-xl px-4 py-3 text-sm font-medium h-24 resize-none`}
              placeholder="Descreva o compromisso..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Número do Processo (CNJ)</label>
            <input 
              type="text"
              value={formData.processo}
              onChange={(e) => setFormData({...formData, processo: e.target.value})}
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#8B1538]/10 outline-none"
              placeholder="0000000-00.0000.0.00.0000"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Advogado *</label>
              <select 
                value={formData.advogado}
                onChange={(e) => setFormData({...formData, advogado: e.target.value})}
                className={`w-full border ${errors.advogado ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-xl px-4 py-3 text-sm font-bold`}
              >
                <option value="">Selecione...</option>
                {LAWYERS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Data *</label>
              <input 
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold"
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 uppercase tracking-widest text-[10px] transition-all hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="flex-1 py-4 bg-[#8B1538] rounded-2xl font-bold text-white uppercase tracking-widest text-[10px] shadow-lg shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
