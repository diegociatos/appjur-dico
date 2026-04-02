
import React, { useState, useEffect } from 'react';
import { X, Target, Zap, BarChart3, Save, Info } from 'lucide-react';
import { KPIIndicator, KPIIndicatorValueType, KPIPolarity } from '../types';

interface KPIIndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (indicator: KPIIndicator) => void;
  editingIndicator: KPIIndicator | null;
  categoryDefaultId: string;
}

const KPIIndicatorModal: React.FC<KPIIndicatorModalProps> = ({ isOpen, onClose, onSave, editingIndicator, categoryDefaultId }) => {
  const [formData, setFormData] = useState<Omit<KPIIndicator, 'id'>>({
    nome: '',
    categoriaId: categoryDefaultId,
    unidade: 'Quantidade',
    tipoValor: 'number',
    polaridade: 'POSITIVO',
    metaMensal: 0,
    ativo: true,
    ordem: 1
  });

  useEffect(() => {
    if (editingIndicator) {
      setFormData({ ...editingIndicator });
    } else {
      setFormData({
        nome: '',
        categoriaId: categoryDefaultId,
        unidade: 'Quantidade',
        tipoValor: 'number',
        polaridade: 'POSITIVO',
        metaMensal: 0,
        ativo: true,
        ordem: 1
      });
    }
  }, [editingIndicator, categoryDefaultId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;

    onSave({
      ...formData,
      id: editingIndicator ? editingIndicator.id : `ind_${Date.now()}`
    } as KPIIndicator);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B1538]/5 rounded-2xl flex items-center justify-center text-[#8B1538]">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">
                {editingIndicator ? 'Editar Indicador' : 'Novo Indicador Estratégico'}
              </h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Definição de Métrica de Performance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nome do Indicador *</label>
            <input 
              type="text" required value={formData.nome} 
              onChange={e => setFormData({...formData, nome: e.target.value})}
              placeholder="Ex: Nº de Audiências, Taxa de Conversão..."
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Polaridade *</label>
              <select 
                value={formData.polaridade} 
                onChange={e => setFormData({...formData, polaridade: e.target.value as KPIPolarity})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none"
              >
                <option value="POSITIVO">Positivo (+ melhor)</option>
                <option value="NEGATIVO">Negativo (- melhor)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Unidade</label>
              <select 
                value={formData.unidade} 
                onChange={e => {
                   const unit = e.target.value;
                   let type: KPIIndicatorValueType = 'number';
                   if (unit === 'R$') type = 'currency';
                   if (unit === 'Porcentagem') type = 'percent';
                   if (unit === 'Nota 0-10') type = 'score';
                   setFormData({...formData, unidade: unit, tipoValor: type});
                }}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none"
              >
                <option value="Quantidade">Quantidade</option>
                <option value="R$">Valor (R$)</option>
                <option value="Porcentagem">Porcentagem (%)</option>
                <option value="Nota 0-10">Nota (0 a 10)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Meta Mensal *</label>
            <div className="relative">
               <input 
                 type="number" step="0.01" required value={formData.metaMensal} 
                 onChange={e => setFormData({...formData, metaMensal: Number(e.target.value)})}
                 className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-lg font-serif font-black text-[#2D3748] outline-none"
               />
               <Zap className="absolute right-5 top-1/2 -translate-y-1/2 text-amber-400" size={20} />
            </div>
          </div>

          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
             <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
             <p className="text-[11px] font-serif italic text-blue-800 leading-relaxed">
               Indicadores positivos alertam queda de performance se estiverem abaixo da meta. 
               Indicadores negativos (ex: faltas) alertam se ultrapassarem o teto definido.
             </p>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-black text-[10px] uppercase text-gray-400 hover:bg-gray-50 transition-all">Cancelar</button>
            <button type="submit" className="flex-1 py-4 bg-[#8B1538] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-[#8B1538]/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
              <Save size={18} /> {editingIndicator ? 'Atualizar' : 'Criar Indicador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KPIIndicatorModal;
