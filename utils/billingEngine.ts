
import { ClientContract, MonthlyBillingEntry, ProcessPricingBand } from '../types';

export interface BillingBreakdownItem {
  label: string;
  valor: number;
  descricao: string;
  isOverride: boolean;
}

export interface BillingCalculationResult {
  monthlyFee: BillingBreakdownItem;
  processes: BillingBreakdownItem;
  hours: BillingBreakdownItem;
  performance: BillingBreakdownItem;
  others: BillingBreakdownItem;
  total: number;
  currency: string;
}

/**
 * Motor de Cálculo Ciatos Jurídico
 * Processa um lançamento mensal contra as regras do contrato do cliente.
 */
export const calculateMonthlyBilling = (
  entry: Partial<MonthlyBillingEntry>,
  contract: ClientContract
): BillingCalculationResult => {
  const formatBRL = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // 1. Mensalidade Fixa
  const monthlyFee: BillingBreakdownItem = {
    label: 'Plano Mensal (Fixo)',
    valor: contract.monthlyFee,
    descricao: `Valor fixo contratual recorrente.`,
    isOverride: false
  };

  // 2. Cálculo de Processos Excedentes
  const totalProcReported = entry.totalReportedProcesses || 0;
  const includedProc = contract.planIncludes.processesIncluded || 0;
  const billableCount = Math.max(0, totalProcReported - includedProc);
  
  let suggestedProcValue = 0;
  let procDesc = `Nenhum processo excedente (Franquia: ${includedProc}p).`;

  if (billableCount > 0) {
    // Encontrar a faixa de preço baseada no volume TOTAL relatado
    const band = contract.processPricingTable.find(b => 
      totalProcReported >= b.min && totalProcReported <= (b.max || Infinity)
    );
    
    const unitPrice = band ? band.pricePerProcess : (contract.processPricingTable[contract.processPricingTable.length - 1]?.pricePerProcess || 0);
    suggestedProcValue = billableCount * unitPrice;
    procDesc = `${billableCount} processos excedentes calculados a ${formatBRL(unitPrice)} (Faixa de volume: ${totalProcReported}p).`;
  }

  // Verifica se o usuário sobrescreveu o valor manualmente no lançamento
  const finalProcValue = (entry.billableProcessValue !== undefined && entry.billableProcessValue !== suggestedProcValue && entry.billableProcessValue > 0)
    ? entry.billableProcessValue 
    : suggestedProcValue;

  const processes: BillingBreakdownItem = {
    label: 'Processos Excedentes',
    valor: finalProcValue,
    descricao: (entry.billableProcessValue !== undefined && entry.billableProcessValue !== suggestedProcValue && entry.billableProcessValue > 0)
      ? `Valor ajustado manualmente (Cálculo original: ${formatBRL(suggestedProcValue)})`
      : procDesc,
    isOverride: finalProcValue !== suggestedProcValue
  };

  // 3. Cálculo de Horas (Consultivo)
  const totalHoursReported = entry.totalExecutedHours || 0;
  const includedHours = contract.planIncludes.hoursIncluded || 0;
  const billableHours = Math.max(0, totalHoursReported - includedHours);
  
  // Por padrão usamos a taxa de Pleno para excedentes genéricos
  const hourlyRate = contract.hourlyRates.pleno || 250;
  const suggestedHoursValue = billableHours * hourlyRate;
  
  let hoursDesc = `Uso dentro da franquia de ${includedHours}h.`;
  if (billableHours > 0) {
    hoursDesc = `${billableHours}h excedentes calculadas à taxa de Pleno (${formatBRL(hourlyRate)}/h).`;
  }

  const finalHoursValue = (entry.totalHoursValue !== undefined && entry.totalHoursValue !== suggestedHoursValue && entry.totalHoursValue > 0)
    ? entry.totalHoursValue
    : suggestedHoursValue;

  const hours: BillingBreakdownItem = {
    label: 'Consultivo Excedente',
    valor: finalHoursValue,
    descricao: (entry.totalHoursValue !== undefined && entry.totalHoursValue !== suggestedHoursValue && entry.totalHoursValue > 0)
      ? `Ajuste manual de honorários por hora (Sugerido: ${formatBRL(suggestedHoursValue)})`
      : hoursDesc,
    isOverride: finalHoursValue !== suggestedHoursValue
  };

  // 4. Performance e Outros (Apenas repasse com descrição)
  const performance: BillingBreakdownItem = {
    label: 'Taxas de Performance',
    valor: entry.performanceFeeValue || 0,
    descricao: `Honorários de êxito e sucumbência apurados no período.`,
    isOverride: false
  };

  const others: BillingBreakdownItem = {
    label: 'Ajustes e Reembolsos',
    valor: entry.otherFees || 0,
    descricao: entry.otherFeesReason || 'Nenhum ajuste extra informado.',
    isOverride: false
  };

  // 5. Consolidação Total
  const total = monthlyFee.valor + processes.valor + hours.valor + performance.valor + others.valor;

  return {
    monthlyFee,
    processes,
    hours,
    performance,
    others,
    total,
    currency: contract.currency || 'BRL'
  };
};
