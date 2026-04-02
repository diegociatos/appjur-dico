
import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Filter, Plus, Download, Upload, Eye, Edit3, UserX, UserCheck, 
  MapPin, Phone, Mail, Calendar, Briefcase, ChevronRight, X, ArrowUpDown, 
  Contact2, Building2, UserCircle2, ArrowRight, Save, ShieldCheck, CheckCircle2,
  Trash2, PlusCircle, AlertCircle, User
} from 'lucide-react';
import { Client, UserProfile, UserRole, Processo, MonthlyBillingEntry } from '../types';
import Avatar from './Avatar';
import ClientModal from './ClientModal';
import ClientImportModal from './ClientImportModal';
import ClientDetailsView from './ClientDetailsView';

interface ClientsViewProps {
  clients: Client[];
  users: UserProfile[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  currentUser: UserProfile;
  processes: Processo[];
  billingEntries: MonthlyBillingEntry[];
  onLogAudit: (log: any) => void;
}

const ClientsView: React.FC<ClientsViewProps> = ({ 
  clients, users, onAddClient, onUpdateClient, currentUser, processes, billingEntries, onLogAudit 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterResp, setFilterResp] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Usar ID para rastrear o cliente sendo visualizado para garantir reatividade total
  const [viewingClientId, setViewingClientId] = useState<string | null>(null);

  const lawyers = users.filter(u => u.cargo === 'Advogado' || u.cargo === 'Administrador');

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || c.documento.includes(searchTerm);
      const matchesStatus = filterStatus === 'Todos' || c.status === filterStatus;
      const matchesResp = filterResp === 'Todos' || c.responsavelId === filterResp;
      
      const canSee = currentUser.cargo !== 'Advogado' || c.responsavelId === currentUser.id;
      
      return matchesSearch && matchesStatus && matchesResp && canSee;
    });
  }, [clients, searchTerm, filterStatus, filterResp, currentUser]);

  const currentViewingClient = useMemo(() => 
    clients.find(c => c.id === viewingClientId) || null
  , [clients, viewingClientId]);

  const getActiveProcessesCount = (clientId: string) => {
    return processes.filter(p => p.clienteId === clientId && p.status === 'Ativo').length;
  };

  const handleToggleStatus = (client: Client) => {
    const next: Client = { ...client, status: client.status === 'Ativo' ? 'Inativo' : 'Ativo' };
    onUpdateClient(next);
  };

  const exportBase = () => {
    const headers = "Nome,Documento,Tipo,Segmento,Email,Telefone,Status,Responsavel\n";
    const rows = clients.map(c => 
      `"${c.nome}","${c.documento}","${c.tipo}","${c.segmento}","${c.email}","${c.telefone}","${c.status}","${users.find(u=>u.id===c.responsavelId)?.nome}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ciatos_Base_Clientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (viewingClientId && currentViewingClient) {
    return (
      <ClientDetailsView 
        client={currentViewingClient} 
        onBack={() => setViewingClientId(null)} 
        onEdit={() => { setEditingClient(currentViewingClient); setIsModalOpen(true); }}
        processes={processes.filter(p => p.clienteId === viewingClientId)}
        users={users}
        billingEntries={billingEntries}
        currentUser={currentUser}
        onLogAudit={onLogAudit}
      />
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#8B1538] leading-tight">Gestão de Clientes</h1>
          <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic font-serif">Governança de portfólio e fidelização estratégica</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportBase}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-100 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-[#8B1538]/20 hover:text-[#8B1538] transition-all"
          >
            <Download size={16} /> Exportar Base
          </button>
          <button 
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-100 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-[#8B1538]/20 hover:text-[#8B1538] transition-all"
          >
            <Upload size={16} /> Importar
          </button>
          <button 
            onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
            className="flex items-center gap-3 bg-[#8B1538] text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} /> Novo Cliente
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <div className="relative lg:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou documento..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all"
              />
           </div>
           
           <div className="flex items-center gap-3">
              <Filter className="text-[#8B1538]" size={16} />
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer"
              >
                <option value="Todos">Status: Todos</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
           </div>

           <div className="flex items-center gap-3">
              <UserCircle2 className="text-[#8B1538]" size={16} />
              <select 
                value={filterResp} 
                onChange={(e) => setFilterResp(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer"
              >
                <option value="Todos">Responsável: Todos</option>
                {lawyers.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Documento</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Processos Ativos</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsável</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredClients.map(client => (
              <tr key={client.id} className="hover:bg-gray-50/10 transition-colors group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${client.tipo === 'PJ' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-600'}`}>
                      {client.tipo === 'PJ' ? <Building2 size={20}/> : <User size={20}/>}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-serif font-bold text-[#2D3748]">{client.nome}</span>
                      <span className="text-[11px] text-gray-400 font-medium uppercase tracking-tight">{client.segmento || 'Não Informado'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 font-mono text-xs text-gray-500">{client.documento}</td>
                <td className="px-8 py-6 text-center">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                      <Briefcase size={12} className="text-[#8B1538]"/>
                      <span className="text-xs font-black text-gray-700">{getActiveProcessesCount(client.id)}</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-bold text-gray-600 font-serif">
                    {users.find(u => u.id === client.responsavelId)?.nome || 'Sem Resp.'}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight border ${client.status === 'Ativo' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      title="Ver Detalhes"
                      onClick={() => setViewingClientId(client.id)}
                      className="p-3 text-gray-300 hover:text-[#8B1538] hover:bg-[#8B1538]/5 rounded-xl transition-all"
                    >
                      <Eye size={18} />
                    </button>
                    {currentUser.cargo !== 'Advogado' && (
                      <>
                        <button 
                          title={client.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                          onClick={() => handleToggleStatus(client)}
                          className={`p-3 rounded-xl transition-all ${client.status === 'Ativo' ? 'text-gray-300 hover:text-red-500 hover:bg-red-50' : 'text-gray-300 hover:text-green-500 hover:bg-green-50'}`}
                        >
                          {client.status === 'Ativo' ? <UserX size={18} /> : <UserCheck size={18} />}
                        </button>
                        <button 
                          onClick={() => { setEditingClient(client); setIsModalOpen(true); }}
                          className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={(c) => {
          if (editingClient) onUpdateClient(c);
          else onAddClient(c);
        }}
        clientToEdit={editingClient}
        users={users}
        currentUser={currentUser}
      />

      <ClientImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onImport={(list) => list.forEach(c => onAddClient(c))}
        users={users}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ClientsView;
