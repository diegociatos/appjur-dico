
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, 
  ArrowRight, ShieldCheck, Eye, Trash2, Edit3, User, Briefcase, ChevronRight,
  TrendingUp, TrendingDown, Target, Zap, FileCheck2
} from 'lucide-react';
import { Assignment, UserProfile, AssignmentStatus, AssignmentCategory, AssignmentPriority } from '../types';
import NewAssignmentModal from './NewAssignmentModal';
import AssignmentValidationModal from './AssignmentValidationModal';

interface AssignmentManagementViewProps {
  assignments: Assignment[];
  users: UserProfile[];
  onAddAssignment: (assignment: Assignment) => void;
  onUpdateAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  // Fix: changed 'APROVADO' | 'REPROVADO' to AssignmentStatus for better type consistency
  onAuditAssignment: (id: string, decision: AssignmentStatus, reason?: string) => void;
  currentUser: UserProfile;
}

const AssignmentManagementView: React.FC<AssignmentManagementViewProps> = ({ 
  assignments, users, onAddAssignment, onUpdateAssignment, onDeleteAssignment, onAuditAssignment, currentUser 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterLawyer, setFilterLawyer] = useState<string>('Todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const lawyers = users.filter(u => u.cargo === 'Advogado' || u.cargo === 'Administrador');

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const matchesSearch = a.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'Todos' || a.status === filterStatus;
      const matchesLawyer = filterLawyer === 'Todos' || a.advogadoId === filterLawyer;
      return matchesSearch && matchesStatus && matchesLawyer;
    });
  }, [assignments, searchTerm, filterStatus, filterLawyer]);

  const stats = useMemo(() => {
    const total = assignments.length;
    const waiting = assignments.filter(a => a.status === 'AGUARDANDO_VALIDACAO').length;
    const pending = assignments.filter(a => a.status === 'PENDENTE').length;
    const approved = assignments.filter(a => a.status === 'APROVADO').length;
    const reproved = assignments.filter(a => a.status === 'REPROVADO').length;
    const expired = assignments.filter(a => a.status === 'PENDENTE' && new Date(a.prazo) < new Date()).length;
    return { total, waiting, pending, approved, reproved, expired };
  }, [assignments]);

  const getStatusBadge = (s: AssignmentStatus) => {
    switch (s) {
      case 'APROVADO': return 'bg-green-50 text-green-600 border-green-100';
      case 'REPROVADO': return 'bg-red-50 text-red-600 border-red-100';
      case 'AGUARDANDO_VALIDACAO': return 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  const handleOpenAudit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsAuditModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">Compromissos da Equipe</h1>
          <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">Curadoria de tarefas táticas e validação de performance</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-3 bg-[#8B1538] text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} /> Novo Compromisso
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Atribuído</span>
            <span className="text-3xl font-bold text-gray-800">{stats.total}</span>
         </div>
         <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <span className="block text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Fila Auditoria</span>
              <span className="text-3xl font-bold text-amber-700">{stats.waiting}</span>
            </div>
            <FileCheck2 className="absolute right-[-10px] bottom-[-10px] text-amber-200/50" size={80}/>
         </div>
         <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm">
            <span className="block text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Vencidos s/ Entrega</span>
            <span className="text-3xl font-bold text-red-700">{stats.expired}</span>
         </div>
         <div className="bg-green-50 p-6 rounded-3xl border border-green-100 shadow-sm">
            <span className="block text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Taxa Aprovação</span>
            <span className="text-3xl font-bold text-green-700">{stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(0) : 0}%</span>
         </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 flex flex-wrap gap-6 items-center">
         <div className="flex-1 relative min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" placeholder="Filtrar por título ou descrição..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all"
            />
         </div>
         <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer">
            <option value="Todos">Status: Todos</option>
            <option value="PENDENTE">Pendente</option>
            <option value="AGUARDANDO_VALIDACAO">Auditoria</option>
            <option value="APROVADO">Aprovado</option>
            <option value="REPROVADO">Reprovado</option>
         </select>
         <select value={filterLawyer} onChange={e => setFilterLawyer(e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer">
            <option value="Todos">Responsável: Todos</option>
            {lawyers.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
         </select>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Compromisso</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Prazo Final</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Pontuação</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(a => {
              const isExpired = a.status === 'PENDENTE' && new Date(a.prazo) < new Date();
              return (
                <tr key={a.id} className={`hover:bg-gray-50/10 transition-colors group ${isExpired ? 'bg-red-50/30' : ''}`}>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <div className={`w-2 h-10 rounded-full ${a.prioridade === 'Urgente' ? 'bg-red-500' : a.prioridade === 'Alta' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                       <div className="flex flex-col">
                          <span className="text-[15px] font-serif font-bold text-[#2D3748]">{a.titulo}</span>
                          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">{a.advogadoNome} — {a.categoria}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                       <span className={`text-xs font-bold ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>{new Date(a.prazo).toLocaleDateString()}</span>
                       {isExpired && <span className="text-[8px] font-black text-red-500 uppercase">Atrasado</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                       <span className="text-sm font-black text-green-600">+{a.pontos} pts</span>
                       <span className="text-[8px] font-black text-red-400 uppercase">Penalidade: -{a.penalidade} pts</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight border ${getStatusBadge(a.status)}`}>
                       {a.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {a.status === 'AGUARDANDO_VALIDACAO' ? (
                         <button 
                          onClick={() => handleOpenAudit(a)}
                          className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                         >
                            <ShieldCheck size={14}/> Validar
                         </button>
                       ) : (
                         <button 
                          className="p-3 text-gray-300 hover:text-[#8B1538] hover:bg-[#8B1538]/5 rounded-xl transition-all cursor-default"
                         >
                            <CheckCircle2 size={18} className={a.status === 'APROVADO' ? 'text-green-500' : 'text-gray-200'} />
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <NewAssignmentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        users={lawyers}
        onSave={onAddAssignment}
      />

      {isAuditModalOpen && selectedAssignment && (
        <AssignmentValidationModal 
          isOpen={isAuditModalOpen}
          assignment={selectedAssignment}
          onClose={() => { setIsAuditModalOpen(false); setSelectedAssignment(null); }}
          // Fix: passed updated onAuditAssignment handler
          onAudit={onAuditAssignment}
        />
      )}
    </div>
  );
};

export default AssignmentManagementView;
