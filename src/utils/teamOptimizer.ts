import { Player } from '../types';
import { JOB_CLASSES } from '../constants/classes';

export interface TeamOptimizationStats {
  teamIndex: number;
  totalPower: number;
  averagePower: number;
  roles: {
    Tank: number;
    Healer: number;
    Suporte: number;
    DPS: number;
  };
  classes: string[];
  leaderName: string;
}

export interface OptimizationResult {
  teams: (Player | null)[][];
  benchPlayers: Player[];
  teamStats: TeamOptimizationStats[];
  overallAveragePower: number;
  minTeamPower: number;
  maxTeamPower: number;
  powerDisparityPercent: number;
  synergyScore: number; // 0 - 100
  totalPlayersAssigned: number;
  rolesSummary: {
    Tanks: number;
    Healers: number;
    Suportes: number;
    DPS: number;
  };
}

/**
 * Parses user input power strings like "1.2M", "450k", "500.000", "350000" into raw numeric values.
 */
export function parsePowerString(raw?: string | number): number {
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === 'number') return isNaN(raw) ? 0 : raw;

  const str = String(raw).trim().toLowerCase().replace(/\s+/g, '');
  if (!str) return 0;

  // Handle "1.5m" or "1,5m"
  if (str.endsWith('m') || str.endsWith('kk') || str.includes('mi')) {
    const num = parseFloat(str.replace(/[^0-9.,]/g, '').replace(',', '.'));
    return isNaN(num) ? 0 : Math.round(num * 1_000_000);
  }

  // Handle "450k" or "450 mil"
  if (str.endsWith('k') || str.includes('mil')) {
    const num = parseFloat(str.replace(/[^0-9.,]/g, '').replace(',', '.'));
    return isNaN(num) ? 0 : Math.round(num * 1_000);
  }

  // Format with dots or commas like "450.000" or "450,000"
  const clean = str.replace(/[.,]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculates a composite combat power score for optimization weighting.
 */
export function calculatePlayerRating(player: Player): number {
  let basePower = 0;
  if (player.power) {
    basePower = parsePowerString(player.power);
  } else if (player.powerAndGlory) {
    basePower = parsePowerString(player.powerAndGlory);
  }

  // If no power specified, estimate from level
  if (basePower <= 0) {
    basePower = (player.level || 90) * 3500 + 100_000;
  }

  // Add weight for Feather Level and Mount Level
  const fLvl = Number(player.featherLevel || player.feathersLevel) || 0;
  const mLvl = Number(player.mountLevel) || 0;
  const featherBonus = fLvl * 12_000;
  const mountBonus = mLvl * 15_000;

  return basePower + featherBonus + mountBonus;
}

/**
 * Format raw power into human-readable compact notation (e.g. 1.25M, 450K)
 */
export function formatPowerNumber(value: number): string {
  if (!value || isNaN(value)) return '0';
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + 'K';
  }
  return value.toLocaleString('pt-BR');
}

/**
 * Resolves the canonical role of a player.
 */
export function getPlayerRole(player: Player): 'Tank' | 'Healer' | 'Suporte' | 'DPS' {
  if (player.role && ['Tank', 'Healer', 'Suporte', 'DPS'].includes(player.role)) {
    return player.role;
  }
  const match = JOB_CLASSES.find((jc) => jc.name.toLowerCase() === player.jobClass.toLowerCase());
  return (match?.role as 'Tank' | 'Healer' | 'Suporte' | 'DPS') || 'DPS';
}

/**
 * Main AI-inspired Team Balancing & Class Synergy Engine.
 *
 * It analyzes:
 * 1. Player Job Class & Role (Tank, Healer, Buffer/Support, DPS).
 * 2. Player Combat Rating (Power, Feathers, Mount).
 * 3. Class Diversity & Synergies (e.g. pairing buffers with DPS, assigning dedicated Healers).
 * 4. Equalizes total team power across all 8 teams using snake drafting and role-constrained swap optimization.
 */
export function optimizeTeams(
  availablePlayers: Player[],
  options: {
    teamCount?: number;
    slotsPerTeam?: number;
    prioritizeHealers?: boolean;
    prioritizeTanks?: boolean;
    balancePower?: boolean;
  } = {}
): OptimizationResult {
  const teamCount = options.teamCount || 8;
  const slotsPerTeam = options.slotsPerTeam || 5;
  const maxAllocated = teamCount * slotsPerTeam; // 40

  // Filter valid players and sort by rating
  const pool = [...availablePlayers].map((p) => ({
    player: p,
    role: getPlayerRole(p),
    rating: calculatePlayerRating(p),
  }));

  // Separate by roles
  const healers = pool.filter((p) => p.role === 'Healer').sort((a, b) => b.rating - a.rating);
  const tanks = pool.filter((p) => p.role === 'Tank').sort((a, b) => b.rating - a.rating);
  const supports = pool.filter((p) => p.role === 'Suporte').sort((a, b) => b.rating - a.rating);
  const dps = pool.filter((p) => p.role === 'DPS').sort((a, b) => b.rating - a.rating);

  // Initialize 8 teams with 5 slots each
  const teams: (Player | null)[][] = Array.from({ length: teamCount }, () =>
    Array.from({ length: slotsPerTeam }, () => null)
  );

  const teamPowers = new Array(teamCount).fill(0);

  // Helper to place player in a specific team and slot
  const assign = (teamIdx: number, slotIdx: number, item: { player: Player; rating: number }) => {
    teams[teamIdx][slotIdx] = item.player;
    teamPowers[teamIdx] += item.rating;
  };

  // Helper to find first empty slot in team
  const getNextEmptySlot = (teamIdx: number): number => {
    return teams[teamIdx].findIndex((s) => s === null);
  };

  // PHASE 1: Distribute Healers (Slot 1 in teams)
  // Use snake or lowest-power team assignment for balanced distribution
  healers.forEach((h, idx) => {
    if (idx < teamCount) {
      // Pick team with lowest power that doesn't have a healer yet
      const candidateTeams = Array.from({ length: teamCount }, (_, i) => i)
        .filter((t) => !teams[t].some((p) => p && getPlayerRole(p) === 'Healer'))
        .sort((a, b) => teamPowers[a] - teamPowers[b]);

      const targetTeam = candidateTeams[0] ?? (idx % teamCount);
      const slot = getNextEmptySlot(targetTeam);
      if (slot !== -1) assign(targetTeam, slot, h);
    } else {
      dps.push(h); // overflow healers become backup DPS/supports
    }
  });

  // PHASE 2: Distribute Tanks (Slot 0 in teams)
  tanks.forEach((tk, idx) => {
    if (idx < teamCount) {
      const candidateTeams = Array.from({ length: teamCount }, (_, i) => i)
        .filter((t) => !teams[t].some((p) => p && getPlayerRole(p) === 'Tank'))
        .sort((a, b) => teamPowers[a] - teamPowers[b]);

      const targetTeam = candidateTeams[0] ?? (idx % teamCount);
      const slot = getNextEmptySlot(targetTeam);
      if (slot !== -1) assign(targetTeam, slot, tk);
    } else {
      dps.push(tk);
    }
  });

  // PHASE 3: Distribute Buffers / Support (Menestrel, Cigana, Professor, Criador)
  supports.forEach((sp, idx) => {
    if (idx < teamCount) {
      const candidateTeams = Array.from({ length: teamCount }, (_, i) => i)
        .filter((t) => !teams[t].some((p) => p && getPlayerRole(p) === 'Suporte'))
        .sort((a, b) => teamPowers[a] - teamPowers[b]);

      const targetTeam = candidateTeams[0] ?? (idx % teamCount);
      const slot = getNextEmptySlot(targetTeam);
      if (slot !== -1) assign(targetTeam, slot, sp);
    } else {
      dps.push(sp);
    }
  });

  // Re-sort DPS by rating descending
  dps.sort((a, b) => b.rating - a.rating);

  // PHASE 4: Fill remaining slots with DPS / All-rounders using greedy min-power allocation
  dps.forEach((d) => {
    // Find candidate teams with at least one empty slot
    const teamsWithRoom = Array.from({ length: teamCount }, (_, i) => i)
      .filter((t) => teams[t].some((s) => s === null))
      .sort((a, b) => teamPowers[a] - teamPowers[b]);

    if (teamsWithRoom.length > 0) {
      const bestTeam = teamsWithRoom[0];
      const slot = getNextEmptySlot(bestTeam);
      if (slot !== -1) {
        assign(bestTeam, slot, d);
      }
    }
  });

  // PHASE 5: Fine-tuning Power Equalization (Role-Preserving Swap Optimization)
  // Runs a limited number of iterations to swap players of identical or compatible roles
  // between the highest-power team and lowest-power team to minimize variance.
  for (let iter = 0; iter < 30; iter++) {
    let highestTeam = 0;
    let lowestTeam = 0;
    for (let t = 1; t < teamCount; t++) {
      if (teamPowers[t] > teamPowers[highestTeam]) highestTeam = t;
      if (teamPowers[t] < teamPowers[lowestTeam]) lowestTeam = t;
    }

    const currentDiff = teamPowers[highestTeam] - teamPowers[lowestTeam];
    if (currentDiff < 30_000) break; // Already within 30k power difference

    let bestSwap: { slotHigh: number; slotLow: number; improvement: number } | null = null;

    for (let sh = 0; sh < slotsPerTeam; sh++) {
      const pHigh = teams[highestTeam][sh];
      if (!pHigh) continue;
      const roleHigh = getPlayerRole(pHigh);
      const ratingHigh = calculatePlayerRating(pHigh);

      for (let sl = 0; sl < slotsPerTeam; sl++) {
        const pLow = teams[lowestTeam][sl];
        if (!pLow) continue;
        const roleLow = getPlayerRole(pLow);
        const ratingLow = calculatePlayerRating(pLow);

        // Allow swap only if same role or both are non-healers, and high > low
        if (roleHigh === roleLow && ratingHigh > ratingLow) {
          const delta = ratingHigh - ratingLow;
          const newDiff = Math.abs(currentDiff - 2 * delta);
          const improvement = currentDiff - newDiff;

          if (improvement > 0 && (!bestSwap || improvement > bestSwap.improvement)) {
            bestSwap = { slotHigh: sh, slotLow: sl, improvement };
          }
        }
      }
    }

    if (bestSwap && bestSwap.improvement > 5_000) {
      const temp = teams[highestTeam][bestSwap.slotHigh];
      teams[highestTeam][bestSwap.slotHigh] = teams[lowestTeam][bestSwap.slotLow];
      teams[lowestTeam][bestSwap.slotLow] = temp;

      // Recalculate powers for both teams
      teamPowers[highestTeam] = teams[highestTeam].reduce(
        (sum, p) => sum + (p ? calculatePlayerRating(p) : 0),
        0
      );
      teamPowers[lowestTeam] = teams[lowestTeam].reduce(
        (sum, p) => sum + (p ? calculatePlayerRating(p) : 0),
        0
      );
    } else {
      break;
    }
  }

  // Collect assigned IDs to determine remaining bench players
  const assignedIds = new Set<string>();
  teams.flat().forEach((p) => {
    if (p) assignedIds.add(p.id);
  });

  const benchPlayers = availablePlayers.filter((p) => !assignedIds.has(p.id));

  // Compute detailed statistics
  const teamStats: TeamOptimizationStats[] = teams.map((team, idx) => {
    const validPlayers = team.filter(Boolean) as Player[];
    const totalP = validPlayers.reduce((sum, p) => sum + calculatePlayerRating(p), 0);
    const avgP = validPlayers.length > 0 ? Math.round(totalP / validPlayers.length) : 0;

    const roles = { Tank: 0, Healer: 0, Suporte: 0, DPS: 0 };
    const classes: string[] = [];

    validPlayers.forEach((p) => {
      const r = getPlayerRole(p);
      roles[r] += 1;
      classes.push(p.jobClass);
    });

    const leader = validPlayers.find((p) => p.isLeader) || validPlayers[0];

    return {
      teamIndex: idx,
      totalPower: totalP,
      averagePower: avgP,
      roles,
      classes,
      leaderName: leader ? leader.name : `Time ${idx + 1}`,
    };
  });

  const allTotals = teamStats.map((ts) => ts.totalPower).filter((p) => p > 0);
  const overallAvg =
    allTotals.length > 0 ? Math.round(allTotals.reduce((a, b) => a + b, 0) / allTotals.length) : 0;
  const minP = allTotals.length > 0 ? Math.min(...allTotals) : 0;
  const maxP = allTotals.length > 0 ? Math.max(...allTotals) : 0;
  const disparity = overallAvg > 0 ? Math.round(((maxP - minP) / overallAvg) * 100) : 0;

  // Calculate Synergy Score (0 - 100):
  // Rewards teams having at least 1 Healer, 1 Tank, 1 Support, and balanced power
  let synergyPoints = 0;
  teamStats.forEach((ts) => {
    if (ts.roles.Healer >= 1) synergyPoints += 4;
    if (ts.roles.Tank >= 1) synergyPoints += 3;
    if (ts.roles.Suporte >= 1) synergyPoints += 3;
    if (ts.roles.DPS >= 1) synergyPoints += 2.5;
  });

  // Bonus for low power disparity
  const balanceBonus = Math.max(0, 100 - disparity);
  const synergyScore = Math.min(100, Math.round((synergyPoints / (teamCount * 12.5)) * 80 + balanceBonus * 0.2));

  return {
    teams,
    benchPlayers,
    teamStats,
    overallAveragePower: overallAvg,
    minTeamPower: minP,
    maxTeamPower: maxP,
    powerDisparityPercent: disparity,
    synergyScore,
    totalPlayersAssigned: assignedIds.size,
    rolesSummary: {
      Tanks: tanks.length,
      Healers: healers.length,
      Suportes: supports.length,
      DPS: dps.length,
    },
  };
}
