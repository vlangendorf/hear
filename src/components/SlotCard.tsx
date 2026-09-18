import React, { useState } from 'react';
import { Plus, Edit2, X, Crown, Shield, Swords, ShieldPlus, Sparkles } from 'lucide-react';
import { Player, DragItemData } from '../types';
import { ClassIcon } from './ClassIcon';
import { JOB_CLASSES } from '../constants/classes';
import { useTheme } from '../context/ThemeContext';

interface SlotCardProps {
  teamIndex: number;
  slotIndex: number;
  player: Player | null;
  fieldId?: 'primary' | 'secondary';
  isSelected?: boolean;
  canEdit?: boolean;
  onSelectSlot?: () => void;
  onDropPlayer: (targetTeam: number, targetSlot: number, data: DragItemData) => void;
  onEditPlayer: (player: Player, teamIndex: number, slotIndex: number) => void;
  onRemovePlayer: (teamIndex: number, slotIndex: number) => void;
  onOpenEmptySlotPicker: (teamIndex: number, slotIndex: number) => void;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  teamIndex,
  slotIndex,
  player,
  fieldId = 'primary',
  isSelected,
  canEdit = true,
  onSelectSlot,
  onDropPlayer,
  onEditPlayer,
  onRemovePlayer,
  onOpenEmptySlotPicker,
}) => {
  const { isParchment } = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);

  // Status badge colors
  const getStatusBadge = (status: Player['status']) => {
    switch (status) {
      case 'Líder':
        return 'bg-amber-500/90 text-amber-50 border-amber-300/60';
      case 'Ausente':
        return 'bg-rose-900/80 text-rose-200 border-rose-700/60';
      case 'Longe':
        return 'bg-stone-800/80 text-stone-300 border-stone-600/60';
      case 'Online':
      default:
        return 'bg-emerald-900/80 text-emerald-200 border-emerald-700/60';
    }
  };

  // Class badge banner theme
  const getClassTheme = (jobClass: string) => {
    const found = JOB_CLASSES.find((c) => c.name.toLowerCase() === jobClass.toLowerCase());
    if (found) {
      return {
        bg: found.badgeBg,
        text: found.textColor,
      };
    }
    // Default olive/greenish tone seen in screenshot
    return {
      bg: 'bg-[#5b7337]/90',
      text: 'text-lime-100',
    };
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!canEdit || !player) {
      e.preventDefault();
      return;
    }
    const dragData: DragItemData = {
      type: 'FROM_GRID',
      player,
      fromTeamIndex: teamIndex,
      fromSlotIndex: slotIndex,
      fromField: fieldId,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only if leaving this container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    setIsDragOver(false);
    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const data: DragItemData = JSON.parse(rawData);
      onDropPlayer(teamIndex, slotIndex, data);
    } catch (err) {
      console.error('Failed to parse drag item', err);
    }
  };

  // If slot is empty:
  if (!player) {
    return (
      <div
        id={`slot-${teamIndex}-${slotIndex}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={canEdit ? () => onOpenEmptySlotPicker(teamIndex, slotIndex) : undefined}
        className={`group relative h-[74px] rounded-lg transition-all duration-150 flex items-center justify-center select-none
          ${
            !canEdit
              ? isParchment
                ? 'bg-[#edd8b6]/40 border border-[#b8915b]/50 cursor-default opacity-80'
                : 'bg-slate-100/60 border border-slate-200/80 cursor-default opacity-80'
              : isDragOver
              ? isParchment
                ? 'bg-[#faebd0] border-2 border-dashed border-[#8c5624] scale-[1.02] shadow-md shadow-[#8c5624]/20 cursor-pointer'
                : 'bg-blue-100/90 border-2 border-dashed border-blue-500 scale-[1.02] shadow-md shadow-blue-500/20 cursor-pointer'
              : isSelected
              ? isParchment
                ? 'bg-[#faeed6] border-2 border-[#b8860b] ring-2 ring-[#c5994f]/40 cursor-pointer'
                : 'bg-blue-50/90 border-2 border-blue-400 ring-2 ring-blue-300 cursor-pointer'
              : isParchment
              ? 'bg-[#faeed6]/60 hover:bg-[#faeed6] border-[1.5px] border-dashed border-[#b68c56] hover:border-[#8f5e28] shadow-2xs cursor-pointer'
              : 'bg-white/85 hover:bg-white border-[1.5px] border-sky-200/90 hover:border-sky-300 shadow-xs cursor-pointer'
          }
        `}
        title={canEdit ? "Clique para adicionar jogador ou arraste aqui" : "Vaga livre (Modo Somente Visualização)"}
      >
        <div className={`flex flex-col items-center justify-center transition-transform ${
          canEdit
            ? isParchment
              ? 'text-[#9c723b] group-hover:text-[#6e3c13] group-hover:scale-110'
              : 'text-sky-300 group-hover:text-blue-500 group-hover:scale-110'
            : isParchment
            ? 'text-[#c2a176]'
            : 'text-slate-300'
        }`}>
          <Plus size={canEdit ? 26 : 20} strokeWidth={canEdit ? 2.5 : 2} />
        </div>
        <span className={`absolute bottom-1 right-1.5 text-[9px] font-mono font-medium ${
          isParchment ? 'text-[#8a6538]' : 'text-slate-400'
        }`}>
          T{teamIndex + 1}·S{slotIndex + 1}
        </span>
      </div>
    );
  }

  // Filled slot card:
  const theme = getClassTheme(player.jobClass);
  const powerVal = player.power !== undefined ? player.power : player.powerAndGlory;
  const gloryVal = player.glory;
  const hasExtraStats = Boolean(
    player.featherLevel !== undefined ||
    powerVal !== undefined ||
    gloryVal !== undefined ||
    player.mountLevel !== undefined
  );

  return (
    <div
      id={`slot-${teamIndex}-${slotIndex}`}
      draggable={canEdit}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onSelectSlot}
      onDoubleClick={canEdit ? () => onEditPlayer(player, teamIndex, slotIndex) : undefined}
      className={`group relative h-[74px] rounded-lg overflow-hidden flex flex-col justify-between select-none transition-all duration-150 shadow-xs border
        ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
        ${
          isDragOver && canEdit
            ? isParchment
              ? 'ring-2 ring-[#b8860b] scale-[1.03] shadow-lg border-[#8a5d2b]'
              : 'ring-2 ring-blue-500 scale-[1.03] shadow-lg'
            : isSelected
            ? isParchment
              ? 'ring-2 ring-[#c5994f] border-[#8a5d2b] shadow-md'
              : 'ring-2 ring-amber-400 border-amber-300 shadow-md'
            : isParchment
            ? 'border-[#a9814c]/70 hover:border-[#835623] hover:shadow-md'
            : 'border-slate-300/60 hover:shadow-md hover:border-blue-300'
        }
      `}
      title={`Jogador: ${player.name}\nClasse: ${player.jobClass} (${player.role})\nNível de Penas: ${player.featherLevel || 'Não definido'}\nPoder: ${powerVal || 'Não definido'}\nGlória: ${gloryVal || 'Não definido'}\nNível da Montaria: ${player.mountLevel || 'Não definido'}${canEdit ? '\nClique 2x para editar' : ''}`}
    >
      {/* Top Banner (Level + Class Emblem + Status Tag) */}
      <div
        className={`h-[30px] px-1.5 flex items-center justify-between text-white ${theme.bg} relative overflow-hidden`}
      >
        {/* Class Emblem circle & Level */}
        <div className="flex items-center gap-1.5 min-w-0 z-10">
          <div className="w-5 h-5 rounded-full bg-white/20 border border-white/40 flex items-center justify-center shrink-0 shadow-xs">
            <ClassIcon name={player.jobClass} size={11} className="text-white" />
          </div>
          <span className="text-[10.5px] font-bold tracking-tight text-white/95 truncate">
            Nv.{player.level}
          </span>
        </div>

        {/* Status Badge (Ausente, Longe, Líder, Online) */}
        <div className="flex items-center gap-1 shrink-0 z-10">
          {player.isLeader && (
            <span
              title="Líder do Time"
              className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs"
            >
              <Crown size={10} className="stroke-[2.5]" />
            </span>
          )}
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold border ${getStatusBadge(
              player.status
            )} shadow-xs`}
          >
            {player.status}
          </span>
        </div>

        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/15 pointer-events-none" />
      </div>

      {/* Bottom Name & Stats Section */}
      <div
        className={`h-[44px] px-2 flex flex-col justify-center relative border-t ${
          isParchment
            ? 'bg-gradient-to-b from-[#fffcf5] via-[#fcf5e5] to-[#f4e6ca] border-[#d8be96] text-[#341d0b]'
            : 'bg-gradient-to-b from-white via-white to-slate-50 border-slate-200/80 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between min-w-0">
          <span
            className={`text-[11.5px] font-bold tracking-tight truncate leading-tight ${
              isParchment ? 'text-[#361f0c]' : 'text-slate-800'
            }`}
          >
            {player.name}
          </span>
          <span
            className={`text-[8.5px] font-medium truncate ml-1 shrink-0 ${
              isParchment ? 'text-[#7d5c36]' : 'text-slate-400'
            }`}
          >
            {player.jobClass.split('/')[0].trim()}
          </span>
        </div>

        {/* Progression stats: Penas, Poder, Glória, Montaria */}
        <div className="flex items-center gap-1 text-[8px] font-semibold mt-0.5 leading-none flex-nowrap overflow-hidden">
          {hasExtraStats ? (
            <>
              {player.featherLevel !== undefined && (
                <span
                  title={`Nível de Penas: ${player.featherLevel}`}
                  className={`px-1 py-0.2 rounded border font-bold shrink-0 ${
                    isParchment
                      ? 'text-[#2e4f72] bg-[#eef3f9] border-[#a9bed6]'
                      : 'text-sky-800 bg-sky-50 border-sky-200/80'
                  }`}
                >
                  🪶{player.featherLevel}
                </span>
              )}
              {powerVal !== undefined && (
                <span
                  title={`Poder: ${powerVal}`}
                  className={`px-1 py-0.2 rounded border font-bold truncate max-w-[48px] shrink-0 ${
                    isParchment
                      ? 'text-[#7a390e] bg-[#faebd7] border-[#d8b082]'
                      : 'text-amber-800 bg-amber-50 border-amber-200/80'
                  }`}
                >
                  ⚔️{powerVal}
                </span>
              )}
              {gloryVal !== undefined && (
                <span
                  title={`Glória: ${gloryVal}`}
                  className={`px-1 py-0.2 rounded border font-bold truncate max-w-[42px] shrink-0 ${
                    isParchment
                      ? 'text-[#5e2b69] bg-[#f8ebfc] border-[#d6a9dd]'
                      : 'text-purple-800 bg-purple-50 border-purple-200/80'
                  }`}
                >
                  ⚜️{gloryVal}
                </span>
              )}
              {player.mountLevel !== undefined && (
                <span
                  title={`Nível da Montaria: ${player.mountLevel}`}
                  className={`px-1 py-0.2 rounded border font-bold shrink-0 ${
                    isParchment
                      ? 'text-[#1d5c2e] bg-[#eaf7ee] border-[#9fd8ad]'
                      : 'text-emerald-800 bg-emerald-50 border-emerald-200/80'
                  }`}
                >
                  🐎{player.mountLevel}
                </span>
              )}
            </>
          ) : (
            <span
              className={`text-[8px] italic truncate ${
                isParchment ? 'text-[#9c7849]' : 'text-slate-400'
              }`}
            >
              Clique 2x p/ atributos
            </span>
          )}
        </div>

        {/* Action buttons (Edit & Remove) - only when canEdit is true */}
        {canEdit && (
          <div
            className={`absolute right-1 top-1 flex items-center gap-1 transition-opacity rounded-md px-1 py-0.5 shadow-xs border z-20 ${
              isParchment
                ? 'bg-[#faeed6]/95 border-[#c59e67] text-[#4f2f11]'
                : 'bg-white/95 border-slate-200 text-slate-600'
            } ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 sm:opacity-0'}`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditPlayer(player, teamIndex, slotIndex);
              }}
              title="Editar jogador e atributos"
              className={`p-1.5 rounded transition-colors touch-manipulation cursor-pointer ${
                isParchment
                  ? 'hover:bg-[#f2dfbf] text-[#693d14] hover:text-[#3d2008]'
                  : 'hover:bg-blue-50 text-slate-600 hover:text-blue-600'
              }`}
            >
              <Edit2 size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemovePlayer(teamIndex, slotIndex);
              }}
              title="Remover para reserva"
              className={`p-1.5 rounded transition-colors touch-manipulation cursor-pointer ${
                isParchment
                  ? 'hover:bg-rose-100 text-[#693d14] hover:text-rose-700'
                  : 'hover:bg-rose-50 text-slate-600 hover:text-rose-600'
              }`}
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
