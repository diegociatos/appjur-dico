
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, Calendar, Save, CheckCircle2, AlertCircle, Edit3, 
  Plus, Trash2, TrendingUp, TrendingDown, Users, X, Download, 
  History, Info, Zap, Target, BookOpen, Briefcase, FileText, 
  PieChart, Settings, Search, Filter, ArrowRight, LayoutGrid, List
} from 'lucide-react';
import { 
  KPICategory, KPIIndicator, KPIEntry, KPIIndicatorValueType, 
  KPIPolarity, UserProfile 
} from '../types';
import KPIIndicatorModal from './KPIIndicatorModal';

interface KPIsViewProps {
  currentUser: UserProfile;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const INITIAL_INDICATORS: KPIIndicator[] = [
  { id: 'ind_1', nome: 'Nº Processos (N2/N3)', categoriaId: 'Prod', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'POSITIVO', metaMensal: 1200, ativo: true, ordem: 1 },
  { id: 'ind_2', nome: 'Nº Peças Iniciais', categoriaId: 'Prod', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'POSITIVO', metaMensal: 40, ativo: true, ordem: 2 },
  { id: 'ind_3', nome: 'Nº Defesas', categoriaId: 'Prod', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'POSITIVO', metaMensal: 100, ativo: true, ordem: 3 },
  { id: 'ind_4', nome: 'Nº Recursos', categoriaId: 'Prod', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'POSITIVO', metaMensal: 30, ativo: true, ordem: 4 },
  { id: 'ind_5', nome: 'Nº Êxitos em Processos', categoriaId: 'Res', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'POSITIVO', metaMensal: 15, ativo: true, ordem: 5 },
  { id: 'ind_6', nome: 'Nº Acordos', categoriaId: 'Res', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'POSITIVO', metaMensal: 20, ativo: true, ordem: 6 },
  { id: 'ind_7', nome: 'Nº Audiências', categoriaId: 'Prod', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'POSITIVO', metaMensal: 40, ativo: true, ordem: 7 },
  { id: 'ind_8', nome: 'Nº de OS - Consultoria', categoriaId: 'Prod', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'POSITIVO', metaMensal: 80, ativo: true, ordem: 8 },
  { id: 'ind_9', nome: 'Nº Contratos', categoriaId: 'Cli', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'POSITIVO', metaMensal: 10, ativo: true, ordem: 9 },
  { id: 'ind_10', nome: 'Nº Pareceres', categoriaId: 'Prod', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'POSITIVO', metaMensal: 12, ativo: true, ordem: 10 },
  { id: 'ind_11', nome: 'Nº Reuniões', categoriaId: 'Prod', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'POSITIVO', metaMensal: 120, ativo: true, ordem: 11 },
  { id: 'ind_12', nome: 'Nº Erros/Falhas', categoriaId: 'Prod', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'NEGATIVO', metaMensal: 2, ativo: true, ordem: 12 },
  { id: 'ind_13', nome: 'Novos Clientes', categoriaId: 'Cli', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'POSITIVO', metaMensal: 10, ativo: true, ordem: 13 },
  { id: 'ind_14', nome: 'Satisfação (NPS)', categoriaId: 'Cli', unidade: 'NOTA 0-10', tipoValor: 'score', polaridade: 'POSITIVO', metaMensal: 9, ativo: true, ordem: 14 },
  { id: 'ind_15', nome: 'Clima Organizacional', categoriaId: 'Pes', unidade: 'NOTA 0-10', tipoValor: 'score', polaridade: 'POSITIVO', metaMensal: 3.5, ativo: true, ordem: 15 },
  { id: 'ind_16', nome: 'Faltas / Absenteísmo', categoriaId: 'Pes', unidade: 'QUANTIDADE', tipoValor: 'number', polaridade: 'NEGATIVO', metaMensal: 0, ativo: true, ordem: 16 },
];

const INITIAL_ENTRIES: KPIEntry[] = [
  { id: 'e1', mes: 'Fevereiro', ano: 2026, indicatorId: 'ind_1', valor: 1240, atualizadoEm: '2026-02-28', atualizadoPor: 'Gestora' },
  { id: 'e2', mes: 'Fevereiro', ano: 2026, indicatorId: 'ind_2', valor: 42, atualizadoEm: '2026-02-28', atualizadoPor: 'Gestora' },
  { id: 'e3', mes: 'Fevereiro', ano: 2026, indicatorId: 'ind_12', valor: 5, atualizadoEm: '2026-02-28', atualizadoPor: 'Gestora' },
  { id: 'e4', mes: 'Fevereiro', ano: 2026, indicatorId: 'ind_13', valor: 12, atualizadoEm: '2026-02-28', atualizadoPor: 'Gestora' },
  { id: 'e5', mes: 'Fevereiro', ano: 2026, indicatorId: 'ind_15', valor: 3.8, atualizadoEm: '2026-02-28', atualizadoPor: 'Gestora' },
  { id: 'e_prev1', mes: 'Janeiro', ano: 2026, indicatorId: 'ind_1', valor: 1100, atualizadoEm: '2026-01-31', atualizadoPor: 'Gestora' },
];

const KPIsView: React.FC<KPIsViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'results' | 'entry' | 'config'>('results');
  const [selectedMonth, setSelectedMonth] = useState('Fevereiro');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [filterCategory, setFilterCategory] = useState('Todas as Áreas');
  
  const [indicators, setIndicators] = useState<KPIIndicator[]>(INITIAL_INDICATORS);
  const [entries, setEntries] = useState<KPIEntry[]>(INITIAL_ENTRIES);
  const [formValues, setFormValues] = useState<Record<string, number>>({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<KPIIndicator | null>(null);

  useEffect(() => {
    const monthEntries = entries.filter(e => e.mes === selectedMonth && e.ano === selectedYear);
    const initialValues: Record<string, number> = {};
    indicators.forEach(ind => {
      const entry = monthEntries.find(e => e.indicatorId === ind.id);
      initialValues[ind.id] = entry ? entry.valor : 0;
    });
    setFormValues(initialValues);
  }, [selectedMonth, selectedYear, indicators, entries]);

  const handleSaveData = () => {
    const newEntries = entries.filter(e => !(e.mes === selectedMonth && e.ano === selectedYear));
    Object.entries(formValues).forEach(([id, val]) => {
      newEntries.push({
        id: `e_${id}_${selectedMonth}_${selectedYear}`,
        mes: selectedMonth,
        ano: selectedYear,
        indicatorId: id,
        valor: val,
        atualizadoEm: new Date().toISOString(),
        atualizadoPor: currentUser.nome
      });
    });
    setEntries(newEntries);
    alert("Dados do mês salvos com sucesso!");
  };

  const getPreviousMonthData = (indId: string) => {
    const prevMonthIdx = MESES.indexOf(selectedMonth) - 1;
    if (prevMonthIdx < 0) return 0;
    const prevMonth = MESES[prevMonthIdx];
    return entries.find(e => e.indicatorId === indId && e.mes === prevMonth && e.ano === selectedYear)?.valor || 0;
  };

  const calculateDelta = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      {/* Header Estilo Captura de Tela */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div>
           <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">Controladoria & KPIs</h1>
           <p className="text-[#2D3748] mt-2 opacity-60 italic font-serif text-[15px]">Análise comparativa e inteligência de dados</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm flex">
              <button 
                onClick={() => setActiveTab('entry')} 
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'entry' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}
              >
                Preenchimento
              </button>
              <button 
                onClick={() => setActiveTab('results')} 
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'results' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}
              >
                Visão de Resultados
              </button>
              <button 
                onClick={() => setActiveTab('config')} 
                className={`px-4 py-2.5 rounded-xl text-gray-400 hover:text-[#8B1538] transition-all ${activeTab === 'config' ? 'bg-gray-100 text-[#8B1538]' : ''}`}
              >
                <Settings size={18} />
              </button>
           </div>
        </div>
      </div>

      {activeTab === 'results' && (
        <div className="flex flex-col xl:flex-row gap-10 animate-in slide-in-from-left duration-500">
           <div className="flex-1 space-y-10">
              {/* Filtros Visão 1 */}
              <div className="flex flex-wrap items-center gap-6">
                 <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Período de Análise</span>
                    <div className="flex gap-2">
                       <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none shadow-sm min-w-[120px]">
                          {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                       </select>
                       <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none shadow-sm">
                          <option value={2026}>2026</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Filtrar Categoria</span>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none shadow-sm min-w-[200px]">
                       <option>Todas as Áreas</option>
                       <option>Produção Jurídica</option>
                       <option>Resultados</option>
                       <option>Clientes</option>
                    </select>
                 </div>
                 <button className="self-end px-10 py-3 bg-[#8B1538] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#8B1538]/20 hover:scale-105 transition-all flex items-center gap-2">
                    <Download size={14}/> Relatório
                 </button>
              </div>

              {/* Tabela Monitor (Imagem 1) */}
              <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden">
                 <div className="p-10 pb-4">
                    <h3 className="text-xl font-serif font-bold text-[#8B1538]">Monitor de Variação Mensal</h3>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">Comparativo vs Período Anterior</p>
                 </div>
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-gray-50/30">
                          <th className="px-10 py-6 text-[9px] font-black text-gray-400 uppercase">Indicador Estratégico</th>
                          <th className="px-6 py-6 text-[9px] font-black text-gray-400 uppercase text-center">Atual</th>
                          <th className="px-6 py-6 text-[9px] font-black text-gray-400 uppercase text-center">Δ %</th>
                          <th className="px-6 py-6 text-[9px] font-black text-gray-400 uppercase text-center">Meta</th>
                          <th className="px-10 py-6 text-[9px] font-black text-gray-400 uppercase text-right">Análise</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {indicators.map(ind => {
                          const val = formValues[ind.id] || 0;
                          const prev = getPreviousMonthData(ind.id);
                          const delta = calculateDelta(val, prev);
                          const reach = ind.polaridade === 'POSITIVO' ? val >= ind.metaMensal : val <= ind.metaMensal;
                          
                          return (
                            <tr key={ind.id} className="hover:bg-gray-50/20 transition-all group">
                               <td className="px-10 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Target size={16}/></div>
                                     <div className="flex flex-col">
                                        <span className="text-[14px] font-serif font-bold text-gray-700">{ind.nome}</span>
                                        <span className="text-[8px] text-gray-300 font-black uppercase">{ind.categoriaId}</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-6 text-center text-lg font-serif font-black text-gray-800">{val}</td>
                               <td className="px-6 py-6 text-center">
                                  {delta !== 0 ? (
                                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase flex items-center justify-center gap-1 mx-auto w-fit ${delta > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                       {delta > 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                                       {Math.abs(delta).toFixed(0)}%
                                    </span>
                                  ) : <span className="text-gray-300">—</span>}
                               </td>
                               <td className="px-6 py-6 text-center">
                                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${reach ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                     {reach ? 'Alcançada' : 'Pendente'}
                                  </span>
                               </td>
                               <td className="px-10 py-6 text-right">
                                  <button className="p-2 text-gray-200 hover:text-[#8B1538] transition-colors"><History size={16}/></button>
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Painel lateral de Insights (Imagem 1) */}
           <div className="xl:w-[380px] shrink-0">
              <div className="sticky top-12 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm h-fit min-h-[500px]">
                 <div className="flex items-center gap-3 mb-8">
                    <Zap className="text-[#8B1538]" size={20} fill="currentColor"/>
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Insights do Sistema</h3>
                 </div>
                 <div className="flex flex-col items-center justify-center h-80 text-center opacity-40">
                    <p className="text-[12px] font-serif italic text-gray-500">Operação dentro da normalidade estatística.</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'entry' && (
        <div className="animate-in slide-in-from-right duration-500 space-y-12">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-[#8B1538]/5 rounded-2xl flex items-center justify-center text-[#8B1538]"><Edit3 size={24}/></div>
                 <div>
                    <h3 className="text-xl font-serif font-bold text-[#8B1538]">Preenchimento Mensal</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Alimentação da Inteligência da Banca</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold">
                    {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                 </select>
                 <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold">
                    <option value={2026}>2026</option>
                 </select>
              </div>
           </div>

           {/* Grid de Cards de Input (Imagem 2) */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {indicators.map(ind => (
                <div key={ind.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                   <div className="flex items-center gap-3 mb-8">
                      <Target size={16} className="text-gray-300 group-hover:text-[#8B1538] transition-colors"/>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ind.nome}</span>
                   </div>
                   <div className="flex items-end justify-center gap-4">
                      <input 
                        type="number" 
                        value={formValues[ind.id] || 0}
                        onChange={e => setFormValues({...formValues, [ind.id]: Number(e.target.value)})}
                        className="w-full text-center text-5xl font-serif font-black text-[#2D3748] bg-transparent outline-none focus:text-[#8B1538] transition-all"
                      />
                   </div>
                   <span className="absolute bottom-6 right-10 text-[8px] font-black text-gray-300 uppercase">{ind.unidade}</span>
                </div>
              ))}
           </div>

           <div className="flex justify-center pt-10">
              <button 
                onClick={handleSaveData}
                className="bg-[#8B1538] text-white px-16 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[#8B1538]/30 hover:scale-105 active:scale-95 transition-all"
              >
                 Salvar Dados do Mês
              </button>
           </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden animate-in zoom-in duration-500">
           <div className="p-10 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
              <div>
                 <h3 className="text-xl font-serif font-bold text-[#8B1538]">Dicionário de Inteligência</h3>
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Configuração de Pesos e Metas de Operação</p>
              </div>
              <button 
                onClick={() => { setEditingIndicator(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 bg-[#8B1538] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:scale-105 transition-all"
              >
                 <Plus size={16}/> Novo Indicador
              </button>
           </div>
           
           {/* Tabela de Dicionário (Imagem 3) */}
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50/50">
                    <th className="px-10 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Indicador</th>
                    <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase text-center">Polaridade</th>
                    <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase text-center">Unidade</th>
                    <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase text-center">Meta Mensal</th>
                    <th className="px-10 py-6 text-[9px] font-black text-gray-400 uppercase text-right">Ações</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-serif">
                 {indicators.map(ind => (
                   <tr key={ind.id} className="hover:bg-gray-50/10">
                      <td className="px-10 py-6 font-bold text-gray-700">{ind.nome}</td>
                      <td className="px-8 py-6 text-center">
                         <span className={`px-3 py-1 rounded text-[8px] font-black uppercase border ${ind.polaridade === 'POSITIVO' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {ind.polaridade}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">{ind.unidade}</td>
                      <td className="px-8 py-6 text-center font-black text-gray-800">{ind.metaMensal}</td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingIndicator(ind); setIsModalOpen(true); }} className="p-2 text-gray-300 hover:text-blue-500"><Edit3 size={16}/></button>
                            <button className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {isModalOpen && (
        <KPIIndicatorModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={(ind) => {
            if (editingIndicator) setIndicators(indicators.map(i => i.id === ind.id ? ind : i));
            else setIndicators([...indicators, ind]);
          }} 
          editingIndicator={editingIndicator} 
          categoryDefaultId="Prod" 
        />
      )}
    </div>
  );
};

export default KPIsView;
