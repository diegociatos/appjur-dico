
import React, { useState, useEffect } from 'react';
import { 
  Save, Plus, Trash2, Edit3, X, ArrowRight, Settings, Info, Layers, 
  Palette, ListOrdered, AlertTriangle, Zap, Briefcase, Star, Calculator, 
  CheckCircle2, ToggleLeft, ToggleRight, FileText, ShieldAlert, Coins, Trophy
} from 'lucide-react';
import { PointRule, DailyEntryType, DailyCategory, CategoryColor, ProcessScoreConfig, UserProfile } from '../types';

interface ConfigPointsViewProps {
  rules: PointRule[];
  onSaveRules: (rules: PointRule[]) => void;
  dailyTypes: DailyEntryType[];
  onSaveDailyTypes: (types: DailyEntryType[]) => void;
  categories: DailyCategory[];
  onSaveCategories: (cats: DailyCategory[]) => void;
  processScoreConfig: ProcessScoreConfig;
  onSaveProcessScoreConfig: (config: ProcessScoreConfig) => void;
  currentUser: UserProfile;
}

const COLORS_PALETTE: CategoryColor[] = ['blue', 'green', 'gray', 'yellow', 'red', 'purple', 'orange'];

const ConfigPointsView: React.FC<ConfigPointsViewProps> = ({ 
  rules, onSaveRules, dailyTypes, onSaveDailyTypes, 
  categories, onSaveCategories, processScoreConfig, onSaveProcessScoreConfig,
  currentUser
}) => {
  const isAdmin = currentUser.cargo === 'Administrador';
  const [activeTab, setActiveTab] = useState<'daily' | 'categories' | 'processes'>('daily');
  
  const [localProcessConfig, setLocalProcessConfig] = useState<ProcessScoreConfig>(processScoreConfig);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalProcessConfig(processScoreConfig);
  }, [processScoreConfig]);

  // Estados de Modais
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DailyCategory | null>(null);
  const [catForm, setCatForm] = useState<Omit<DailyCategory, 'id'>>({ nome: '', cor: 'blue', ordem: 1 });

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [typeForm, setTypeForm] = useState<Omit<DailyEntryType, 'id'>>({
    nome: '',
    categoriaId: categories[0]?.id || '',
    pontos: 0,
    descricao: '',
    ativo: true
  });

  const colorHex: Record<CategoryColor, string> = {
    blue: 'bg-blue-500', green: 'bg-green-500', gray: 'bg-gray-400', 
    yellow: 'bg-amber-400', red: 'bg-red-500', purple: 'bg-purple-500', orange: 'bg-orange-500'
  };

  const colorBadge: Record<CategoryColor, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100', 
    green: 'bg-green-50 text-green-600 border-green-100', 
    gray: 'bg-gray-50 text-gray-600 border-gray-100', 
    yellow: 'bg-amber-50 text-amber-600 border-amber-100', 
    red: 'bg-red-50 text-red-600 border-red-100', 
    purple: 'bg-purple-50 text-purple-600 border-purple-100', 
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  const handleSaveProcessParams = () => {
    onSaveProcessScoreConfig(localProcessConfig);
    setHasChanges(false);
    alert("Parâmetros de pontuação estratégica salvos!");
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">Configuração Tática</h1>
          <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-60 italic">Gestão exclusiva de parâmetros de performance e inteligência</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => setActiveTab('daily')} className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'daily' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Tipos de Ato</button>
          <button onClick={() => setActiveTab('categories')} className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'categories' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Categorias</button>
          <button onClick={() => setActiveTab('processes')} className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'processes' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Processos</button>
        </div>
      </div>

      {activeTab === 'daily' && (
        <div className="space-y-8 animate-in slide-in-from-left duration-500">
           <div className="bg-white rounded-[3rem] shadow-sm border border-gray-50 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3"><ListOrdered size={16}/> Catálogo de Atividades</h3>
                 <button onClick={() => setIsTypeModalOpen(true)} className="flex items-center gap-2 bg-[#8B1538] text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#8B1538]/20 hover:scale-105 transition-all">
                    <Plus size={14} /> Adicionar Novo Tipo
                 </button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/30">
                    <th className="px-10 py-5 text-[8px] font-black text-gray-300 uppercase">Atividade</th>
                    <th className="px-8 py-5 text-[8px] font-black text-gray-300 uppercase">Categoria</th>
                    <th className="px-8 py-5 text-[8px] font-black text-gray-300 uppercase text-center">Score</th>
                    <th className="px-8 py-5 text-[8px] font-black text-gray-300 uppercase text-center">Status</th>
                    <th className="px-10 py-5 text-[8px] font-black text-gray-300 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dailyTypes.map(type => {
                    const cat = categories.find(c => c.id === type.categoriaId);
                    return (
                      <tr key={type.id} className="hover:bg-gray-50/10 transition-colors group">
                        <td className="px-10 py-6">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-700">{type.nome}</span>
                              <span className="text-[9px] text-gray-300 italic">{type.descricao || 'Sem descrição'}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded text-[8px] font-black uppercase border ${cat ? colorBadge[cat.cor] : 'bg-gray-50'}`}>
                              {cat?.nome || 'Sem Categoria'}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <span className={`text-sm font-black ${type.pontos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {type.pontos > 0 ? '+' : ''}{type.pontos}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <div className={`w-2 h-2 rounded-full mx-auto ${type.ativo ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingTypeId(type.id); setTypeForm({...type}); setIsTypeModalOpen(true); }} className="p-2 text-gray-300 hover:text-blue-500"><Edit3 size={14}/></button>
                              <button onClick={() => onSaveDailyTypes(dailyTypes.filter(t => t.id !== type.id))} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
           <div className="bg-white rounded-[3rem] shadow-sm border border-gray-50 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3"><Layers size={16}/> Gestão de Categorias</h3>
                 <button onClick={() => { setEditingCategory(null); setCatForm({nome: '', cor: 'blue', ordem: categories.length+1}); setIsCatModalOpen(true); }} className="flex items-center gap-2 bg-[#8B1538] text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#8B1538]/20 hover:scale-105 transition-all">
                    <Plus size={14} /> Adicionar Categoria
                 </button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/30">
                    <th className="px-10 py-5 text-[8px] font-black text-gray-300 uppercase">Categoria</th>
                    <th className="px-8 py-5 text-[8px] font-black text-gray-300 uppercase text-center">Cor Visual</th>
                    <th className="px-8 py-5 text-[8px] font-black text-gray-300 uppercase text-center">Ordem</th>
                    <th className="px-10 py-5 text-[8px] font-black text-gray-300 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-gray-50/10 group transition-colors">
                      <td className="px-10 py-6 text-sm font-bold text-gray-700">{cat.nome}</td>
                      <td className="px-8 py-6 text-center">
                        <div className={`w-8 h-2 rounded-full mx-auto ${colorHex[cat.cor]}`}></div>
                      </td>
                      <td className="px-8 py-6 text-center text-xs font-bold text-gray-400">{cat.ordem}º</td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingCategory(cat); setCatForm({...cat}); setIsCatModalOpen(true); }} className="p-2 text-gray-300 hover:text-blue-500"><Edit3 size={14}/></button>
                            <button onClick={() => onSaveCategories(categories.filter(c => c.id !== cat.id))} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'processes' && (
        <div className="max-w-5xl animate-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                 <div className="w-12 h-12 bg-[#8B1538]/5 rounded-2xl flex items-center justify-center text-[#8B1538]"><Calculator size={24}/></div>
                 <div>
                    <h3 className="text-xl font-serif font-bold text-[#8B1538]">Sugestões de Pontuação Estratégica</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Definição dos pilares de mérito para curadoria mensal</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                 {/* Card Nível 1 */}
                 <div className="p-8 bg-purple-50/50 rounded-[2.5rem] border border-purple-100 flex flex-col items-center text-center space-y-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm"><Zap size={20} fill="currentColor" /></div>
                    <span className="text-[9px] font-black text-purple-400 uppercase">Complexidade & Risco</span>
                    <h4 className="text-xs font-black text-purple-700 uppercase">Processo Nível 1</h4>
                    <div className="relative w-24">
                       <input 
                         type="number" 
                         value={localProcessConfig.sugestaoNivel1} 
                         onChange={(e) => { setLocalProcessConfig({...localProcessConfig, sugestaoNivel1: Number(e.target.value)}); setHasChanges(true); }} 
                         className="w-full text-center text-3xl font-serif font-black text-purple-900 bg-white border border-purple-200 rounded-xl py-2 outline-none"
                       />
                       <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[8px] font-black text-purple-300">PTS</span>
                    </div>
                    <p className="text-[10px] font-serif italic text-purple-400 px-4">Peso para dossiês de alta complexidade e impacto direto no valor da banca.</p>
                 </div>

                 {/* Card Contratuais */}
                 <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 flex flex-col items-center text-center space-y-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Star size={20} fill="currentColor" /></div>
                    <span className="text-[9px] font-black text-blue-400 uppercase">Recorrência Fixa</span>
                    <h4 className="text-xs font-black text-blue-700 uppercase">Honorários Contratuais</h4>
                    <div className="relative w-24">
                       <input 
                         type="number" 
                         value={localProcessConfig.sugestaoHonorarios} 
                         onChange={(e) => { setLocalProcessConfig({...localProcessConfig, sugestaoHonorarios: Number(e.target.value)}); setHasChanges(true); }} 
                         className="w-full text-center text-3xl font-serif font-black text-blue-900 bg-white border border-blue-200 rounded-xl py-2 outline-none"
                       />
                       <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[8px] font-black text-blue-300">PTS</span>
                    </div>
                    <p className="text-[10px] font-serif italic text-blue-400 px-4">Peso para processos que sustentam a receita recorrente e fidelização de longo prazo.</p>
                 </div>

                 {/* Card Sucumbenciais */}
                 <div className="p-8 bg-green-50/50 rounded-[2.5rem] border border-green-100 flex flex-col items-center text-center space-y-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm"><Coins size={20} /></div>
                    <span className="text-[9px] font-black text-green-400 uppercase">Êxito & Resultado</span>
                    <h4 className="text-xs font-black text-green-700 uppercase">Honorários Sucumbenciais</h4>
                    <div className="relative w-24">
                       <input 
                         type="number" 
                         value={localProcessConfig.sugestaoSucumbenciais} 
                         onChange={(e) => { setLocalProcessConfig({...localProcessConfig, sugestaoSucumbenciais: Number(e.target.value)}); setHasChanges(true); }} 
                         className="w-full text-center text-3xl font-serif font-black text-green-900 bg-white border border-green-200 rounded-xl py-2 outline-none"
                       />
                       <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[8px] font-black text-green-300">PTS</span>
                    </div>
                    <p className="text-[10px] font-serif italic text-green-400 px-4">Peso para vitórias processuais que geram receita variável e êxito direto.</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                 <div className="flex items-center gap-3 text-gray-400 text-xs italic">
                    <Info size={18} className="text-[#8B1538]" />
                    Estes valores são utilizados pelo sistema como sugestão padrão na Fila de Validação.
                 </div>
                 <button 
                  onClick={handleSaveProcessParams}
                  disabled={!hasChanges}
                  className={`px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all
                    ${hasChanges ? 'bg-[#8B1538] text-white shadow-[#8B1538]/20' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                 >
                    <Save size={16} className="inline mr-2"/> Salvar Parâmetros
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL CATEGORIA */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="text-lg font-serif font-bold text-[#8B1538]">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                 <button onClick={() => setIsCatModalOpen(false)} className="text-gray-300 hover:text-red-500"><X size={24}/></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); onSaveCategories(editingCategory ? categories.map(c=>c.id===editingCategory.id ? {...catForm, id: c.id}:c) : [...categories, {...catForm, id: `cat_${Date.now()}`}]); setIsCatModalOpen(false); }} className="p-10 space-y-6">
                 <input type="text" required value={catForm.nome} onChange={e=>setCatForm({...catForm, nome: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" placeholder="Nome da Categoria"/>
                 <div className="flex gap-3 justify-center">
                    {COLORS_PALETTE.map(c => <button key={c} type="button" onClick={()=>setCatForm({...catForm, cor: c})} className={`w-8 h-8 rounded-full ${colorHex[c]} border-4 ${catForm.cor === c ? 'border-[#8B1538]' : 'border-white'}`}/>)}
                 </div>
                 <button type="submit" className="w-full py-4 bg-[#8B1538] text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Salvar</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL TIPO ATO */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="text-lg font-serif font-bold text-[#8B1538]">{editingTypeId ? 'Editar Tipo' : 'Novo Tipo'}</h3>
                 <button onClick={() => setIsTypeModalOpen(false)} className="text-gray-300 hover:text-red-500"><X size={24}/></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); onSaveDailyTypes(editingTypeId ? dailyTypes.map(t=>t.id===editingTypeId ? {...typeForm, id: t.id}:t) : [...dailyTypes, {...typeForm, id: `dt_${Date.now()}`}]); setIsTypeModalOpen(false); }} className="p-10 space-y-6">
                 <div className="space-y-4">
                    <input type="text" required value={typeForm.nome} onChange={e=>setTypeForm({...typeForm, nome: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" placeholder="Nome do Ato"/>
                    <select value={typeForm.categoriaId} onChange={e=>setTypeForm({...typeForm, categoriaId: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold">
                       {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <div className="flex items-center gap-4">
                       <label className="text-[10px] font-black text-gray-400 uppercase">Pontos:</label>
                       <input type="number" step="0.5" value={typeForm.pontos} onChange={e=>setTypeForm({...typeForm, pontos: Number(e.target.value)})} className="w-20 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold"/>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-4 bg-[#8B1538] text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Salvar Configuração</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPointsView;
