import React, { useState } from 'react';
import { X, Copy, Check, FileDown, Loader2 } from 'lucide-react';
import { Player } from '../types';
import { exportTeamListToPdf } from '../utils/exportPdf';
import { useTheme } from '../context/ThemeContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: (Player | null)[][];
  teamName: string;
  targetObjective: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  teams,
  teamName,
  targetObjective,
}) => {
  const { isParchment } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isOpen) return null;

  // Generate plain text report
  let textReport = `⚔️ **CAMPO PRIMARIO - ESCALAÇÃO: ${teamName}** ⚔️\n`;
  textReport += `🎯 Alvo: ${targetObjective}\n`;
  const totalAssigned = teams.flat().filter(Boolean).length;
  textReport += `👥 Total Escalados: ${totalAssigned} / 40\n\n`;

  teams.forEach((slots, tIdx) => {
    const filled = slots.filter(Boolean) as Player[];
    textReport += `🔹 **TIME ${tIdx + 1}** (${filled.length}/5):\n`;
    if (filled.length === 0) {
      textReport += `   *(Vazio)*\n`;
    } else {
      filled.forEach((p, sIdx) => {
        const leaderTag = p.isLeader ? '👑 [Líder] ' : '';
        textReport += `   ${sIdx + 1}. ${leaderTag}${p.name} - ${p.jobClass} (Nv.${p.level}) [${p.status}]\n`;
      });
    }
    textReport += `\n`;
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportTeamListToPdf({
        elementId: 'main-team-window',
        teams,
        teamLeaderName: teamName,
        targetObjective,
      });
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border ${
          isParchment
            ? 'parchment-card border-[#c09761] text-[#3d2008]'
            : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isParchment
              ? 'bg-[#ecd8b5] border-[#c09761]'
              : 'bg-gradient-to-r from-blue-900/70 to-slate-800 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileDown className={isParchment ? 'text-[#8c4b14]' : 'text-blue-400'} size={20} />
            <h3 className={`text-base font-bold ${isParchment ? 'text-[#3b1f06] font-serif' : 'text-white'}`}>
              Exportar Lista da Tela
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isParchment
                ? 'text-[#7d532b] hover:text-[#3d2008] hover:bg-[#dfc49c]'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              isParchment
                ? 'bg-[#f7ebda] border-[#cbb085]'
                : 'bg-blue-950/60 border-blue-800/80'
            }`}
          >
            <div>
              <h4 className={`text-xs font-bold ${isParchment ? 'text-[#4d2807]' : 'text-white'}`}>
                Exportação Oficial em PDF
              </h4>
              <p className={`text-[11px] ${isParchment ? 'text-[#7a4819]' : 'text-blue-200'}`}>
                Gera o arquivo PDF de alta definição com a lista dos 8 times e contador de classes.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className={`shrink-0 px-4 py-2 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-75 ${
                isParchment
                  ? 'bg-gradient-to-r from-[#7a4417] to-[#9c5b23] hover:brightness-110 border border-[#c5994f]'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
              }`}
            >
              {isExportingPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin text-white" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileDown size={14} />
                  Baixar PDF
                </>
              )}
            </button>
          </div>

          <p className={`text-xs pt-1 ${isParchment ? 'text-[#5a3311]' : 'text-slate-300'}`}>
            Ou copie o texto formatado para o Discord / WhatsApp:
          </p>

          <textarea
            readOnly
            value={textReport}
            rows={8}
            className={`w-full text-xs font-mono rounded-xl p-3 select-all focus:outline-hidden ${
              isParchment
                ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] focus:border-[#7a4417]'
                : 'bg-slate-950 border border-slate-800 text-slate-200 focus:border-blue-500'
            }`}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                isParchment
                  ? 'text-[#69421c] hover:bg-[#eedbc0]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                isParchment
                  ? 'bg-[#eedbc0] hover:bg-[#e4cbab] text-[#542d0a] border border-[#cbb085]'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} className={isParchment ? 'text-emerald-700' : 'text-emerald-300'} />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copiar Texto
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
