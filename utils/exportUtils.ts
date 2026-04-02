
import { MonthlyBillingEntry, UserProfile, AuditLog, FinanceTransaction, FinanceSubcategory } from '../types';

/**
 * Motor de Exportação Financeira Ciatos
 */

export const generateFinanceCSV = (transactions: FinanceTransaction[], subcategories: FinanceSubcategory[]): string => {
  const headers = [
    'Data',
    'Descricao',
    'Valor',
    'Tipo',
    'Subcategoria',
    'Status',
    'Banco'
  ];

  const rows = transactions.map(t => {
    const sub = subcategories.find(s => s.id === t.subcategoriaId);
    return [
      t.data,
      t.descricao,
      t.valor.toFixed(2),
      t.tipo,
      sub?.nome || 'Outros',
      t.pago ? 'PAGO' : 'PROVISIONADO',
      t.bancoId
    ].join(';');
  });

  return [headers.join(';'), ...rows].join('\n');
};

export const generateBillingCSV = (entries: MonthlyBillingEntry[], clientName: string): string => {
  const headers = [
    'Cliente',
    'Mês de Referência',
    'Proc. Totais',
    'Proc. Cobráveis',
    'Valor Processos (R$)',
    'Horas Totais',
    'Valor Horas (R$)',
    'Performance/Exito (R$)',
    'Ajustes/Outros (R$)',
    'Total Bruto (R$)',
    'Status'
  ];

  const rows = entries.map(e => [
    e.clientName,
    e.month,
    e.totalReportedProcesses,
    e.billableProcessCount,
    e.billableProcessValue.toFixed(2),
    e.totalExecutedHours,
    e.totalHoursValue.toFixed(2),
    e.performanceFeeValue.toFixed(2),
    e.otherFees.toFixed(2),
    e.totalAmount.toFixed(2),
    e.status
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  return csvContent;
};

export const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const createAuditLog = (
  user: UserProfile, 
  action: AuditLog['action'], 
  resource: string, 
  details: string
): AuditLog => {
  return {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.nome,
    action,
    resource,
    details
  };
};

/**
 * Simulação de Endpoint de API: /export/billing?month=YYYY-MM
 */
export const simulateBillingApiExport = async (entries: MonthlyBillingEntry[], month: string) => {
  console.log(`[API SIMULATOR] Requesting: GET /export/billing?month=${month}`);
  const filtered = entries.filter(e => e.month === month);
  
  // Simula latência de rede
  await new Promise(r => setTimeout(r, 600));
  
  return {
    success: true,
    timestamp: new Date().toISOString(),
    count: filtered.length,
    data: filtered
  };
};
