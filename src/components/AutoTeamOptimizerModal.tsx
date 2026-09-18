import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Shield,
  Heart,
  Wand2,
  Swords,
  CheckCircle2,
  TrendingUp,
  Scale,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Player } from '../types';
import {
  optimizeTeams,
  formatPowerNumber,
  calculatePlayerRating,
  getPlayerRole,
  OptimizationResult,
} from '../utils/teamOptimizer';
import { ClassIcon } from './ClassIcon';
import { useTheme } from '../context/ThemeContext';

interface AutoTeamOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: Player[];
  primaryTeams: (Player | null)[][];
  secondaryTeams: (Player | null)[][];
  onApplyOptimization: (
    targetField: 'primary' | 'secondary' | 'both',
    optimizedTeams: (Player | null)[][],
    secondaryOptimizedTeams?: (Player | null)[][]
  ) => void;
}

export const AutoTeamOptimizerModal: React.FC<AutoTeamOptimizerModalProps> = ({
  isOpen,
  onClose,
  roster,
  primaryTeams,
  secondaryTeams,
  onApplyOptimization,
}) => {
  const { isParchment } = useTheme();
  const [includeRoster, setIncludeRoster] = useState(true);
  const [includePrimary, setIncludePrimary] = useState(true);
  const [includeSecondary, setIncludeSecondary] = useState(false);
  const [targetField, setTargetField] = useState<'primary' | 'secondary' | 'both'>('primary');

  // Collect all eligible unique players based on source selection
  const combinedPlayerPool = useMemo(() => {
    const map = new Map<string, Player>();

    if (includeRoster) {
      roster.forEach((p) => map.set(p.id, p));
    }
    if (includePrimary) {
      primaryTeams.flat().forEach((p) => {
        if (p) map.set(p.id, p);
      });
    }
    if (includeSecondary) {
      secondaryTeams.flat().forEach((p) => {
        if (p) map.set(p.id, p);
      });
    }

    return Array.from(map.values());
  }, [includeRoster, includePrimary, includeSecondary, roster, primaryTeams, secondaryTeams]);

  // Run optimization on the player pool
  const optimizationResult: OptimizationResult = useMemo(() => {
    return optimizeTeams(combinedPlayerPool, {
      teamCount: 8,
      slotsPerTeam: 5,
    });
  }, [combinedPlayerPool]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (targetField === 'both') {
      // Run two consecutive optimizations for primary and secondary fields
      const firstPass = optimizeTeams(combinedPlayerPool, { teamCount: 8, slotsPerTeam: 5 });
      const remainingForSecond = firstPass.benchPlayers;
      const secondPass = optimizeTeams(remainingForSecond, { teamCount: 8, slotsPerTeam: 5 });

      onApplyOptimization('both', firstPass.teams, secondPass.teams);
    } else {
      onApplyOptimization(targetField, optimizationResult.teams);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto border ${
          isParchment
            ? 'parchment-card border-[#c09761] text-[#3d2008]'
            : 'bg-slate-900 border-slate-700/80 text-slate-100'
        }`}
      >
        {/* TOP HEADER */}
        <div
          className={`px-4 sm:px-6 py-3.5 sm:py-4 border-b flex items-center justify-between shrink-0 ${
            isParchment
              ? 'bg-[#ecd8b5] border-[#c09761]'
              : 'bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shadow-md ${
                isParchment
                  ? 'bg-[#ebd4b3] border-[#c09761] text-[#7a4417]'
                  : 'bg-blue-600/30 border-blue-400/40 text-blue-300'
              }`}
            >
              <Sparkles size={22} className={isParchment ? 'text-[#8b4b12]' : 'animate-pulse text-amber-300'} />
            </div>
            <div>
              <h2
                className={`text-sm sm:text-lg font-black flex items-center gap-2 ${
                  isParchment ? 'text-[#3b1f06] font-serif' : 'text-white'
                }`}
              >
                <span>Gerador Inteligente de Times</span>
                <span
                  className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border ${
                    isParchment
                      ? 'bg-[#eed7b3] text-[#69390e] border-[#c09761]'
                      : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                  }`}
                >
                  Poder & Sinergia
                </span>
              </h2>
              <p className={`text-[11px] sm:text-xs ${isParchment ? 'text-[#7d532b]' : 'text-slate-300'}`}>
                Análise automática de atributos (Poder, Glória, Penas, Montaria) e equilíbrio de classes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              isParchment
                ? 'text-[#7d532b] hover:text-[#3d2008] hover:bg-[#dfc49c]'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/80'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* SOURCE DATA FILTERS & DESTINATION CONTROLS */}
          <div
            className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
              isParchment
                ? 'bg-[#f7ebda] border-[#cbb085]'
                : 'bg-slate-800/80 border-slate-700/80'
            }`}
          >
            <div>
              <span className={`text-xs font-bold block mb-1.5 ${isParchment ? 'text-[#5a3311]' : 'text-slate-300'}`}>
                1. Selecionar Origem dos Jogadores:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <label
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                    isParchment
                      ? 'bg-[#fffcf4] border-[#c29c67] text-[#4d2807]'
                      : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={includeRoster}
                    onChange={(e) => setIncludeRoster(e.target.checked)}
                    className="accent-[#7a4417] rounded"
                  />
                  <span>Banco ({roster.length})</span>
                </label>
                <label
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                    isParchment
                      ? 'bg-[#fffcf4] border-[#c29c67] text-[#4d2807]'
                      : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={includePrimary}
                    onChange={(e) => setIncludePrimary(e.target.checked)}
                    className="accent-[#7a4417] rounded"
                  />
                  <span>Campo Primário ({primaryTeams.flat().filter(Boolean).length})</span>
                </label>
                <label
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                    isParchment
                      ? 'bg-[#fffcf4] border-[#c29c67] text-[#4d2807]'
                      : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={includeSecondary}
                    onChange={(e) => setIncludeSecondary(e.target.checked)}
                    className="accent-[#7a4417] rounded"
                  />
                  <span>Campo Secundário ({secondaryTeams.flat().filter(Boolean).length})</span>
                </label>
              </div>
            </div>

            {/* Target Field */}
            <div className="shrink-0 w-full md:w-auto">
              <span className={`text-xs font-bold block mb-1.5 ${isParchment ? 'text-[#5a3311]' : 'text-slate-300'}`}>
                2. Aplicar Times Gerados em:
              </span>
              <div
                className={`flex items-center gap-1 p-1 rounded-xl border ${
                  isParchment
                    ? 'bg-[#ecd8b5] border-[#c09761]'
                    : 'bg-slate-900/90 border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setTargetField('primary')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    targetField === 'primary'
                      ? isParchment
                        ? 'bg-gradient-to-r from-[#7a4417] to-[#9c5b23] text-white shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                      : isParchment
                        ? 'text-[#69421c] hover:text-[#3d2008]'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Campo Primário
                </button>
                <button
                  type="button"
                  onClick={() => setTargetField('secondary')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    targetField === 'secondary'
                      ? isParchment
                        ? 'bg-gradient-to-r from-[#7a4417] to-[#9c5b23] text-white shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                      : isParchment
                        ? 'text-[#69421c] hover:text-[#3d2008]'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Campo Secundário
                </button>
                <button
                  type="button"
                  onClick={() => setTargetField('both')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    targetField === 'both'
                      ? isParchment
                        ? 'bg-[#532b0a] text-white shadow-xs'
                        : 'bg-indigo-600 text-white shadow-xs'
                      : isParchment
                        ? 'text-[#69421c] hover:text-[#3d2008]'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Ambos (80 vagas)
                </button>
              </div>
            </div>
          </div>

          {/* AI ANALYSIS METRICS BANNER */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Metric 1: Total Players */}
            <div
              className={`border rounded-xl p-3 flex items-center gap-3 ${
                isParchment
                  ? 'bg-[#f7ebda] border-[#cbb085]'
                  : 'bg-slate-800/60 border-slate-700/80'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  isParchment
                    ? 'bg-[#e2edf4] border-[#95bed5] text-[#16435c]'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}
              >
                <Users size={18} />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-medium truncate ${isParchment ? 'text-[#7a4819]' : 'text-slate-400'}`}>
                  Analisados
                </p>
                <p className={`text-base sm:text-lg font-black ${isParchment ? 'text-[#3d2008]' : 'text-white'}`}>
                  {combinedPlayerPool.length}{' '}
                  <span className={`text-xs font-normal ${isParchment ? 'text-[#7d532b]' : 'text-slate-400'}`}>jogadores</span>
                </p>
              </div>
            </div>

            {/* Metric 2: Average Team Power */}
            <div
              className={`border rounded-xl p-3 flex items-center gap-3 ${
                isParchment
                  ? 'bg-[#f7ebda] border-[#cbb085]'
                  : 'bg-slate-800/60 border-slate-700/80'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  isParchment
                    ? 'bg-[#fef3c7] border-[#fde68a] text-[#92400e]'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                <Swords size={18} />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-medium truncate ${isParchment ? 'text-[#7a4819]' : 'text-slate-400'}`}>
                  Média de Poder
                </p>
                <p className={`text-base sm:text-lg font-black ${isParchment ? 'text-[#8b4b12]' : 'text-amber-300'}`}>
                  ⚔️ {formatPowerNumber(optimizationResult.overallAveragePower)}
                </p>
              </div>
            </div>

            {/* Metric 3: Power Disparity */}
            <div
              className={`border rounded-xl p-3 flex items-center gap-3 ${
                isParchment
                  ? 'bg-[#f7ebda] border-[#cbb085]'
                  : 'bg-slate-800/60 border-slate-700/80'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  isParchment
                    ? 'bg-[#dcfce7] border-[#bbf7d0] text-[#15803d]'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                <Scale size={18} />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-medium truncate ${isParchment ? 'text-[#7a4819]' : 'text-slate-400'}`}>
                  Equilíbrio de Poder
                </p>
                <p className={`text-base sm:text-lg font-black ${isParchment ? 'text-[#15803d]' : 'text-emerald-300'}`}>
                  ±{optimizationResult.powerDisparityPercent}%{' '}
                  <span className={`text-xs font-normal ${isParchment ? 'text-[#7d532b]' : 'text-slate-400'}`}>variação</span>
                </p>
              </div>
            </div>

            {/* Metric 4: Class Synergy */}
            <div
              className={`border rounded-xl p-3 flex items-center gap-3 ${
                isParchment
                  ? 'bg-[#f7ebda] border-[#cbb085]'
                  : 'bg-slate-800/60 border-slate-700/80'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  isParchment
                    ? 'bg-[#f3e8ff] border-[#e9d5ff] text-[#7e22ce]'
                    : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                }`}
              >
                <TrendingUp size={18} />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-medium truncate ${isParchment ? 'text-[#7a4819]' : 'text-slate-400'}`}>
                  Sinergia de Classes
                </p>
                <p className={`text-base sm:text-lg font-black ${isParchment ? 'text-[#7e22ce]' : 'text-purple-300'}`}>
                  {optimizationResult.synergyScore}%{' '}
                  <span className={`text-xs font-normal ${isParchment ? 'text-[#7d532b]' : 'text-slate-400'}`}>ótima</span>
                </p>
              </div>
            </div>
          </div>

          {/* ROLES COVERAGE SUMMARY */}
          <div
            className={`border rounded-xl p-2.5 sm:p-3 flex items-center justify-between flex-wrap gap-2 text-xs ${
              isParchment
                ? 'bg-[#fffcf4] border-[#cbb085]'
                : 'bg-slate-800/40 border-slate-700/60'
            }`}
          >
            <span className={isParchment ? 'text-[#5a3311] font-semibold' : 'text-slate-400 font-semibold'}>
              Distribuição de Funções no Banco:
            </span>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1 font-bold ${isParchment ? 'text-[#0284c7]' : 'text-sky-400'}`}>
                <Shield size={14} /> {optimizationResult.rolesSummary.Tanks} Tanks
              </span>
              <span className={`flex items-center gap-1 font-bold ${isParchment ? 'text-[#16a34a]' : 'text-emerald-400'}`}>
                <Heart size={14} /> {optimizationResult.rolesSummary.Healers} Healers
              </span>
              <span className={`flex items-center gap-1 font-bold ${isParchment ? 'text-[#d97706]' : 'text-amber-400'}`}>
                <Wand2 size={14} /> {optimizationResult.rolesSummary.Suportes} Suportes
              </span>
              <span className={`flex items-center gap-1 font-bold ${isParchment ? 'text-[#e11d48]' : 'text-rose-400'}`}>
                <Swords size={14} /> {optimizationResult.rolesSummary.DPS} DPS
              </span>
            </div>
          </div>

          {/* 8 TEAMS PREVIEW GRID */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${isParchment ? 'text-[#3b1f06]' : 'text-white'}`}>
                <Zap size={14} className={isParchment ? 'text-[#8b4b12]' : 'text-amber-400'} />
                <span>Prévia dos 8 Times Gerados com Poder & Classes Balanceados:</span>
              </h3>
              <span className={`text-[11px] ${isParchment ? 'text-[#7d532b]' : 'text-slate-400'}`}>
                {optimizationResult.totalPlayersAssigned}/40 escalados
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {optimizationResult.teams.map((team, teamIndex) => {
                const stats = optimizationResult.teamStats[teamIndex];
                const filledCount = team.filter(Boolean).length;

                return (
                  <div
                    key={`preview-team-${teamIndex}`}
                    className={`border rounded-xl p-3 flex flex-col justify-between transition-colors shadow-sm ${
                      isParchment
                        ? 'bg-[#fffcf4] border-[#cbb085] hover:border-[#8b5a2b]'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {/* Team Header */}
                    <div
                      className={`flex items-center justify-between border-b pb-2 mb-2 ${
                        isParchment ? 'border-[#ecd8b5]' : 'border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black ${isParchment ? 'text-[#8c460d]' : 'text-blue-400'}`}>
                          Time {teamIndex + 1}
                        </span>
                        <span className={`text-[10px] font-medium ${isParchment ? 'text-[#7d532b]' : 'text-slate-400'}`}>
                          ({filledCount}/5)
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${
                          isParchment
                            ? 'text-[#8c460d] bg-[#fef3c7] border-[#fde68a]'
                            : 'text-amber-300 bg-amber-950/60 border-amber-800/50'
                        }`}
                      >
                        ⚔️ {formatPowerNumber(stats?.totalPower || 0)}
                      </span>
                    </div>

                    {/* Roles Badges for this team */}
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold mb-2 ${isParchment ? 'text-[#5a3311]' : 'text-slate-300'}`}>
                      <span
                        title="Tanks"
                        className={`px-1 rounded ${
                          stats?.roles.Tank
                            ? isParchment ? 'bg-[#e0f2fe] text-[#0369a1]' : 'bg-sky-900/60 text-sky-300'
                            : 'opacity-40'
                        }`}
                      >
                        🛡️{stats?.roles.Tank || 0}
                      </span>
                      <span
                        title="Healers"
                        className={`px-1 rounded ${
                          stats?.roles.Healer
                            ? isParchment ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-emerald-900/60 text-emerald-300'
                            : 'opacity-40'
                        }`}
                      >
                        💚{stats?.roles.Healer || 0}
                      </span>
                      <span
                        title="Suportes"
                        className={`px-1 rounded ${
                          stats?.roles.Suporte
                            ? isParchment ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-amber-900/60 text-amber-300'
                            : 'opacity-40'
                        }`}
                      >
                        ✨{stats?.roles.Suporte || 0}
                      </span>
                      <span
                        title="DPS"
                        className={`px-1 rounded ${
                          stats?.roles.DPS
                            ? isParchment ? 'bg-[#ffe4e6] text-[#be123c]' : 'bg-rose-900/60 text-rose-300'
                            : 'opacity-40'
                        }`}
                      >
                        🗡️{stats?.roles.DPS || 0}
                      </span>
                    </div>

                    {/* Slot members */}
                    <div className="space-y-1.5">
                      {team.map((player, slotIndex) => {
                        if (!player) {
                          return (
                            <div
                              key={`preview-t${teamIndex}-s${slotIndex}`}
                              className={`h-8 rounded-lg border border-dashed flex items-center justify-center text-[10px] ${
                                isParchment
                                  ? 'border-[#cbb085] bg-[#f7ebda]/50 text-[#96734c]'
                                  : 'border-slate-700/80 bg-slate-900/40 text-slate-500'
                              }`}
                            >
                              Vazio
                            </div>
                          );
                        }

                        const rating = calculatePlayerRating(player);

                        return (
                          <div
                            key={`preview-player-${player.id}`}
                            className={`px-2 py-1.5 rounded-lg border flex items-center justify-between gap-1.5 ${
                              isParchment
                                ? 'bg-[#f7ebda] border-[#cbb085]'
                                : 'bg-slate-900/80 border-slate-700/60'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <ClassIcon name={player.jobClass} size={13} />
                              <span className={`text-xs font-bold truncate ${isParchment ? 'text-[#3b1f06]' : 'text-white'}`}>
                                {player.name}
                              </span>
                            </div>
                            <span className={`text-[10px] font-mono shrink-0 ${isParchment ? 'text-[#7d532b]' : 'text-slate-400'}`}>
                              {formatPowerNumber(rating)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isParchment ? 'bg-[#ecd8b5] border-[#c09761]' : 'bg-slate-800/90 border-slate-700'
          }`}
        >
          <div className={`flex items-center gap-2 text-xs ${isParchment ? 'text-[#5a3311]' : 'text-slate-400'}`}>
            <CheckCircle2 size={15} className={isParchment ? 'text-emerald-700' : 'text-emerald-400'} />
            <span>
              Balanceamento automático considerando Nv. Penas, Poder, Glória e Montaria.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isParchment
                  ? 'text-[#69421c] hover:bg-[#dfc49c]'
                  : 'bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200'
              }`}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={combinedPlayerPool.length === 0}
              className={`flex items-center gap-2 px-5 py-2 active:scale-95 text-white rounded-xl text-xs font-extrabold shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
                isParchment
                  ? 'bg-gradient-to-r from-[#7a4417] to-[#9c5b23] hover:brightness-110 border border-[#c5994f]'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25'
              }`}
            >
              <Sparkles size={15} className="text-amber-300" />
              <span>
                {targetField === 'both'
                  ? 'Aplicar aos 2 Campos (80 Vagas)'
                  : targetField === 'primary'
                  ? 'Aplicar ao Campo Primário'
                  : 'Aplicar ao Campo Secundário'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
