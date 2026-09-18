import React, { useMemo, useState } from 'react';
import { Users, FileDown, Loader2, Edit2, RotateCw, RotateCcw, Info, LayoutGrid, Columns3, Sparkles } from 'lucide-react';
import { Player, DragItemData } from '../types';
import { TeamColumn } from './TeamColumn';
import { ClassIcon } from './ClassIcon';
import { JOB_CLASSES } from '../constants/classes';
import { useTheme } from '../context/ThemeContext';
import { MedievalDivider } from './MedievalDivider';

interface CampoBoardProps {
  id: string;
  fieldId: 'primary' | 'secondary';
  title: string;
  teams: (Player | null)[][];
  teamLeaderName: string;
  targetObjective: string;
  isEditingLeader: boolean;
  selectedSlot: { teamIndex: number; slotIndex: number; fieldId?: 'primary' | 'secondary' } | null;
  isExportingPdf: boolean;
  canEdit?: boolean;
  onSetIsEditingLeader: (editing: boolean) => void;
  onSaveLeaderName: (name: string) => void;
  onCycleTarget: () => void;
  onSelectSlot: (teamIndex: number, slotIndex: number) => void;
  onDropPlayer: (targetTeam: number, targetSlot: number, data: DragItemData) => void;
  onEditPlayer: (player: Player, teamIndex: number, slotIndex: number) => void;
  onRemovePlayer: (teamIndex: number, slotIndex: number) => void;
  onClearTeam: (teamIndex: number) => void;
  onOpenEmptySlotPicker: (teamIndex: number, slotIndex: number) => void;
  onExportPdf: () => void;
  onOpenAutoOptimizer?: () => void;
  onAutoFillThisField?: () => void;
  onClearThisField?: () => void;
  headerTheme?: 'blue' | 'indigo' | 'sky';
}

export const CampoBoard: React.FC<CampoBoardProps> = ({
  id,
  fieldId,
  title,
  teams,
  teamLeaderName,
  targetObjective,
  isEditingLeader,
  selectedSlot,
  isExportingPdf,
  canEdit = true,
  onSetIsEditingLeader,
  onSaveLeaderName,
  onCycleTarget,
  onSelectSlot,
  onDropPlayer,
  onEditPlayer,
  onRemovePlayer,
  onClearTeam,
  onOpenEmptySlotPicker,
  onExportPdf,
  onOpenAutoOptimizer,
  onAutoFillThisField,
  onClearThisField,
}) => {
  const { isParchment } = useTheme();
  const [viewMode, setViewMode] = useState<'responsive' | 'panoramic'>('responsive');
  const [activeTeamFilter, setActiveTeamFilter] = useState<number | null>(null);
  const totalAssigned = teams.flat().filter(Boolean).length;

  // Class breakdown across all 8 teams in this board
  const overallClassCounts = useMemo(() => {
    const map = new Map<string, { count: number; role: string; id: string }>();
    JOB_CLASSES.forEach((jc) => {
      map.set(jc.name, { count: 0, role: jc.role, id: jc.id });
    });
    teams.flat().forEach((p) => {
      if (p) {
        const existing = map.get(p.jobClass);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(p.jobClass, { count: 1, role: p.role, id: p.jobClass });
        }
      }
    });
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      ...data,
    }));
  }, [teams]);

  // Roles distribution across all teams in this board
  const roleCounts = useMemo(() => {
    const roles: Record<string, number> = { Tank: 0, Healer: 0, DPS: 0, Suporte: 0 };
    teams.flat().forEach((p) => {
      if (p && p.role in roles) {
        roles[p.role] += 1;
      }
    });
    return roles;
  }, [teams]);

  return (
    <div
      id={id}
      className={`w-full rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col transition-all ${
        isParchment
          ? 'parchment-surface border-2 border-[#8b5a2b] shadow-[0_20px_60px_rgba(0,0,0,0.65)] text-[#361e0b]'
          : 'bg-gradient-to-b from-[#eaf4ff] via-[#f4f9ff] to-[#e4eefb] shadow-[0_20px_60px_-15px_rgba(30,58,138,0.25)] border-[3px] border-white/90'
      }`}
    >
      {/* Scroll roll detail in parchment mode */}
      {isParchment && (
        <div className="parchment-scroll-roll h-2 w-full" />
      )}

      {/* TOP HEADER BAR (Title + 8 Times 40 Vagas + Exclusively Exportar Button) */}
      <div
        className={`h-12 sm:h-14 px-4 sm:px-6 flex items-center justify-between shadow-md relative ${
          isParchment
            ? 'bg-gradient-to-r from-[#6b3e18] via-[#8c5424] to-[#6b3e18] text-[#fff8ec] border-b-2 border-[#b8860b]'
            : 'bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#60a5fa] text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xs border ${
              isParchment
                ? 'bg-[#3b200b]/50 border-[#d8af65] text-[#d8af65]'
                : 'bg-white/20 border-white/40 text-white'
            }`}
          >
            <Users size={18} />
          </div>
          <h2
            className={`text-sm sm:text-lg lg:text-xl font-black tracking-wider uppercase drop-shadow-xs ${
              isParchment ? 'font-medieval text-[#f8ebd0]' : 'text-white'
            }`}
          >
            {title}
          </h2>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block border ${
              isParchment
                ? 'bg-[#eed8b6] text-[#4d280a] border-[#bda072]'
                : 'bg-white/25 text-white border-white/30'
            }`}
          >
            8 Times · 40 Vagas ({totalAssigned}/40)
          </span>
        </div>

        {/* Right Header Controls: Gerar Times Inteligentes + Exportar */}
        <div className="flex items-center gap-2">
          {onOpenAutoOptimizer && (
            <button
              type="button"
              id={`btn-otimizar-${fieldId}`}
              onClick={onOpenAutoOptimizer}
              title="Analisar dados de cada usuário e gerar automaticamente os times baseados em poderes e classes combinadas"
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 active:scale-95 rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer ${
                isParchment
                  ? 'bg-gradient-to-r from-[#854b1c] to-[#a36127] hover:brightness-110 text-[#fff8ed] border-2 border-[#c5994f]'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white border border-amber-300/60'
              }`}
            >
              <Sparkles size={15} className="text-yellow-100 animate-pulse" />
              <span className="hidden sm:inline">Gerar Times </span>
              <span>(Poder & Classes)</span>
            </button>
          )}

          <button
            type="button"
            id={`btn-exportar-${fieldId}`}
            onClick={onExportPdf}
            disabled={isExportingPdf}
            title={`Exportar em PDF a lista de ${title}`}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-75 ${
              isParchment
                ? 'bg-[#faeed6] hover:bg-[#fae5c3] text-[#41240c] border border-[#a87d46]'
                : 'bg-white/20 hover:bg-white/30 active:bg-white/40 text-white border border-white/40'
            }`}
          >
            {isExportingPdf ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Gerando PDF...</span>
              </>
            ) : (
              <>
                <FileDown size={15} />
                <span>Exportar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SUBHEADER ROW ("Time de Leader", "Alvo", View Mode Selector) */}
      <div
        className={`px-3 sm:px-5 py-2.5 sm:py-3 border-b flex flex-wrap items-center justify-between gap-2.5 ${
          isParchment
            ? 'bg-[#ecd8b5]/85 border-[#c8a470]'
            : 'bg-gradient-to-r from-[#d9ebff]/90 to-[#eaf3ff]/90 border-sky-200/80'
        }`}
      >
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Team Leader Badge */}
          <div
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 shadow-xs border ${
              isParchment
                ? 'bg-[#fffcf4] border-[#c29c67] text-[#542d0a]'
                : 'bg-white/95 border-sky-300/80'
            }`}
          >
            <span
              className={`text-xs sm:text-sm font-semibold ${
                isParchment ? 'text-[#7d5225]' : 'text-slate-600'
              }`}
            >
              Time de
            </span>
            {isEditingLeader && canEdit ? (
              <input
                type="text"
                autoFocus
                defaultValue={teamLeaderName}
                onBlur={(e) => {
                  onSaveLeaderName(e.target.value.trim() || 'vseteRR');
                  onSetIsEditingLeader(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSaveLeaderName(e.currentTarget.value.trim() || 'vseteRR');
                    onSetIsEditingLeader(false);
                  }
                }}
                className={`text-xs sm:text-sm font-extrabold underline outline-hidden px-1 rounded ${
                  isParchment
                    ? 'text-[#6a350c] bg-[#eed8b6]/80'
                    : 'text-blue-700 bg-blue-50/60'
                }`}
              />
            ) : canEdit ? (
              <button
                type="button"
                onClick={() => onSetIsEditingLeader(true)}
                className={`text-xs sm:text-sm font-extrabold underline flex items-center gap-1 cursor-pointer ${
                  isParchment
                    ? 'text-[#6a350c] hover:text-[#381a04]'
                    : 'text-blue-700 hover:text-blue-900'
                }`}
                title="Clique para renomear"
              >
                <span>{teamLeaderName}</span>
                <Edit2 size={12} className={isParchment ? 'text-[#a27747]' : 'text-slate-400'} />
              </button>
            ) : (
              <span
                className={`text-xs sm:text-sm font-extrabold ${
                  isParchment ? 'text-[#6a350c]' : 'text-blue-700'
                }`}
              >
                {teamLeaderName}
              </span>
            )}
          </div>

          {/* Target Selector */}
          <div
            onClick={canEdit ? onCycleTarget : undefined}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold shadow-xs border ${
              isParchment
                ? 'bg-[#fffcf4] border-[#c29c67] text-[#542d0a]'
                : 'bg-white/90 border-sky-300/80 text-slate-700'
            } ${
              canEdit
                ? isParchment
                  ? 'hover:bg-[#f6ebd7] hover:text-[#381a04] transition-colors cursor-pointer'
                  : 'hover:bg-white hover:text-blue-600 transition-colors cursor-pointer'
                : 'cursor-default'
            }`}
            title={canEdit ? "Clique para alternar o Alvo da Raide" : "Alvo configurado da Raide"}
          >
            <span>
              Alvo:{' '}
              <span
                className={`font-extrabold ${
                  isParchment ? 'text-[#7d3c09]' : 'text-blue-600'
                }`}
              >
                {targetObjective}
              </span>
            </span>
            {canEdit && (
              <RotateCw
                size={13}
                className={`hover:rotate-180 transition-transform duration-300 ${
                  isParchment ? 'text-[#a27747]' : 'text-sky-500'
                }`}
              />
            )}
          </div>

          {/* Quick Fill & Clear Field Buttons - Only available to Editors */}
          {canEdit && (onAutoFillThisField || onClearThisField) && (
            <div className="flex items-center gap-1.5">
              {onAutoFillThisField && (
                <button
                  type="button"
                  id={`btn-preencher-${fieldId}`}
                  onClick={onAutoFillThisField}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer ${
                    isParchment
                      ? 'bg-gradient-to-r from-[#7a4417] to-[#99571e] hover:brightness-110 text-[#fff9ee] border border-[#c5994f]'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white'
                  }`}
                  title={`Preencher vagas livres do ${title} com jogadores do banco`}
                >
                  <Sparkles size={13} className="text-yellow-200" />
                  <span>Preencher</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isParchment
                        ? 'bg-[#4d2508] text-[#faebd7]'
                        : 'bg-blue-800/90 text-blue-100'
                    }`}
                  >
                    {40 - totalAssigned}
                  </span>
                </button>
              )}

              {onClearThisField && (
                <button
                  type="button"
                  id={`btn-remover-${fieldId}`}
                  onClick={onClearThisField}
                  disabled={totalAssigned === 0}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border ${
                    isParchment
                      ? 'bg-[#fffcf4] hover:bg-rose-100 text-[#542d0a] hover:text-rose-800 border-[#c29c67]'
                      : 'bg-white/95 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-sky-300/80 hover:border-rose-300'
                  }`}
                  title={`Remover todos os nomes do ${title} e devolver ao banco de reservas`}
                >
                  <RotateCcw
                    size={13}
                    className={isParchment ? 'text-[#8c673d] hover:text-rose-700' : 'text-slate-500 hover:text-rose-600'}
                  />
                  <span>Remover Nomes</span>
                  {totalAssigned > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        isParchment ? 'bg-[#eed8b6] text-[#4d280a]' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {totalAssigned}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* View Mode Switcher (Adaptativa vs Panorâmica 8 Colunas) */}
        <div
          className={`flex items-center rounded-xl p-0.5 shadow-xs border ${
            isParchment
              ? 'bg-[#fffcf4] border-[#c29c67]'
              : 'bg-white/95 border-sky-300/80'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setViewMode('responsive');
              setActiveTeamFilter(null);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'responsive'
                ? isParchment
                  ? 'bg-[#7a4417] text-[#fff9ee] shadow-xs'
                  : 'bg-blue-600 text-white shadow-xs'
                : isParchment
                ? 'text-[#693d14] hover:text-[#3d2008] hover:bg-[#faeed6]'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/60'
            }`}
            title="Modo Adaptativo (celular, tablet e computador)"
          >
            <LayoutGrid size={13} />
            <span className="hidden xs:inline">Grade </span>Adaptativa
          </button>
          <button
            type="button"
            onClick={() => setViewMode('panoramic')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'panoramic'
                ? isParchment
                  ? 'bg-[#7a4417] text-[#fff9ee] shadow-xs'
                  : 'bg-blue-600 text-white shadow-xs'
                : isParchment
                ? 'text-[#693d14] hover:text-[#3d2008] hover:bg-[#faeed6]'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/60'
            }`}
            title="Modo Panorâmico (todas as 8 colunas lado a lado)"
          >
            <Columns3 size={13} />
            <span>Panorâmica (8 Colunas)</span>
          </button>
        </div>
      </div>

      {/* QUICK TEAM FILTER BAR (When in responsive mode) */}
      {viewMode === 'responsive' && (
        <div
          className={`px-3 sm:px-5 py-1.5 border-b flex items-center gap-1.5 overflow-x-auto scrollbar-none ${
            isParchment ? 'bg-[#e4ceaa] border-[#c8a470]' : 'bg-[#e4effc] border-sky-200/80'
          }`}
        >
          <span
            className={`text-[11px] font-bold shrink-0 mr-1 ${
              isParchment ? 'text-[#724a20]' : 'text-slate-500'
            }`}
          >
            Filtrar:
          </span>
          <button
            type="button"
            onClick={() => setActiveTeamFilter(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
              activeTeamFilter === null
                ? isParchment
                  ? 'bg-[#7a4417] text-[#fff9ee] shadow-xs'
                  : 'bg-blue-600 text-white shadow-xs'
                : isParchment
                ? 'bg-[#fffcf4] hover:bg-[#f6ebd7] text-[#542d0a] border border-[#c29c67]'
                : 'bg-white/85 hover:bg-white text-slate-700 border border-sky-200'
            }`}
          >
            Todos os Times (40 Vagas)
          </button>
          {Array.from({ length: 8 }, (_, i) => {
            const teamFilled = (teams[i] || []).filter(Boolean).length;
            const isSelected = activeTeamFilter === i;
            return (
              <button
                key={`team-tab-${fieldId}-${i}`}
                type="button"
                onClick={() => setActiveTeamFilter(i)}
                className={`px-2 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? isParchment
                      ? 'bg-[#7a4417] text-[#fff9ee] shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                    : isParchment
                    ? 'bg-[#fffcf4] hover:bg-[#f6ebd7] text-[#542d0a] border border-[#c29c67]'
                    : 'bg-white/85 hover:bg-white text-slate-700 border border-sky-200'
                }`}
              >
                <span>T{i + 1}</span>
                <span
                  className={`text-[9.5px] font-mono font-extrabold px-1 rounded ${
                    isSelected
                      ? isParchment
                        ? 'bg-[#4d2508] text-[#faebd7]'
                        : 'bg-blue-800 text-white'
                      : isParchment
                      ? 'bg-[#ecd8b5] text-[#5c3510]'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {teamFilled}/5
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* THE 40-SLOT GRID */}
      {viewMode === 'panoramic' ? (
        <div className="p-3 sm:p-5 overflow-x-auto">
          <div className="min-w-[960px] grid grid-cols-8 gap-2.5 sm:gap-3">
            {teams.map((slots, teamIndex) => (
              <TeamColumn
                key={`${fieldId}-team-col-${teamIndex}`}
                teamIndex={teamIndex}
                slots={slots}
                fieldId={fieldId}
                canEdit={canEdit}
                selectedSlot={
                  selectedSlot?.fieldId === fieldId || (!selectedSlot?.fieldId && fieldId === 'primary')
                    ? selectedSlot
                    : null
                }
                onSelectSlot={onSelectSlot}
                onDropPlayer={onDropPlayer}
                onEditPlayer={onEditPlayer}
                onRemovePlayer={onRemovePlayer}
                onClearTeam={onClearTeam}
                onOpenEmptySlotPicker={onOpenEmptySlotPicker}
              />
            ))}
          </div>
        </div>
      ) : activeTeamFilter !== null ? (
        /* Focused Single Team View (optimized for mobile) */
        <div className="p-3 sm:p-5 max-w-sm mx-auto w-full">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900">
              Visualizando Time {activeTeamFilter + 1} de 8
            </span>
            <button
              type="button"
              onClick={() => setActiveTeamFilter(null)}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold underline"
            >
              Ver todos os times
            </button>
          </div>
          <TeamColumn
            key={`${fieldId}-team-col-${activeTeamFilter}`}
            teamIndex={activeTeamFilter}
            slots={teams[activeTeamFilter] || []}
            fieldId={fieldId}
            canEdit={canEdit}
            selectedSlot={
              selectedSlot?.fieldId === fieldId || (!selectedSlot?.fieldId && fieldId === 'primary')
                ? selectedSlot
                : null
            }
            onSelectSlot={onSelectSlot}
            onDropPlayer={onDropPlayer}
            onEditPlayer={onEditPlayer}
            onRemovePlayer={onRemovePlayer}
            onClearTeam={onClearTeam}
            onOpenEmptySlotPicker={onOpenEmptySlotPicker}
          />
        </div>
      ) : (
        /* Responsive Adaptive Grid (1 col on phone, 2 cols on wide phone, 4 cols on tablet, 8 cols on desktop) */
        <div className="p-3 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3">
            {teams.map((slots, teamIndex) => (
              <TeamColumn
                key={`${fieldId}-team-col-${teamIndex}`}
                teamIndex={teamIndex}
                slots={slots}
                fieldId={fieldId}
                canEdit={canEdit}
                selectedSlot={
                  selectedSlot?.fieldId === fieldId || (!selectedSlot?.fieldId && fieldId === 'primary')
                    ? selectedSlot
                    : null
                }
                onSelectSlot={onSelectSlot}
                onDropPlayer={onDropPlayer}
                onEditPlayer={onEditPlayer}
                onRemovePlayer={onRemovePlayer}
                onClearTeam={onClearTeam}
                onOpenEmptySlotPicker={onOpenEmptySlotPicker}
              />
            ))}
          </div>
        </div>
      )}

      {/* Drag & Drop Hint Banner */}
      <div
        className={`px-4 py-1.5 border-t flex items-center justify-between text-[11px] ${
          isParchment
            ? 'bg-[#ecd8b5]/70 border-[#c8a470]/70 text-[#69421c]'
            : 'bg-sky-100/60 border-sky-200/60 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Info size={13} className={isParchment ? 'text-[#8c5727] shrink-0' : 'text-sky-600 shrink-0'} />
          <span>
            <strong>Dica:</strong> Arraste jogadores entre os 40 quadrados para organizar as vagas deste campo.
          </span>
        </div>
        <span
          className={`hidden sm:inline-block font-mono text-[10px] ${
            isParchment ? 'text-[#8c673d]' : 'text-slate-400'
          }`}
        >
          Total: {totalAssigned}/40 jogadores escalados
        </span>
      </div>

      {/* CONTADOR DE CADA CLASSE */}
      <div
        className={`px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col gap-3 ${
          isParchment
            ? 'bg-[#e7d2af] border-[#c29c67] text-[#3d220b]'
            : 'bg-gradient-to-b from-[#eaf2fc] to-[#d8e8fa] border-sky-200/80'
        }`}
      >
        {/* Header com Totais de Funções (Roles) */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2 ${
            isParchment ? 'border-[#c8a470]' : 'border-sky-200/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-xs sm:text-sm font-extrabold uppercase tracking-wide ${
                isParchment ? 'text-[#5a3311] font-medieval' : 'text-sky-950'
              }`}
            >
              Contador de Classes ({title})
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full shadow-xs ${
                isParchment
                  ? 'bg-[#7a4417] text-[#fff9ee] border border-[#c5994f]'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {totalAssigned} / 40 jogadores
            </span>
          </div>

          {/* Roles quick summary */}
          <div className="flex items-center flex-wrap gap-1.5 text-[11px] font-bold">
            <span
              className={`px-2 py-0.5 rounded-md border ${
                isParchment
                  ? 'bg-[#fff5e6] text-[#7a4812] border-[#deb687]'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              🛡️ Tanks: {roleCounts.Tank}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md border ${
                isParchment
                  ? 'bg-[#eaf5ec] text-[#1e612f] border-[#a0d2ac]'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              💚 Healers: {roleCounts.Healer}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md border ${
                isParchment
                  ? 'bg-[#faebee] text-[#852535] border-[#df9ea9]'
                  : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}
            >
              ⚔️ DPS: {roleCounts.DPS}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md border ${
                isParchment
                  ? 'bg-[#f6ecfa] text-[#632174] border-[#caa0d6]'
                  : 'bg-purple-100 text-purple-800 border-purple-200'
              }`}
            >
              ✨ Suporte: {roleCounts.Suporte}
            </span>
          </div>
        </div>

        {/* Grid de badges com contador de cada classe */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1.5 sm:gap-2">
          {overallClassCounts.map((item) => {
            const isPresent = item.count > 0;
            return (
              <div
                key={`${fieldId}-counter-${item.name}`}
                className={`flex items-center justify-between px-2 py-1 rounded-lg border text-xs transition-all ${
                  isParchment
                    ? isPresent
                      ? 'bg-[#fffcf4] shadow-xs border-[#c59f6b] text-[#3d2008] font-medium'
                      : 'bg-[#fffcf4]/40 border-[#d2b88e]/60 text-[#8c6d48] opacity-60'
                    : isPresent
                    ? 'bg-white shadow-xs border-sky-300/80 text-slate-800 font-medium'
                    : 'bg-white/40 border-slate-200/60 text-slate-400 opacity-60'
                }`}
                title={`${item.name} (${item.role}): ${item.count} na equipe`}
              >
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <div
                    className={`shrink-0 ${
                      isPresent
                        ? isParchment
                          ? 'text-[#7d481a]'
                          : 'text-sky-600'
                        : isParchment
                        ? 'text-[#a2815a]'
                        : 'text-slate-400'
                    }`}
                  >
                    <ClassIcon name={item.name} size={13} />
                  </div>
                  <span className="truncate text-[11px] font-semibold">
                    {item.name.split('/')[0].trim()}
                  </span>
                </div>
                <span
                  className={`shrink-0 font-mono font-extrabold text-[11px] px-1.5 py-0.2 rounded-full ${
                    isParchment
                      ? isPresent
                        ? 'bg-[#7a4417] text-[#fff9ee] border border-[#c5994f]'
                        : 'bg-[#dec49c] text-[#5a3614]'
                      : isPresent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-200/80 text-slate-500'
                  }`}
                >
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
