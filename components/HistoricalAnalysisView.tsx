
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Database, Upload, Download, Filter, 
  BarChart3, LayoutGrid, Calendar, ArrowRight, ShieldCheck, 
  History, Info, FileText, ChevronRight, X, Layers, BrainCircuit, RefreshCcw,
  Zap, Edit3, Save, Calculator, ArrowUpRight, DollarSign
} from 'lucide-react';
// Import DRERubric from types
import { HistoricalYearData, FinanceCategory, FinanceSubcategory, DRERubric } from '../types';

interface HistoricalAnalysisViewProps {
  historicalData: HistoricalYearData[];
  onImportHistorical: (data: HistoricalYearData) => void;
  categories: FinanceCategory[];
  subcategories: FinanceSubcategory[];
  // Added dreRubrics to props to replace local DRE_STRUCTURE import
  dreRubrics: DRERubric[];
}

const HistoricalAnalysisView: React.FC<HistoricalAnalysisViewProps> = ({ 
  // Destructured dreRubrics from props
  historicalData = [], onImportHistorical, categories, subcategories, dreRubrics 
}) => {
  const [selectedYears, setSelectedYears] = useState<number[]>([2020, 2021, 2022, 2023, 2024, 2025]);
  const [activeTab, setActiveTab] = useState<'comparison' | 'trends'>('comparison');
  
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [editFormValues, setEditFormValues] = useState<Record<string, number>>({});

  const formatCurrency = (val: number) => 
    val === 0 ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const calculateDelta = (v1: number, v2: number) => {
    if (!v1) return 0;
    return ((v2 - v1) / v1) * 100;
  };

  const processedHistorical = useMemo(() => {
    return historicalData.map(yearData => {
      const subTotals = yearData.subcategoryTotals || {};
      
      const getSumByDRELine = (lineId: string) => {
        const catsInLine = categories.filter(c => c.dreLine === lineId).map(c => c.id);
        const subsInCats = subcategories.filter(s => catsInLine.includes(s.categoryId)).map(s => s.id);
        return subsInCats.reduce((acc, subId) => acc + (subTotals[subId] || 0), 0);
      };

      const rb = getSumByDRELine('RECEITA_BRUTA');
      const sn = getSumByDRELine('SIMPLES_NACIONAL');
      const rl = rb - sn;
      const cd = getSumByDRELine('CUSTO_DIRETO');
      const lb = rl - cd;
      const dAdm = getSumByDRELine('DESPESA_ADMIN');
      const dCom = getSumByDRELine('DESPESA_COMERCIAL');
      const dFin = getSumByDRELine('DESPESA_FINANCEIRA');
      const ll = lb - (dAdm + dCom + dFin);
      const inv = getSumByDRELine('INVESTIMENTOS');
      const div = getSumByDRELine('DIVIDENDOS');
      const rf = ll - (inv + div);

      return {
        ...yearData,
        calculatedLines: {
          RECEITA_BRUTA: rb,
          SIMPLES_NACIONAL: sn,
          RECEITA_LIQUIDA: rl,
          CUSTO_DIRETO: cd,
          LUCRO_BRUTO: lb,
          DESPESA_ADMIN: dAdm,
          DESPESA_COMERCIAL: dCom,
          DESPESA_FINANCEIRA: dFin,
          LUCRO_LIQUIDO: ll,
          INVESTIMENTOS: inv,
          DIVIDENDOS: div,
          RESULTADO_FINAL: rf
        } as Record<string, number>
      };
    });
  }, [historicalData, categories, subcategories]);

  const handleOpenEdit = (year: number) => {
    const data = historicalData.find(d => d.year === year);
    setEditFormValues(data?.subcategoryTotals || {});
    setEditingYear(year);
  };

  const handleSaveEdit = () => {
    if (editingYear === null) return;
    onImportHistorical({
      year: editingYear,
      lineTotals: {}, 
      subcategoryTotals: editFormValues
    });
    setEditingYear(null);
    setEditFormValues({});
  };

  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      if (selectedYears.length > 1) setSelectedYears(selectedYears.filter(y => y !== year));
    } else {
      setSelectedYears([...selectedYears, year].sort((a,b) => a - b));
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div>
           <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">Inteligência Estratégica</h1>
           <p className="text-[#2D3748] mt-2 opacity-60 text-lg">Evolução corporativa multianual e projeções de tendência</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
           <button onClick={() => setActiveTab('comparison')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'comparison' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Comparativo de Resultados</button>
           <button onClick={() => setActiveTab('trends')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'trends' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Tendências de Crescimento</button>
        </div>
      </div>

      {/* FILTROS DE ANOS */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-12 flex flex-wrap items-center gap-6">
         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selecionar Exercícios:</span>
         <div className="flex flex-wrap gap-3">
            {[2020, 2021, 2022, 2023, 2024, 2025].map(year => (
              <button 
                key={year} 
                onClick={() => toggleYear(year)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all border ${selectedYears.includes(year) ? 'bg-[#8B1538] border-[#8B1538] text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'}`}
              >
                Ano {year}
              </button>
            ))}
         </div>
      </div>

      {activeTab === 'comparison' ? (
        <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-left duration-700">
           <div className="p-10 bg-gray-50/20 border-b border-gray-50 flex items-center justify-between">
              <div>
                 <h3 className="text-2xl font-serif font-bold text-[#8B1538]">Evolução Patrimonial & Resultados</h3>
                 <p className="text-[10px] font-black text-gray-400 uppercase mt-1">Visão comparativa baseada na governança do Plano de Contas</p>
              </div>
              <button onClick={() => window.print()} className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#8B1538] shadow-sm transition-all"><Download size={20}/></button>
           </div>
           
           <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left min-w-[1200px] border-collapse">
                 <thead className="bg-gray-50/50">
                    <tr>
                       <th className="py-6 px-10 text-[10px] font-black text-gray-400 uppercase sticky left-0 bg-gray-50/50 z-10">Rubrica Gerencial</th>
                       {selectedYears.map(year => (
                         <th key={year} className="py-6 px-6 text-[10px] font-black text-gray-400 uppercase text-left border-l border-gray-100/50">
                            <div className="flex flex-col items-start gap-2">
                               <span>Ano {year}</span>
                               <button onClick={() => handleOpenEdit(year)} className="p-1.5 bg-[#8B1538]/5 text-[#8B1538] rounded-lg hover:bg-[#8B1538] hover:text-white transition-all"><Edit3 size={12}/></button>
                            </div>
                         </th>
                       ))}
                       <th className="py-6 px-10 text-[10px] font-black text-[#8B1538] uppercase text-right bg-[#8B1538]/5">Δ Histórico %</th>
                    </tr>
                 </thead>
                 <tbody className="font-serif">
                    {/* Fixed: replace non-existent DRE_STRUCTURE with dreRubrics prop */}
                    {dreRubrics.map(line => {
                       const values = selectedYears.map(y => processedHistorical.find(d => d.year === y)?.calculatedLines[line.id] || 0);
                       const delta = calculateDelta(values[0], values[values.length - 1]);
                       const isHeader = line.type === 'header';
                       const isResult = line.type === 'result';

                       return (
                         <React.Fragment key={line.id}>
                           <tr className={`border-b border-gray-50 transition-all
                             ${isHeader ? 'bg-gray-50/60 font-black text-[13px] text-gray-800' : ''}
                             ${isResult ? 'bg-[#8B1538]/5 font-black text-[14px] text-[#8B1538] border-t-2 border-[#8B1538]/20' : ''}
                           `}>
                              <td className={`py-6 px-10 sticky left-0 z-10 uppercase ${isHeader ? 'bg-gray-50/100' : isResult ? 'bg-[#8B1538]/5' : 'bg-white text-gray-600'}`}>
                                 <div className="tracking-tight">{line.label}</div>
                              </td>
                              {values.map((v, i) => (
                                <td key={i} className="py-6 px-6 text-left font-serif font-bold text-gray-700 tabular-nums border-l border-gray-50/50">
                                   {formatCurrency(v)}
                                </td>
                              ))}
                              <td className={`py-6 px-10 text-right font-black text-xs bg-[#8B1538]/[0.02] ${delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-500' : 'text-gray-300'}`}>
                                 {delta !== 0 ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%` : '—'}
                              </td>
                           </tr>
                         </React.Fragment>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-right duration-700">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
                 <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-12 flex items-center gap-3">
                    <BarChart3 size={18} className="text-[#8B1538]"/> Evolução: Lucratividade x Faturamento
                 </h3>
                 <div className="h-80 flex items-end gap-6 px-4 relative">
                    {selectedYears.map(year => {
                       const data = processedHistorical.find(d => d.year === year);
                       const rb = data?.calculatedLines['RECEITA_BRUTA'] || 0;
                       const ll = data?.calculatedLines['RESULTADO_FINAL'] || 0;
                       const max = Math.max(...processedHistorical.map(d => d.calculatedLines['RECEITA_BRUTA']), 1);
                       
                       return (
                         <div key={year} className="flex-1 flex flex-col items-center gap-4 group">
                            <div className="w-full flex justify-center gap-2 items-end">
                               <div className="w-4 bg-[#8B1538]/20 rounded-t transition-all group-hover:bg-[#8B1538]/40" style={{ height: `${(rb/max) * 220}px` }} />
                               <div className="w-4 bg-[#8B1538] rounded-t shadow-lg" style={{ height: `${(ll/max) * 220}px` }} />
                            </div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{year}</span>
                         </div>
                       );
                    })}
                 </div>
              </div>

              <div className="bg-[#8B1538] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
                 <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit size={240}/></div>
                 <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-10">Margem Líquida Anual Consolidada</h3>
                 <div className="space-y-10">
                    {selectedYears.map(year => {
                       const data = processedHistorical.find(d => d.year === year);
                       const ll = data?.calculatedLines['RESULTADO_FINAL'] || 0;
                       const rb = data?.calculatedLines['RECEITA_BRUTA'] || 1;
                       const margin = (ll / rb) * 100;
                       
                       return (
                         <div key={year} className="space-y-3">
                            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                               <span>Ano {year}</span>
                               <span className="text-lg font-serif font-black">{margin.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${Math.max(5, Math.min(100, margin))}%` }} />
                            </div>
                         </div>
                       );
                    })}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL EDIÇÃO */}
      {editingYear !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
              <div className="p-10 border-b border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-50 text-[#8B1538] rounded-2xl flex items-center justify-center shadow-inner"><Calendar size={28}/></div>
                    <div>
                       <h2 className="text-2xl font-serif font-bold text-[#8B1538]">Auditores do Exercício {editingYear}</h2>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ajuste Manual de Valores por Subcategoria</p>
                    </div>
                 </div>
                 <button onClick={() => setEditingYear(null)} className="text-gray-400 hover:text-red-500 p-2"><X size={32}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide bg-gray-50/20">
                 {categories.map(cat => (
                   <section key={cat.id} className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                         <Layers size={14} className="text-[#8B1538]"/>
                         <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest">{cat.nome}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {subcategories.filter(s => s.categoryId === cat.id).map(sub => (
                           <div key={sub.id} className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase block ml-1">{sub.nome}</label>
                              <div className="relative group">
                                 <input 
                                   type="number" 
                                   value={editFormValues[sub.id] || ''} 
                                   onChange={e => setEditFormValues({...editFormValues, [sub.id]: Number(e.target.value)})}
                                   className="w-full bg-white border border-gray-100 rounded-xl px-12 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all"
                                   placeholder="0,00"
                                 />
                                 <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                              </div>
                           </div>
                         ))}
                      </div>
                   </section>
                 ))}
              </div>

              <div className="p-10 border-t border-gray-100 bg-white flex gap-6">
                 <button onClick={() => setEditingYear(null)} className="flex-1 py-5 border-2 border-gray-200 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">Cancelar</button>
                 <button onClick={handleSaveEdit} className="flex-1 py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[11px] uppercase shadow-xl shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all flex items-center justify-center gap-3">
                    <Save size={18}/> Salvar Histórico {editingYear}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalAnalysisView;
