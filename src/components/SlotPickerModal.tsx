import React, { useState } from 'react';
import { X, Search, UserPlus, ArrowDownToLine, Sparkles } from 'lucide-react';
import { Player } from '../types';
import { JOB_CLASSES } from '../constants/classes';
import { ClassIcon } from './ClassIcon';
import { useTheme } from '../context/ThemeContext';

interface SlotPickerModalProps {
  isOpen: boolean;
  teamIndex: number;
  slotIndex: number;
  fieldTitle?: string;
  roster: Player[];
  onClose: () => void;
  onSelectFromRoster: (player: Player) => void;
  onCreateAndAssign: (name: string, jobClass: string) => void;
}

export const SlotPickerModal: React.FC<SlotPickerModalProps> = ({
  isOpen,
  teamIndex,
  slotIndex,
  fieldTitle,
  roster,
  onClose,
  onSelectFromRoster,
  onCreateAndAssign,
}) => {
  const { isParchment } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickClass, setQuickClass] = useState('Atirador de Elite');

  if (!isOpen) return null;

  const filteredRoster = roster.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jobClass.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    onCreateAndAssign(quickName.trim(), quickClass);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-md max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto border ${
          isParchment
            ? 'parchment-card border-[#c09761] text-[#3d2008]'
            : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 sm:px-5 py-3 sm:py-3.5 border-b flex items-center justify-between shrink-0 ${
            isParchment
              ? 'bg-[#ecd8b5] border-[#c09761]'
              : 'bg-gradient-to-r from-blue-900/60 to-slate-800 border-slate-700'
          }`}
        >
          <div className="min-w-0 pr-2">
            <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 flex-wrap">
              <span>Alocar {fieldTitle ? `[${fieldTitle}]` : ''}:</span>
              <span className={isParchment ? 'text-[#8c460d]' : 'text-blue-400'}>Time {teamIndex + 1}</span> (Vaga {slotIndex + 1})
            </h3>
            <p className={`text-[10px] sm:text-[11px] truncate ${isParchment ? 'text-[#7d532b]' : 'text-slate-400'}`}>
              Escolha do banco ou digite um novo nick
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isParchment
                ? 'hover:bg-[#dfc49c] text-[#7d532b] hover:text-[#3d2008]'
                : 'hover:bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick create direct */}
        <form
          onSubmit={handleQuickCreate}
          className={`p-2.5 sm:p-3 border-b flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 ${
            isParchment
              ? 'bg-[#f7ebda] border-[#cbb085]'
              : 'bg-slate-800/60 border-slate-700/80'
          }`}
        >
          <input
            type="text"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            placeholder="Nome do novo jogador..."
            className={`flex-1 text-xs rounded-lg px-2.5 py-2 focus:outline-hidden ${
              isParchment
                ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] placeholder-[#a68662] focus:border-[#7a4417]'
                : 'bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
            }`}
          />
          <div className="flex items-center gap-2">
            <select
              value={quickClass}
              onChange={(e) => setQuickClass(e.target.value)}
              className={`flex-1 sm:flex-initial text-xs rounded-lg px-2 py-2 focus:outline-hidden ${
                isParchment
                  ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] focus:border-[#7a4417]'
                  : 'bg-slate-900 border border-slate-700 text-slate-200 focus:border-blue-500'
              }`}
            >
              {JOB_CLASSES.map((jc) => (
                <option key={jc.id} value={jc.name}>
                  {jc.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!quickName.trim()}
              className={`px-3.5 py-2 text-white rounded-lg text-xs font-bold shrink-0 shadow-sm cursor-pointer disabled:opacity-40 active:scale-95 transition-all ${
                isParchment
                  ? 'bg-gradient-to-r from-[#7a4417] to-[#9c5b23] hover:brightness-110 border border-[#c5994f]'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              Inserir
            </button>
          </div>
        </form>

        {/* Roster selection */}
        <div className="p-3 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="relative mb-2 shrink-0">
            <Search size={13} className={`absolute left-2.5 top-2.5 ${isParchment ? 'text-[#8b5a2b]' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar jogadores disponíveis no banco..."
              className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg placeholder-slate-500 focus:outline-hidden ${
                isParchment
                  ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] placeholder-[#a68662] focus:border-[#7a4417]'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-blue-500'
              }`}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin min-h-[140px] max-h-[300px]">
            {filteredRoster.length === 0 ? (
              <p className={`py-6 text-center text-xs ${isParchment ? 'text-[#7d532b]' : 'text-slate-400'}`}>
                Nenhum jogador no banco. Digite um nome acima!
              </p>
            ) : (
              filteredRoster.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectFromRoster(p);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-colors ${
                    isParchment
                      ? 'bg-[#f7ebda] hover:bg-[#fff7ea] border-[#cbb085] hover:border-[#8b5a2b]'
                      : 'bg-slate-800/80 hover:bg-blue-950/60 border-slate-700/60 hover:border-blue-500/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        isParchment ? 'bg-[#ebd4b3] text-[#7a4417]' : 'bg-slate-700 text-blue-300'
                      }`}
                    >
                      <ClassIcon name={p.jobClass} size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-xs font-bold truncate ${isParchment ? 'text-[#3b1f06]' : 'text-slate-100'}`}>
                        {p.name}
                      </span>
                      <div className={`flex items-center gap-1.5 flex-wrap text-[10px] ${isParchment ? 'text-[#7d532b]' : 'text-slate-400'}`}>
                        <span>Nv.{p.level} · {p.jobClass.split('/')[0].trim()}</span>
                        {(p.featherLevel !== undefined || p.power !== undefined || p.glory !== undefined || p.powerAndGlory !== undefined || p.mountLevel !== undefined) && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {p.featherLevel !== undefined && (
                              <span
                                title={`Nível de Penas: ${p.featherLevel}`}
                                className={`font-bold px-1 py-0.2 rounded border text-[9px] ${
                                  isParchment
                                    ? 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]'
                                    : 'text-sky-300 bg-sky-950 border-sky-800'
                                }`}
                              >
                                🪶{p.featherLevel}
                              </span>
                            )}
                            {(p.power !== undefined || p.powerAndGlory !== undefined) && (
                              <span
                                title={`Poder: ${p.power || p.powerAndGlory}`}
                                className={`font-bold px-1 py-0.2 rounded border text-[9px] ${
                                  isParchment
                                    ? 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                                    : 'text-amber-300 bg-amber-950 border-amber-800'
                                }`}
                              >
                                ⚔️{p.power || p.powerAndGlory}
                              </span>
                            )}
                            {p.glory !== undefined && (
                              <span
                                title={`Glória: ${p.glory}`}
                                className={`font-bold px-1 py-0.2 rounded border text-[9px] ${
                                  isParchment
                                    ? 'bg-[#f3e8ff] text-[#7e22ce] border-[#e9d5ff]'
                                    : 'text-purple-300 bg-purple-950 border-purple-800'
                                }`}
                              >
                                ⚜️{p.glory}
                              </span>
                            )}
                            {p.mountLevel !== undefined && (
                              <span
                                title={`Nível da Montaria: ${p.mountLevel}`}
                                className={`font-bold px-1 py-0.2 rounded border text-[9px] ${
                                  isParchment
                                    ? 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]'
                                    : 'text-emerald-300 bg-emerald-950 border-emerald-800'
                                }`}
                              >
                                🐎{p.mountLevel}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold flex items-center gap-1 ${
                      isParchment ? 'text-[#8b4b12]' : 'text-blue-400'
                    }`}
                  >
                    Selecionar
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
