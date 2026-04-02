
import { 
  Appointment, MonthlyIndicator, ProductivityConfig, OfficeIndicator, 
  QualifiedActivity, QualifiedActivityType, Processo, PointRule, 
  DailyEntryType, DailyCategory, ProcessScoreConfig, Client, 
  Assignment, ClientContract, MonthlyBillingEntry, AuditLog,
  FinanceBank, FinanceCategory, FinanceSubcategory, ScoreEvent
} from './types';

// --- FINANCEIRO DINÂMICO ---
export const INITIAL_FINANCE_BANKS: FinanceBank[] = [
  { id: 'bank_1', nome: 'Itaú Unibanco', saldoInicial: 25000.00, ativo: true },
  { id: 'bank_2', nome: 'Banco Inter', saldoInicial: 12450.00, ativo: true },
  { id: 'bank_3', nome: 'Sicoob Judiciário', saldoInicial: 5800.00, ativo: true },
];

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
  /* Fixed categoryId to categoriaId to match DailyEntryType interface */
  { id: 'dt_2', nome: 'Defesas', categoriaId: 'cat_1', pontos: 5, ativo: true },
  { id: 'dt_4', nome: 'Audiências', categoriaId: 'cat_1', pontos: 10, ativo: true },
  { id: 'dt_5', nome: 'Contratos', categoriaId: 'cat_2', pontos: 8, ativo: true },
  { id: 'dt_8', nome: 'Erros Ocorridos', categoriaId: 'cat_5', pontos: -20, ativo: true },
];

export const INITIAL_CLIENTS: Client[] = [
  { 
    id: 'cli_1', tipo: 'PJ', nome: 'Indústria Metalúrgica São Paulo Ltda', 
    documento: '12.345.678/0001-90', segmento: 'Indústria', telefone: '(11) 4004-0000', 
    email: 'juridico@metalsaopaulo.com.br', responsavelId: 'user_renan', status: 'Ativo',
    endereco: { rua: 'Av. Paulista', numero: '1000', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', cep: '01310-100' },
    contatos: [], dataInicio: '2020-05-15', criadoPor: 'Admin', criadoEm: '2026-01-01T10:00:00Z'
  },
  { 
    id: 'cli_2', tipo: 'PJ', nome: 'AgroTec Soluções Rurais', 
    documento: '98.765.432/0001-11', segmento: 'Agronegócio', telefone: '(31) 3344-5566', 
    email: 'financeiro@agrotec.com.br', responsavelId: 'u2', status: 'Ativo',
    endereco: { rua: 'Rua da Bahia', numero: '500', bairro: 'Centro', cidade: 'Belo Horizonte', estado: 'MG', cep: '30160-010' },
    contatos: [], dataInicio: '2022-03-10', criadoPor: 'Admin', criadoEm: '2026-01-01T10:00:00Z'
  },
];

export const INITIAL_CONTRACTS: ClientContract[] = [
  { 
    id: 'cont_1', clientId: 'cli_1', clientName: 'Indústria Metalúrgica São Paulo Ltda', 
    planName: 'Corporate I', planType: 'VALOR_FIXO', billingDay: 10, monthlyFee: 5000, 
    processPricingTable: [], performanceFeeBands: [], hourlyRates: { senior: 450, pleno: 300, junior: 150 }, 
    planIncludes: { hoursIncluded: 10, processesIncluded: 5 }, signatureDate: '2025-01-01', 
    expirationDate: '2026-01-01', indiceReajuste: 'IPCA', currency: 'BRL' 
  },
  { 
    id: 'cont_2', clientId: 'cli_2', clientName: 'AgroTec Soluções Rurais', 
    planName: 'Elite Agribusiness', planType: 'PERSONALIZADO', billingDay: 5, monthlyFee: 8500, 
    processPricingTable: [{ min: 1, max: 10, pricePerProcess: 200 }], performanceFeeBands: [], 
    hourlyRates: { senior: 500, pleno: 350, junior: 200 }, planIncludes: { hoursIncluded: 20, processesIncluded: 10 }, 
    signatureDate: '2024-06-15', expirationDate: '2026-06-15', indiceReajuste: 'IGPM', currency: 'BRL' 
  },
];

export const INITIAL_BILLING_ENTRIES: MonthlyBillingEntry[] = [
  {
    id: 'bill_1', contractId: 'cont_1', clientId: 'cli_1', clientName: 'Indústria Metalúrgica São Paulo Ltda',
    month: '2026-01', fixedMonthlyValue: 5000, totalReportedProcesses: 4, billableProcessCount: 0,
    billableProcessValue: 0, hoursSenior: 0, hoursPleno: 0, hoursJunior: 0, totalExecutedHours: 5,
    hourlyRateType: 'pleno', hourlyRateUsed: 300, totalHoursValue: 0, performanceBaseValue: 0,
    performancePercentage: 0, performanceFeeValue: 0, otherFees: 0, totalAmount: 5000,
    status: 'PAGO', isPaid: true, attachments: [], createdBy: 'Stephanie', createdAt: '2026-01-31'
  },
  {
    id: 'bill_2', contractId: 'cont_2', clientId: 'cli_2', clientName: 'AgroTec Soluções Rurais',
    month: '2026-02', fixedMonthlyValue: 8500, totalReportedProcesses: 15, billableProcessCount: 5,
    billableProcessValue: 1000, hoursSenior: 0, hoursPleno: 0, hoursJunior: 0, totalExecutedHours: 25,
    hourlyRateType: 'pleno', hourlyRateUsed: 350, totalHoursValue: 1750, performanceBaseValue: 0,
    performancePercentage: 0, performanceFeeValue: 0, otherFees: 0, totalAmount: 11250,
    status: 'FINALIZADO', isPaid: true, attachments: [], createdBy: 'Stephanie', createdAt: '2026-02-28'
  }
];

export const INITIAL_PROCESSES: Processo[] = [
  {
    id: 'proc_1', numero_processo: '5001234-55.2026.8.13.0024', cliente: 'AgroTec Soluções Rurais',
    clienteId: 'cli_2', tipo_processo: 'Nível 1', tipo_honorarios: 'Ambos', advogado_responsavel: 'Stephanie',
    data_cadastro: '2026-01-10', valor_honorarios: 15000, valor_sucumbencial: 45000, fase_processual: 'Conhecimento',
    tribunal: 'TJMG', vara: '2ª Vara Cível de BH', observacoes_gestor: 'Processo estratégico de alto impacto financeiro.',
    status: 'Ativo', timeline: [
      { id: 'upd_1', mes_referencia: 'Fevereiro', ano_referencia: 2026, movimentacoes_realizadas: 'Réplica protocolada e pedido de tutela de urgência deferido.', proximos_passos: 'Aguardar citação da parte ré.', data_atualizacao: '2026-02-15', advogado_atualizador: 'Stephanie', status_validacao: 'VALIDADO', pontos_atribuidos: 15, data_validacao: '2026-02-16' }
    ]
  },
  {
    id: 'proc_2', numero_processo: '0011440-64.2019.5.15.0137', cliente: 'Indústria Metalúrgica São Paulo Ltda',
    clienteId: 'cli_1', tipo_processo: 'Nível 1', tipo_honorarios: 'Contratual', advogado_responsavel: 'Renan Almeida',
    data_cadastro: '2025-12-01', valor_honorarios: 12000, fase_processual: 'Execução',
    tribunal: 'TRT15', vara: '1ª Vara do Trabalho de Piracicaba', observacoes_gestor: 'Foco em bloqueio judicial BacenJud.',
    status: 'Ativo', timeline: []
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'as_1', titulo: 'Prazos Fatais: Recurso Ordinário Vale', descricao: 'Elaborar recurso ordinário para o processo 0011440. Focar na tese de horas extras.',
    advogadoId: 'user_renan', advogadoNome: 'Renan Almeida', prazo: '2026-02-24', pontos: 50, penalidade: 100,
    categoria: 'Prazo Processual', prioridade: 'Urgente', status: 'PENDENTE', criadoEm: '2026-02-20'
  },
  {
    id: 'as_2', titulo: 'Parecer Estratégico AgroTec', descricao: 'Análise de viabilidade de acordo em ação indenizatória.',
    advogadoId: 'user_renan', advogadoNome: 'Renan Almeida', prazo: '2026-02-27', pontos: 30, penalidade: 60,
    categoria: 'Consultivo', prioridade: 'Alta', status: 'PENDENTE', criadoEm: '2026-02-20'
  },
  {
    id: 'as_3', titulo: 'Audiência de Instrução - Metalurgica', descricao: 'Participar de audiência virtual via Zoom.',
    advogadoId: 'u3', advogadoNome: 'Bruna Silva', prazo: '2026-02-25', pontos: 40, penalidade: 80,
    categoria: 'Audiência', prioridade: 'Alta', status: 'PENDENTE', criadoEm: '2026-02-20'
  }
];

export const INITIAL_INDICATORS: MonthlyIndicator[] = [
  {
    advogado: 'Stephanie', mes: 'Fevereiro', ano: 2026, is_fechado: false, score_total: 485,
    bloco_producao: {}, bloco_resultado: {}, bloco_organizacao: {}, bloco_comunicacao: {},
    bloco_qualidade: { erros_ocorridos: 0 }, bloco_financeiro: {}
  },
  {
    advogado: 'Renan Almeida', mes: 'Fevereiro', ano: 2026, is_fechado: false, score_total: 320,
    bloco_producao: {}, bloco_resultado: {}, bloco_organizacao: {}, bloco_comunicacao: {},
    bloco_qualidade: { erros_ocorridos: 1 }, bloco_financeiro: {}
  },
  {
    advogado: 'Bruna Silva', mes: 'Fevereiro', ano: 2026, is_fechado: false, score_total: 150,
    bloco_producao: {}, bloco_resultado: {}, bloco_organizacao: {}, bloco_comunicacao: {},
    bloco_qualidade: { erros_ocorridos: 0 }, bloco_financeiro: {}
  }
];

export const INITIAL_POINT_RULES: PointRule[] = [
  { id: '1', indicador: 'Processo Nível 1', tipo: 'Volume', pontos: 15, observacao: 'Atualização obrigatória mensal.' },
  { id: '2', indicador: 'Sustentação Oral', tipo: 'Qualidade', pontos: 25, observacao: 'Bonificação por performance em tribunal.' },
  { id: '3', indicador: 'Êxito em Processo', tipo: 'Resultado', pontos: 50, observacao: 'Ganho efetivo para o cliente.' }
];

export const PRODUCTIVITY_RULE: ProductivityConfig = { 
  pontos_base_por_tipo: { "Análise": 5, "Elaboração de Peça": 10, "Prazo Processual": 8, "Audiência": 12, "Outros": 2 }, 
  bonus_urgente: 0.2, penalidade_atraso: 0.3, nao_pontuar_se_precisa_revisao: true, 
  pesos_indicadores: { exito: 50, acordo: 30, peca_inicial: 15, reuniao: 2, erro_penalidade: -20 }, 
  multiplicadores_impacto: { "QUALIDADE": 1, "RESULTADO": 2, "PENALIDADE": 5, "ESTRATEGICO": 10 } 
};

export const COLORS = { primary: '#8B1538', pending: '#FFC107', urgent: '#DC3545', completed: '#28A745', total: '#6F42C1', background: '#F8F9FA', white: '#FFFFFF' };
export const INITIAL_OFFICE_INDICATORS: OfficeIndicator = { mes: "Fevereiro", ano: 2026, volume_juridico: { processos_total: 1240, pecas_iniciais: 42, defesas: 115, recursos: 38, exitos_processos: 12, acordos: 24, audiencias: 45 }, consultivo_e_estrategico: { os_consultoria: 88, contratos: 12, pareceres: 15, reuniões: 142, planejamentos_cliente: 8 }, eficiencia_operacional: { compromissos_gerados: 854, compromissos_urgentes: 24, compromissos_reagendados: 32, hours_timesheet: 2450.5, erros_ocorridos: 1 }, clientes_e_mercado: { numero_clientes: 156, novos_clientes: 8, perda_clientes: 2, satisfacao_clientes: 9.2, retencao_clientes: 98.7, reuniões_bimestrais_clientes: 45, relatórios_atualizados_clientes: 100 }, gestao_pessoais: [], financeiro_banca: { sucumbencias: 85400, honorarios_exito: 312000 } };
export const QUALIFIED_ACTIVITY_TYPES: QualifiedActivityType[] = [ 'Sustentação Oral', 'Êxito em Processo', 'Acordo' ];
export const INITIAL_QUALIFIED_ACTIVITIES: QualifiedActivity[] = [];
export const INITIAL_DATA: Appointment[] = [];
export const INITIAL_INDICATORS_DATA: MonthlyIndicator[] = [];
