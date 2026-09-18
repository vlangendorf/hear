import React from 'react';
import { Player, DragItemData } from '../types';
import { SlotCard } from './SlotCard';
import { ClassIcon } from './ClassIcon';
import { Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TeamColumnProps {
  teamIndex: number;
  slots: (Player | null)[];
  fieldId?: 'primary' | 'secondary';
  selectedSlot: { teamIndex: number; slotIndex: number } | null;
  canEdit?: boolean;
  onSelectSlot: (teamIndex: number, slotIndex: number) => void;
  onDropPlayer: (targetTeam: number, targetSlot: number, data: DragItemData) => void;
  onEditPlayer: (player: Player, teamIndex: number, slotIndex: number) => void;
  onRemovePlayer: (teamIndex: number, slotIndex: number) => void;
  onClearTeam: (teamIndex: number) => void;
  onOpenEmptySlotPicker: (teamIndex: number, slotIndex: number) => void;
}

export const TeamColumn: React.FC<TeamColumnProps> = ({
  teamIndex,
  slots,
  fieldId = 'primary',
  selectedSlot,
  canEdit = true,
  onSelectSlot,
  onDropPlayer,
  onEditPlayer,
  onRemovePlayer,
  onClearTeam,
  onOpenEmptySlotPicker,
}) => {
  const { isParchment } = useTheme();
  const filledCount = slots.filter(Boolean).length;
  const isFull = filledCount === 5;

  // Aggregate class counts for this team list
  const classCounts = slots.reduce<Record<string, { count: number; role: string }>>((acc, player) => {
    if (player) {
      if (!acc[player.jobClass]) {
        acc[player.jobClass] = { count: 0, role: player.role };
      }
      acc[player.jobClass].count += 1;
    }
    return acc;
  }, {});

  const classEntries = Object.entries(classCounts);

  // Shorten class names for compact display in the column footer
  const getShortName = (fullName: string) => {
    return fullName.split('/')[0].trim();
  };

  return (
    <div className="flex flex-col gap-2 w-full min-w-0 flex-1">
      {/* Column Header */}
      <div
        className={`flex items-center justify-between px-1.5 py-1 rounded-md border ${
          isParchment
            ? 'bg-[#ecd8b5]/90 border-[#c29c67] text-[#4d280a]'
            : 'bg-sky-50/80 border-sky-100/80'
        }`}
      >
        <div className="flex items-center gap-1 min-w-0">
          <span
            className={`text-[12px] font-bold tracking-tight ${
              isParchment ? 'text-[#5a3311] font-medieval' : 'text-sky-600'
            }`}
          >
            Time{teamIndex + 1}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-full ${
              isParchment
                ? isFull
                  ? 'bg-[#d8eedb] text-[#135921] border border-[#a2d8ac]'
                  : filledCount > 0
                  ? 'bg-[#faeed6] text-[#693d14] border border-[#d2ab76]'
                  : 'text-[#8c673d] font-bold'
                : isFull
                ? 'bg-emerald-100 text-emerald-700'
                : filledCount > 0
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-500 font-bold'
            }`}
          >
            {filledCount}/5
          </span>
        </div>
      </div>

      {/* 5 Slots */}
      <div className="flex flex-col gap-1.5">
        {slots.map((player, slotIndex) => {
          const isSelected =
            selectedSlot?.teamIndex === teamIndex && selectedSlot?.slotIndex === slotIndex;

          return (
            <SlotCard
              key={`team-${teamIndex}-slot-${slotIndex}`}
              teamIndex={teamIndex}
              slotIndex={slotIndex}
              player={player}
              fieldId={fieldId}
              isSelected={isSelected}
              canEdit={canEdit}
              onSelectSlot={() => onSelectSlot(teamIndex, slotIndex)}
              onDropPlayer={onDropPlayer}
              onEditPlayer={onEditPlayer}
              onRemovePlayer={onRemovePlayer}
              onOpenEmptySlotPicker={onOpenEmptySlotPicker}
            />
          );
        })}
      </div>

      {/* CONTADOR DE CLASSES ABAIXO DA LISTA DESTE TIME */}
      <div
        className={`mt-0.5 p-2 rounded-xl shadow-xs flex flex-col gap-1.5 border ${
          isParchment
            ? 'bg-[#fffcf4] border-[#c8a470] text-[#3d220b]'
            : 'bg-white/95 border-sky-200/90'
        }`}
      >
        <div
          className={`flex items-center justify-between border-b pb-1 ${
            isParchment ? 'border-[#e4ceaa]' : 'border-sky-100'
          }`}
        >
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider ${
              isParchment ? 'text-[#5a3311] font-medieval' : 'text-sky-900'
            }`}
          >
            Classes ({filledCount})
          </span>
          <span
            className={`text-[9.5px] font-semibold ${
              isParchment ? 'text-[#8c673d]' : 'text-slate-400'
            }`}
          >
            T{teamIndex + 1}
          </span>
        </div>

        {classEntries.length === 0 ? (
          <div className="py-2.5 text-center">
            <span
              className={`text-[10px] italic ${
                isParchment ? 'text-[#9c7849]' : 'text-slate-400'
              }`}
            >
              Vazio (0)
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {classEntries.map(([className, info]) => (
              <div
                key={className}
                className={`flex items-center justify-between px-1.5 py-0.5 rounded-md text-[10.5px] transition-colors border ${
                  isParchment
                    ? 'bg-[#faeed6] hover:bg-[#fae6c3] border-[#dec299] text-[#3b200b]'
                    : 'bg-slate-50 hover:bg-sky-50 border-slate-200/60 text-slate-700'
                }`}
                title={`${className} (${info.role})`}
              >
                <div className="flex items-center gap-1 min-w-0 pr-1">
                  <div className={isParchment ? 'text-[#7d481a] shrink-0' : 'text-sky-600 shrink-0'}>
                    <ClassIcon name={className} size={11} />
                  </div>
                  <span
                    className={`truncate font-bold leading-none ${
                      isParchment ? 'text-[#3b200b]' : 'text-slate-700'
                    }`}
                  >
                    {getShortName(className)}
                  </span>
                </div>
                <span
                  className={`shrink-0 font-mono font-extrabold text-[10px] px-1 py-0.2 rounded-full border ${
                    isParchment
                      ? 'bg-[#eed8b6] text-[#4e2c0e] border-[#bca076]'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  x{info.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

