
import React, { useMemo } from 'react';
import { 
  Coins, 
  Trophy, 
  Medal, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { MonthlyIndicator, QualifiedActivity, OfficeIndicator, PointRule } from '../types';
import { calculateAdvancedScore } from '../utils/productivity';

interface BonusDashboardViewProps {
  indicators: MonthlyIndicator[];
  activities: QualifiedActivity[];
  officeIndicator: OfficeIndicator;
  rules: PointRule[];
}

const META_MINIMA = 100;
const ERROS_CRITICOS = 5;
const BONUS_BASE = {
  1: 2500, // Ouro
  2: 1500, // Prata
  3: 1000  // Bronze
};
const VALOR_ENCANTAMENTO = 200;

const BonusDashboardView: React.FC<BonusDashboardViewProps> = ({ indicators, activities, officeIndicator, rules }) => {
  const bonusTable = useMemo(() => {
    // 1. Calcular scores e dados base usando as regras dinâmicas
    const rawData = indicators.map(ind => {
      const calculation = calculateAdvancedScore(ind, rules, activities);
      
      // Buscar casos de encantamento no officeIndicator (Gente & Gestão)
      let casesCount = 0;
      // Fix: changed gestao_pessoas to gestao_pessoais to match OfficeIndicator type
      officeIndicator.gestao_pessoais.forEach(sector => {
        casesCount += sector.casos_encantamento.filter((c: any) => c.author === ind.advogado).length;
      });

      return {
        advogado: ind.advogado,
        score: calculation.score_total,
        erros: ind.bloco_qualidade.erros_ocorridos,
        encantamentos: casesCount,
        elegivel_meta: calculation.score_total >= META_MINIMA,
        trava_qualidade: ind.bloco_qualidade.erros_ocorridos > ERROS_CRITICOS
      };
    }).sort((a, b) => b.score - a.score);

    // 2. Atribuir bônus por ranking e encantamento
    return rawData.map((lawyer, idx) => {
      let baseVal = 0;
      if (lawyer.elegivel_meta) {
        if (idx === 0) baseVal = BONUS_BASE[1];
        else if (idx === 1) baseVal = BONUS_BASE[2];
        else if (idx === 2) baseVal = BONUS_BASE[3];
      }

      const encantamentoBonus = lawyer.encantamentos * VALOR_ENCANTAMENTO;
      let totalSugerido = baseVal + encantamentoBonus;

      // Aplicar Trava de Qualidade (-50%)
      if (lawyer.trava_qualidade) {
        totalSugerido = totalSugerido * 0.5;
      }

      return {
        ...lawyer,
        posicao: idx + 1,
        bonusRanking: baseVal,
        bonusEncantamento: encantamentoBonus,
        totalSugerido
      };
    });
  }, [indicators, activities, officeIndicator, rules]);

  const topThree = bonusTable.slice(0, 3);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#8B1538] leading-tight">Painel de Bonificação</h1>
          <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">Fechamento mensal de meritocracia e recompensas financeiras</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mês de Referência</span>
              <span className="text-sm font-bold text-[#8B1538]">Fev/2026</span>
              <ChevronDown size={14} className="text-gray-300" />
           </div>
           <button className="bg-[#8B1538] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-3">
              <ShieldCheck size={18} />
              Aprovar Pagamentos
           </button>
        </div>
      </div>

      {/* Pódio de Premiação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
        {topThree.map((lawyer, idx) => (
          <div 
            key={lawyer.advogado} 
            className={`relative bg-white rounded-[3rem] p-10 border transition-all hover:shadow-2xl group overflow-hidden
              ${idx === 0 ? 'border-[#8B1538]/20 shadow-xl ring-1 ring-[#8B1538]/10 bg-gradient-to-b from-white to-amber-50/20' : 'border-gray-100 shadow-sm'}`}
          >
            {/* Medal Icon */}
            <div className={`absolute -top-4 -right-4 w-24 h-24 opacity-10 rotate-12 group-hover:rotate-0 transition-transform
              ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : 'text-orange-400'}`}>
              {idx === 0 ? <Trophy size={96} /> : idx === 1 ? <Medal size={96} /> : <Award size={96} />}
            </div>

            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white
                ${idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 
                  idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : 
                  'bg-gradient-to-br from-orange-300 to-orange-500'}`}>
                {idx === 0 ? <Trophy size={28} /> : idx === 1 ? <Medal size={28} /> : <Award size={28} />}
              </div>

              <h3 className="text-2xl font-serif font-bold text-[#2D3748] mb-1">{lawyer.advogado}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">
                {idx === 0 ? '🏆 Bônus Ouro' : idx === 1 ? '🥈 Bônus Prata' : '🥉 Bônus Bronze'}
              </p>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase">Score Obtido</span>
                  <span className="text-lg font-serif font-bold text-[#8B1538]">{lawyer.score.toFixed(0)} pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase">Valor do Bônus</span>
                  <span className="text-2xl font-serif font-bold text-gray-800">{formatCurrency(lawyer.totalSugerido)}</span>
                </div>
              </div>

              {!lawyer.elegivel_meta && (
                <div className="mt-6 p-4 bg-red-50 rounded-2xl flex items-center gap-3 border border-red-100">
                  <XCircle size={18} className="text-red-500 shrink-0" />
                  <span className="text-[10px] font-black uppercase text-red-600">Inelegível: Score abaixo de {META_MINIMA}</span>
                </div>
              )}

              {lawyer.trava_qualidade && (
                <div className="mt-4 p-4 bg-amber-50 rounded-2xl flex items-center gap-3 border border-amber-100">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                  <span className="text-[10px] font-black uppercase text-amber-600">Redução 50%: Erros acima do limite</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de Elegibilidade e Liquidação */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
           <div>
             <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Mapa de Liquidação Financeira</h3>
             <p className="text-xs text-gray-400 font-medium italic">Regras de meta, travas de qualidade e bônus de encantamento aplicadas</p>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Elegível
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Inelegível
              </div>
           </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/30">
              <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Advogado</th>
              <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Score</th>
              <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Qualidade (Erros)</th>
              <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Status Meta</th>
              <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Encantamentos</th>
              <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Valor Sugerido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bonusTable.map((lawyer) => (
              <tr key={lawyer.advogado} className="hover:bg-gray-50/20 transition-colors group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-[#8B1538] font-serif font-bold text-xs border border-gray-100">
                      {lawyer.advogado.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[15px] font-serif font-bold text-[#2D3748]">{lawyer.advogado}</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-center font-serif font-bold text-[#8B1538]">
                  {lawyer.score.toFixed(0)}
                </td>
                <td className="px-10 py-6 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-sm font-bold ${lawyer.trava_qualidade ? 'text-red-500' : 'text-gray-600'}`}>{lawyer.erros}</span>
                    <span className="text-[8px] font-black uppercase text-gray-400">erros ocorridos</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-center">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight border
                    ${lawyer.elegivel_meta ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                    {lawyer.elegivel_meta ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {lawyer.elegivel_meta ? 'Elegível' : 'Abaixo da Meta'}
                  </div>
                </td>
                <td className="px-10 py-6 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500">
                    <Sparkles size={14} fill="currentColor" />
                    <span className="text-sm font-bold">+{lawyer.encantamentos}</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`text-lg font-serif font-bold ${lawyer.totalSugerido > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                      {formatCurrency(lawyer.totalSugerido)}
                    </span>
                    {lawyer.bonusEncantamento > 0 && (
                      <span className="text-[9px] font-black text-green-600 uppercase">Inclui R$ {lawyer.bonusEncantamento} Encant.</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumo Financeiro do Mês */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-2 bg-gray-50 border border-gray-100 rounded-[2.5rem] p-10 flex items-center gap-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#8B1538] shadow-sm">
               <Coins size={32} />
            </div>
            <div>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Previsto de Bonificação</h4>
               <p className="text-4xl font-serif font-bold text-[#8B1538]">
                 {formatCurrency(bonusTable.reduce((acc, l) => acc + l.totalSugerido, 0))}
               </p>
            </div>
         </div>

         <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
              <TrendingUp size={14} className="text-green-500" /> ROI da Meritocracia
            </div>
            <p className="text-sm font-serif italic text-gray-500">
              O investimento em bônus representa 8.5% do aumento de receita gerado no mês.
            </p>
         </div>

         <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
              <Sparkles size={14} className="text-amber-500" /> Fator Humano
            </div>
            <p className="text-sm font-serif italic text-gray-500">
              {bonusTable.reduce((acc, l) => acc + l.encantamentos, 0)} situações de encantamento de cliente recompensadas.
            </p>
         </div>
      </div>
    </div>
  );
};

export default BonusDashboardView;
