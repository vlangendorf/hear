import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Users,
  ArrowRight,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Shuffle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Player, DragItemData, PlayerRole, PlayerStatus } from '../types';
import { JOB_CLASSES } from '../constants/classes';
import { ClassIcon } from './ClassIcon';
import { useTheme } from '../context/ThemeContext';

interface PlayerRosterTableProps {
  roster: Player[];
  activeGridCount?: number;
  primaryAssignedCount: number;
  secondaryAssignedCount: number;
  canEdit?: boolean;
  onAddPlayer: (playerData: Omit<Player, 'id'>) => void;
  onBatchAddPlayers: (names: string[], defaultClass: string) => void;
  onRemoveFromRoster: (playerId: string) => void;
  onEditPlayer: (player: Player) => void;
  onQuickAssign: (player: Player) => void;
  onAutoFillGrid: (targetField?: 'primary' | 'secondary' | 'both') => void;
  onResetGridToRoster: (targetField?: 'primary' | 'secondary' | 'both') => void;
  onDropFromGridToRoster: (data: DragItemData) => void;
  onLoadFull40Preset: (targetField?: 'primary' | 'secondary') => void;
  onOpenAutoOptimizer?: () => void;
}

export const PlayerRosterTable: React.FC<PlayerRosterTableProps> = ({
  roster,
  activeGridCount,
  primaryAssignedCount,
  secondaryAssignedCount,
  canEdit = true,
  onAddPlayer,
  onBatchAddPlayers,
  onRemoveFromRoster,
  onEditPlayer,
  onQuickAssign,
  onAutoFillGrid,
  onResetGridToRoster,
  onDropFromGridToRoster,
  onLoadFull40Preset,
  onOpenAutoOptimizer,
}) => {
  const { isParchment } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchClass, setBatchClass] = useState('Algoz / Assassino');

  // Field targeted for fill / clear operations
  const [actionField, setActionField] = useState<'primary' | 'secondary' | 'both'>('primary');

  // Single player form state
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('Atirador de Elite');
  const [newLevel, setNewLevel] = useState<number>(99);
  const [newStatus, setNewStatus] = useState<PlayerStatus>('Online');

  // Drop zone feedback
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const classInfo = JOB_CLASSES.find((c) => c.name === newClass);
    onAddPlayer({
      name: newName.trim(),
      jobClass: newClass,
      level: newLevel || 99,
      status: newStatus,
      role: classInfo?.role || 'DPS',
    });

    setNewName('');
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchText.trim()) return;

    const lines = batchText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (lines.length > 0) {
      onBatchAddPlayers(lines, batchClass);
      setBatchText('');
      setIsBatchOpen(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    if (!canEdit) {
      e.preventDefault();
      return;
    }
    const dragData: DragItemData = {
      type: 'FROM_ROSTER',
      player,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDropZoneActive) setIsDropZoneActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDropZoneActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    setIsDropZoneActive(false);
    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const data: DragItemData = JSON.parse(rawData);
      if (data.type === 'FROM_GRID') {
        onDropFromGridToRoster(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter roster
  const filteredRoster = roster.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jobClass.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'ALL' || p.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full lg:w-[350px] shrink-0 flex flex-col rounded-2xl border transition-all duration-200 shadow-2xl overflow-hidden ${
        isParchment
          ? 'parchment-card text-[#3d2008]'
          : 'bg-slate-900/90 backdrop-blur-md'
      } ${
        isDropZoneActive
          ? isParchment
            ? 'border-[#a86524] ring-4 ring-[#d89750]/30 bg-[#f7ecd9]'
            : 'border-blue-400 ring-4 ring-blue-500/20 bg-slate-800/95'
          : isParchment
          ? 'border-[#c8a470]'
          : 'border-slate-700/80'
      }`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between ${
          isParchment
            ? 'bg-gradient-to-r from-[#d8be92] via-[#e5cfab] to-[#ecd9bd] border-[#c09761]'
            : 'bg-gradient-to-r from-slate-800 via-slate-800 to-indigo-950/80 border-slate-700/80'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isParchment
                ? 'bg-[#eedbc0] border-[#bca076] text-[#7a4816]'
                : 'bg-blue-600/30 border border-blue-500/50 text-blue-400'
            }`}
          >
            <Users size={18} />
          </div>
          <div>
            <h2
              className={`text-sm font-bold flex items-center gap-1.5 ${
                isParchment ? 'text-[#4d2807] font-medieval' : 'text-slate-100'
              }`}
            >
              Banco de Nomes
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                  isParchment
                    ? 'bg-[#7a4417] text-[#fff8ee] border-[#b27938]'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}
              >
                {roster.length}
              </span>
            </h2>
            <div
              className={`flex items-center gap-1.5 text-[10.5px] ${
                isParchment ? 'text-[#7d532b]' : 'text-slate-400'
              }`}
            >
              <span>
                Primário:{' '}
                <strong className={isParchment ? 'text-[#206927] font-bold' : 'text-emerald-400 font-bold'}>
                  {primaryAssignedCount}
                </strong>
                /40
              </span>
              <span className={isParchment ? 'text-[#a27747]' : 'text-slate-600'}>·</span>
              <span>
                Secundário:{' '}
                <strong className={isParchment ? 'text-[#7a4417] font-bold' : 'text-sky-400 font-bold'}>
                  {secondaryAssignedCount}
                </strong>
                /40
              </span>
            </div>
          </div>
        </div>

        {/* Batch Add Toggle - Only for Editors */}
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsBatchOpen(!isBatchOpen)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              isBatchOpen
                ? isParchment
                  ? 'bg-[#7a4417] text-[#fff8ee] border-[#b27938] shadow-sm'
                  : 'bg-blue-600 text-white border-blue-400 shadow-sm'
                : isParchment
                ? 'bg-[#fffcf4] hover:bg-[#f6ebd7] text-[#542d0a] border-[#c29c67]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600 hover:text-white'
            }`}
            title="Importar lista de nomes de uma vez"
          >
            <FileSpreadsheet size={13} />
            Em Lote
          </button>
        )}
      </div>

      {/* Batch Import Panel */}
      {canEdit && isBatchOpen && (
        <form
          onSubmit={handleBatchSubmit}
          className={`p-3 border-b flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
            isParchment
              ? 'bg-[#f4e4cb] border-[#cbb085]'
              : 'bg-slate-800/90 border-slate-700/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold flex items-center gap-1 ${
                isParchment ? 'text-[#7a4417]' : 'text-blue-300'
              }`}
            >
              <FileSpreadsheet size={13} /> Adicionar Vários Nomes
            </span>
            <span className={`text-[10px] ${isParchment ? 'text-[#8b653d]' : 'text-slate-400'}`}>
              1 nome por linha
            </span>
          </div>

          <textarea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder="Cole aqui a lista de nicks (ex:&#10;LordeKiller&#10;DarkMage99&#10;PriestHeal...)"
            rows={4}
            className={`w-full text-xs font-mono rounded-lg p-2 focus:outline-hidden ${
              isParchment
                ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] placeholder-[#a68662] focus:border-[#7a4417]'
                : 'bg-slate-950/80 border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />

          <div className="flex items-center gap-2">
            <select
              value={batchClass}
              onChange={(e) => setBatchClass(e.target.value)}
              className={`text-xs rounded-lg px-2 py-1.5 focus:outline-hidden flex-1 ${
                isParchment
                  ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] focus:border-[#7a4417]'
                  : 'bg-slate-900 border border-slate-700 text-slate-200 focus:border-blue-500'
              }`}
            >
              {JOB_CLASSES.map((jc) => (
                <option key={jc.id} value={jc.name}>
                  {jc.name} ({jc.role})
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!batchText.trim()}
              className={`px-3 py-1.5 disabled:opacity-50 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                isParchment
                  ? 'bg-[#7a4417] hover:bg-[#603510] text-[#fff8ee]'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              Adicionar
            </button>
          </div>
        </form>
      )}

      {/* Quick Add Single Player Form - Only for Editors */}
      {canEdit && (
        <form
          onSubmit={handleCreateSingle}
          className={`p-3 border-b flex flex-col gap-2 ${
            isParchment
              ? 'bg-[#eeddbf]/80 border-[#cbb085]'
              : 'bg-slate-800/40 border-slate-700/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Novo Nick / Nome..."
              maxLength={18}
              className={`flex-1 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden ${
                isParchment
                  ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] placeholder-[#a68662] focus:border-[#7a4417]'
                  : 'bg-slate-950/90 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />

            <input
              type="number"
              min={1}
              max={99}
              value={newLevel}
              onChange={(e) => setNewLevel(Number(e.target.value))}
              title="Nível do jogador"
              className={`w-14 text-xs font-bold text-center rounded-lg py-1.5 focus:outline-hidden ${
                isParchment
                  ? 'bg-[#fffcf4] border border-[#c29c67] text-[#7a4417] focus:border-[#7a4417]'
                  : 'bg-slate-950/90 border border-slate-700 text-amber-300 focus:border-blue-500'
              }`}
            />

            <button
              type="submit"
              disabled={!newName.trim()}
              className={`px-3 py-1.5 disabled:opacity-40 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0 shadow-sm cursor-pointer ${
                isParchment
                  ? 'bg-gradient-to-r from-[#7a4417] to-[#96551e] hover:brightness-110 text-[#fff8ee] border border-[#c5994f]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <UserPlus size={13} />
              Add
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              className={`text-xs rounded-lg px-2 py-1 focus:outline-hidden ${
                isParchment
                  ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] focus:border-[#7a4417]'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 focus:border-blue-500'
              }`}
            >
              {JOB_CLASSES.map((jc) => (
                <option key={jc.id} value={jc.name}>
                  {jc.name}
                </option>
              ))}
            </select>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as PlayerStatus)}
              className={`text-xs rounded-lg px-2 py-1 focus:outline-hidden ${
                isParchment
                  ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] focus:border-[#7a4417]'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 focus:border-blue-500'
              }`}
            >
              <option value="Online">Online</option>
              <option value="Ausente">Ausente</option>
              <option value="Longe">Longe</option>
              <option value="Líder">Líder</option>
            </select>
          </div>
        </form>
      )}

      {/* Search & Role Filters */}
      <div
        className={`px-3 py-2 border-b flex flex-col gap-2 ${
          isParchment
            ? 'bg-[#ecd8b5]/90 border-[#cbb085]'
            : 'bg-slate-950/40 border-slate-800'
        }`}
      >
        <div className="relative">
          <Search
            size={13}
            className={`absolute left-2.5 top-2.5 ${
              isParchment ? 'text-[#8c673d]' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar nome ou classe..."
            className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-hidden ${
              isParchment
                ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] placeholder-[#a68662] focus:border-[#7a4417]'
                : 'bg-slate-900 border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:border-blue-500'
            }`}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className={`absolute right-2 top-2 text-[10px] ${
                isParchment ? 'text-[#8c673d] hover:text-[#3d2008]' : 'text-slate-400 hover:text-white'
              }`}
            >
              ✕
            </button>
          )}
        </div>

        {/* Role Filter Chips */}
        <div className="flex items-center gap-1 text-[11px] overflow-x-auto no-scrollbar pb-0.5">
          {['ALL', 'DPS', 'Tank', 'Healer', 'Suporte'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRoleFilter(role)}
              className={`px-2 py-0.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                selectedRoleFilter === role
                  ? isParchment
                    ? 'bg-[#7a4417] text-[#fff8ee] shadow-xs'
                    : 'bg-blue-600 text-white'
                  : isParchment
                  ? 'bg-[#fffcf4] text-[#69421c] hover:bg-[#f6ebd7] border border-[#d2b88e]'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {role === 'ALL' ? 'Todos' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table / List */}
      <div className="flex-1 overflow-y-auto max-h-[380px] p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
        {filteredRoster.length === 0 ? (
          <div
            className={`py-8 px-4 text-center flex flex-col items-center gap-2 ${
              isParchment ? 'text-[#7d532b]' : 'text-slate-400'
            }`}
          >
            <Users size={28} className={isParchment ? 'text-[#a27747]' : 'text-slate-600'} />
            <p className="text-xs">Nenhum jogador encontrado no banco.</p>
            <p className={`text-[11px] ${isParchment ? 'text-[#8b653d]' : 'text-slate-500'}`}>
              Adicione acima ou arraste jogadores do time para cá.
            </p>
          </div>
        ) : (
          filteredRoster.map((player) => (
            <div
              key={player.id}
              draggable={canEdit}
              onDragStart={(e) => handleDragStart(e, player)}
              className={`group flex items-center justify-between p-2 rounded-xl transition-all shadow-xs border ${
                isParchment
                  ? 'bg-[#fffcf4]/90 hover:bg-[#fffcf4] border-[#cbb085] hover:border-[#a86524] text-[#3d2008]'
                  : 'bg-slate-800/80 hover:bg-slate-750 border-slate-750 hover:border-blue-500/50'
              } ${
                canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              }`}
              title={canEdit ? "Arraste para qualquer quadrado na equipe ou clique na seta para preencher o primeiro slot livre" : `${player.name} (${player.jobClass})`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    isParchment
                      ? 'bg-[#eedbc0] border-[#c09e72] text-[#7a4816] group-hover:text-[#4d2807]'
                      : 'bg-slate-700/80 border-slate-600 text-slate-200 group-hover:text-blue-400'
                  }`}
                >
                  <ClassIcon name={player.jobClass} size={15} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold truncate ${
                        isParchment ? 'text-[#4d2807]' : 'text-slate-100'
                      }`}
                    >
                      {player.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold shrink-0 ${
                        isParchment ? 'text-[#b45309]' : 'text-amber-400'
                      }`}
                    >
                      Nv.{player.level}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 flex-wrap text-[9.5px] ${
                      isParchment ? 'text-[#7d532b]' : 'text-slate-400'
                    }`}
                  >
                    <span className="truncate max-w-[90px]">{player.jobClass.split('/')[0].trim()}</span>
                    <span className={isParchment ? 'text-[#96551e] font-medium' : 'text-blue-300 font-medium'}>
                      · {player.role}
                    </span>
                    {(player.featherLevel !== undefined || player.power !== undefined || player.glory !== undefined || player.powerAndGlory !== undefined || player.mountLevel !== undefined) && (
                      <div className="flex items-center gap-1 ml-0.5 flex-wrap">
                        {player.featherLevel !== undefined && (
                          <span
                            title={`Nível de Penas: ${player.featherLevel}`}
                            className={`font-bold px-1 py-0.2 rounded border text-[8.5px] ${
                              isParchment
                                ? 'text-[#0e5c70] bg-[#e0f2f7] border-[#89c5d4]'
                                : 'text-sky-300 bg-sky-950/70 border-sky-700/60'
                            }`}
                          >
                            🪶{player.featherLevel}
                          </span>
                        )}
                        {(player.power !== undefined || player.powerAndGlory !== undefined) && (
                          <span
                            title={`Poder: ${player.power || player.powerAndGlory}`}
                            className={`font-bold px-1 py-0.2 rounded border text-[8.5px] ${
                              isParchment
                                ? 'text-[#92400e] bg-[#fef3c7] border-[#fcd34d]'
                                : 'text-amber-300 bg-amber-950/70 border-amber-700/60'
                            }`}
                          >
                            ⚔️{player.power || player.powerAndGlory}
                          </span>
                        )}
                        {player.glory !== undefined && (
                          <span
                            title={`Glória: ${player.glory}`}
                            className={`font-bold px-1 py-0.2 rounded border text-[8.5px] ${
                              isParchment
                                ? 'text-[#6b21a8] bg-[#f3e8ff] border-[#d8b4fe]'
                                : 'text-purple-300 bg-purple-950/70 border-purple-700/60'
                            }`}
                          >
                            ⚜️{player.glory}
                          </span>
                        )}
                        {player.mountLevel !== undefined && (
                          <span
                            title={`Nível da Montaria: ${player.mountLevel}`}
                            className={`font-bold px-1 py-0.2 rounded border text-[8.5px] ${
                              isParchment
                                ? 'text-[#166534] bg-[#dcfce7] border-[#86efac]'
                                : 'text-emerald-300 bg-emerald-950/70 border-emerald-700/60'
                            }`}
                          >
                            🐎{player.mountLevel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Only for Editors */}
              {canEdit && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onQuickAssign(player)}
                    title="Mover para o primeiro slot livre da equipe"
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isParchment
                        ? 'bg-[#7a4417]/20 hover:bg-[#7a4417] text-[#7a4417] hover:text-[#fff8ee] border-[#b27938]/40'
                        : 'bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30'
                    }`}
                  >
                    <ArrowRight size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditPlayer(player)}
                    title="Editar dados"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isParchment
                        ? 'hover:bg-[#eedbc0] text-[#7d532b] hover:text-[#3d2008]'
                        : 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFromRoster(player.id)}
                    title="Excluir do banco"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isParchment
                        ? 'hover:bg-rose-100 text-[#7d532b] hover:text-rose-700'
                        : 'hover:bg-rose-900/50 text-slate-400 hover:text-rose-300'
                    }`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Tool Actions */}
      {canEdit ? (
        <div
          className={`p-3 border-t flex flex-col gap-2.5 ${
            isParchment
              ? 'bg-[#ecd8b5] border-[#c09761]'
              : 'bg-slate-950/90 border-slate-800'
          }`}
        >
          {onOpenAutoOptimizer && (
            <button
              type="button"
              onClick={onOpenAutoOptimizer}
              className={`w-full py-2 px-3 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer border ${
                isParchment
                  ? 'bg-gradient-to-r from-[#8b4f19] via-[#a86524] to-[#8b4f19] hover:brightness-110 border-[#c5994f] shadow-md'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 border-amber-300/40 shadow-lg shadow-orange-950/40'
              }`}
              title="Analisar Poder, Glória, Penas, Montaria e Classes combinadas para gerar times balanceados"
            >
              <Sparkles size={14} className="text-amber-200 animate-pulse" />
              <span>Gerar Times (Poder & Classes)</span>
            </button>
          )}

          {/* Gerenciador de Preenchimento / Remoção de Nomes */}
          <div
            className={`rounded-xl p-2.5 border flex flex-col gap-2 shadow-inner ${
              isParchment
                ? 'bg-[#fffcf4]/80 border-[#cbb085]'
                : 'bg-slate-900/95 border-slate-800'
            }`}
          >
            <div
              className={`flex items-center justify-between text-[11px] font-bold ${
                isParchment ? 'text-[#5a3311]' : 'text-slate-300'
              }`}
            >
              <span>Campo de Ação:</span>
              <div
                className={`inline-flex rounded-lg p-0.5 border ${
                  isParchment
                    ? 'bg-[#ecd8b5] border-[#cbb085]'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActionField('primary')}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                    actionField === 'primary'
                      ? isParchment
                        ? 'bg-[#7a4417] text-[#fff8ee] shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                      : isParchment
                      ? 'text-[#7d532b] hover:text-[#3d2008]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Ações para o Campo Primário"
                >
                  Primário ({primaryAssignedCount}/40)
                </button>
                <button
                  type="button"
                  onClick={() => setActionField('secondary')}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                    actionField === 'secondary'
                      ? isParchment
                        ? 'bg-[#7a4417] text-[#fff8ee] shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                      : isParchment
                      ? 'text-[#7d532b] hover:text-[#3d2008]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Ações para o Campo Secundário"
                >
                  Secundário ({secondaryAssignedCount}/40)
                </button>
                <button
                  type="button"
                  onClick={() => setActionField('both')}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                    actionField === 'both'
                      ? isParchment
                        ? 'bg-[#7a4417] text-[#fff8ee] shadow-xs'
                        : 'bg-indigo-600 text-white shadow-xs'
                      : isParchment
                      ? 'text-[#7d532b] hover:text-[#3d2008]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Ações para Ambos os Campos"
                >
                  Ambos ({primaryAssignedCount + secondaryAssignedCount}/80)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onAutoFillGrid(actionField)}
                disabled={roster.length === 0}
                className={`py-2 px-2 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                  isParchment
                    ? 'bg-gradient-to-r from-[#7a4417] to-[#99571e] hover:brightness-110 shadow-sm border border-[#c5994f]'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-900/30'
                }`}
                title={`Preencher vagas do ${
                  actionField === 'primary'
                    ? 'Campo Primário'
                    : actionField === 'secondary'
                    ? 'Campo Secundário'
                    : 'Ambos os Campos'
                } usando nomes do banco`}
              >
                <Sparkles size={13} className="shrink-0 text-yellow-200" />
                <span className="truncate">
                  Preencher {actionField === 'primary' ? 'Primário' : actionField === 'secondary' ? 'Secundário' : 'Ambos'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onResetGridToRoster(actionField)}
                disabled={
                  actionField === 'primary'
                    ? primaryAssignedCount === 0
                    : actionField === 'secondary'
                    ? secondaryAssignedCount === 0
                    : primaryAssignedCount + secondaryAssignedCount === 0
                }
                className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 ${
                  isParchment
                    ? 'bg-[#fffcf4] hover:bg-rose-100 text-[#542d0a] hover:text-rose-800 border-[#c29c67]'
                    : 'bg-slate-800 hover:bg-rose-950/80 hover:text-rose-200 hover:border-rose-700/60 text-slate-300 border-slate-700'
                }`}
                title={`Remover todos os nomes do ${
                  actionField === 'primary'
                    ? 'Campo Primário'
                    : actionField === 'secondary'
                    ? 'Campo Secundário'
                    : 'Ambos os Campos'
                } e devolver ao banco`}
              >
                <RotateCcw size={13} className="shrink-0" />
                <span className="truncate">
                  Remover {actionField === 'primary' ? 'Primário' : actionField === 'secondary' ? 'Secundário' : 'Ambos'}
                </span>
              </button>
            </div>
          </div>

          {/* Preset Sample Quick Load */}
          <div className="flex items-center justify-center gap-2 pt-0.5 text-[11px]">
            <span
              className={`font-medium ${
                isParchment ? 'text-[#7d532b]' : 'text-slate-400'
              }`}
            >
              Carregar 40 Nomes Prontos:
            </span>
            <button
              type="button"
              onClick={() => onLoadFull40Preset('primary')}
              className={`font-bold hover:underline cursor-pointer ${
                isParchment ? 'text-[#7a4417] hover:text-[#4d2807]' : 'text-blue-400 hover:text-blue-300'
              }`}
              title="Preencher Campo Primário com 40 jogadores de exemplo"
            >
              Primário
            </button>
            <span className={isParchment ? 'text-[#a27747]' : 'text-slate-600'}>·</span>
            <button
              type="button"
              onClick={() => onLoadFull40Preset('secondary')}
              className={`font-bold hover:underline cursor-pointer ${
                isParchment ? 'text-[#7a4417] hover:text-[#4d2807]' : 'text-blue-400 hover:text-blue-300'
              }`}
              title="Preencher Campo Secundário com 40 jogadores de exemplo"
            >
              Secundário
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`p-3.5 border-t flex flex-col items-center text-center gap-2 ${
            isParchment
              ? 'bg-[#ecd8b5] border-[#c09761]'
              : 'bg-slate-950/90 border-slate-800'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full border flex items-center justify-center ${
              isParchment
                ? 'bg-[#fffcf4] border-[#c29c67] text-[#7a4417]'
                : 'bg-slate-800 border-slate-700 text-sky-400'
            }`}
          >
            <Users size={16} />
          </div>
          <div>
            <span
              className={`text-xs font-bold block ${
                isParchment ? 'text-[#4d2807]' : 'text-slate-200'
              }`}
            >
              Modo Somente Visualização
            </span>
            <span
              className={`text-[11px] block mt-0.5 max-w-[260px] mx-auto ${
                isParchment ? 'text-[#7d532b]' : 'text-slate-400'
              }`}
            >
              Para adicionar jogadores, movimentar vagas ou gerar times balanceados, faça login como Administrador.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
