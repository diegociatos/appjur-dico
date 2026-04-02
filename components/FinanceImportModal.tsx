
import React, { useState } from 'react';
import { X, Upload, Download, FileText, CheckCircle2, AlertCircle, Info, Database, ChevronRight, Save } from 'lucide-react';
import { FinanceTransaction, FinanceBank, FinanceSubcategory, UserProfile, FinanceTransactionType } from '../types';
import { downloadFile } from '../utils/exportUtils';

interface FinanceImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactions: FinanceTransaction[]) => void;
  banks: FinanceBank[];
  subcategories: FinanceSubcategory[];
  currentUser: UserProfile;
}

const FinanceImportModal: React.FC<FinanceImportModalProps> = ({ isOpen, onClose, onConfirm, banks, subcategories, currentUser }) => {
  const [csvText, setCsvText] = useState('');
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [results, setResults] = useState<{
    validos: FinanceTransaction[];
    erros: { linha: number; desc: string }[];
  } | null>(null);

  if (!isOpen) return null;

  const downloadModel = () => {
    const csvContent = "Data;Descricao;Valor;Tipo(RECEITA/DESPESA);Pago(SIM/NAO);Banco;Subcategoria\n2026-02-25;Honorários Mensais Exemplo;5500.00;RECEITA;SIM;Itaú Unibanco;Honorários Mensais\n2026-02-26;Aluguel Escritório;2500.00;DESPESA;NAO;Banco Inter;Aluguel / Condomínio";
    downloadFile(csvContent, "Modelo_Importacao_Financeira_Ciatos.csv", "text/csv;charset=utf-8;");
  };

  const processCSV = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return alert("Planilha vazia ou inválida.");

    const validos: FinanceTransaction[] = [];
    const erros: { linha: number; desc: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(';').map(p => p.trim());
      if (parts.length < 7) {
        erros.push({ linha: i + 1, desc: 'Colunas insuficientes (esperado 7)' });
        continue;
      }

      const [data, desc, valorStr, tipo, pagoStr, bancoNome, subNome] = parts;
      const valor = parseFloat(valorStr.replace(',', '.'));
      
      const bank = banks.find(b => b.nome.toLowerCase() === bancoNome.toLowerCase());
      const sub = subcategories.find(s => s.nome.toLowerCase() === subNome.toLowerCase());

      if (!data || !desc || isNaN(valor) || !bank || !sub) {
        erros.push({ 
          linha: i + 1, 
          desc: !bank ? `Banco '${bancoNome}' não localizado` : !sub ? `Subcategoria '${subNome}' não localizada` : 'Dados obrigatórios ausentes ou inválidos' 
        });
        continue;
      }

      validos.push({
        id: `tx_imp_${Date.now()}_${i}`,
        data,
        descricao: desc,
        valor,
        tipo: tipo.toUpperCase() as FinanceTransactionType,
        pago: pagoStr.toUpperCase() === 'SIM',
        bancoId: bank.id,
        subcategoriaId: sub.id,
        categoriaId: sub.categoryId,
        competencia: data.substring(0, 7),
        criadoPor: currentUser.nome,
        createdAt: new Date().toISOString()
      });
    }

    setResults({ validos, erros });
    setStep('preview');
  };

  const handleConfirm = () => {
    if (results) {
      onConfirm(results.validos);
      onClose();
      setStep('input');
      setCsvText('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1600] flex items-center justify-center p-4 font-serif-elegant">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><Upload size={24}/></div>
            <div>
               <h2 className="text-xl font-bold text-[#8B1538]">Importação de Extrato</h2>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Integração Massiva de Lançamentos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          {step === 'input' ? (
            <>
              <div className="bg-[#8B1538]/5 p-6 rounded-[2rem] border border-[#8B1538]/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Info size={24} className="text-[#8B1538]"/>
                  <p className="text-xs font-serif text-gray-600 italic leading-relaxed">
                    Mantenha os nomes de <strong>Bancos</strong> e <strong>Subcategorias</strong> exatamente iguais aos cadastrados no Plano de Contas.
                  </p>
                </div>
                <button onClick={downloadModel} className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#8B1538] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all border border-gray-100">
                  <Download size={16}/> Baixar Modelo CSV
                </button>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Conteúdo do CSV (Separador: Ponto-e-Vírgula)</label>
                 <textarea 
                    value={csvText} onChange={e => setCsvText(e.target.value)}
                    placeholder="Data;Descricao;Valor;Tipo;Pago;Banco;Subcategoria..."
                    className="w-full h-64 bg-gray-50 border border-gray-100 rounded-[2.5rem] p-8 text-xs font-mono outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all"
                 />
              </div>
            </>
          ) : (
            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                    <span className="text-[9px] font-black text-green-400 uppercase tracking-widest block mb-1">Prontos para Importar</span>
                    <span className="text-3xl font-bold text-green-700">{results?.validos.length}</span>
                  </div>
                  <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-1">Linhas com Inconsistência</span>
                    <span className="text-3xl font-bold text-red-700">{results?.erros.length}</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prévia da Auditoria</h4>
                  <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-inner max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                       <thead className="bg-gray-50 sticky top-0">
                          <tr>
                             <th className="px-6 py-3 font-black text-gray-400 uppercase">Descrição</th>
                             <th className="px-6 py-3 font-black text-gray-400 uppercase">Subcategoria</th>
                             <th className="px-6 py-3 font-black text-gray-400 uppercase text-right">Valor</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {results?.validos.map((tx, i) => (
                            <tr key={i}>
                               <td className="px-6 py-3 font-bold text-gray-700">{tx.descricao}</td>
                               <td className="px-6 py-3 text-gray-400">{subcategories.find(s=>s.id === tx.subcategoriaId)?.nome}</td>
                               <td className={`px-6 py-3 text-right font-black ${tx.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {tx.tipo === 'RECEITA' ? '+' : '-'}{tx.valor.toFixed(2)}
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
               </div>

               {results?.erros.length! > 0 && (
                 <div className="p-5 bg-red-50 rounded-2xl border border-red-100 space-y-2">
                    <h5 className="text-[9px] font-black text-red-600 uppercase mb-2">Relatório de Erros:</h5>
                    {results?.erros.map((err, i) => (
                      <p key={i} className="text-[10px] text-red-400 font-medium italic flex items-center gap-2"><AlertCircle size={10}/> Linha {err.linha}: {err.desc}</p>
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="p-10 border-t border-gray-100 bg-gray-50 flex gap-6">
           <button onClick={() => setStep('input')} disabled={step === 'input'} className="flex-1 py-5 border-2 border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-white transition-all disabled:opacity-30">Voltar</button>
           <button 
             onClick={step === 'input' ? processCSV : handleConfirm}
             disabled={step === 'preview' && results?.validos.length === 0}
             className="flex-[2] py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all flex items-center justify-center gap-3 active:scale-95"
           >
              {step === 'input' ? <><ChevronRight size={18}/> Analisar Planilha</> : <><Save size={18}/> Confirmar Importação ({results?.validos.length})</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceImportModal;
