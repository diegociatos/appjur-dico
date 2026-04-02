
import { Appointment, MonthlyIndicator, ProductivityConfig, QualifiedActivity, PointRule, DailyEntry, DailyEntryType, DailyCategory, ScoreEvent, ImpactLevel } from '../types';
import { PRODUCTIVITY_RULE } from '../constants';

export interface ScoreDetail {
  indicador: string;
  quantidade: number;
  pontos_unitarios: number;
  subtotal: number;
  tipo: 'Volume' | 'Qualidade' | 'Resultado' | 'Penalidade';
}

export interface CalculationResult {
  score_total: number;
  detalhamento_por_indicador: ScoreDetail[];
  penalidades: number;
  bonus_estrategico: number;
  breakdown: {
    producao: number;
    resultado: number;
    organizacao: number;
    financeiro: number;
    impacto: number;
  };
}

export const calculateAdvancedScore = (
  indicator: MonthlyIndicator,
  rules: PointRule[],
  activities: QualifiedActivity[],
  dailyEntries: DailyEntry[] = [],
  dailyTypes: DailyEntryType[] = [],
  categories: DailyCategory[] = [],
  scoreEvents: ScoreEvent[] = []
): CalculationResult => {
  const details: ScoreDetail[] = [];
  let totalPenalties = 0;
  let totalImpact = 0;

  // 1. Pontos de Lançamentos Diários
  const entriesInMonth = dailyEntries.filter(e => 
    e.advogado === indicator.advogado && e.mes === indicator.mes && e.ano === indicator.ano
  );

  const sums: Record<string, number> = {};
  entriesInMonth.forEach(e => {
    Object.entries(e.valores).forEach(([typeId, qty]) => {
      sums[typeId] = (sums[typeId] || 0) + (qty as number);
    });
  });

  Object.entries(sums).forEach(([typeId, qty]) => {
    const type = dailyTypes.find(t => t.id === typeId);
    if (type && qty !== 0) {
      const cat = categories.find(c => c.id === type.categoriaId);
      const subtotal = qty * type.pontos;
      details.push({
        indicador: type.nome,
        quantidade: qty,
        pontos_unitarios: type.pontos,
        subtotal,
        tipo: cat?.nome.includes('Produção') ? 'Volume' : 
              cat?.nome.includes('Penalidade') ? 'Penalidade' :
              cat?.nome.includes('Resultados') ? 'Resultado' : 'Qualidade'
      });
      if (cat?.nome.includes('Penalidade')) totalPenalties += Math.abs(subtotal);
    }
  });

  // 2. Pontos de Eventos Automáticos (Auditoria, Updates e FINANCEIRO)
  const monthlyEvents = scoreEvents.filter(e => 
    e.advogado === indicator.advogado && e.mes === indicator.mes && e.ano === indicator.ano
  );

  monthlyEvents.forEach(evt => {
    const isFinancial = evt.tipoEvento === 'FINANCIAL_SUCCESS_FEE';
    
    details.push({
      indicador: evt.detalhe,
      quantidade: 1,
      pontos_unitarios: evt.pontos,
      subtotal: evt.pontos,
      tipo: isFinancial ? 'Resultado' : (evt.pontos > 0 ? 'Volume' : 'Penalidade')
    });
    
    if (evt.pontos < 0) totalPenalties += Math.abs(evt.pontos);
    if (isFinancial) totalImpact += evt.pontos;
  });

  // 3. Pontos de Atividades Qualificadas
  const lawyerActivities = activities.filter(
    a => a.advogado === indicator.advogado && a.status_validacao === 'CONFIRMADO'
  );

  lawyerActivities.forEach(act => {
    const rule = rules.find(r => r.indicador === act.tipo_atividade);
    const basePoints = rule ? rule.pontos : 15;
    // Fix: ensured multiplier is a number by using type assertion or fallback
    const multiplier = (PRODUCTIVITY_RULE.multiplicadores_impacto[act.impacto as string] as number) || 1;
    const subtotal = basePoints * multiplier;
    totalImpact += subtotal;
    details.push({
      indicador: `[IMPACTO] ${act.tipo_atividade}`,
      quantidade: 1,
      pontos_unitarios: basePoints * multiplier,
      subtotal,
      tipo: 'Qualidade'
    });
  });

  const score_total = details.reduce((acc, d) => acc + d.subtotal, 0);

  return {
    score_total: Math.max(0, score_total),
    detalhamento_por_indicador: details,
    penalidades: totalPenalties,
    bonus_estrategico: totalImpact,
    breakdown: {
      producao: details.filter(d => d.tipo === 'Volume').reduce((acc, d) => acc + d.subtotal, 0),
      resultado: details.filter(d => d.tipo === 'Resultado').reduce((acc, d) => acc + d.subtotal, 0),
      organizacao: details.filter(d => d.tipo === 'Qualidade' && !d.indicador.includes('[IMPACTO]')).reduce((acc, d) => acc + d.subtotal, 0),
      financeiro: details.filter(d => d.indicador.includes('Êxito Faturado')).reduce((acc, d) => acc + d.subtotal, 0),
      impacto: totalImpact
    }
  };
};

export const getLawyerScore = (name: string, appointments: Appointment[], indicators: MonthlyIndicator[], qualifiedActivities: QualifiedActivity[], dailyEntries: DailyEntry[], dailyTypes: DailyEntryType[], categories: DailyCategory[], scoreEvents: ScoreEvent[] = []) => {
  const indicator = indicators.find((i: MonthlyIndicator) => i.advogado === name);
  if (!indicator) return { total: 0, breakdown: { impact: 0, result: 0, tactical: 0, penalty: 0 } };
  const res = calculateAdvancedScore(indicator, [], qualifiedActivities, dailyEntries, dailyTypes, categories, scoreEvents);
  return {
    total: res.score_total,
    breakdown: {
      impact: res.breakdown.impacto,
      result: res.breakdown.resultado,
      tactical: res.breakdown.producao + res.breakdown.organizacao,
      penalty: res.penalidades
    }
  };
};

export const calculatePoints = (appointment: Appointment): number => {
  if (appointment.status !== 'CONCLUÍDO') return 0;
  return PRODUCTIVITY_RULE.pontos_base_por_tipo[appointment.tipo] || 5;
};
