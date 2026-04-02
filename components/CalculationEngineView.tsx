
import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Search, 
  Calculator, 
  ChevronRight, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  FileText,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  ChevronDown,
  Info
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { MonthlyIndicator, PointRule, QualifiedActivity } from '../types';
import { calculateAdvancedScore, CalculationResult } from '../utils/productivity';
import { INITIAL_POINT_RULES } from '../constants';

interface CalculationEngineViewProps {
  indicators: MonthlyIndicator[];
  rules?: PointRule[];
  activities: QualifiedActivity[];
}

const CalculationEngineView: React.FC<CalculationEngineViewProps> = ({ 
  indicators, 
  rules = INITIAL_POINT_RULES, 
  activities 
}) => {
  const [selectedLawyer, setSelectedLawyer] = useState(indicators[0]?.advogado || '');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const currentIndicator = useMemo(() => 
    indicators.find(i => i.advogado === selectedLawyer), 
    [indicators, selectedLawyer]
  );

  const result = useMemo(() => {
    if (!currentIndicator) return null;
    return calculateAdvancedScore(currentIndicator, rules, activities);
  }, [currentIndicator, rules, activities]);

  const generateAIInsight = async () => {
    if (!result || !currentIndicator) return;
    setLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise matematicamente o score do advogado ${selectedLawyer}.
      Dados: ${JSON.stringify(result)}
      Indicadores originais: ${JSON.stringify(currentIndicator)}
      
      Forneça um comentário executivo curto (máximo 3 frases) justificando se o score é saudável ou se há riscos (como alta pontuação mas dependente apenas de um êxito, ou penalidades críticas).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiAnalysis(response.text);
    } catch (e) {
      setAiAnalysis("Não foi possível gerar a análise por IA neste momento.");
    } finally {
      setLoadingAI(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#8B1538] leading-tight">Motor de Cálculo</h1>
          <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">Transparência total na auditoria da meritocracia</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-2 px-4 border-r border-gray-100">
              <Calendar size={18} className="text-[#8B1538]" />
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">Fev/2026</span>
           </div>
           <div className="relative min-w-[200px]">
              <select 
                value={selectedLawyer}
                onChange={(e) => {
                  setSelectedLawyer(e.target.value);
                  setAiAnalysis(null);
                }}
                className="w-full bg-transparent text-sm font-bold text-[#2D3748] outline-none appearance-none pr-8"
              >
                {indicators.map(i => <option key={i.advogado} value={i.advogado}>{i.advogado}</option>)}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
           </div>
        </div>
      </div>

      {!result ? (
        <div className="bg-white p-20 rounded-[3rem] border border-dashed border-gray-200 text-center">
           <p className="text-gray-400 font-serif italic">Nenhum dado de produtividade encontrado para este advogado no período selecionado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* Coluna de Detalhamento Matemático */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                 <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                   <Calculator size={18} /> Rastreabilidade do Score (DRE Jurídico)
                 </h3>
              </div>
              
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Indicador / Origem</th>
                    <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Qtd / Valor</th>
                    <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Peso</th>
                    <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {result.detalhamento_por_indicador.map((det, i) => (
                    <tr key={i} className="hover:bg-gray-50/20 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${
                            det.tipo === 'Penalidade' ? 'bg-red-500' : 
                            det.tipo === 'Resultado' ? 'bg-green-500' : 
                            det.tipo === 'Volume' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}></span>
                          <span className="text-sm font-serif font-bold text-[#2D3748]">{det.indicador}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                         <span className="text-xs font-mono font-bold text-gray-500">
                           {det.indicador.includes('Financeira') ? formatCurrency(det.quantidade) : det.quantidade}
                         </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                         <span className="text-[10px] font-black text-gray-300">x {det.pontos_unitarios}</span>
                      </td>
                      <td className={`px-8 py-5 text-right font-serif font-bold text-sm ${det.subtotal < 0 ? 'text-red-500' : 'text-[#8B1538]'}`}>
                         {det.subtotal > 0 ? '+' : ''}{det.subtotal.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#8B1538]/5 border-t-2 border-[#8B1538]/10">
                    <td colSpan={3} className="px-8 py-6 text-[10px] font-black text-[#8B1538] uppercase tracking-widest text-right">
                      Score Final Consolidado
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className="text-2xl font-serif font-bold text-[#8B1538]">{result.score_total.toFixed(0)} pts</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Alertas Operacionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-red-50 rounded-[2rem] p-8 border border-red-100 flex gap-5">
                  <div className="p-3 bg-white rounded-xl text-red-600 shadow-sm shrink-0 h-fit">
                     <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-red-800 uppercase tracking-widest mb-1">Deduções Críticas</h4>
                    <p className="text-2xl font-serif font-bold text-red-600">-{result.penalidades} pts</p>
                    <p className="text-xs text-red-800/60 font-medium mt-2 leading-relaxed">
                      Pontos subtraídos devido a erros de qualidade ou falhas operacionais registradas no período.
                    </p>
                  </div>
               </div>

               <div className="bg-purple-50 rounded-[2rem] p-8 border border-purple-100 flex gap-5">
                  <div className="p-3 bg-white rounded-xl text-purple-600 shadow-sm shrink-0 h-fit">
                     <Sparkles size={24} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-purple-800 uppercase tracking-widest mb-1">Bônus Estratégico</h4>
                    <p className="text-2xl font-serif font-bold text-purple-600">+{result.bonus_estrategico} pts</p>
                    <p className="text-xs text-purple-800/60 font-medium mt-2 leading-relaxed">
                      Adicional por atividades avulsas de alto impacto e encantamento de clientes.
                    </p>
                  </div>
               </div>
            </div>
          </div>

          {/* Coluna Lateral: Resumo Executivo */}
          <div className="space-y-8">
             <div className="bg-[#8B1538] rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 p-8 opacity-5 rotate-12 pointer-events-none">
                   <Cpu size={200} />
                </div>
                <h3 className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <TrendingUp size={18} /> Composição de Performance
                </h3>
                
                <div className="space-y-8">
                   {[
                     { label: 'Produção Jurídica', value: result.breakdown.producao, color: 'bg-blue-400' },
                     { label: 'Resultados / Êxitos', value: result.breakdown.resultado, color: 'bg-green-400' },
                     { label: 'Financeiro Direto', value: result.breakdown.financeiro, color: 'bg-amber-400' },
                     { label: 'Impacto Estratégico', value: result.breakdown.impacto, color: 'bg-purple-400' },
                   ].map(item => (
                     <div key={item.label} className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                           <span>{item.label}</span>
                           <span>{item.value.toFixed(0)} pts</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                           <div 
                            className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${Math.min(100, (item.value / (result.score_total || 1)) * 100)}%` }}
                           />
                        </div>
                     </div>
                   ))}
                </div>

                <div className="mt-12 pt-10 border-t border-white/10">
                   <div className="flex items-center gap-3 text-white/40 text-[9px] font-black uppercase tracking-widest italic leading-relaxed">
                     <Info size={14} />
                     <span>Este cálculo segue as regras aprovadas pelo conselho para o exercício de 2026.</span>
                   </div>
                </div>
             </div>

             {/* Insight de IA */}
             <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Sparkles className="text-[#8B1538]" size={16} /> Insight do Motor IA
                   </h3>
                   {!aiAnalysis && !loadingAI && (
                     <button 
                      onClick={generateAIInsight}
                      className="p-2 text-[#8B1538] hover:bg-[#8B1538]/5 rounded-lg transition-colors"
                     >
                       <TrendingUp size={16} />
                     </button>
                   )}
                </div>

                {loadingAI ? (
                  <div className="py-8 flex flex-col items-center gap-4 text-center">
                    <div className="w-10 h-10 border-4 border-[#8B1538]/10 border-t-[#8B1538] rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Processando análise tática...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="animate-in fade-in slide-in-from-top-4">
                    <p className="text-sm font-serif font-medium text-gray-700 italic leading-relaxed">
                      "{aiAnalysis}"
                    </p>
                    <button 
                      onClick={() => setAiAnalysis(null)}
                      className="mt-6 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-[#8B1538]"
                    >
                      Recalcular Insight
                    </button>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs text-gray-400 font-serif mb-6 italic">Gere um diagnóstico automático sobre os pontos deste advogado.</p>
                    <button 
                      onClick={generateAIInsight}
                      className="bg-gray-50 text-[#8B1538] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-[#8B1538] hover:text-white transition-all shadow-sm"
                    >
                      Analisar Desempenho
                    </button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculationEngineView;
