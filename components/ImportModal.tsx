
import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { Appointment, AppointmentStatus, AppointmentType } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (appointments: Appointment[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [csvText, setCsvText] = useState('');
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [results, setResults] = useState<{
    mapeamento_colunas: Record<string, string>;
    registros_validos: Appointment[];
    registros_com_erro: { linha: number; erros: string[]; raw: any }[];
    resumo: { total: number; validos: number; erros: number };
  } | null>(null);

  if (!isOpen) return null;

  const processData = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return;

    // 1) Detectar separador
    const firstLine = lines[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semiCount = (firstLine.match(/;/g) || []).length;
    const separator = semiCount > commaCount ? ';' : ',';

    const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());
    
    // Mapeamento esperado: status, tipo, descricao, processo, advogado, data
    const colMap: Record<string, number> = {};
    headers.forEach((h, i) => {
      if (h.includes('status')) colMap['status'] = i;
      if (h.includes('tipo')) colMap['tipo'] = i;
      if (h.includes('descri')) colMap['descricao'] = i;
      if (h.includes('processo')) colMap['processo'] = i;
      if (h.includes('advogado') || h.includes('responsavel')) colMap['advogado'] = i;
      if (h.includes('data') && !h.includes('concl')) colMap['data'] = i;
      if (h.includes('prazo')) colMap['prazo'] = i;
      if (h.includes('urgente')) colMap['urgente'] = i;
    });

    const validRecords: Appointment[] = [];
    const errorRecords: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(separator).map(v => v.trim());
      const raw: any = {};
      headers.forEach((h, idx) => { raw[h] = currentLine[idx]; });

      const erros: string[] = [];
      
      // Validações básicas
      if (!currentLine[colMap['descricao']]) erros.push('Descrição ausente');
      if (!currentLine[colMap['advogado']]) erros.push('Advogado ausente');
      if (!currentLine[colMap['data']]) erros.push('Data ausente');

      if (erros.length > 0) {
        errorRecords.push({ linha: i + 1, erros, raw });
        continue;
      }

      // Normalização de Tipo
      const rawType = currentLine[colMap['tipo']]?.toLowerCase() || '';
      let normalizedType: AppointmentType = 'Outros';
      if (rawType.includes('peça') || rawType.includes('elabora')) normalizedType = 'Elaboração de Peça';
      else if (rawType.includes('prazo') || rawType.includes('processu')) normalizedType = 'Prazo Processual';
      else if (rawType.includes('audi')) normalizedType = 'Audiência';
      else if (rawType.includes('anali')) normalizedType = 'Análise';

      // Normalização de Status
      const rawStatus = currentLine[colMap['status']]?.toUpperCase() || '';
      let normalizedStatus: AppointmentStatus = 'PENDENTE';
      if (rawStatus.includes('CONCL') || rawStatus.includes('FEITO')) normalizedStatus = 'CONCLUÍDO';
      else if (rawStatus.includes('REAG') normalizedStatus = 'REAGENDADO';
      else if (rawStatus.includes('URG')) normalizedStatus = 'URGENTE';

      // Normalização de Data (Esperado DD/MM/AAAA ou YYYY-MM-DD)
      let rawDate = currentLine[colMap['data']];
      let isoDate = rawDate;
      if (rawDate.includes('/')) {
        const [d, m, y] = rawDate.split('/');
        isoDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }

      // ID Determinístico (hash simples do conteúdo)
      const deterministicId = `imp_${currentLine[colMap['processo']] || 'no-proc'}_${isoDate}_${i}`;

      validRecords.push({
        id: deterministicId,
        status: normalizedStatus,
        tipo: normalizedType,
        descricao: currentLine[colMap['descricao']],
        processo: currentLine[colMap['processo']] || '0000000-00.0000.0.00.0000',
        advogado: currentLine[colMap['advogado']],
        data: isoDate,
        urgente: normalizedStatus === 'URGENTE' || currentLine[colMap['urgente']]?.toLowerCase() === 'sim'
      });
    }

    setResults({
      mapeamento_colunas: Object.fromEntries(Object.entries(colMap).map(([k, v]) => [k, headers[v]])),
      registros_validos: validRecords,
      registros_com_erro: errorRecords,
      resumo: { total: lines.length - 1, validos: validRecords.length, erros: errorRecords.length }
    });
    setStep('preview');
  };

  const handleFinalImport = () => {
    if (results) {
      onImport(results.registros_validos);
      onClose();
      setStep('input');
      setCsvText('');
      setResults(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#8B1538] rounded-full"></div>
            <h2 className="text-xl font-bold text-[#8B1538]">Importar Planilha (CSV)</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#8B1538] transition-colors p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {step === 'input' ? (
            <div className="space-y-6">
              <div className="bg-[#8B1538]/5 border border-[#8B1538]/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-[#8B1538] mb-2 flex items-center gap-2">
                  <AlertCircle size={16} /> Como importar?
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Copie os dados da sua planilha (incluindo cabeçalhos) e cole no campo abaixo. O motor do Ciatos detectará automaticamente o separador e normalizará os campos de <span className="font-bold">Status</span> e <span className="font-bold">Tipo</span>.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Cole o conteúdo CSV aqui</label>
                <textarea 
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Status, Tipo, Descricao, Processo, Advogado, Data&#10;PENDENTE, Prazo, Recurso, 0011440-64.2019.5.15.0137, Bruna, 01/02/2026..."
                  className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-6 py-5 text-sm font-mono focus:ring-4 focus:ring-[#8B1538]/5 focus:border-[#8B1538]/30 outline-none transition-all h-64 resize-none shadow-inner"
                />
              </div>

              <button 
                onClick={processData}
                disabled={!csvText.trim()}
                className="w-full py-5 bg-[#8B1538] rounded-2xl font-black text-white uppercase tracking-widest text-xs shadow-xl shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <FileText size={18} />
                Processar Dados
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                  <span className="block text-2xl font-black text-gray-800">{results?.resumo.total}</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total</span>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                  <span className="block text-2xl font-black text-green-600">{results?.resumo.validos}</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Válidos</span>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                  <span className="block text-2xl font-black text-red-600">{results?.resumo.erros}</span>
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Erros</span>
                </div>
              </div>

              {/* Column Mapping Preview */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Mapeamento Detectado</h4>
                <div className="flex flex-wrap gap-2">
                  {results && Object.entries(results.mapeamento_colunas).map(([key, value]) => (
                    <div key={key} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                      <span className="text-[10px] font-bold text-[#8B1538] capitalize">{key}:</span>
                      <span className="text-[10px] font-black text-gray-700 uppercase">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Valid Items Scroll Area */}
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Prévia dos Registros Válidos</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                  {results?.registros_validos.map((reg, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <div>
                          <p className="text-xs font-bold text-gray-800">{reg.descricao}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{reg.processo} | {reg.advogado}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-gray-400">{reg.data}</span>
                    </div>
                  ))}
                  {results?.registros_validos.length === 0 && (
                    <p className="text-center py-4 text-xs text-gray-400 italic">Nenhum registro válido para importar.</p>
                  )}
                </div>
              </div>

              {/* Error Items Scroll Area */}
              {results?.registros_com_erro.length! > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3">Erros de Validação</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                    {results?.registros_com_erro.map((err, idx) => (
                      <div key={idx} className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={16} className="text-red-500 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-bold text-red-600">Linha {err.linha}: {err.erros.join(', ')}</p>
                            <p className="text-[9px] text-red-400 mt-1 font-mono truncate max-w-sm italic">Raw: {JSON.stringify(err.raw)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
          {step === 'preview' && (
            <button 
              onClick={() => setStep('input')}
              className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-2 border-gray-200 rounded-2xl hover:bg-white hover:text-gray-600 transition-all active:scale-95"
            >
              Voltar e Corrigir
            </button>
          )}
          <button 
            onClick={step === 'input' ? processData : handleFinalImport}
            disabled={step === 'preview' && results?.registros_validos.length === 0}
            className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-[#8B1538] rounded-2xl shadow-xl shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {step === 'input' ? 'Processar Dados' : `Confirmar Importação (${results?.resumo.validos})`}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
