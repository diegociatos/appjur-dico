
export type AppointmentStatus = 'PENDENTE' | 'CONCLUÍDO' | 'REAGENDADO' | 'URGENTE';
export type AppointmentType = 'Análise' | 'Elaboração de Peça' | 'Prazo Processual' | 'Audiência' | 'Outros';
export type ImpactLevel = 'QUALIDADE' | 'RESULTADO' | 'PENALIDADE' | 'ESTRATEGICO';

export type CategoryColor = 'blue' | 'green' | 'gray' | 'yellow' | 'red' | 'purple' | 'orange';

export type UserRole = 'Advogado' | 'Gestor' | 'Administrador' | 'Estagiário' | 'Financeiro';
export type UserStatus = 'Ativo' | 'Inativo' | 'Aguardando Primeiro Acesso';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  cargo: UserRole;
  status: UserStatus;
  dataCadastro: string;
  fotoUrl?: string;
  telefone?: string;
  oab?: string;
  dataAdmissao?: string;
  especialidade?: string;
  notificacoesEmail: boolean;
  exibirNoRanking: boolean;
  requiresPasswordChange: boolean;
}

// --- FINANCEIRO DINÂMICO ---

export interface FinanceBank {
  id: string;
  nome: string;
  saldoInicial: number;
  ativo: boolean;
}

export interface FinanceMonthlyBalance {
  id: string;
  bancoId: string;
  mesAno: string; // YYYY-MM
  saldoAbertura: number;
}

export interface FinanceCategory {
  id: string;
  nome: string;
  tipo: 'RECEITA' | 'DESPESA';
  dreLine: string; 
  ativo: boolean;
}

export interface FinanceSubcategory {
  id: string;
  categoryId: string;
  nome: string;
  ativo: boolean;
}

export interface DRERubric {
  id: string;
  label: string;
  type: 'header' | 'result';
}

export type FinanceTransactionType = 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA';

export interface FinanceTransaction {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: FinanceTransactionType;
  categoriaId: string; 
  subcategoriaId: string; 
  pago: boolean;
  competencia: string; 
  criadoPor: string;
  createdAt: string;
  bancoId: string; 
  destinoBancoId?: string;
}

// --- OUTROS TIPOS JÁ EXISTENTES ---
export interface HistoricalYearData { year: number; lineTotals: Record<string, number>; subcategoryTotals: Record<string, number>; }
export type PlanType = 'VALOR_FIXO' | 'PERSONALIZADO' | 'PAGUE_PELO_USO';
export interface ProcessPricingBand { min: number; max: number; pricePerProcess: number; }
export interface PerformanceFeeBand { maxValue: number; percentage: number; }
export interface ClientContract { id: string; clientId: string; clientName: string; planName: string; planType: PlanType; billingDay: number; monthlyFee: number; processPricingTable: ProcessPricingBand[]; performanceFeeBands: PerformanceFeeBand[]; hourlyRates: { senior: number; pleno: number; junior: number; }; planIncludes: { hoursIncluded: number; processesIncluded: number; }; signatureDate: string; expirationDate: string; indiceReajuste: string; currency: string; notes?: string; }
export type BillingStatus = 'RASCUNHO' | 'FINALIZADO' | 'ENVIADO' | 'PAGO';
export interface MonthlyBillingEntry { id: string; contractId: string; clientId: string; clientName: string; month: string; fixedMonthlyValue: number; totalReportedProcesses: number; billableProcessCount: number; billableProcessValue: number; hoursSenior: number; hoursPleno: number; hoursJunior: number; totalExecutedHours: number; hourlyRateType: 'senior' | 'pleno' | 'junior'; hourlyRateUsed: number; totalHoursValue: number; performanceBaseValue: number; performancePercentage: number; performanceFeeValue: number; otherFees: number; otherFeesReason?: string; totalAmount: number; status: BillingStatus; attachments: string[]; createdBy: string; createdAt: string; sentToFinanceAt?: string; isPaid?: boolean; correctionRequestedAt?: string; correctionReason?: string; }
export type ClientType = 'PF' | 'PJ';
export type ClientStatus = 'Ativo' | 'Inativo';

export interface ClientContact {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  aniversario: string;
  observacoes?: string;
}

export interface Client { id: string; tipo: ClientType; nome: string; documento: string; segmento?: string; telefone: string; email: string; endereco: { rua: string; numero: string; complemento?: string; bairro: string; cidade: string; estado: string; cep: string; }; contatos: ClientContact[]; dataInicio: string; responsavelId: string; status: ClientStatus; observacoes?: string; criadoPor: string; criadoEm: string; editadoEm?: string; editadoPor?: string; }
export interface Appointment { id: string; status: AppointmentStatus; tipo: AppointmentType; descricao: string; processo: string; advogado: string; data: string; urgente: boolean; data_conclusao?: string; prazo?: string; }
export interface MonthlyIndicator { advogado: string; mes: string; ano: number; is_fechado: boolean; score_total: number; bloco_producao: any; bloco_resultado: any; bloco_organizacao: any; bloco_comunicacao: any; bloco_qualidade: { erros_ocorridos: number }; bloco_financeiro: any; }
export interface OfficeIndicator { mes: string; ano: number; volume_juridico: any; consultivo_e_estrategico: any; eficiencia_operacional: any; clientes_e_mercado: any; gestao_pessoais: any[]; financeiro_banca: any; }
export interface SectorPeopleIndicator { sector: string; clima: number; casos_encantamento: any[]; }

export type QualifiedActivityType = 'Sustentação Oral' | 'Êxito em Processo' | 'Acordo';

export interface QualifiedActivity { id: string; advogado: string; tipo_atividade: QualifiedActivityType | string; cliente: string; impacto: string; status_validacao: 'PENDENTE' | 'CONFIRMADO' | 'RECUSADO'; data_solicitacao?: string; }
export interface ProcessUpdate { id: string; mes_referencia: string; ano_referencia: number; movimentacoes_realizadas: string; proximos_passos: string; riscos_identificados?: string; data_atualizacao: string; advogado_atualizador: string; status_validacao: 'PENDENTE_VALIDACAO' | 'VALIDADO'; data_validacao?: string; pontos_atribuidos?: number; status_no_momento?: string; }
export interface Processo { id: string; numero_processo: string; cliente: string; clienteId: string; tipo_processo: string; tipo_honorarios: string; advogado_responsavel: string; data_cadastro: string; valor_honorarios: number; valor_sucumbencial?: number; fase_processual: string; tribunal: string; vara: string; observacoes_gestor: string; status: string; timeline: ProcessUpdate[]; }
export interface CiatosNotification { id: string; titulo: string; mensagem: string; data: string; tipo: any; lida: boolean; }
export interface AuditLog { id: string; timestamp: string; userId: string; userName: string; action: any; resource: string; details: string; }
export interface PointRule { id: string; indicador: string; tipo: string; pontos: number; observacao: string; }
export interface DailyCategory { id: string; nome: string; cor: CategoryColor; ordem: number; }
export interface DailyEntryType { id: string; nome: string; categoriaId: string; pontos: number; ativo: boolean; descricao?: string; }
export interface DailyEntry { id: string; advogado: string; data: string; mes: string; ano: number; valores: Record<string, number>; criado_em: string; editado_em?: string; }
export interface ScoreEvent { id: string; advogado: string; mes: string; ano: number; pontos: number; tipoEvento: any; detalhe: string; data: string; validado_por?: string; processoId?: string; billingEntryId?: string; }
export interface ProcessScoreConfig { sugestaoNivel1: number; sugestaoHonorarios: number; sugestaoSucumbenciais: number; ativo: boolean; }
export interface Assignment { id: string; titulo: string; descricao: string; advogadoId: string; advogadoNome: string; prazo: string; pontos: number; penalidade: number; categoria: string; prioridade: string; status: AssignmentStatus; criadoEm: string; concluidoEm?: string; evidenciaAdvogado?: string; validadoPor?: string; validadoEm?: string; motivoReprovacao?: string; }

export interface BillingTemplate { id: string; contractId: string; clientName: string; name: string; pattern: string; billingDay: number; autoCreate: boolean; isActive: boolean; }
export interface ProductivityConfig { pontos_base_por_tipo: Record<string, number>; bonus_urgente: number; penalidade_atraso: number; nao_pontuar_se_precisa_revisao: boolean; pesos_indicadores: any; multiplicadores_impacto: Record<string, number>; }
export interface HourlyLog { id: string; advogadoId: string; clienteId: string; data: string; horas: number; descricao: string; }
export type MoodScore = 1 | 2 | 3 | 4 | 5;
export type SuggestionArea = any;
export type SuggestionStatus = 'PENDENTE' | 'IMPLEMENTADO' | 'REPROVADO';
export interface Suggestion { id: string; data: string; area: SuggestionArea; conteudo: string; impactoEsperado: string; autor: string; status: SuggestionStatus; }
export type PraiseCategory = any;
export type ProcessType = 'Nível 1' | 'Honorários Contratuais' | 'Honorários Sucumbenciais';
export type ProcessStatus = 'Ativo' | 'Inativo' | 'Arquivado';
export type HonorarioType = 'Nenhum' | 'Contratual' | 'Sucumbencial' | 'Ambos';
export interface KPICategory { id: string; nome: string; corBadge: CategoryColor; ordem: number; ativo: boolean; }
export type KPIPolarity = 'POSITIVO' | 'NEGATIVO';
export type KPIIndicatorValueType = 'number' | 'currency' | 'percent' | 'score';
export interface KPIIndicator { id: string; nome: string; categoriaId: string; unidade: string; tipoValor: KPIIndicatorValueType; polaridade: KPIPolarity; metaMensal?: number; ativo: boolean; ordem: number; }
export interface KPIEntry { id: string; mes: string; ano: number; indicatorId: string; valor: number; atualizadoEm: string; atualizadoPor: string; comentarioGestora?: string; }
export type KPIReportStatusType = 'RASCUNHO' | 'FINALIZADO';
export interface KPIReportStatus { mes: string; ano: number; status: KPIReportStatusType; fechadoPor?: string; fechadoEm?: string; }
export interface KPIInsight { titulo: string; evidencia: string; prioridade: any; polaridadeImpacto: any; sugestoes: string[]; }
export type AssignmentStatus = 'PENDENTE' | 'AGUARDANDO_VALIDACAO' | 'APROVADO' | 'REPROVADO';
export type AssignmentCategory = any;
export type AssignmentPriority = any;
export type RecurrencePattern = 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY';
