
import React, { useState } from 'react';
import { 
  Building2, Plus, Trash2, Edit3, X, Save, Layers, ListPlus, 
  Wallet, ShieldCheck, CheckCircle2, ChevronRight, AlertCircle, LayoutGrid,
  Settings2, FileText, Type
} from 'lucide-react';
import { FinanceBank, FinanceCategory, FinanceSubcategory, DRERubric } from '../types';

interface FinanceSettingsViewProps {
  banks: FinanceBank[];
  categories: FinanceCategory[];
  subcategories: FinanceSubcategory[];
  onUpdateBanks: (banks: FinanceBank[]) => void;
  onUpdateCategories: (categories: FinanceCategory[]) => void;
  onUpdateSubcategories: (subcategories: FinanceSubcategory[]) => void;
  dreRubrics: DRERubric[];
  onUpdateDreRubrics: (rubrics: DRERubric[]) => void;
}

const FinanceSettingsView: React.FC<FinanceSettingsViewProps> = ({ 
  banks, categories, subcategories, onUpdateBanks, onUpdateCategories, onUpdateSubcategories,
  dreRubrics, onUpdateDreRubrics
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'banks' | 'dre_structure' | 'dre_names'>('banks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'bank' | 'category' | 'subcategory' | 'rubric'>('bank');
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const handleOpenModal = (type: any, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || (type === 'bank' ? { nome: '', ativo: true, saldoInicial: 0 } : 
                         type === 'category' ? { nome: '', tipo: 'DESPESA', dreLine: 'DESPESA_ADMIN', ativo: true } :
                         type === 'rubric' ? { label: '' } :
                         { nome: '', categoryId: categories[0]?.id, ativo: true }));
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (modalType === 'bank') {
      const newList = editingItem ? banks.map(b => b.id === editingItem.id ? {...formData, id: b.id} : b) : [...banks, {...formData, id: `bank_${Date.now()}`}];
      onUpdateBanks(newList);
    } else if (modalType === 'category') {
      const newList = editingItem ? categories.map(c => c.id === editingItem.id ? {...formData, id: c.id} : c) : [...categories, {...formData, id: `cat_${Date.now()}`}];
      onUpdateCategories(newList);
    } else if (modalType === 'rubric') {
      const newList = dreRubrics.map(r => r.id === editingItem.id ? { ...r, label: formData.label } : r);
      onUpdateDreRubrics(newList);
    } else {
      const newList = editingItem ? subcategories.map(s => s.id === editingItem.id ? {...formData, id: s.id} : s) : [...subcategories, {...formData, id: `sub_${Date.now()}`}];
      onUpdateSubcategories(newList);
    }
    setIsModalOpen(false);
  };

  const availableDreLines = dreRubrics.filter(line => line.type === 'header');

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
           <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">Arquitetura de Plano de Contas</h1>
           <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">Mapeamento direto entre categorias operacionais e rubricas do DRE</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
           <button onClick={() => setActiveSubTab('banks')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'banks' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Bancos</button>
           <button onClick={() => setActiveSubTab('dre_structure')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'dre_structure' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Plano de Contas</button>
           <button onClick={() => setActiveSubTab('dre_names')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'dre_names' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Nomes do DRE</button>
        </div>
      </div>

      {activeSubTab === 'banks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-left duration-500">
           {banks.map(bank => (
             <div key={bank.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-6 group hover:border-[#8B1538]/20 transition-all">
                <div className="flex items-center justify-between">
                   <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-[#8B1538]/5 group-hover:text-[#8B1538] transition-colors"><Building2 size={24}/></div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal('bank', bank)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={18}/></button>
                      <button onClick={() => onUpdateBanks(banks.filter(b => b.id !== bank.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                   </div>
                </div>
                <div>
                   <h3 className="text-xl font-serif font-bold text-gray-700">{bank.nome}</h3>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo Inicial: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bank.saldoInicial)}</span>
                </div>
             </div>
           ))}
           <button onClick={() => handleOpenModal('bank')} className="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-gray-400 hover:border-[#8B1538]/20 hover:text-[#8B1538] transition-all gap-2 group min-h-[160px]">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-[#8B1538]/5 transition-colors"><Plus size={24}/></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Banco</span>
           </button>
        </div>
      )}

      {activeSubTab === 'dre_structure' && (
        <div className="space-y-12 animate-in slide-in-from-right duration-500">
           {categories.map(cat => (
             <div key={cat.id} className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${cat.tipo === 'RECEITA' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}><Layers size={24}/></div>
                      <div>
                         <h3 className="text-lg font-serif font-bold text-gray-700">{cat.nome}</h3>
                         <span className="text-[9px] font-black text-[#8B1538] uppercase tracking-[0.2em] bg-[#8B1538]/5 px-3 py-1 rounded-full border border-[#8B1538]/10">
                            Vínculo DRE: {dreRubrics.find(l=>l.id===cat.dreLine)?.label || 'Não Vinculado'}
                         </span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <button onClick={() => handleOpenModal('category', cat)} className="p-2 text-gray-300 hover:text-blue-500 transition-colors"><Edit3 size={18}/></button>
                      <button onClick={() => handleOpenModal('subcategory', { categoryId: cat.id, ativo: true })} className="flex items-center gap-2 bg-[#8B1538] text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#8B1538]/20 hover:scale-105 active:scale-95 transition-all"><Plus size={14}/> Nova Subcategoria</button>
                   </div>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {subcategories.filter(s => s.categoryId === cat.id).map(sub => (
                     <div key={sub.id} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                        <span className="text-xs font-bold text-gray-600">{sub.nome}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleOpenModal('subcategory', sub)} className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors"><Edit3 size={16}/></button>
                           <button onClick={() => onUpdateSubcategories(subcategories.filter(s => s.id !== sub.id))} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ))}
           <button onClick={() => handleOpenModal('category')} className="w-full py-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-gray-400 group hover:border-[#8B1538]/20 hover:text-[#8B1538] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-[#8B1538]/5 transition-colors"><LayoutGrid size={32}/></div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Criar Categoria de Agrupamento</span>
           </button>
        </div>
      )}

      {activeSubTab === 'dre_names' && (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
           <div className="p-10 border-b border-gray-50 bg-gray-50/20 flex items-center gap-4">
              <Type className="text-[#8B1538]" size={24} />
              <h3 className="text-xl font-serif font-bold text-[#8B1538]">Configuração de Cabeçalhos do DRE</h3>
           </div>
           <div className="p-10 space-y-4">
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4 mb-8">
                 <AlertCircle className="text-amber-500 shrink-0" size={20} />
                 <p className="text-xs font-serif italic text-amber-800">
                    A edição dos nomes abaixo altera apenas o rótulo visual no relatório. A lógica contábil e os vínculos com o Plano de Contas permanecem preservados.
                 </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {dreRubrics.map(rubric => (
                   <div key={rubric.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group">
                      <div>
                         <span className="block text-[8px] font-black text-gray-400 uppercase mb-1">Identificador Interno: {rubric.id}</span>
                         <span className="text-sm font-bold text-gray-700">{rubric.label}</span>
                      </div>
                      <button 
                        onClick={() => handleOpenModal('rubric', rubric)}
                        className="p-3 bg-white text-gray-300 hover:text-[#8B1538] rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                      >
                         <Edit3 size={18} />
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* MODAL CONFIG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 font-serif-elegant">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 text-[#8B1538] rounded-2xl flex items-center justify-center shadow-inner"><Settings2 size={24}/></div>
                    <div>
                       <h3 className="text-xl font-serif font-bold text-[#8B1538]">
                          {modalType === 'bank' ? 'Configurar Banco' : 
                           modalType === 'category' ? 'Categoria do Plano' : 
                           modalType === 'rubric' ? 'Editar Nome da Rubrica' :
                           'Nova Subcategoria'}
                       </h3>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-red-500 p-2 transition-colors"><X size={32}/></button>
              </div>
              <div className="p-10 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
                 
                 {modalType === 'rubric' ? (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nome Exibido no Relatório *</label>
                       <input 
                         type="text" required value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none"
                       />
                    </div>
                 ) : (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nome Identificador *</label>
                       <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all" />
                    </div>
                 )}

                 {modalType === 'bank' && (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Saldo Inicial (R$)</label>
                       <input type="number" step="0.01" value={formData.saldoInicial} onChange={e => setFormData({...formData, saldoInicial: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none transition-all" />
                    </div>
                 )}

                 {modalType === 'category' && (
                   <>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Natureza Contábil</label>
                         <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 shadow-inner">
                            <button type="button" onClick={() => setFormData({...formData, tipo: 'RECEITA'})} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${formData.tipo === 'RECEITA' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>Receita (+)</button>
                            <button type="button" onClick={() => setFormData({...formData, tipo: 'DESPESA'})} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${formData.tipo === 'DESPESA' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>Despesa (-)</button>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-[#8B1538] uppercase tracking-widest block ml-1">Linha Correspondente no DRE *</label>
                         <select value={formData.dreLine} onChange={e => setFormData({...formData, dreLine: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none cursor-pointer hover:bg-white transition-colors">
                            {availableDreLines.map(line => (
                               <option key={line.id} value={line.id}>{line.label}</option>
                            ))}
                         </select>
                      </div>
                   </>
                 )}

                 {modalType === 'subcategory' && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Vincular à Categoria Pai</label>
                      <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none transition-all">
                         {categories.map(c => <option key={c.id} value={c.id}>{c.nome} ({dreRubrics.find(r=>r.id===c.dreLine)?.label})</option>)}
                      </select>
                   </div>
                 )}
              </div>
              <div className="p-8 border-t border-gray-100 bg-gray-50">
                 <button onClick={handleSave} className="w-full py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-[#72112d] active:scale-95 transition-all">
                    <Save size={18}/> Salvar Parâmetros
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FinanceSettingsView;
