
import React, { useState, useMemo } from 'react';
import { 
  FileText, Plus, Search, Filter, Eye, Edit3, Download, History, 
  Calendar, CreditCard, ChevronRight, AlertCircle, Building2, UserCircle2,
  DollarSign, Clock, Layers
} from 'lucide-react';
import { ClientContract, Client, UserProfile } from '../types';
import ContractModal from './ContractModal';

interface ContractsViewProps {
  contracts: ClientContract[];
  clients: Client[];
  onAddContract: (contract: ClientContract) => void;
  onUpdateContract: (contract: ClientContract) => void;
  currentUser: UserProfile;
}

const ContractsView: React.FC<ContractsViewProps> = ({ contracts, clients, onAddContract, onUpdateContract, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ClientContract | null>(null);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => 
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contracts, searchTerm]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">Contratos & Planos</h1>
          <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">Arquitetura comercial e parâmetros de cobrança jurídica</p>
        </div>
        <button 
          onClick={() => { setEditingContract(null); setIsModalOpen(true); }}
          className="flex items-center gap-3 bg-[#8B1538] text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} /> Novo Contrato
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
        <div className="flex items-center gap-6">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar por cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all"
              />
           </div>
           <button className="p-3 text-gray-400 hover:text-[#8B1538] bg-gray-50 rounded-xl border border-gray-100 transition-all"><Download size={20}/></button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente / ID Contrato</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plano Mensal</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Incluído</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Vencimento</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredContracts.map(contract => (
              <tr key={contract.id} className="hover:bg-gray-50/10 transition-colors group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#8B1538] border border-gray-100">
                       <FileText size={20}/>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-serif font-bold text-[#2D3748]">{contract.clientName}</span>
                      <span className="text-[10px] text-gray-300 font-mono">#{contract.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-serif font-bold text-gray-700">{formatCurrency(contract.monthlyFee)}</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{contract.monthlyFee > 0 ? 'Plano Mensal' : 'Sem Plano / Consultivo'}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                   <div className="inline-flex items-center gap-3 px-4 py-1 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-1.5">
                         <Clock size={12} className="text-blue-400"/>
                         <span className="text-[11px] font-black text-gray-600">{contract.planIncludes.hoursIncluded}h</span>
                      </div>
                      <div className="w-px h-3 bg-gray-200" />
                      <div className="flex items-center gap-1.5">
                         <Layers size={12} className="text-purple-400"/>
                         <span className="text-[11px] font-black text-gray-600">{contract.planIncludes.processesIncluded}p</span>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-600">Dia {contract.billingDay}</span>
                    <span className="text-[8px] font-black text-gray-300 uppercase">Vencimento</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 text-gray-300 hover:text-[#8B1538] hover:bg-[#8B1538]/5 rounded-xl transition-all" title="Ver Histórico de Auditoria"><History size={18} /></button>
                    <button 
                      onClick={() => { setEditingContract(contract); setIsModalOpen(true); }}
                      className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Editar Parâmetros"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContractModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={(c) => {
          if (editingContract) onUpdateContract(c);
          else onAddContract(c);
        }}
        contractToEdit={editingContract}
        clients={clients}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ContractsView;
