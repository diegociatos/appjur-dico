
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Smile, 
  Frown, 
  Activity,
  UserCheck,
  MessageSquare,
  Sparkles, 
  TrendingUp, 
  Plus, 
  X, 
  Download, 
  CalendarX,
  MessageCircleOff,
  Meh,
  SmilePlus,
  Send,
  Heart,
  UserCircle2,
  Zap,
  BarChart3,
  Lightbulb,
  Star,
  CheckCircle2,
  ArrowRight,
  Clock,
  Inbox,
  Trash2,
  Award,
  ShieldCheck
} from 'lucide-react';
import { SectorPeopleIndicator, MoodScore, UserProfile, Suggestion, SuggestionArea, SuggestionStatus, PraiseCategory } from '../types';
import Avatar from './Avatar';

interface PeopleViewProps {
  sectors: SectorPeopleIndicator[];
  currentUser: UserProfile;
}

const MOODS: { score: MoodScore; label: string; icon: any; color: string; bg: string }[] = [
  { score: 1, label: 'Péssimo', icon: Frown, color: 'text-red-500', bg: 'bg-red-50' },
  { score: 2, label: 'Ruim', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
  { score: 3, label: 'Neutro', icon: Meh, color: 'text-blue-500', bg: 'bg-blue-50' },
  { score: 4, label: 'Bem', icon: UserCheck, color: 'text-green-500', bg: 'bg-green-50' },
  { score: 5, label: 'Excelente', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' }
];

const SUGGESTION_AREAS: SuggestionArea[] = [
  'Infraestrutura/TI', 'Processos Internos', 'Gestão de Pessoas', 'Comercial', 'Outros'
];

const PRAISE_CATEGORIES: PraiseCategory[] = [
  'Qualidade Técnica', 'Proatividade', 'Trabalho em Equipe', 'Atendimento ao Cliente'
];

const PeopleView: React.FC<PeopleViewProps> = ({ sectors, currentUser }) => {
  const isAdvogado = currentUser.cargo === 'Advogado';
  // Fix: changed 'Gestora' to 'Gestor' as it's the correct value for UserRole type
  const canSeeSectors = currentUser.cargo === 'Gestor' || currentUser.cargo === 'Administrador';
  
  const [activeMainTab, setActiveMainTab] = useState<'clima' | 'setores'>('clima');
  const [selectedMood, setSelectedMood] = useState<MoodScore | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  
  const TEAM_MEMBERS = ['Stephanie', 'Bruna Silva', 'Sarah', 'Deisinay', 'Renan Almeida'];

  const [encantamentos, setEncantamentos] = useState([
    { id: '1', advogado: 'Stephanie', data: '2026-02-15', descricao: 'Elogio formal do cliente Vale do Ouro pela celeridade no recurso.', tipo: 'Qualidade Técnica' },
    { id: '2', advogado: 'Deisinay', data: '2026-02-10', descricao: 'Identificou erro material em sentença que reverteu condenação de 200k.', tipo: 'Proatividade' },
  ]);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { id: 's1', data: '2026-02-18', area: 'Infraestrutura/TI', conteudo: 'O sistema de peticionamento eletrônico está lento no período da tarde.', impactoEsperado: 'Redução de tempo morto e stress da equipe.', autor: 'Bruna Silva', status: 'PENDENTE' },
    { id: 's2', data: '2026-02-15', area: 'Processos Internos', conteudo: 'Implementar checklist padrão para iniciais de Nível 1.', impactoEsperado: 'Padronização e redução de erros de admissibilidade.', autor: 'Renan Almeida', status: 'IMPLEMENTADO' }
  ]);

  const [isPraiseModalOpen, setIsPraiseModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  const [newPraise, setNewPraise] = useState({ paraQuem: '', categoria: 'Qualidade Técnica' as PraiseCategory, motivo: '' });
  const [newSuggestion, setNewSuggestion] = useState({ area: 'Processos Internos' as SuggestionArea, conteudo: '', impacto: '' });

  const handleSendMood = () => {
    if (selectedMood === null) return;
    alert(`Obrigado pelo seu feedback! Registramos seu sentimento.`);
    setSelectedMood(null);
    setFeedbackText('');
  };

  const handleAddPraise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPraise.paraQuem || !newPraise.motivo) return;
    setEncantamentos([{ 
      id: Date.now().toString(), 
      advogado: newPraise.paraQuem, 
      data: new Date().toISOString().split('T')[0], 
      descricao: newPraise.motivo, 
      tipo: newPraise.categoria 
    }, ...encantamentos]);
    setIsPraiseModalOpen(false);
    setNewPraise({ paraQuem: '', categoria: 'Qualidade Técnica', motivo: '' });
  };

  const handleAddSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.conteudo || !newSuggestion.impacto) return;
    setSuggestions([{
      id: `s_${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      area: newSuggestion.area,
      conteudo: newSuggestion.conteudo,
      impactoEsperado: newSuggestion.impacto,
      autor: currentUser.nome,
      status: 'PENDENTE'
    }, ...suggestions]);
    setIsSuggestionModalOpen(false);
    setNewSuggestion({ area: 'Processos Internos', conteudo: '', impacto: '' });
    alert("Sua sugestão foi enviada para a Gestão. Obrigado por inovar!");
  };

  const renderEncantamentoPanel = () => (
    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
       <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
             <Star size={16} className="text-amber-500" fill="currentColor"/> Destaques & Encantamento
          </h3>
          <div className="flex gap-3">
            <button 
                onClick={() => setIsPraiseModalOpen(true)}
                className="flex items-center gap-2 bg-amber-50 text-amber-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all shadow-sm"
            >
                <Star size={14} fill="currentColor"/> Elogiar Colega
            </button>
            <button 
                onClick={() => setIsSuggestionModalOpen(true)}
                className="flex items-center gap-2 bg-[#8B1538]/5 text-[#8B1538] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#8B1538]/10 transition-all border border-[#8B1538]/10"
            >
                <Lightbulb size={14} fill="currentColor"/> Sugerir Melhoria
            </button>
          </div>
       </div>
       
       <div className="space-y-6 flex-1 overflow-y-auto max-h-[600px] scrollbar-hide pr-2 pb-4 font-serif">
          {encantamentos.map(enc => (
            <div key={enc.id} className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 relative group overflow-hidden transition-all hover:bg-white hover:shadow-md">
               <div className="flex items-center gap-3 mb-3">
                  <Avatar nome={enc.advogado} size="sm" />
                  <span className="text-sm font-bold text-gray-700">{enc.advogado}</span>
               </div>
               <p className="text-xs text-gray-500 leading-relaxed italic">"{enc.descricao}"</p>
               <div className="mt-4 flex justify-between items-center">
                  <span className="text-[8px] font-black bg-white border border-gray-100 px-3 py-1 rounded-full text-amber-600 uppercase tracking-tighter shadow-sm">{enc.tipo}</span>
                  <span className="text-[8px] font-black text-gray-300 uppercase">{enc.data.split('-').reverse().join('/')}</span>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  const renderClimaTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
      <div className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-xl shadow-black/[0.02] flex flex-col items-center text-center h-full">
          <div className="w-16 h-16 bg-[#8B1538]/5 rounded-3xl flex items-center justify-center text-[#8B1538] mb-8">
             <Heart size={32} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#2D3748] mb-3">Como você está hoje?</h2>
          <p className="text-sm text-gray-400 font-serif italic mb-12">Seu bem-estar é a nossa prioridade corporativa. Compartilhe seu sentimento.</p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
             {MOODS.map(mood => (
               <button 
                key={mood.score} 
                onClick={() => setSelectedMood(mood.score)}
                className={`flex flex-col items-center gap-3 p-5 rounded-[2.5rem] transition-all group w-28 border-2 
                  ${selectedMood === mood.score ? 'bg-[#8B1538] border-[#8B1538] scale-110 shadow-xl text-white' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-100'}`}
               >
                  <mood.icon size={32} className={`${selectedMood === mood.score ? 'text-white' : 'text-gray-300 group-hover:text-[#8B1538]'}`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${selectedMood === mood.score ? 'text-white/80' : 'text-gray-400'}`}>{mood.label}</span>
               </button>
             ))}
          </div>

          <div className="w-full max-w-md space-y-6">
             <textarea 
               value={feedbackText}
               onChange={e => setFeedbackText(e.target.value)}
               placeholder="Deseja compartilhar algo confidencial com a gestão?" 
               className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] p-8 text-sm h-32 resize-none outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all text-center font-serif"
             />
             <button 
               onClick={handleSendMood}
               disabled={selectedMood === null}
               className="bg-[#8B1538] text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-[#8B1538]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-50"
             >
                <Send size={18} /> Enviar Feedback
             </button>
          </div>
       </div>

       {renderEncantamentoPanel()}
    </div>
  );

  const renderSetoresTab = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Time Ativo', value: TEAM_MEMBERS.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Score de Clima', value: '4.2', icon: Smile, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Sugestões Ativas', value: suggestions.filter(s=>s.status === 'PENDENTE').length.toString(), icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Média Produção', value: '92%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          ].map((m, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
               <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-xl flex items-center justify-center mb-6`}>
                  <m.icon size={24} />
               </div>
               <span className="block text-4xl font-serif font-bold text-[#2D3748]">{m.value}</span>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 block">{m.label}</span>
            </div>
          ))}
       </div>

       <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
             <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Lightbulb size={16}/> Central de Inovação & Sugestões
             </h3>
          </div>
          <table className="w-full text-left">
             <thead>
                <tr className="bg-gray-50/50">
                   <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase">Autor/Data</th>
                   <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase">Área/Impacto</th>
                   <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase">Conteúdo</th>
                   <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase text-center">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
                {suggestions.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/30 transition-colors">
                     <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-gray-700">{s.autor}</span>
                           <span className="text-[9px] font-black text-gray-300 uppercase">{s.data}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-[#8B1538] uppercase">{s.area}</span>
                           <span className="text-[9px] text-gray-400 italic">Impacto: {s.impactoEsperado}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-xs font-serif text-gray-600 line-clamp-2">"{s.conteudo}"</p>
                     </td>
                     <td className="px-8 py-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border 
                          ${s.status === 'IMPLEMENTADO' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {s.status}
                        </span>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10">
        <div>
           <h1 className="text-4xl font-serif font-bold text-[#8B1538]">Gente & Gestão</h1>
           <p className="text-[#2D3748] mt-2 opacity-70 italic font-serif text-lg">Cultura de feedback, clima organizacional e inovação participativa</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
           <button onClick={() => setActiveMainTab('clima')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMainTab === 'clima' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Clima & Elogios</button>
           {canSeeSectors && <button onClick={() => setActiveMainTab('setores')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMainTab === 'setores' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Monitoramento</button>}
        </div>
      </div>

      {activeMainTab === 'clima' ? renderClimaTab() : renderSetoresTab()}

      {/* MODAL DE ELOGIO */}
      {isPraiseModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                       <Award size={24} />
                    </div>
                    <div>
                       <h2 className="text-xl font-serif font-bold text-[#8B1538]">Elogiar Colega</h2>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reconhecimento e Meritocracia</p>
                    </div>
                 </div>
                 <button onClick={() => setIsPraiseModalOpen(false)} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
              </div>
              <form onSubmit={handleAddPraise} className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Para quem é o elogio? *</label>
                    <select 
                      required value={newPraise.paraQuem} onChange={e => setNewPraise({...newPraise, paraQuem: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5"
                    >
                       <option value="">Selecione um colega...</option>
                       {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Categoria do Reconhecimento</label>
                    <select 
                      value={newPraise.categoria} onChange={e => setNewPraise({...newPraise, categoria: e.target.value as PraiseCategory})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none"
                    >
                       {PRAISE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">O que aconteceu? (Motivo) *</label>
                    <textarea 
                      required value={newPraise.motivo} onChange={e => setNewPraise({...newPraise, motivo: e.target.value})}
                      placeholder="Descreva a atitude positiva que merece destaque..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-sm h-32 resize-none outline-none focus:ring-4 focus:ring-[#8B1538]/5 font-serif italic"
                    />
                 </div>
                 <button type="submit" className="w-full py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all">
                    <Star size={18} fill="currentColor"/> Publicar no Mural
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL DE SUGESTÃO */}
      {isSuggestionModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                       <Lightbulb size={24} />
                    </div>
                    <div>
                       <h2 className="text-xl font-serif font-bold text-[#8B1538]">Sugerir Melhoria</h2>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inovação e Eficiência Interna</p>
                    </div>
                 </div>
                 <button onClick={() => setIsSuggestionModalOpen(false)} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
              </div>
              <form onSubmit={handleAddSuggestion} className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Área Sugerida</label>
                    <select 
                      value={newSuggestion.area} onChange={e => setNewSuggestion({...newSuggestion, area: e.target.value as SuggestionArea})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none"
                    >
                       {SUGGESTION_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Sua Ideia / Sugestão *</label>
                    <textarea 
                      required value={newSuggestion.conteudo} onChange={e => setNewSuggestion({...newSuggestion, conteudo: e.target.value})}
                      placeholder="Explique sua ideia detalhadamente..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-sm h-32 resize-none outline-none focus:ring-4 focus:ring-[#8B1538]/5 font-serif"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Impacto Esperado *</label>
                    <input 
                      required type="text" value={newSuggestion.impacto} onChange={e => setNewSuggestion({...newSuggestion, impacto: e.target.value})}
                      placeholder="Ex: Redução de 2h/semana no processo X"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none"
                    />
                 </div>
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                    <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" size={16}/>
                    <p className="text-[10px] font-serif font-medium text-blue-800 italic leading-relaxed">
                       Sua sugestão é enviada de forma privada para a gestão jurídica para avaliação técnica de implementação.
                    </p>
                 </div>
                 <button type="submit" className="w-full py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all">
                    <Send size={18} /> Enviar para Gestão
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PeopleView;
