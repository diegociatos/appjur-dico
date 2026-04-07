import {
  Appointment, MonthlyIndicator, ProductivityConfig, OfficeIndicator,
  QualifiedActivity, QualifiedActivityType, Processo, PointRule,
  DailyEntryType, DailyCategory, ProcessScoreConfig, Client,
  Assignment, ClientContract, MonthlyBillingEntry, AuditLog,
  FinanceBank, FinanceCategory, FinanceSubcategory, ScoreEvent,
  DRERubric
} from './types';

// --- FINANCEIRO DINÂMICO (defaults usados quando Firestore está vazio) ---
export const INITIAL_FINANCE_BANKS: FinanceBank[] = [];

export const INITIAL_FINANCE_CATEGORIES: FinanceCategory[] = [
  { id: 'cat_rb', nome: 'Faturamento de Honorários', tipo: 'RECEITA', dreLine: 'RECEITA_BRUTA', ativo: true },
  { id: 'cat_imp', nome: 'Impostos sobre Faturamento', tipo: 'DESPESA', dreLine: 'SIMPLES_NACIONAL', ativo: true },
  { id: 'cat_cd', nome: 'Custos Operacionais Jurídicos', tipo: 'DESPESA', dreLine: 'CUSTO_DIRETO', ativo: true },
  { id: 'cat_da', nome: 'Despesas Administrativas (Fixas)', tipo: 'DESPESA', dreLine: 'DESPESA_ADMIN', ativo: true },
  { id: 'cat_dcom', nome: 'Comercial e Marketing', tipo: 'DESPESA', dreLine: 'DESPESA_COMERCIAL', ativo: true },
  { id: 'cat_dfin', nome: 'Taxas e Despesas Financeiras', tipo: 'DESPESA', dreLine: 'DESPESA_FINANCEIRA', ativo: true },
  { id: 'cat_inv', nome: 'Investimentos e Aquisições', tipo: 'DESPESA', dreLine: 'INVESTIMENTOS', ativo: true },
  { id: 'cat_div', nome: 'Distribuição de Resultados', tipo: 'DESPESA', dreLine: 'DIVIDENDOS', ativo: true },
];

export const INITIAL_FINANCE_SUBCATEGORIES: FinanceSubcategory[] = [
  { id: 'sub_1', categoryId: 'cat_rb', nome: 'Honorários Mensais', ativo: true },
  { id: 'sub_2', categoryId: 'cat_rb', nome: 'Honorários Êxito', ativo: true },
  { id: 'sub_3', categoryId: 'cat_imp', nome: 'DAS - Simples Nacional', ativo: true },
  { id: 'sub_4', categoryId: 'cat_imp', nome: 'ISSQN', ativo: true },
  { id: 'sub_5', categoryId: 'cat_cd', nome: 'Advogados Associados', ativo: true },
  { id: 'sub_6', categoryId: 'cat_cd', nome: 'Custas Processuais Reembolsáveis', ativo: true },
  { id: 'sub_9', categoryId: 'cat_da', nome: 'Aluguel / Condomínio', ativo: true },
  { id: 'sub_10', categoryId: 'cat_da', nome: 'Energia / Água / Internet', ativo: true },
  { id: 'sub_11', categoryId: 'cat_da', nome: 'Softwares e Assinaturas (SaaS)', ativo: true },
  { id: 'sub_12', categoryId: 'cat_dcom', nome: 'Tráfego Pago (Google/Meta)', ativo: true },
  { id: 'sub_13', categoryId: 'cat_dfin', nome: 'Tarifas Bancárias', ativo: true },
  { id: 'sub_14', categoryId: 'cat_inv', nome: 'Móveis e Equipamentos (CAPEX)', ativo: true },
  { id: 'sub_15', categoryId: 'cat_div', nome: 'Pró-Labore Sócios', ativo: true },
  { id: 'sub_16', categoryId: 'cat_div', nome: 'PLR Equipe', ativo: true },
];

export const INITIAL_PROCESS_SCORE_CONFIG: ProcessScoreConfig = {
  sugestaoNivel1: 15,
  sugestaoHonorarios: 10,
  sugestaoSucumbenciais: 5,
  ativo: true
};

export const INITIAL_DAILY_CATEGORIES: DailyCategory[] = [
  { id: 'cat_1', nome: 'Produção Jurídica', cor: 'blue', ordem: 1 },
  { id: 'cat_2', nome: 'Resultados', cor: 'green', ordem: 2 },
  { id: 'cat_5', nome: 'Penalidades', cor: 'red', ordem: 3 },
];

export const INITIAL_DAILY_TYPES: DailyEntryType[] = [
  { id: 'dt_1', nome: 'Peças Iniciais', categoriaId: 'cat_1', pontos: 5, ativo: true },
  { id: 'dt_2', nome: 'Defesas', categoriaId: 'cat_1', pontos: 5, ativo: true },
  { id: 'dt_4', nome: 'Audiências', categoriaId: 'cat_1', pontos: 10, ativo: true },
  { id: 'dt_5', nome: 'Contratos', categoriaId: 'cat_2', pontos: 8, ativo: true },
  { id: 'dt_8', nome: 'Erros Ocorridos', categoriaId: 'cat_5', pontos: -20, ativo: true },
];

export const INITIAL_POINT_RULES: PointRule[] = [
  { id: '1', indicador: 'Processo Nível 1', tipo: 'Volume', pontos: 15, observacao: 'Atualização obrigatória mensal.' },
  { id: '2', indicador: 'Sustentação Oral', tipo: 'Qualidade', pontos: 25, observacao: 'Bonificação por performance em tribunal.' },
  { id: '3', indicador: 'Êxito em Processo', tipo: 'Resultado', pontos: 50, observacao: 'Ganho efetivo para o cliente.' }
];

export const INITIAL_OFFICE_INDICATORS: OfficeIndicator = {
  mes: '', ano: 0,
  volume_juridico: {}, consultivo_e_estrategico: {}, eficiencia_operacional: {},
  clientes_e_mercado: {}, gestao_pessoais: [], financeiro_banca: {}
};

export const DRE_RUBRICS_STRUCTURE: DRERubric[] = [
  { id: 'RECEITA_BRUTA', label: 'RECEITA OPERACIONAL BRUTA', type: 'header' },
  { id: 'SIMPLES_NACIONAL', label: '(-) IMPOSTOS (SIMPLES)', type: 'header' },
  { id: 'RECEITA_LIQUIDA', label: '(=) RECEITA OPERACIONAL LÍQUIDA', type: 'result' },
  { id: 'CUSTO_DIRETO', label: '(-) CUSTOS DE PRODUÇÃO / OPERAÇÃO', type: 'header' },
  { id: 'LUCRO_BRUTO', label: '(=) LUCRO BRUTO', type: 'result' },
  { id: 'DESPESA_ADMIN', label: '(-) DESPESAS ADMINISTRATIVAS', type: 'header' },
  { id: 'DESPESA_COMERCIAL', label: '(-) DESPESAS COMERCIAIS / MARKETING', type: 'header' },
  { id: 'DESPESA_FINANCEIRA', label: '(-) DESPESAS FINANCEIRAS / TAXAS', type: 'header' },
  { id: 'LUCRO_LIQUIDO', label: '(=) EBITDA / LUCRO OPERACIONAL', type: 'result' },
  { id: 'INVESTIMENTOS', label: '(-) INVESTIMENTOS (CAPEX)', type: 'header' },
  { id: 'DIVIDENDOS', label: '(-) DISTRIBUIÇÃO DE LUCROS / PLR', type: 'header' },
  { id: 'RESULTADO_FINAL', label: '(=) RESULTADO LÍQUIDO FINAL', type: 'result' },
];

export const PRODUCTIVITY_RULE: ProductivityConfig = {
  pontos_base_por_tipo: { "Análise": 5, "Elaboração de Peça": 10, "Prazo Processual": 8, "Audiência": 12, "Outros": 2 },
  bonus_urgente: 0.2, penalidade_atraso: 0.3, nao_pontuar_se_precisa_revisao: true,
  pesos_indicadores: { exito: 50, acordo: 30, peca_inicial: 15, reuniao: 2, erro_penalidade: -20 },
  multiplicadores_impacto: { "QUALIDADE": 1, "RESULTADO": 2, "PENALIDADE": 5, "ESTRATEGICO": 10 }
};

export const COLORS = { primary: '#8B1538', pending: '#FFC107', urgent: '#DC3545', completed: '#28A745', total: '#6F42C1', background: '#F8F9FA', white: '#FFFFFF' };
export const QUALIFIED_ACTIVITY_TYPES: QualifiedActivityType[] = ['Sustentação Oral', 'Êxito em Processo', 'Acordo'];
export const INITIAL_QUALIFIED_ACTIVITIES: QualifiedActivity[] = [];
export const INITIAL_DATA: Appointment[] = [];
export const INITIAL_INDICATORS_DATA: MonthlyIndicator[] = [];
