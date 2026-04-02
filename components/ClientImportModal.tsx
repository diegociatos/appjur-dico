
import React, { useState } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle2, FileText, ChevronRight, Info, Building2 } from 'lucide-react';
import { Client, UserProfile, ClientStatus, ClientType } from '../types';

interface ClientImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (clients: Client[]) => void;
  users: UserProfile[];
  currentUser: UserProfile;
}

const ClientImportModal: React.FC<ClientImportModalProps> = ({ isOpen, onClose, onImport, users, currentUser }) => {
  const [csvText, setCsvText] = useState('');
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [results, setResults] = useState<{
    validos: Client[];
    erros: { linha: number; desc: string }[];
  } | null>(null);

  if (!isOpen) return null;

  const downloadModel = () => {
    const csvContent = "Tipo(PF/PJ),Razao Social,Documento,Segmento,Email,Telefone,ResponsavelID,Rua,Num,Bairro,Cidade,Estado,CEP,Status(Ativo/Inativo)\nPJ,Exemplo Ltda,12.345.678/0001-90,Servicos,contato@exemplo.com,(11) 4004-0001,user_renan,Av Paulista,100,Bela Vista,Sao Paulo,SP,01310-100,Ativo";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Modelo_Importacao_Clientes_Ciatos.csv";
    a.click();
  };

  const processCSV = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return;

    const validos: Client[] = [];
    const erros: { linha: number; desc: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 14) {
        erros.push({ linha: i + 1, desc: 'Colunas insuficientes' });
        continue;
      }

      const [tipo, nome, doc, seg, email, tel, resp, rua, num, bairro, cid, uf, cep, status] = parts;

      if (!nome || !doc || !email) {
        erros.push({ linha: i + 1, desc: 'Campos obrigatórios vazios' });
        continue;
      }

      validos.push({
        id: `cli_imp_${Date.now()}_${i}`,
        tipo: tipo as ClientType,
        nome,
        documento: doc,
        segmento: seg,
        email,
        telefone: tel,
        responsavelId: resp || currentUser.id,
        endereco: { rua, numero: num, bairro, cidade: cid, estado: uf, cep },
        status: status as ClientStatus || 'Ativo',
        contatos: [],
        dataInicio: new Date().toISOString().split('T')[0],
        criadoEm: new Date().toISOString(),
        criadoPor: currentUser.nome
      });
    }

    setResults({ validos, erros });
    setStep('preview');
  };

  const handleConfirm = () => {
    if (results) {
      onImport(results.validos);
      onClose();
      setStep('input');
      setCsvText('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><Upload size={24}/></div>
            <h2 className="text-xl font-serif font-bold text-[#8B1538]">Importação em Lote</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          {step === 'input' ? (
            <>
              <div className="bg-blue-50 p-6 rounded-[1.5rem] border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info size={20} className="text-blue-500"/>
                  <p className="text-xs font-serif text-blue-800 leading-relaxed italic">
                    Utilize o modelo padrão para garantir a integridade dos dados dos clientes.
                  </p>
                </div>
                <button onClick={downloadModel} className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-blue-50 transition-all">
                  <Download size={14}/> Baixar Modelo
                </button>
              </div>
              <textarea 
                value={csvText} onChange={e => setCsvText(e.target.value)}
                placeholder="Cole aqui o conteúdo do CSV (incluindo cabeçalhos)..."
                className="w-full h-64 bg-gray-50 border border-gray-100 rounded-[2rem] p-8 text-xs font-mono outline-none focus:ring-4 focus:ring-[#8B1538]/5"
              />
              <button onClick={processCSV} disabled={!csvText.trim()} className="w-full py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl disabled:opacity-50">Analisar Dados</button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
                  <span className="text-[9px] font-black text-green-400 uppercase tracking-widest block mb-1">Registros Válidos</span>
                  <span className="text-2xl font-serif font-bold text-green-700">{results?.validos.length}</span>
                </div>
                <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-1">Erros Detectados</span>
                  <span className="text-2xl font-serif font-bold text-red-700">{results?.erros.length}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prévia da Importação</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {results?.validos.slice(0, 5).map((c, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-100">
                       <Building2 size={16} className="text-gray-400"/>
                       <span className="text-xs font-bold text-gray-700">{c.nome}</span>
                       <span className="text-[9px] font-mono text-gray-300 ml-auto">{c.documento}</span>
                    </div>
                  ))}
                </div>
              </div>

              {results?.erros.length! > 0 && (
                 <div className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-2">
                    <p className="text-[9px] font-black text-red-600 uppercase">Detalhes dos Erros:</p>
                    {results?.erros.map((err, i) => (
                      <p key={i} className="text-[10px] text-red-400 italic">Linha {err.linha}: {err.desc}</p>
                    ))}
                 </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
           {step === 'preview' && (
             <button onClick={() => setStep('input')} className="flex-1 py-4 border border-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:bg-white transition-all">Voltar</button>
           )}
           <button 
            disabled={step === 'preview' && results?.validos.length === 0}
            onClick={step === 'input' ? processCSV : handleConfirm} 
            className="flex-1 py-4 bg-[#8B1538] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#8B1538]/20"
           >
             {step === 'input' ? 'Processar' : 'Confirmar Importação'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default ClientImportModal;
