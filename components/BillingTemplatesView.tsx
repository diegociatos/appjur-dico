
import React, { useState, useMemo } from 'react';
import { 
  RotateCcw, Plus, Search, Play, Pause, Zap, CheckCircle2, AlertCircle, 
  Calendar, Info, ArrowRight, Settings2, Trash2, Edit3, Loader2, Sparkles
} from 'lucide-react';
import { BillingTemplate, ClientContract, UserProfile } from '../types';
import BillingTemplateModal from './BillingTemplateModal';

interface BillingTemplatesViewProps {
  templates: BillingTemplate[];
  contracts: ClientContract[];
  onAddTemplate: (template: BillingTemplate) => void;
  onUpdateTemplate: (template: BillingTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onBulkGenerate: (month: string, year: number) => void;
  currentUser: UserProfile;
}

const BillingTemplatesView: React.FC<BillingTemplatesViewProps> = ({ 
  templates, contracts, onAddTemplate, onUpdateTemplate, onDeleteTemplate, onBulkGenerate, currentUser 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BillingTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
      t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  const handleRunBulk = async () => {
    setIsGenerating(true);
    // Simula processamento
    setTimeout(() => {
      onBulkGenerate('Fevereiro', 2026);
      setIsGenerating(false);
      alert('Automação Concluída: Rascunhos de faturamento provisionados com sucesso!');
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">Automação de Recorrência</h1>
          <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">Provisionamento automático de honorários e controle de ciclo financeiro</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
            onClick={handleRunBulk}
            disabled={isGenerating}
            className="flex items-center gap-3 bg-white border-2 border-[#8B1538]/10 text-[#8B1538] px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/5 hover:bg-[#8B1538]/5 active:scale-95 transition-all disabled:opacity-50"
           >
             {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} fill="currentColor"/>}
             Gerar Rascunhos do Mês
           </button>
           <button 
            onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }}
            className="flex items-center gap-3 bg-[#8B1538] text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:scale-105 active:scale-95 transition-all"
           >
            <Plus size={20} /> Novo Template
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><RotateCcw size={28}/></div>
            <div>
               <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Templates Ativos</span>
               <span className="text-2xl font-bold text-gray-800">{templates.filter(t=>t.isActive).length}</span>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Sparkles size={28}/></div>
            <div>
               <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Provisionamento Auto</span>
               <span className="text-2xl font-bold text-gray-800">{templates.filter(t=>t.autoCreate).length}</span>
            </div>
         </div>
         <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm"><Info size={28}/></div>
            <p className="text-[10px] font-serif font-medium text-amber-800 italic leading-relaxed">
              Templates automatizam a criação de rascunhos todo dia 01, baseando-se no valor fixo do contrato.
            </p>
         </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" placeholder="Pesquisar por cliente ou nome do template..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all"
            />
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identificação do Ciclo</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Dia / Freq.</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Geração Automática</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Config</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTemplates.map(template => (
              <tr key={template.id} className="hover:bg-gray-50/10 transition-colors group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-gray-100 ${template.isActive ? 'bg-[#8B1538]/5 text-[#8B1538]' : 'bg-gray-50 text-gray-300'}`}>
                       <RotateCcw size={20}/>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-serif font-bold text-[#2D3748]">{template.clientName}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{template.name}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                   <div className="flex flex-col">
                      <span className="text-sm font-serif font-black text-gray-700">Dia {template.billingDay}</span>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{template.pattern}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-center">
                   <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${template.autoCreate ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                      <Zap size={12} className={template.autoCreate ? 'fill-current' : ''}/>
                      <span className="text-[10px] font-black uppercase">{template.autoCreate ? 'HABILITADA' : 'MANUAL'}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-center">
                   <button 
                    onClick={() => onUpdateTemplate({...template, isActive: !template.isActive})}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight border transition-all
                      ${template.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                   >
                      {template.isActive ? 'ATIVO' : 'PAUSADO'}
                   </button>
                </td>
                <td className="px-10 py-6 text-right">
                   <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingTemplate(template); setIsModalOpen(true); }}
                        className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                         <Settings2 size={18}/>
                      </button>
                      <button 
                        onClick={() => onDeleteTemplate(template.id)}
                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                         <Trash2 size={18}/>
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BillingTemplateModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(t) => {
          if (editingTemplate) onUpdateTemplate(t);
          else onAddTemplate(t);
        }}
        templateToEdit={editingTemplate}
        contracts={contracts}
      />
    </div>
  );
};

export default BillingTemplatesView;
