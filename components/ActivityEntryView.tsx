
import React, { useState, useMemo } from 'react';
import { 
  Zap, CheckCircle2, Plus, Calendar, Save, ChevronDown, Scale,
  Calculator, Info, Edit3, Trash2, Lock, Unlock, History, Clock, 
  ArrowRight, X, Coins, FileText, Star, TrendingUp, AlertTriangle,
  Download, Filter, Briefcase, Gem, Trophy
} from 'lucide-react';
import { QualifiedActivity, MonthlyIndicator, PointRule, DailyEntry, DailyEntryType, DailyCategory, CategoryColor, ScoreEvent } from '../types';
import { calculateAdvancedScore } from '../utils/productivity';

interface ActivityEntryViewProps {
  activities: QualifiedActivity[];
  indicators: MonthlyIndicator[];
  dailyEntries: DailyEntry[];
  dailyEntryTypes: DailyEntryType[];
  dailyCategories: DailyCategory[];
  rules: PointRule[];
  scoreEvents: ScoreEvent[];
  onAdd: (activity: Omit<QualifiedActivity, 'id' | 'status_validacao'>) => void;
  onValidate: (id: string, status: 'CONFIRMADO' | 'RECUSADO') => void;
  onSaveIndicator: (indicator: MonthlyIndicator) => void;
  onUpdateDailyEntries: (entries: DailyEntry[]) => void;
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const LAWYERS = ['Renan Almeida', 'Stephanie', 'Bruna', 'Deisinay', 'Sarah'];

const ActivityEntryView: React.FC<ActivityEntryViewProps> = ({ 
  activities, indicators, dailyEntries, dailyEntryTypes, dailyCategories, rules, scoreEvents,
  onAdd, onValidate, onSaveIndicator, onUpdateDailyEntries
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [editingDailyId, setEditingDailyId] = useState<string | null>(null);

  const [selectedLawyer, setSelectedLawyer] = useState(LAWYERS[0]);
  const [selectedMonth, setSelectedMonth] = useState(MESES[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(2026);

  const [dailyFormDate, setDailyFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyFormValues, setDailyFormValues] = useState<Record<string, number>>(
    Object.fromEntries(dailyEntryTypes.map(t => [t.id, 0]))
  );

  // Consolidação de Dados para o Advogado Selecionado
  const indicator = useMemo(() => {
    const existing = indicators.find(i => i.advogado === selectedLawyer && i.mes === selectedMonth && i.ano === selectedYear);
    // Fix: Added missing score_total and other required properties to match MonthlyIndicator type
    return existing || {
      advogado: selectedLawyer, mes: selectedMonth, ano: selectedYear, is_fechado: false, score_total: 0,
      bloco_producao: {}, bloco_resultado: {}, bloco_organizacao: {}, bloco_comunicacao: {}, bloco_qualidade: { erros_ocorridos: 0 }, bloco_financeiro: {}
    } as MonthlyIndicator;
  }, [selectedLawyer, selectedMonth, selectedYear, indicators]);

  const scoreResult = useMemo(() => {
    return calculateAdvancedScore(indicator, rules, activities, dailyEntries, dailyEntryTypes, dailyCategories, scoreEvents);
  }, [indicator, activities, rules, dailyEntries, dailyEntryTypes, dailyCategories, scoreEvents]);

  const currentEntryScore = useMemo(() => {
    return (Object.entries(dailyFormValues) as [string, number][]).reduce((acc, [id, val]) => {
      const type = dailyEntryTypes.find(t => t.id === id);
      return acc + (val * (type?.pontos || 0));
    }, 0);
  }, [dailyFormValues, dailyEntryTypes]);

  const handleDailySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (indicator.is_fechado) return alert("Este mês já foi fechado pela gestão.");

    const entryDate = new Date(dailyFormDate);
    const entryMonth = MESES[entryDate.getMonth()];
    const entryYear = entryDate.getFullYear();

    if (editingDailyId) {
      onUpdateDailyEntries(dailyEntries.map(e => e.id === editingDailyId ? { 
        id: editingDailyId, advogado: selectedLawyer, data: dailyFormDate, mes: entryMonth, ano: entryYear,
        valores: dailyFormValues, criado_em: e.criado_em, editado_em: new Date().toISOString()
      } : e));
      setEditingDailyId(null);
    } else {
      const newEntry: DailyEntry = {
        id: `daily_${Date.now()}`, advogado: selectedLawyer, data: dailyFormDate, mes: entryMonth, ano: entryYear,
        valores: dailyFormValues, criado_em: new Date().toISOString()
      };
      onUpdateDailyEntries([newEntry, ...dailyEntries]);
    }
    setDailyFormValues(Object.fromEntries(dailyEntryTypes.map(t => [t.id, 0])));
  };

  const handleEditDaily = (entry: DailyEntry) => {
    setDailyFormDate(entry.data);
    setDailyFormValues({ ...entry.valores });
    setEditingDailyId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const colorClasses: Record<CategoryColor, string> = {
    blue: 'border-blue-100 bg-blue-50/30 text-blue-600',
    green: 'border-green-100 bg-green-50/30 text-green-600',
    gray: 'border-gray-200 bg-gray-50/30 text-gray-500',
    yellow: 'border-amber-100 bg-amber-50/30 text-amber-600',
    red: 'border-red-100 bg-red-50/30 text-red-600',
    purple: 'border-purple-100 bg-purple-50/30 text-purple-600',
    orange: 'border-orange-100 bg-orange-50/30 text-orange-600',
  };

  return (
    <div className="animate-in fade-in duration-500 pb-24">
      {/* Header Unificado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#8B1538]">Monitor de Performance</h1>
          <p className="text-[#2D3748] mt-2 opacity-70 italic font-serif">Lançamentos táticos e análise de score em tempo real</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => setActiveTab('daily')} className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'daily' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Lançamento Diário</button>
          <button onClick={() => setActiveTab('monthly')} className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'monthly' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Consolidado Mensal</button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-10">
        {/* Lado Esquerdo: Área de Trabalho */}
        <div className="flex-1 space-y-10">
          {/* Seletor de Contexto (Sticky) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-wrap items-center gap-10 sticky top-4 z-20">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Foco de Análise</label>
                <select value={selectedLawyer} onChange={(e) => setSelectedLawyer(e.target.value)} className="pl-4 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none appearance-none cursor-pointer">
                  {LAWYERS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Período Fiscal</label>
                <div className="flex gap-2">
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="pl-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold cursor-pointer">
                    {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="pl-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold cursor-pointer">
                    <option value={2026}>2026</option>
                  </select>
                </div>
             </div>
             <div className="ml-auto hidden lg:flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${indicator.is_fechado ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status do Mês: {indicator.is_fechado ? 'FECHADO' : 'ABERTO'}</span>
             </div>
          </div>

          {activeTab === 'daily' ? (
            <div className="animate-in slide-in-from-left duration-500 space-y-10">
               {/* Formulário de Lançamento */}
               <div className={`bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 relative overflow-hidden ${indicator.is_fechado ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
                    <h3 className="text-[11px] font-black text-[#8B1538] uppercase tracking-[0.3em] flex items-center gap-3">
                      <Zap size={20} /> {editingDailyId ? 'Ajustar Lançamento' : 'Novo Ato Jurídico'}
                    </h3>
                    <input type="date" value={dailyFormDate} onChange={e => setDailyFormDate(e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold outline-none" />
                  </div>

                  <form onSubmit={handleDailySubmit} className="space-y-12">
                     <div className="space-y-12">
                        {dailyCategories.sort((a, b) => a.ordem - b.ordem).map(cat => {
                          const types = dailyEntryTypes.filter(t => t.categoriaId === cat.id && t.ativo);
                          if (types.length === 0) return null;
                          return (
                            <div key={cat.id} className={`p-8 rounded-[2.5rem] border-2 ${colorClasses[cat.cor].split(' ')[0]} ${colorClasses[cat.cor].split(' ')[1]} space-y-6`}>
                               <h4 className={`font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-2 ${colorClasses[cat.cor].split(' ')[2]}`}>
                                 <div className="w-1.5 h-4 bg-current opacity-30 rounded-full"></div> {cat.nome}
                               </h4>
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                  {types.map(type => (
                                    <div key={type.id} className="space-y-2">
                                       <div className="flex justify-between items-center px-1">
                                          <label className="text-[10px] font-bold text-gray-400 uppercase truncate max-w-[120px]">{type.nome}</label>
                                          <span className="text-[9px] font-black text-gray-300">+{type.pontos} pts</span>
                                       </div>
                                       <input 
                                          type="number" min="0" value={dailyFormValues[type.id] || 0}
                                          onChange={e => setDailyFormValues({...dailyFormValues, [type.id]: Number(e.target.value)})}
                                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all"
                                       />
                                    </div>
                                  ))}
                               </div>
                            </div>
                          );
                        })}
                     </div>

                     <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-50">
                        <div className={`flex items-center gap-6 p-6 rounded-3xl border-2 transition-all ${currentEntryScore > 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                           <Calculator size={28} />
                           <div>
                              <span className="text-[10px] font-black uppercase tracking-widest block opacity-60">Impacto no Score</span>
                              <span className="text-3xl font-serif font-bold">+{currentEntryScore.toFixed(1)} <span className="text-sm font-black">pontos</span></span>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           {editingDailyId && <button type="button" onClick={() => {setEditingDailyId(null); setDailyFormValues(Object.fromEntries(dailyEntryTypes.map(t => [t.id, 0])))}} className="px-8 py-4 border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-400">Cancelar</button>}
                           <button type="submit" className="flex items-center gap-3 bg-[#8B1538] text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-[#8B1538]/30 hover:scale-105 active:scale-95 transition-all">
                              <Save size={20} /> {editingDailyId ? 'Confirmar Ajuste' : 'Salvar no Prontuário'}
                           </button>
                        </div>
                     </div>
                  </form>
               </div>

               {/* Histórico Recente */}
               <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                     <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3"><History size={18} /> Linha do Tempo Diária</h3>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase">Data</th>
                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase">Resumo da Produção</th>
                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {dailyEntries.filter(e => e.advogado === selectedLawyer && e.mes === selectedMonth).map(entry => (
                        <tr key={entry.id} className="group hover:bg-gray-50/20 transition-all">
                          <td className="px-8 py-6 text-sm font-serif font-bold text-gray-700">{entry.data.split('-').reverse().join('/')}</td>
                          <td className="px-8 py-6">
                             <div className="flex flex-wrap gap-2">
                                {Object.entries(entry.valores).map(([id, val]) => {
                                  if (val === 0) return null;
                                  const type = dailyEntryTypes.find(t => t.id === id);
                                  return (
                                    <span key={id} className="text-[9px] font-black px-2 py-1 rounded bg-white border border-gray-100 shadow-sm text-gray-500 uppercase">
                                      {type?.nome || 'Atividade'}: {val}
                                    </span>
                                  );
                                })}
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditDaily(entry)} className="p-2.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                                <button onClick={() => onUpdateDailyEntries(dailyEntries.filter(i => i.id !== entry.id))} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                      {dailyEntries.filter(e => e.advogado === selectedLawyer && e.mes === selectedMonth).length === 0 && (
                        <tr><td colSpan={3} className="px-8 py-20 text-center text-xs font-serif italic text-gray-400">Nenhum lançamento para este período.</td></tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right duration-500 space-y-10">
               {/* Extrato Consolidado */}
               <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-10 border-b border-gray-50 bg-gray-50/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div>
                        <h3 className="text-xl font-serif font-bold text-[#8B1538]">DRE de Produtividade</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Visão Analítica Mensal — {selectedMonth}</p>
                     </div>
                     <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-5 py-3 border border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:bg-white shadow-sm transition-all"><Download size={16}/> Exportar PDF</button>
                        {!indicator.is_fechado && (
                          <button onClick={() => onSaveIndicator({...indicator, is_fechado: true})} className="flex items-center gap-2 px-5 py-3 bg-[#8B1538] text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-[#8B1538]/20 hover:scale-105 transition-all"><Lock size={16}/> Fechar Mês</button>
                        )}
                     </div>
                  </div>

                  <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                     {/* Breakdown de Pontos */}
                     <div className="space-y-8">
                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Filter size={16}/> Composição da Nota</h4>
                        <div className="space-y-6">
                           {[
                             { label: 'Produção Tática (Diária)', value: scoreResult.breakdown.producao, color: 'bg-blue-500' },
                             { label: 'Updates de Processos', value: scoreEvents.filter(e => e.advogado === selectedLawyer && e.mes === selectedMonth && e.tipoEvento === 'PROCESS_UPDATE_MONTHLY').reduce((acc, e) => acc + e.pontos, 0), color: 'bg-amber-500' },
                             { label: 'Impacto Estratégico (Êxitos)', value: scoreResult.breakdown.impacto, color: 'bg-purple-500' },
                             { label: 'Resultados Diversos', value: scoreResult.breakdown.resultado, color: 'bg-green-500' },
                           ].map(item => (
                             <div key={item.label} className="group">
                                <div className="flex justify-between items-center mb-2">
                                   <span className="text-[12px] font-bold text-gray-600 font-serif">{item.label}</span>
                                   <span className="text-[12px] font-black text-[#8B1538]">+{item.value.toFixed(1)}</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                   <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(100, (item.value / (scoreResult.score_total || 1)) * 100)}%` }}></div>
                                </div>
                             </div>
                           ))}
                           <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                              <span className="text-[11px] font-black text-red-400 uppercase">Penalidades Críticas</span>
                              <span className="text-sm font-black text-red-500">-{scoreResult.penalidades} pts</span>
                           </div>
                        </div>
                     </div>

                     {/* Insights IA do Consolidado */}
                     <div className="bg-[#8B1538]/[0.02] p-8 rounded-[2.5rem] border border-[#8B1538]/5 flex flex-col justify-between">
                        <div>
                           <div className="flex items-center gap-2 mb-6">
                              <div className="w-8 h-8 bg-[#8B1538] text-white rounded-lg flex items-center justify-center"><Star size={16} fill="currentColor"/></div>
                              <span className="text-[10px] font-black text-[#8B1538] uppercase tracking-[0.2em]">Resumo Executivo</span>
                           </div>
                           <p className="text-base font-serif text-gray-600 leading-relaxed italic">
                             "O volume de produção está 12% acima da média do trimestre, tracionado principalmente pelas Iniciais de Nível 1. Foco em reduzir os erros de qualidade (-{scoreResult.penalidades} pts) para garantir a liderança do ranking."
                           </p>
                        </div>
                        <div className="mt-10 grid grid-cols-2 gap-4">
                           <div className="bg-white p-5 rounded-2xl border border-[#8B1538]/10 text-center">
                              <span className="block text-[8px] font-black text-gray-400 uppercase mb-1">Qualidade</span>
                              <span className="text-xl font-serif font-bold text-green-600">92%</span>
                           </div>
                           <div className="bg-white p-5 rounded-2xl border border-[#8B1538]/10 text-center">
                              <span className="block text-[8px] font-black text-gray-400 uppercase mb-1">Engajamento</span>
                              <span className="text-xl font-serif font-bold text-blue-600">Alto</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Detalhamento das Atividades de Impacto (Substituindo "Avulso") */}
               <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                     <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Gem size={18}/> Conquistas Estratégicas do Mês</h3>
                  </div>
                  <div className="p-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activities.filter(a => a.advogado === selectedLawyer && a.status_validacao === 'CONFIRMADO').map(act => (
                          <div key={act.id} className="p-5 border border-purple-100 bg-purple-50/20 rounded-2xl flex items-center gap-4">
                             <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0"><Star size={24} fill="currentColor"/></div>
                             <div>
                                <h5 className="text-sm font-serif font-bold text-purple-900">{act.tipo_atividade}</h5>
                                <p className="text-[10px] text-purple-500 uppercase font-black tracking-tighter">{act.cliente} — {act.impacto}</p>
                             </div>
                             <div className="ml-auto">
                                <span className="text-sm font-black text-purple-700">+{rules.find(r => r.indicador === act.tipo_atividade)?.pontos || 15}</span>
                             </div>
                          </div>
                        ))}
                        {activities.filter(a => a.advogado === selectedLawyer && a.status_validacao === 'CONFIRMADO').length === 0 && (
                          <div className="col-span-2 py-10 text-center text-xs font-serif italic text-gray-300">Nenhum evento estratégico confirmado.</div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Lado Direito: Widget de Score Permanente */}
        <div className="xl:w-[360px] shrink-0">
           <div className="sticky top-12 space-y-8">
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in">
                 <div className="bg-[#8B1538] p-10 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                       <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
                          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
                       </svg>
                    </div>
                    <div className="p-5 bg-white/10 rounded-[2rem] w-fit mx-auto mb-6"><Trophy size={40} className="text-amber-400" fill="currentColor"/></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 block mb-3">Score Meritocracia</span>
                    <h4 className="text-7xl font-serif font-bold tracking-tighter">{scoreResult.score_total.toFixed(0)}</h4>
                    <div className="mt-8 flex items-center justify-center gap-2">
                       <TrendingUp size={16} className="text-green-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-green-400">+18.5% este mês</span>
                    </div>
                 </div>
                 
                 <div className="p-10 space-y-8">
                    <div className="space-y-4">
                       <h5 className="text-[11px] font-black text-gray-300 uppercase tracking-widest text-center">Progresso para Elite (500 pts)</h5>
                       <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner p-0.5">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-[#8B1538] rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (scoreResult.score_total / 500) * 100)}%` }}></div>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-50 text-center">
                          <span className="block text-[8px] font-black text-gray-400 uppercase mb-1">Posição Ranking</span>
                          <span className="text-2xl font-serif font-bold text-[#8B1538]">2º</span>
                       </div>
                       <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-50 text-center">
                          <span className="block text-[8px] font-black text-gray-400 uppercase mb-1">Status Meta</span>
                          <span className="text-2xl font-serif font-bold text-gray-800">{Math.min(100, (scoreResult.score_total/500)*100).toFixed(0)}%</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Botão de Atalho para Evento Estratégico (O que sobrou do Avulso) */}
              <button 
                onClick={() => alert("Modal de Evento Estratégico em desenvolvimento...")}
                className="w-full p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex items-center justify-between group hover:border-[#8B1538]/30 transition-all active:scale-95"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all"><Star size={24}/></div>
                    <div className="text-left">
                       <span className="block text-[11px] font-black text-gray-700 uppercase tracking-tight">Evento de Alto Impacto</span>
                       <span className="text-[9px] text-gray-400 font-serif italic">Bônus instantâneo para o ranking</span>
                    </div>
                 </div>
                 <ArrowRight className="text-gray-200 group-hover:text-[#8B1538] group-hover:translate-x-1 transition-all" size={20}/>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityEntryView;
