
import React, { useState, useEffect } from 'react';
import { X, Building2, User, Phone, Mail, MapPin, Plus, Trash2, Calendar, ShieldCheck, CheckCircle2, AlertCircle, Save, Contact2, Star } from 'lucide-react';
import { Client, ClientType, ClientContact, UserProfile, ClientStatus } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  clientToEdit?: Client | null;
  users: UserProfile[];
  currentUser: UserProfile;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, clientToEdit, users, currentUser }) => {
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'criadoEm' | 'criadoPor'>>({
    tipo: 'PJ',
    nome: '',
    documento: '',
    segmento: '',
    telefone: '',
    email: '',
    endereco: { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' },
    contatos: [],
    dataInicio: new Date().toISOString().split('T')[0],
    responsavelId: '',
    status: 'Ativo',
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const lawyers = users.filter(u => u.cargo === 'Advogado' || u.cargo === 'Administrador');

  useEffect(() => {
    if (isOpen) {
      if (clientToEdit) {
        setFormData({ ...clientToEdit });
      } else {
        setFormData({
          tipo: 'PJ', nome: '', documento: '', segmento: '', telefone: '', email: '',
          endereco: { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' },
          contatos: [{ id: '1', nome: '', cargo: '', email: '', telefone: '', aniversario: '' }],
          dataInicio: new Date().toISOString().split('T')[0],
          responsavelId: '', status: 'Ativo', observacoes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, clientToEdit]);

  if (!isOpen) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.nome) e.nome = 'Obrigatório';
    if (!formData.documento) e.documento = 'Obrigatório';
    if (!formData.email) e.email = 'Obrigatório';
    if (!formData.responsavelId) e.responsavelId = 'Selecione o responsável';
    
    formData.contatos.forEach((c, i) => {
       if (!c.nome) e[`contact_name_${i}`] = 'Nome obrigatório';
       if (!c.aniversario) e[`contact_bday_${i}`] = 'Data obrigatória';
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddContact = () => {
    setFormData({
      ...formData,
      contatos: [...formData.contatos, { id: Date.now().toString(), nome: '', cargo: '', email: '', telefone: '', aniversario: '' }]
    });
  };

  const handleRemoveContact = (id: string) => {
    setFormData({ ...formData, contatos: formData.contatos.filter(c => c.id !== id) });
  };

  const updateContact = (id: string, field: keyof ClientContact, value: string) => {
    setFormData({
      ...formData,
      contatos: formData.contatos.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalClient: Client = {
      ...formData,
      id: clientToEdit ? clientToEdit.id : `cli_${Date.now()}`,
      criadoEm: clientToEdit ? clientToEdit.criadoEm : new Date().toISOString(),
      criadoPor: clientToEdit ? clientToEdit.criadoPor : currentUser.nome,
      editadoEm: new Date().toISOString(),
      editadoPor: currentUser.nome
    };

    onSave(finalClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
        {/* HEADER */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B1538]/5 rounded-2xl flex items-center justify-center text-[#8B1538]">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">
                {clientToEdit ? 'Editar Registro de Cliente' : 'Provisionar Novo Cliente'}
              </h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base de Inteligência Institucional</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
          
          {/* SEÇÃO 1: DADOS CADASTRAIS */}
          <section className="space-y-8">
             <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <ShieldCheck className="text-[#8B1538]" size={18}/>
                <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">01. Identificação Jurídica</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4 md:col-span-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Natureza</label>
                   <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                      <button type="button" onClick={() => setFormData({...formData, tipo: 'PJ'})} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.tipo === 'PJ' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>PJ</button>
                      <button type="button" onClick={() => setFormData({...formData, tipo: 'PF'})} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.tipo === 'PF' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>PF</button>
                   </div>
                </div>
                <div className="space-y-2 md:col-span-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Razão Social / Nome Completo *</label>
                   <input 
                    type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5"
                   />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">{formData.tipo === 'PJ' ? 'CNPJ' : 'CPF'} *</label>
                   <input 
                    type="text" required value={formData.documento} onChange={e => setFormData({...formData, documento: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-mono font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Segmento / Setor</label>
                   <input 
                    type="text" value={formData.segmento} onChange={e => setFormData({...formData, segmento: e.target.value})}
                    placeholder="Ex: Têxtil, Agronegócio, Tecnologia"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none"
                   />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">E-mail Principal</label>
                   <div className="relative">
                      <input 
                        type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-5 py-3.5 text-sm font-bold outline-none"
                      />
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Telefone Principal</label>
                   <div className="relative">
                      <input 
                        type="text" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-5 py-3.5 text-sm font-bold outline-none"
                      />
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                   </div>
                </div>
             </div>
          </section>

          {/* SEÇÃO 2: CONTATOS / SÓCIOS */}
          <section className="space-y-8 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
             <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                   <Contact2 className="text-[#8B1538]" size={18}/>
                   <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">02. Sócios e Interlocutores</h3>
                </div>
                <button type="button" onClick={handleAddContact} className="flex items-center gap-2 text-[10px] font-black text-[#8B1538] uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm hover:scale-105 transition-all">
                   <Plus size={14}/> Adicionar Contato
                </button>
             </div>

             <div className="space-y-6">
                {formData.contatos.map((contact, idx) => (
                  <div key={contact.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative group animate-in slide-in-from-top-4">
                     <button type="button" onClick={() => handleRemoveContact(contact.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-gray-400 uppercase block ml-1">Nome Completo</label>
                           <input 
                             type="text" value={contact.nome} onChange={e => updateContact(contact.id, 'nome', e.target.value)}
                             className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-xs font-bold outline-none ${errors[`contact_name_${idx}`] ? 'border-red-300' : 'border-gray-100'}`}
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-gray-400 uppercase block ml-1">Cargo / Função</label>
                           <input 
                             type="text" value={contact.cargo} onChange={e => updateContact(contact.id, 'cargo', e.target.value)}
                             className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-[#8B1538] uppercase block ml-1 flex items-center gap-1"><Calendar size={10}/> Aniversário</label>
                           <input 
                             type="date" value={contact.aniversario} onChange={e => updateContact(contact.id, 'aniversario', e.target.value)}
                             className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-xs font-bold outline-none ${errors[`contact_bday_${idx}`] ? 'border-red-300' : 'border-gray-100'}`}
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-gray-400 uppercase block ml-1">E-mail</label>
                           <input 
                             type="email" value={contact.email} onChange={e => updateContact(contact.id, 'email', e.target.value)}
                             className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                           />
                        </div>
                        <div className="space-y-1.5 lg:col-span-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase block ml-1">Observações Pessoais</label>
                           <input 
                             type="text" value={contact.observacoes} onChange={e => updateContact(contact.id, 'observacoes', e.target.value)}
                             placeholder="Ex: Prefere ligações após às 15h, Torcedor do Cruzeiro..."
                             className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                           />
                        </div>
                     </div>
                  </div>
                ))}
                {formData.contatos.length === 0 && (
                  <div className="py-10 text-center text-gray-400 italic text-xs font-serif">Nenhum interlocutor adicionado. Recomendado cadastrar pelo menos o sócio principal.</div>
                )}
             </div>
          </section>

          {/* SEÇÃO 3: RELACIONAMENTO E ENDEREÇO */}
          <section className="space-y-8">
             <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <Star className="text-[#8B1538]" size={18}/>
                <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">03. Contexto & Logística</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Início da Parceria</label>
                   <input 
                    type="date" value={formData.dataInicio} onChange={e => setFormData({...formData, dataInicio: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none"
                   />
                </div>
                <div className="space-y-2 md:col-span-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Advogado Responsável *</label>
                   <select 
                    required value={formData.responsavelId} onChange={e => setFormData({...formData, responsavelId: e.target.value})}
                    className={`w-full bg-gray-50 border rounded-xl px-5 py-3.5 text-sm font-bold outline-none ${errors.responsavelId ? 'border-red-300' : 'border-gray-100'}`}
                   >
                      <option value="">Selecione...</option>
                      {lawyers.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                   </select>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2 md:col-span-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Logradouro (Rua/Av)</label>
                   <input type="text" value={formData.endereco.rua} onChange={e => setFormData({...formData, endereco: {...formData.endereco, rua: e.target.value}})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nº</label>
                   <input type="text" value={formData.endereco.numero} onChange={e => setFormData({...formData, endereco: {...formData.endereco, numero: e.target.value}})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">CEP</label>
                   <input type="text" value={formData.endereco.cep} onChange={e => setFormData({...formData, endereco: {...formData.endereco, cep: e.target.value}})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Histórico / Notas Gerais</label>
                <textarea 
                  value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-5 text-sm h-32 resize-none outline-none focus:ring-4 focus:ring-[#8B1538]/5"
                  placeholder="Relate o perfil do cliente, comportamentos ou acordos especiais..."
                />
             </div>
          </section>
        </form>

        {/* FOOTER */}
        <div className="p-10 border-t border-gray-100 bg-gray-50 flex gap-6">
          <button 
            type="button" onClick={onClose}
            className="flex-1 py-5 border-2 border-gray-200 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-white hover:text-gray-600 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Save size={18}/> {clientToEdit ? 'Atualizar Prontuário' : 'Salvar e Validar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
