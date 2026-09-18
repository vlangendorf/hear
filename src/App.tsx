import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  SlidersHorizontal,
  X,
  Users,
  ShieldCheck,
  LogOut,
  Eye,
  UserCheck,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Player, DragItemData, AuthSession, User } from './types';
import { INITIAL_TIME1_PLAYERS, FULL_40_PLAYERS_SAMPLE, JOB_CLASSES } from './constants/classes';
import { CampoBoard } from './components/CampoBoard';
import { PlayerRosterTable } from './components/PlayerRosterTable';
import { EditPlayerModal } from './components/EditPlayerModal';
import { SlotPickerModal } from './components/SlotPickerModal';
import { ExportModal } from './components/ExportModal';
import { AutoTeamOptimizerModal } from './components/AutoTeamOptimizerModal';
import { exportTeamListToPdf } from './utils/exportPdf';
import { authService } from './auth/authService';
import { LoginScreen } from './components/LoginScreen';
import { UserManagementModal } from './components/UserManagementModal';
import { useTheme } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';

const LOCAL_STORAGE_KEY_V2 = 'ragnarok_team_raid_40_v2';
const LOCAL_STORAGE_KEY_V1 = 'ragnarok_team_raid_40_v1';

const RAID_TARGETS = [
  'Nenhum',
  'Thanatos Raide',
  'Guerra do Emperium (WoE)',
  'Torre sem Fim (Endless)',
  'MVP Caçada Global',
  'GvG Confronto Tático',
];

const createEmptyTeams = (): (Player | null)[][] =>
  Array.from({ length: 8 }, () => Array.from({ length: 5 }, () => null));

export default function App() {
  const { isParchment } = useTheme();
  // CAMPO PRIMARIO: 8 teams of 5 slots each
  const [primaryTeams, setPrimaryTeams] = useState<(Player | null)[][]>(() => {
    try {
      const savedV2 = localStorage.getItem(LOCAL_STORAGE_KEY_V2);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (parsed.primaryTeams && parsed.primaryTeams.length === 8) {
          return parsed.primaryTeams;
        }
      }
      const savedV1 = localStorage.getItem(LOCAL_STORAGE_KEY_V1);
      if (savedV1) {
        const parsed = JSON.parse(savedV1);
        if (parsed.teams && parsed.teams.length === 8) {
          return parsed.teams;
        }
      }
    } catch (e) {
      console.error(e);
    }
    const initial = createEmptyTeams();
    initial[0] = [...INITIAL_TIME1_PLAYERS];
    return initial;
  });

  // CAMPO SECUNDARIO: 8 teams of 5 slots each (exact identical structure)
  const [secondaryTeams, setSecondaryTeams] = useState<(Player | null)[][]>(() => {
    try {
      const savedV2 = localStorage.getItem(LOCAL_STORAGE_KEY_V2);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (parsed.secondaryTeams && parsed.secondaryTeams.length === 8) {
          return parsed.secondaryTeams;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return createEmptyTeams();
  });

  // Bench roster
  const [roster, setRoster] = useState<Player[]>(() => {
    try {
      const savedV2 = localStorage.getItem(LOCAL_STORAGE_KEY_V2);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed.roster)) {
          return parsed.roster;
        }
      }
      const savedV1 = localStorage.getItem(LOCAL_STORAGE_KEY_V1);
      if (savedV1) {
        const parsed = JSON.parse(savedV1);
        if (Array.isArray(parsed.roster)) {
          return parsed.roster;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return FULL_40_PLAYERS_SAMPLE.slice(5, 20);
  });

  // Primary board meta
  const [primaryLeader, setPrimaryLeader] = useState<string>('vseteRR');
  const [isEditingPrimaryLeader, setIsEditingPrimaryLeader] = useState<boolean>(false);
  const [primaryTarget, setPrimaryTarget] = useState<string>('Nenhum');
  const [isExportingPrimaryPdf, setIsExportingPrimaryPdf] = useState(false);

  // Secondary board meta
  const [secondaryLeader, setSecondaryLeader] = useState<string>('vseteRR');
  const [isEditingSecondaryLeader, setIsEditingSecondaryLeader] = useState<boolean>(false);
  const [secondaryTarget, setSecondaryTarget] = useState<string>('Nenhum');
  const [isExportingSecondaryPdf, setIsExportingSecondaryPdf] = useState(false);

  // UI Selection & Modals
  const [selectedSlot, setSelectedSlot] = useState<{
    teamIndex: number;
    slotIndex: number;
    fieldId?: 'primary' | 'secondary';
  } | null>(null);

  const [editingPlayerContext, setEditingPlayerContext] = useState<{
    player: Player;
    teamIndex?: number;
    slotIndex?: number;
    fieldId?: 'primary' | 'secondary';
    fromRoster?: boolean;
  } | null>(null);

  const [slotPicker, setSlotPicker] = useState<{
    isOpen: boolean;
    teamIndex: number;
    slotIndex: number;
    fieldId: 'primary' | 'secondary';
  } | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalTargetField, setExportModalTargetField] = useState<'primary' | 'secondary'>('primary');
  const [isAutoOptimizerOpen, setIsAutoOptimizerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRosterMobile, setShowRosterMobile] = useState(false);

  // Authentication & Permissions State
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    return authService.getStoredSession();
  });
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  const currentUser = authSession?.user || null;
  const isAuthenticated = Boolean(authSession && authSession.isAuthenticated && currentUser);
  const isAdmin = currentUser?.role === 'ADMIN';
  const isViewer = currentUser?.role === 'VIEWER';
  const isGuest = currentUser?.role === 'GUEST' || authSession?.role === 'GUEST';
  const canEdit = isAdmin;

  const handleLogout = () => {
    authService.logout();
    setAuthSession(null);
    showToast('Sessão encerrada com sucesso.');
  };

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY_V2,
        JSON.stringify({
          primaryTeams,
          secondaryTeams,
          roster,
          primaryLeader,
          secondaryLeader,
          primaryTarget,
          secondaryTarget,
        })
      );
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [
    primaryTeams,
    secondaryTeams,
    roster,
    primaryLeader,
    secondaryLeader,
    primaryTarget,
    secondaryTarget,
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  // Drag & Drop Handler (supports internal drops, cross-field transfers, and roster drops)
  const handleDropPlayer = (
    targetField: 'primary' | 'secondary',
    targetTeam: number,
    targetSlot: number,
    data: DragItemData
  ) => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem alterar as equipes.');
      return;
    }

    const isTargetPrimary = targetField === 'primary';
    const targetTeams = isTargetPrimary ? primaryTeams : secondaryTeams;
    const setTargetTeams = isTargetPrimary ? setPrimaryTeams : setSecondaryTeams;
    const currentTargetPlayer = targetTeams[targetTeam][targetSlot];

    if (data.type === 'FROM_ROSTER') {
      const incomingPlayer = data.player;

      // Remove from roster
      setRoster((prev) => prev.filter((p) => p.id !== incomingPlayer.id));

      // Put into target slot
      setTargetTeams((prev) => {
        const next = prev.map((t) => [...t]);
        next[targetTeam][targetSlot] = incomingPlayer;
        return next;
      });

      if (currentTargetPlayer) {
        setRoster((prev) => [currentTargetPlayer, ...prev]);
        showToast(
          `${incomingPlayer.name} colocado no Time ${targetTeam + 1} (${
            isTargetPrimary ? 'Campo Primário' : 'Campo Secundário'
          }). ${currentTargetPlayer.name} voltou para a reserva.`
        );
      } else {
        showToast(
          `${incomingPlayer.name} alocado no Time ${targetTeam + 1} (${
            isTargetPrimary ? 'Campo Primário' : 'Campo Secundário'
          }).`
        );
      }
    } else if (data.type === 'FROM_GRID') {
      const sourceField = data.fromField || 'primary';
      const fromTeam = data.fromTeamIndex!;
      const fromSlot = data.fromSlotIndex!;

      // Same slot in same field
      if (sourceField === targetField && fromTeam === targetTeam && fromSlot === targetSlot) return;

      if (sourceField === targetField) {
        // Internal swap within the same field
        setTargetTeams((prev) => {
          const next = prev.map((t) => [...t]);
          const movingPlayer = next[fromTeam][fromSlot];
          next[fromTeam][fromSlot] = currentTargetPlayer;
          next[targetTeam][targetSlot] = movingPlayer;
          return next;
        });

        if (currentTargetPlayer) {
          showToast(`Troca realizada entre ${data.player.name} e ${currentTargetPlayer.name}!`);
        } else {
          showToast(
            `${data.player.name} movido para Time ${targetTeam + 1}, Vaga ${targetSlot + 1}.`
          );
        }
      } else {
        // Cross-board transfer / swap
        const setSourceTeams = sourceField === 'primary' ? setPrimaryTeams : setSecondaryTeams;
        const movingPlayer = data.player;

        setSourceTeams((prev) => {
          const next = prev.map((t) => [...t]);
          next[fromTeam][fromSlot] = currentTargetPlayer;
          return next;
        });

        setTargetTeams((prev) => {
          const next = prev.map((t) => [...t]);
          next[targetTeam][targetSlot] = movingPlayer;
          return next;
        });

        if (currentTargetPlayer) {
          showToast(`Troca entre campos: ${movingPlayer.name} ⇄ ${currentTargetPlayer.name}!`);
        } else {
          showToast(
            `${movingPlayer.name} transferido para o ${
              isTargetPrimary ? 'Campo Primário' : 'Campo Secundário'
            }.`
          );
        }
      }
    }
  };

  // Dropping from grid back to side roster panel
  const handleDropFromGridToRoster = (data: DragItemData) => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem alterar as equipes.');
      return;
    }

    if (data.type !== 'FROM_GRID') return;
    const { fromTeamIndex, fromSlotIndex, player, fromField = 'primary' } = data;
    if (fromTeamIndex === undefined || fromSlotIndex === undefined) return;

    if (fromField === 'primary') {
      setPrimaryTeams((prev) => {
        const next = prev.map((t) => [...t]);
        next[fromTeamIndex][fromSlotIndex] = null;
        return next;
      });
    } else {
      setSecondaryTeams((prev) => {
        const next = prev.map((t) => [...t]);
        next[fromTeamIndex][fromSlotIndex] = null;
        return next;
      });
    }

    setRoster((prev) => {
      if (prev.some((p) => p.id === player.id)) return prev;
      return [player, ...prev];
    });

    showToast(`${player.name} removido da equipe e devolvido ao banco de reservas.`);
  };

  // Remove player directly from a slot
  const handleRemovePlayerFromSlot = (
    fieldId: 'primary' | 'secondary',
    teamIndex: number,
    slotIndex: number
  ) => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem remover jogadores.');
      return;
    }

    const teams = fieldId === 'primary' ? primaryTeams : secondaryTeams;
    const setTeams = fieldId === 'primary' ? setPrimaryTeams : setSecondaryTeams;
    const player = teams[teamIndex][slotIndex];
    if (!player) return;

    setTeams((prev) => {
      const next = prev.map((t) => [...t]);
      next[teamIndex][slotIndex] = null;
      return next;
    });

    setRoster((prev) => [player, ...prev]);
    showToast(`${player.name} movido para o banco de reserva.`);
  };

  // Clear single team in a field
  const handleClearTeam = (fieldId: 'primary' | 'secondary', teamIndex: number) => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem esvaziar equipes.');
      return;
    }

    const teams = fieldId === 'primary' ? primaryTeams : secondaryTeams;
    const setTeams = fieldId === 'primary' ? setPrimaryTeams : setSecondaryTeams;
    const players = teams[teamIndex].filter(Boolean) as Player[];
    if (players.length === 0) return;

    setTeams((prev) => {
      const next = prev.map((t) => [...t]);
      next[teamIndex] = [null, null, null, null, null];
      return next;
    });

    setRoster((prev) => [...players, ...prev]);
    showToast(
      `Time ${teamIndex + 1} de ${
        fieldId === 'primary' ? 'Campo Primário' : 'Campo Secundário'
      } esvaziado.`
    );
  };

  // Quick assign player from roster to first available slot
  const handleQuickAssignFromRoster = (player: Player) => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem alocar jogadores.');
      return;
    }

    // Try primary first
    for (let t = 0; t < 8; t++) {
      for (let s = 0; s < 5; s++) {
        if (!primaryTeams[t][s]) {
          setRoster((prev) => prev.filter((p) => p.id !== player.id));
          setPrimaryTeams((prev) => {
            const next = prev.map((team) => [...team]);
            next[t][s] = player;
            return next;
          });
          showToast(`${player.name} alocado no Campo Primário (Time ${t + 1}, Vaga ${s + 1})`);
          return;
        }
      }
    }
    // Then try secondary
    for (let t = 0; t < 8; t++) {
      for (let s = 0; s < 5; s++) {
        if (!secondaryTeams[t][s]) {
          setRoster((prev) => prev.filter((p) => p.id !== player.id));
          setSecondaryTeams((prev) => {
            const next = prev.map((team) => [...team]);
            next[t][s] = player;
            return next;
          });
          showToast(`${player.name} alocado no Campo Secundário (Time ${t + 1}, Vaga ${s + 1})`);
          return;
        }
      }
    }
    showToast('Todos os 80 slots (Primário e Secundário) estão ocupados!');
  };

  // Auto-fill slots using available roster (primary, secondary, or both)
  const handleAutoFillGrid = (targetField: 'primary' | 'secondary' | 'both' = 'both') => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem preencher as vagas.');
      return;
    }

    if (roster.length === 0) {
      showToast('O banco de reserva está vazio. Adicione nomes antes de preencher!');
      return;
    }

    const availableRoster = [...roster];
    let filledCount = 0;

    const nextPrimary = primaryTeams.map((team) => [...team]);
    const nextSecondary = secondaryTeams.map((team) => [...team]);

    // Fill primary if selected
    if (targetField === 'primary' || targetField === 'both') {
      for (let t = 0; t < 8; t++) {
        for (let s = 0; s < 5; s++) {
          if (!nextPrimary[t][s] && availableRoster.length > 0) {
            nextPrimary[t][s] = availableRoster.shift()!;
            filledCount++;
          }
        }
      }
    }

    // Fill secondary if selected
    if (targetField === 'secondary' || targetField === 'both') {
      for (let t = 0; t < 8; t++) {
        for (let s = 0; s < 5; s++) {
          if (!nextSecondary[t][s] && availableRoster.length > 0) {
            nextSecondary[t][s] = availableRoster.shift()!;
            filledCount++;
          }
        }
      }
    }

    if (filledCount === 0) {
      const fieldDesc =
        targetField === 'primary'
          ? 'O Campo Primário já está com todas as 40 vagas preenchidas!'
          : targetField === 'secondary'
          ? 'O Campo Secundário já está com todas as 40 vagas preenchidas!'
          : 'Todos os campos já estão com todas as vagas preenchidas!';
      showToast(fieldDesc);
      return;
    }

    setPrimaryTeams(nextPrimary);
    setSecondaryTeams(nextSecondary);
    setRoster(availableRoster);

    const targetDesc =
      targetField === 'primary'
        ? 'Campo Primário'
        : targetField === 'secondary'
        ? 'Campo Secundário'
        : 'campos';
    showToast(`${filledCount} vagas preenchidas no ${targetDesc} com nomes do banco!`);
  };

  // Reset grids back to roster (primary, secondary, or both)
  const handleResetGridToRoster = (targetField: 'primary' | 'secondary' | 'both' = 'both') => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem limpar as vagas.');
      return;
    }

    const playersToReturn: Player[] = [];

    if (targetField === 'primary' || targetField === 'both') {
      primaryTeams.forEach((t) => {
        t.forEach((p) => {
          if (p) playersToReturn.push(p);
        });
      });
    }

    if (targetField === 'secondary' || targetField === 'both') {
      secondaryTeams.forEach((t) => {
        t.forEach((p) => {
          if (p) playersToReturn.push(p);
        });
      });
    }

    if (playersToReturn.length === 0) {
      const fieldDesc =
        targetField === 'primary'
          ? 'O Campo Primário já está vazio.'
          : targetField === 'secondary'
          ? 'O Campo Secundário já está vazio.'
          : 'Os campos já estão vazios.';
      showToast(fieldDesc);
      return;
    }

    if (targetField === 'primary' || targetField === 'both') {
      setPrimaryTeams(createEmptyTeams());
    }
    if (targetField === 'secondary' || targetField === 'both') {
      setSecondaryTeams(createEmptyTeams());
    }

    setRoster((prev) => [...playersToReturn, ...prev]);

    const targetDesc =
      targetField === 'primary'
        ? 'Campo Primário'
        : targetField === 'secondary'
        ? 'Campo Secundário'
        : 'ambos os campos';
    showToast(`${playersToReturn.length} jogadores removidos do ${targetDesc} e devolvidos ao banco.`);
  };

  // Load full 40 preset into primary or secondary field
  const handleLoadFull40Preset = (targetField: 'primary' | 'secondary' = 'primary') => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem carregar presets.');
      return;
    }

    const fullTeams: (Player | null)[][] = [];
    for (let i = 0; i < 8; i++) {
      fullTeams.push(FULL_40_PLAYERS_SAMPLE.slice(i * 5, (i + 1) * 5));
    }
    if (targetField === 'primary') {
      setPrimaryTeams(fullTeams);
      setPrimaryLeader('vseteRR');
      showToast('40 jogadores carregados com sucesso no Campo Primário!');
    } else {
      setSecondaryTeams(fullTeams);
      setSecondaryLeader('vseteRR');
      showToast('40 jogadores carregados com sucesso no Campo Secundário!');
    }
  };

  // Apply intelligent optimization
  const handleApplyOptimization = (
    targetField: 'primary' | 'secondary' | 'both',
    optimizedTeams: (Player | null)[][],
    secondaryOptimizedTeams?: (Player | null)[][]
  ) => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem aplicar a otimização.');
      return;
    }

    const assignedIds = new Set<string>();

    if (targetField === 'primary' || targetField === 'both') {
      setPrimaryTeams(optimizedTeams);
      optimizedTeams.flat().forEach((p) => {
        if (p) assignedIds.add(p.id);
      });
    }

    if (targetField === 'secondary') {
      setSecondaryTeams(optimizedTeams);
      optimizedTeams.flat().forEach((p) => {
        if (p) assignedIds.add(p.id);
      });
    } else if (targetField === 'both' && secondaryOptimizedTeams) {
      setSecondaryTeams(secondaryOptimizedTeams);
      secondaryOptimizedTeams.flat().forEach((p) => {
        if (p) assignedIds.add(p.id);
      });
    }

    // Keep only remaining players in roster
    setRoster((prev) => prev.filter((p) => !assignedIds.has(p.id)));

    showToast(
      targetField === 'both'
        ? '80 vagas distribuídas e equilibradas por Poder e Classes nos dois campos!'
        : `Times do ${targetField === 'primary' ? 'Campo Primário' : 'Campo Secundário'} gerados e equilibrados com sucesso!`
    );
  };

  // Add single player to roster
  const handleAddPlayerToRoster = (playerData: Omit<Player, 'id'>) => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem cadastrar jogadores.');
      return;
    }

    const newPlayer: Player = {
      ...playerData,
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setRoster((prev) => [newPlayer, ...prev]);
    showToast(`${newPlayer.name} adicionado ao banco de nomes.`);
  };

  // Batch add players to roster
  const handleBatchAddPlayers = (names: string[], defaultClassName: string) => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem cadastrar jogadores em lote.');
      return;
    }

    const classInfo = JOB_CLASSES.find((c) => c.name === defaultClassName);
    const newPlayers: Player[] = names.map((name, index) => ({
      id: `batch-${Date.now()}-${index}`,
      name,
      jobClass: defaultClassName,
      level: 99,
      status: 'Online',
      role: classInfo?.role || 'DPS',
    }));

    setRoster((prev) => [...newPlayers, ...prev]);
    showToast(`${newPlayers.length} jogadores adicionados ao banco com sucesso!`);
  };

  // Remove player from roster completely
  const handleRemoveFromRoster = (playerId: string) => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem excluir jogadores do banco.');
      return;
    }

    setRoster((prev) => prev.filter((p) => p.id !== playerId));
    showToast('Jogador excluído do banco.');
  };

  // Edit player save
  const handleSavePlayerEdit = (updatedPlayer: Player) => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem editar jogadores.');
      return;
    }

    if (!editingPlayerContext) return;

    if (editingPlayerContext.fromRoster) {
      setRoster((prev) =>
        prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
      );
    } else if (
      editingPlayerContext.teamIndex !== undefined &&
      editingPlayerContext.slotIndex !== undefined
    ) {
      const t = editingPlayerContext.teamIndex;
      const s = editingPlayerContext.slotIndex;
      const fieldId = editingPlayerContext.fieldId || 'primary';

      if (fieldId === 'primary') {
        setPrimaryTeams((prev) => {
          const next = prev.map((team) => [...team]);
          next[t][s] = updatedPlayer;
          return next;
        });
        if (updatedPlayer.isLeader) {
          setPrimaryLeader(updatedPlayer.name);
        }
      } else {
        setSecondaryTeams((prev) => {
          const next = prev.map((team) => [...team]);
          next[t][s] = updatedPlayer;
          return next;
        });
        if (updatedPlayer.isLeader) {
          setSecondaryLeader(updatedPlayer.name);
        }
      }
    }
    showToast(`Dados de ${updatedPlayer.name} atualizados.`);
    setEditingPlayerContext(null);
  };

  // Cycle target objectives for a specific board
  const handleCycleTarget = (fieldId: 'primary' | 'secondary') => {
    if (!canEdit) {
      showToast('Ação bloqueada: Apenas administradores podem alterar o alvo da raide.');
      return;
    }

    if (fieldId === 'primary') {
      const currentIndex = RAID_TARGETS.indexOf(primaryTarget);
      const nextIndex = (currentIndex + 1) % RAID_TARGETS.length;
      setPrimaryTarget(RAID_TARGETS[nextIndex]);
      showToast(`Alvo (Campo Primário): ${RAID_TARGETS[nextIndex]}`);
    } else {
      const currentIndex = RAID_TARGETS.indexOf(secondaryTarget);
      const nextIndex = (currentIndex + 1) % RAID_TARGETS.length;
      setSecondaryTarget(RAID_TARGETS[nextIndex]);
      showToast(`Alvo (Campo Secundário): ${RAID_TARGETS[nextIndex]}`);
    }
  };

  // PDF Export for Campo Primário
  const handleExportPrimaryPDF = async () => {
    if (isExportingPrimaryPdf) return;
    try {
      setIsExportingPrimaryPdf(true);
      showToast('Gerando PDF do Campo Primário... O download iniciará em instantes.');
      await exportTeamListToPdf({
        elementId: 'main-team-window',
        fieldTitle: 'CAMPO PRIMARIO',
        teams: primaryTeams,
        teamLeaderName: primaryLeader,
        targetObjective: primaryTarget,
      });
      showToast('PDF do Campo Primário exportado com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar PDF Primário:', err);
      showToast('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setIsExportingPrimaryPdf(false);
    }
  };

  // PDF Export for Campo Secundário
  const handleExportSecondaryPDF = async () => {
    if (isExportingSecondaryPdf) return;
    try {
      setIsExportingSecondaryPdf(true);
      showToast('Gerando PDF do Campo Secundário... O download iniciará em instantes.');
      await exportTeamListToPdf({
        elementId: 'secondary-team-window',
        fieldTitle: 'CAMPO SECUNDARIO',
        teams: secondaryTeams,
        teamLeaderName: secondaryLeader,
        targetObjective: secondaryTarget,
      });
      showToast('PDF do Campo Secundário exportado com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar PDF Secundário:', err);
      showToast('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setIsExportingSecondaryPdf(false);
    }
  };

  const primaryAssignedCount = primaryTeams.flat().filter(Boolean).length;
  const secondaryAssignedCount = secondaryTeams.flat().filter(Boolean).length;
  const totalBothAssigned = primaryAssignedCount + secondaryAssignedCount;

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={(user: User) => {
          const session = authService.createUserSession(user);
          setAuthSession(session);
          showToast(`Bem-vindo, ${user.name}!`);
        }}
        onEnterAsGuest={() => {
          const session = authService.createGuestSession();
          setAuthSession(session);
          showToast('Acesso visitante concedido (somente visualização).');
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen p-2 sm:p-4 lg:p-6 flex flex-col items-center justify-start relative overflow-x-hidden font-sans transition-colors duration-300 ${
        isParchment
          ? 'parchment-wood-bg text-[#3a200b]'
          : 'bg-gradient-to-br from-sky-400 via-sky-300 to-indigo-200 text-slate-800'
      }`}
    >
      {/* Decorative backdrop */}
      {isParchment ? (
        <div className="fixed inset-0 pointer-events-none opacity-30 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-700/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-yellow-900/20 rounded-full blur-3xl" />
        </div>
      ) : (
        <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden">
          <div className="absolute top-0 -left-20 w-96 h-96 bg-white/40 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-sky-200/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-indigo-100/40 rounded-full blur-3xl" />
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl border flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200 ${
            isParchment
              ? 'bg-[#3b220d] text-[#fff6e8] border-[#9c6e3d]'
              : 'bg-slate-900/95 text-white border-slate-700/80'
          }`}
        >
          <CheckCircle2 size={16} className={isParchment ? 'text-amber-400 shrink-0' : 'text-emerald-400 shrink-0'} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Master Application Header with Guild Brand, User Role, Theme Toggle & Actions */}
      <header
        className={`w-full max-w-[1600px] mb-3 sm:mb-4 rounded-2xl border shadow-md px-3 sm:px-5 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 relative z-20 backdrop-blur-md transition-all ${
          isParchment
            ? 'bg-[#f5e5cc]/95 border-[#c4a274] text-[#3d2008]'
            : 'bg-white/95 border-sky-200/90 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl p-0.5 shadow-md flex items-center justify-center shrink-0 ${
              isParchment
                ? 'bg-gradient-to-tr from-[#7a4417] via-[#9e5d23] to-[#d4a359] border border-[#d9af6f]'
                : 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400'
            }`}
          >
            <img
              src="/guild_logo.png"
              alt="Guild Emblem"
              className="w-full h-full object-contain rounded-lg drop-shadow-sm"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/guild_logo.jpg';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1
                className={`font-extrabold text-sm sm:text-base md:text-lg tracking-tight ${
                  isParchment ? 'text-[#3b1f06] font-serif' : 'text-slate-800'
                }`}
              >
                Ragnarok Online · Gestor de Raide 40
              </h1>
              <span
                className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isParchment
                    ? 'bg-[#eed7b3] text-[#5e320d] border-[#cbb085]'
                    : 'bg-sky-100 text-sky-800 border-sky-200'
                }`}
              >
                8 Times × 5 Vagas
              </span>
            </div>
            <p
              className={`text-[11px] font-medium ${
                isParchment ? 'text-[#7d532b]' : 'text-slate-500'
              }`}
            >
              Painel de Raide (Campo Primário e Secundário) · WoE / Thanatos / Endless Tower
            </p>
          </div>
        </div>

        {/* User Identity, Role Badges & Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Theme Toggle - Top Right Corner Requested by User */}
          <ThemeToggle />

          {/* Admin Badge */}
          {isAdmin && currentUser && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs border ${
                isParchment
                  ? 'bg-[#eedbbd] text-[#69390e] border-[#c09761]'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              <ShieldCheck size={14} className={isParchment ? 'text-[#8b4b12] shrink-0' : 'text-amber-600 shrink-0'} />
              <span>Admin: <strong>{currentUser.name}</strong></span>
            </div>
          )}

          {/* Viewer Badge */}
          {isViewer && currentUser && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs border ${
                isParchment
                  ? 'bg-[#e2edf4] text-[#16435c] border-[#95bed5]'
                  : 'bg-blue-50 text-blue-900 border-blue-300'
              }`}
            >
              <UserCheck size={14} className={isParchment ? 'text-[#16435c] shrink-0' : 'text-blue-600 shrink-0'} />
              <span>Visualizador: <strong>{currentUser.name}</strong></span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ml-0.5 ${
                  isParchment ? 'bg-[#c5dce9] text-[#16435c]' : 'bg-blue-200/80 text-blue-900'
                }`}
              >
                Leitura
              </span>
            </div>
          )}

          {/* Guest Badge */}
          {isGuest && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs border ${
                isParchment
                  ? 'bg-[#eedbc0] text-[#613b17] border-[#c7a980]'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <Eye size={14} className={isParchment ? 'text-[#7a4816] shrink-0' : 'text-slate-500 shrink-0'} />
              <span>Visitante</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ml-0.5 ${
                  isParchment ? 'bg-[#dfc5a0] text-[#4d2807]' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Modo Leitura
              </span>
            </div>
          )}

          {/* Admin User Management Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsUserManagementOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 active:scale-95 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all border ${
                isParchment
                  ? 'bg-[#5b320d] hover:bg-[#462507] text-[#fff8ee] border-[#8a5320]'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
              }`}
              title="Gerenciar Contas de Usuários"
            >
              <Users size={14} className={isParchment ? 'text-amber-300' : 'text-sky-400'} />
              <span>Gerenciar Contas</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-1.5 px-3 py-1.5 active:scale-95 rounded-xl text-xs font-bold shadow-2xs border cursor-pointer transition-all ${
              isParchment
                ? 'bg-[#fffaf0] hover:bg-rose-100 text-[#542d0a] hover:text-rose-800 border-[#cbb085] hover:border-rose-300'
                : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-300 hover:border-rose-300'
            }`}
            title={isGuest ? 'Fazer login com uma conta cadastrada' : 'Encerrar sessão'}
          >
            <LogOut size={14} className="text-rose-600" />
            <span>{isGuest ? 'Fazer Login' : 'Sair'}</span>
          </button>
        </div>
      </header>

      {/* Top Quick Navigation Bar for Mobile & Tablet */}
      <div className="w-full max-w-[1600px] flex items-center justify-between gap-2 xl:hidden mb-3 relative z-20 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              document.getElementById('main-team-window')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs border cursor-pointer shrink-0 active:scale-95 transition-all ${
              isParchment
                ? 'bg-[#f7ebda] hover:bg-[#fff9ef] text-[#5e320d] border-[#cbb085]'
                : 'bg-white/95 hover:bg-white text-blue-700 border-blue-200'
            }`}
          >
            <span>⚔️ Primário</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                isParchment
                  ? 'bg-[#eed6b4] text-[#5e320d]'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {primaryAssignedCount}/40
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              document.getElementById('secondary-team-window')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs border cursor-pointer shrink-0 active:scale-95 transition-all ${
              isParchment
                ? 'bg-[#f7ebda] hover:bg-[#fff9ef] text-[#5e320d] border-[#cbb085]'
                : 'bg-white/95 hover:bg-white text-blue-700 border-blue-200'
            }`}
          >
            <span>🛡️ Secundário</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                isParchment
                  ? 'bg-[#eed6b4] text-[#5e320d]'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {secondaryAssignedCount}/40
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowRosterMobile(true)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md cursor-pointer shrink-0 active:scale-95 transition-all ${
            isParchment
              ? 'bg-[#7a4417] hover:bg-[#603510] text-[#fff8ee] border border-[#cbb085]'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Banco ({roster.length})</span>
        </button>
      </div>

      {/* Main Container: Both Campo Boards (Left/Center) + Side Table (Right) */}
      <div className="w-full max-w-[1600px] flex flex-col xl:flex-row gap-6 sm:gap-8 items-start relative z-10">
        {/* BOARDS COLUMN: CAMPO PRIMARIO + CAMPO SECUNDARIO */}
        <div className="flex-1 w-full flex flex-col gap-8 min-w-0">
          {/* 1. CAMPO PRIMARIO */}
          <CampoBoard
            id="main-team-window"
            fieldId="primary"
            title="CAMPO PRIMARIO"
            teams={primaryTeams}
            teamLeaderName={primaryLeader}
            targetObjective={primaryTarget}
            isEditingLeader={isEditingPrimaryLeader}
            selectedSlot={selectedSlot}
            isExportingPdf={isExportingPrimaryPdf}
            canEdit={canEdit}
            onSetIsEditingLeader={setIsEditingPrimaryLeader}
            onSaveLeaderName={setPrimaryLeader}
            onCycleTarget={() => handleCycleTarget('primary')}
            onSelectSlot={(t, s) => setSelectedSlot({ teamIndex: t, slotIndex: s, fieldId: 'primary' })}
            onDropPlayer={(t, s, d) => handleDropPlayer('primary', t, s, d)}
            onEditPlayer={(p, t, s) =>
              setEditingPlayerContext({
                player: p,
                teamIndex: t,
                slotIndex: s,
                fieldId: 'primary',
                fromRoster: false,
              })
            }
            onRemovePlayer={(t, s) => handleRemovePlayerFromSlot('primary', t, s)}
            onClearTeam={(t) => handleClearTeam('primary', t)}
            onOpenEmptySlotPicker={(t, s) =>
              setSlotPicker({ isOpen: true, teamIndex: t, slotIndex: s, fieldId: 'primary' })
            }
            onExportPdf={handleExportPrimaryPDF}
            onOpenAutoOptimizer={() => setIsAutoOptimizerOpen(true)}
            onAutoFillThisField={() => handleAutoFillGrid('primary')}
            onClearThisField={() => handleResetGridToRoster('primary')}
          />

          {/* 2. CAMPO SECUNDARIO (EXATAMENTE IGUAL ABAIXO) */}
          <CampoBoard
            id="secondary-team-window"
            fieldId="secondary"
            title="CAMPO SECUNDARIO"
            teams={secondaryTeams}
            teamLeaderName={secondaryLeader}
            targetObjective={secondaryTarget}
            isEditingLeader={isEditingSecondaryLeader}
            selectedSlot={selectedSlot}
            isExportingPdf={isExportingSecondaryPdf}
            canEdit={canEdit}
            onSetIsEditingLeader={setIsEditingSecondaryLeader}
            onSaveLeaderName={setSecondaryLeader}
            onCycleTarget={() => handleCycleTarget('secondary')}
            onSelectSlot={(t, s) => setSelectedSlot({ teamIndex: t, slotIndex: s, fieldId: 'secondary' })}
            onDropPlayer={(t, s, d) => handleDropPlayer('secondary', t, s, d)}
            onEditPlayer={(p, t, s) =>
              setEditingPlayerContext({
                player: p,
                teamIndex: t,
                slotIndex: s,
                fieldId: 'secondary',
                fromRoster: false,
              })
            }
            onRemovePlayer={(t, s) => handleRemovePlayerFromSlot('secondary', t, s)}
            onClearTeam={(t) => handleClearTeam('secondary', t)}
            onOpenEmptySlotPicker={(t, s) =>
              setSlotPicker({ isOpen: true, teamIndex: t, slotIndex: s, fieldId: 'secondary' })
            }
            onExportPdf={handleExportSecondaryPDF}
            onOpenAutoOptimizer={() => setIsAutoOptimizerOpen(true)}
            onAutoFillThisField={() => handleAutoFillGrid('secondary')}
            onClearThisField={() => handleResetGridToRoster('secondary')}
          />
        </div>

        {/* SIDE TABLE ("Tabela ao lado para adição de nomes") - Desktop Sticky Sidebar */}
        <div className="hidden xl:block w-auto shrink-0 sticky top-4">
          <PlayerRosterTable
            roster={roster}
            activeGridCount={totalBothAssigned}
            primaryAssignedCount={primaryAssignedCount}
            secondaryAssignedCount={secondaryAssignedCount}
            canEdit={canEdit}
            onAddPlayer={handleAddPlayerToRoster}
            onBatchAddPlayers={handleBatchAddPlayers}
            onRemoveFromRoster={handleRemoveFromRoster}
            onEditPlayer={(p) =>
              setEditingPlayerContext({
                player: p,
                fromRoster: true,
              })
            }
            onQuickAssign={handleQuickAssignFromRoster}
            onAutoFillGrid={handleAutoFillGrid}
            onResetGridToRoster={handleResetGridToRoster}
            onDropFromGridToRoster={handleDropFromGridToRoster}
            onLoadFull40Preset={handleLoadFull40Preset}
            onOpenAutoOptimizer={() => setIsAutoOptimizerOpen(true)}
          />
        </div>
      </div>

      {/* MOBILE / TABLET ROSTER MODAL DRAWER */}
      {showRosterMobile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 xl:hidden overflow-y-auto">
          <div className="w-full max-w-lg max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-900/80 to-slate-800 border-b border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                <span className="text-sm font-bold text-white">Banco de Jogadores ({roster.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRosterMobile(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3 sm:p-4 overflow-y-auto flex-1">
              <PlayerRosterTable
                roster={roster}
                activeGridCount={totalBothAssigned}
                primaryAssignedCount={primaryAssignedCount}
                secondaryAssignedCount={secondaryAssignedCount}
                canEdit={canEdit}
                onAddPlayer={handleAddPlayerToRoster}
                onBatchAddPlayers={handleBatchAddPlayers}
                onRemoveFromRoster={handleRemoveFromRoster}
                onEditPlayer={(p) =>
                  setEditingPlayerContext({
                    player: p,
                    fromRoster: true,
                  })
                }
                onQuickAssign={handleQuickAssignFromRoster}
                onAutoFillGrid={handleAutoFillGrid}
                onResetGridToRoster={handleResetGridToRoster}
                onDropFromGridToRoster={handleDropFromGridToRoster}
                onLoadFull40Preset={handleLoadFull40Preset}
                onOpenAutoOptimizer={() => {
                  setShowRosterMobile(false);
                  setIsAutoOptimizerOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON ON MOBILE */}
      <div className="fixed bottom-4 right-4 z-40 xl:hidden">
        <button
          type="button"
          onClick={() => setShowRosterMobile(true)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-full font-bold shadow-2xl border-2 border-white/90 cursor-pointer text-xs transition-all"
        >
          <SlidersHorizontal size={15} />
          <span>Banco ({roster.length})</span>
        </button>
      </div>

      {/* MODALS */}
      {/* 1. Edit Player Modal */}
      <EditPlayerModal
        player={editingPlayerContext?.player || null}
        isOpen={Boolean(editingPlayerContext)}
        onClose={() => setEditingPlayerContext(null)}
        onSave={handleSavePlayerEdit}
        onDelete={
          editingPlayerContext?.teamIndex !== undefined &&
          editingPlayerContext?.slotIndex !== undefined
            ? () => {
                handleRemovePlayerFromSlot(
                  editingPlayerContext.fieldId || 'primary',
                  editingPlayerContext.teamIndex!,
                  editingPlayerContext.slotIndex!
                );
                setEditingPlayerContext(null);
              }
            : undefined
        }
      />

      {/* 2. Slot Picker Modal (When clicking empty slot "+") */}
      {slotPicker && (
        <SlotPickerModal
          isOpen={slotPicker.isOpen}
          teamIndex={slotPicker.teamIndex}
          slotIndex={slotPicker.slotIndex}
          fieldTitle={slotPicker.fieldId === 'primary' ? 'Campo Primário' : 'Campo Secundário'}
          roster={roster}
          onClose={() => setSlotPicker(null)}
          onSelectFromRoster={(player) => {
            if (!canEdit) {
              showToast('Ação bloqueada: Apenas administradores podem alocar jogadores.');
              return;
            }
            handleDropPlayer(slotPicker.fieldId, slotPicker.teamIndex, slotPicker.slotIndex, {
              type: 'FROM_ROSTER',
              player,
            });
            setSlotPicker(null);
          }}
          onCreateAndAssign={(name, jobClass) => {
            if (!canEdit) {
              showToast('Ação bloqueada: Apenas administradores podem criar e alocar jogadores.');
              return;
            }
            const classInfo = JOB_CLASSES.find((c) => c.name === jobClass);
            const newPlayer: Player = {
              id: `p-${Date.now()}`,
              name,
              jobClass,
              level: 99,
              status: 'Online',
              role: classInfo?.role || 'DPS',
            };
            const setTargetTeams =
              slotPicker.fieldId === 'primary' ? setPrimaryTeams : setSecondaryTeams;
            setTargetTeams((prev) => {
              const next = prev.map((t) => [...t]);
              next[slotPicker.teamIndex][slotPicker.slotIndex] = newPlayer;
              return next;
            });
            showToast(
              `${newPlayer.name} criado e inserido no Time ${slotPicker.teamIndex + 1} (${
                slotPicker.fieldId === 'primary' ? 'Campo Primário' : 'Campo Secundário'
              })!`
            );
            setSlotPicker(null);
          }}
        />
      )}

      {/* 3. Export Modal (Backup text export) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        teams={exportModalTargetField === 'primary' ? primaryTeams : secondaryTeams}
        teamName={exportModalTargetField === 'primary' ? primaryLeader : secondaryLeader}
        targetObjective={exportModalTargetField === 'primary' ? primaryTarget : secondaryTarget}
      />

      {/* 4. Auto Team Optimizer Modal (Analisa dados e gera times por Poder e Classes) */}
      <AutoTeamOptimizerModal
        isOpen={isAutoOptimizerOpen}
        onClose={() => setIsAutoOptimizerOpen(false)}
        roster={roster}
        primaryTeams={primaryTeams}
        secondaryTeams={secondaryTeams}
        onApplyOptimization={handleApplyOptimization}
      />

      {/* 5. User Management Modal (Admin only) */}
      {isAdmin && currentUser && (
        <UserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          currentUser={currentUser}
          onToast={(msg) => showToast(msg)}
        />
      )}
    </div>
  );
}
