
import React, { useState, useEffect } from 'react';
import { X, Calendar, Edit3, AlertCircle, ArrowRight, Zap, Save } from 'lucide-react';
import { Processo, ProcessUpdate, ProcessStatus, ProcessScoreConfig } from '../types';

interface ProcessUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (processId: string, update: ProcessUpdate) => void;
  process: Processo;
  scoreConfig?: ProcessScoreConfig;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const ProcessUpdateModal: React.FC<ProcessUpdateModalProps> = ({ isOpen, onClose, onSave, process, scoreConfig }) => {
  const now = new Date();
  const [formData, setFormData] = useState({
    mes_referencia: MESES[now.getMonth()],
    ano_referencia: now.getFullYear(),
    movimentacoes_realizadas: '',
    proximos_passos: '',
    status_no_momento: process.status
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        mes_referencia: MESES[now.getMonth()],
        ano_referencia: now.getFullYear(),
        movimentacoes_realizadas: '',
        proximos_passos: '',
        status_no_momento: process.status
      });
      setErrors({});
      setSuccess(false);
    }
  }, [isOpen, process]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.movimentacoes_realizadas.trim()) {
      newErrors.movimentacoes_realizadas = 'O resumo estratégico do mês é obrigatório.';
    }
    
    // Verifica se já atualizou este mês (opcional, para controle de score)
    const isDuplicate = process.timeline.some(u => u.mes_referencia === formData.mes_referencia && u.ano_referencia === formData.ano_referencia);
    if (isDuplicate) {
      newErrors.periodo = `Atenção: Já existe uma movimentação registrada para ${formData.mes_referencia}.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).filter(k => k !== 'periodo').length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    
    const newUpdate: ProcessUpdate = {
      id: `upd_${Date.now()}`,
      ...formData,
      riscos_identificados: '', // Campo opcional mantido para compatibilidade de tipos
      data_atualizacao: new Date().toISOString().split('T')[0],
      advogado_atualizador: process.advogado_responsavel,
      status_validacao: 'PENDENTE_VALIDACAO'
    };

    onSave(process.id, newUpdate);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
        <div className="bg-white rounded-[3rem] p-12 text-center animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={40} fill="currentColor" />
           </div>
           <h2 className="text-2xl font-serif font-bold text-gray-800">Movimentação Salva!</h2>
           <p className="text-sm text-gray-400 font-serif italic mt-2">O histórico do processo foi atualizado com sucesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B1538]/5 rounded-2xl flex items-center justify-center text-[#8B1538]">
              <Edit3 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">Atualização Mensal do Processo</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Relato Estratégico de Performance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#8B1538] p-2 hover:bg-gray-100 rounded-full transition-all"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#8B1538]"/>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data do Lançamento:</span>
                <span className="text-xs font-bold text-gray-700">{now.toLocaleDateString()}</span>
             </div>
             <div className="text-[10px] font-black text-amber-600 uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                Ref: {formData.mes_referencia} / {formData.ano_referencia}
             </div>
          </div>

          {errors.periodo && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-700">
               <AlertCircle size={18}/>
               <span className="text-[11px] font-bold uppercase">{errors.periodo}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Resumo Estratégico do Mês *</label>
              <textarea 
                value={formData.movimentacoes_realizadas} 
                onChange={(e) => setFormData({...formData, movimentacoes_realizadas: e.target.value})} 
                placeholder="Descreva detalhadamente as vitórias e movimentações importantes deste período..." 
                className={`w-full border rounded-2xl px-6 py-5 text-sm h-40 resize-none outline-none transition-all ${errors.movimentacoes_realizadas ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-gray-50 focus:ring-4 focus:ring-[#8B1538]/5'}`} 
              />
              {errors.movimentacoes_realizadas && <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.movimentacoes_realizadas}</span>}
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Próximos Passos</label>
              <textarea 
                value={formData.proximos_passos} 
                onChange={(e) => setFormData({...formData, proximos_passos: e.target.value})} 
                placeholder="O que planeja executar no próximo mês para este dossiê?" 
                className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-6 py-5 text-sm h-28 resize-none outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all" 
              />
            </div>
          </div>
        </div>

        <div className="p-10 border-t border-gray-100 bg-gray-50 flex gap-6">
          <button type="button" onClick={onClose} className="flex-1 py-5 border-2 border-gray-200 rounded-2xl font-black text-[10px] uppercase text-gray-400 hover:bg-white transition-all">Cancelar</button>
          <button onClick={handleSave} className="flex-1 py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95">
            <Save size={18} /> Salvar Atualização
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessUpdateModal;
