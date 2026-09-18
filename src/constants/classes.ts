import { JobClassInfo, Player } from '../types';

export const JOB_CLASSES: JobClassInfo[] = [
  {
    id: 'sniper',
    name: 'Atirador de Elite',
    role: 'DPS',
    badgeBg: 'bg-lime-700/80',
    textColor: 'text-lime-200',
    iconName: 'Crosshair',
  },
  {
    id: 'algoz',
    name: 'Algoz / Assassino',
    role: 'DPS',
    badgeBg: 'bg-emerald-800/80',
    textColor: 'text-emerald-200',
    iconName: 'Swords',
  },
  {
    id: 'menestrel',
    name: 'Menestrel / Trovador',
    role: 'Suporte',
    badgeBg: 'bg-amber-800/80',
    textColor: 'text-amber-200',
    iconName: 'Music',
  },
  {
    id: 'cigana',
    name: 'Cigana',
    role: 'Suporte',
    badgeBg: 'bg-rose-800/80',
    textColor: 'text-rose-200',
    iconName: 'Sparkles',
  },
  {
    id: 'sumo_sacerdote',
    name: 'Sumo Sacerdote',
    role: 'Healer',
    badgeBg: 'bg-sky-800/80',
    textColor: 'text-sky-200',
    iconName: 'ShieldPlus',
  },
  {
    id: 'lorde',
    name: 'Lorde Cavaleiro',
    role: 'Tank',
    badgeBg: 'bg-red-800/80',
    textColor: 'text-red-200',
    iconName: 'Shield',
  },
  {
    id: 'paladino',
    name: 'Paladino',
    role: 'Tank',
    badgeBg: 'bg-yellow-800/80',
    textColor: 'text-yellow-200',
    iconName: 'ShieldCheck',
  },
  {
    id: 'arquimago',
    name: 'Arquimago',
    role: 'DPS',
    badgeBg: 'bg-purple-800/80',
    textColor: 'text-purple-200',
    iconName: 'Flame',
  },
  {
    id: 'professor',
    name: 'Professor / Sábio',
    role: 'Suporte',
    badgeBg: 'bg-indigo-800/80',
    textColor: 'text-indigo-200',
    iconName: 'BookOpen',
  },
  {
    id: 'mestre',
    name: 'Mestre / Monge',
    role: 'DPS',
    badgeBg: 'bg-orange-800/80',
    textColor: 'text-orange-200',
    iconName: 'Zap',
  },
  {
    id: 'criador',
    name: 'Criador / Alquimista',
    role: 'Suporte',
    badgeBg: 'bg-teal-800/80',
    textColor: 'text-teal-200',
    iconName: 'FlaskConical',
  },
  {
    id: 'mestre_ferreiro',
    name: 'Mestre-Ferreiro',
    role: 'DPS',
    badgeBg: 'bg-stone-700/90',
    textColor: 'text-stone-200',
    iconName: 'Hammer',
  },
  {
    id: 'desordeiro',
    name: 'Desordeiro / Stalker',
    role: 'DPS',
    badgeBg: 'bg-slate-700/90',
    textColor: 'text-slate-200',
    iconName: 'Target',
  },
  {
    id: 'espiritualista',
    name: 'Espiritualista',
    role: 'Suporte',
    badgeBg: 'bg-cyan-800/80',
    textColor: 'text-cyan-200',
    iconName: 'Ghost',
  },
];

export const INITIAL_TIME1_PLAYERS: Player[] = [
  {
    id: 'p-1',
    name: 'vseteRR',
    jobClass: 'Atirador de Elite',
    level: 99,
    status: 'Líder',
    role: 'DPS',
    isLeader: true,
  },
  {
    id: 'p-2',
    name: 'RocKShoW',
    jobClass: 'Algoz / Assassino',
    level: 99,
    status: 'Ausente',
    role: 'DPS',
  },
  {
    id: 'p-3',
    name: 'ViolaTocão',
    jobClass: 'Menestrel / Trovador',
    level: 99,
    status: 'Longe',
    role: 'Suporte',
  },
  {
    id: 'p-4',
    name: 'BentinhO',
    jobClass: 'Algoz / Assassino',
    level: 99,
    status: 'Longe',
    role: 'DPS',
  },
  {
    id: 'p-5',
    name: 'vseteR',
    jobClass: 'Sumo Sacerdote',
    level: 99,
    status: 'Longe',
    role: 'Healer',
  },
];

export const FULL_40_PLAYERS_SAMPLE: Player[] = [
  // Time 1 (from screenshot)
  { id: 'f-1', name: 'vseteRR', jobClass: 'Atirador de Elite', level: 99, status: 'Líder', role: 'DPS', isLeader: true, power: '1.45M', glory: '580K', feathersLevel: 18, mountLevel: 12 },
  { id: 'f-2', name: 'RocKShoW', jobClass: 'Algoz / Assassino', level: 99, status: 'Ausente', role: 'DPS', power: '1.20M', glory: '450K', feathersLevel: 16, mountLevel: 10 },
  { id: 'f-3', name: 'ViolaTocão', jobClass: 'Menestrel / Trovador', level: 99, status: 'Longe', role: 'Suporte', power: '890K', glory: '320K', feathersLevel: 14, mountLevel: 9 },
  { id: 'f-4', name: 'BentinhO', jobClass: 'Algoz / Assassino', level: 99, status: 'Longe', role: 'DPS', power: '950K', glory: '360K', feathersLevel: 15, mountLevel: 10 },
  { id: 'f-5', name: 'vseteR', jobClass: 'Sumo Sacerdote', level: 99, status: 'Longe', role: 'Healer', power: '1.15M', glory: '510K', feathersLevel: 17, mountLevel: 11 },

  // Time 2 (Frontline & Magic)
  { id: 'f-6', name: 'Thorin_Tank', jobClass: 'Lorde Cavaleiro', level: 99, status: 'Online', role: 'Tank', power: '1.30M', glory: '490K', feathersLevel: 16, mountLevel: 11 },
  { id: 'f-7', name: 'HolyAegis', jobClass: 'Paladino', level: 98, status: 'Online', role: 'Tank', power: '1.38M', glory: '540K', feathersLevel: 17, mountLevel: 12 },
  { id: 'f-8', name: 'Pyromancer', jobClass: 'Arquimago', level: 99, status: 'Online', role: 'DPS', power: '1.40M', glory: '520K', feathersLevel: 18, mountLevel: 11 },
  { id: 'f-9', name: 'SanctuaryPro', jobClass: 'Sumo Sacerdote', level: 99, status: 'Online', role: 'Healer', power: '980K', glory: '390K', feathersLevel: 15, mountLevel: 9 },
  { id: 'f-10', name: 'MindDispel', jobClass: 'Professor / Sábio', level: 97, status: 'Online', role: 'Suporte', power: '850K', glory: '310K', feathersLevel: 13, mountLevel: 8 },

  // Time 3 (Assassins & Criticals)
  { id: 'f-11', name: 'SilentKill', jobClass: 'Algoz / Assassino', level: 99, status: 'Online', role: 'DPS', power: '1.28M', glory: '480K', feathersLevel: 16, mountLevel: 10 },
  { id: 'f-12', name: 'VenomBlade', jobClass: 'Algoz / Assassino', level: 98, status: 'Online', role: 'DPS', power: '1.10M', glory: '410K', feathersLevel: 15, mountLevel: 9 },
  { id: 'f-13', name: 'DancerMoon', jobClass: 'Cigana', level: 99, status: 'Online', role: 'Suporte', power: '920K', glory: '350K', feathersLevel: 14, mountLevel: 9 },
  { id: 'f-14', name: 'DivineGrace', jobClass: 'Sumo Sacerdote', level: 99, status: 'Online', role: 'Healer', power: '1.22M', glory: '470K', feathersLevel: 16, mountLevel: 11 },
  { id: 'f-15', name: 'IronWall', jobClass: 'Paladino', level: 98, status: 'Online', role: 'Tank', power: '1.18M', glory: '430K', feathersLevel: 15, mountLevel: 10 },

  // Time 4 (Physical Burst)
  { id: 'f-16', name: 'AsuraStrike', jobClass: 'Mestre / Monge', level: 99, status: 'Online', role: 'DPS', power: '1.50M', glory: '600K', feathersLevel: 19, mountLevel: 13 },
  { id: 'f-17', name: 'GuillotineFist', jobClass: 'Mestre / Monge', level: 99, status: 'Online', role: 'DPS', power: '1.35M', glory: '510K', feathersLevel: 17, mountLevel: 11 },
  { id: 'f-18', name: 'AcidTerrorist', jobClass: 'Criador / Alquimista', level: 99, status: 'Online', role: 'Suporte', power: '1.05M', glory: '400K', feathersLevel: 15, mountLevel: 10 },
  { id: 'f-19', name: 'FullCartBoost', jobClass: 'Mestre-Ferreiro', level: 98, status: 'Online', role: 'DPS', power: '1.12M', glory: '420K', feathersLevel: 15, mountLevel: 9 },
  { id: 'f-20', name: 'AngelShield', jobClass: 'Sumo Sacerdote', level: 99, status: 'Online', role: 'Healer', power: '1.08M', glory: '410K', feathersLevel: 15, mountLevel: 10 },

  // Time 5 (Ranged Squad)
  { id: 'f-21', name: 'FalconEyes', jobClass: 'Atirador de Elite', level: 99, status: 'Online', role: 'DPS', power: '1.25M', glory: '470K', feathersLevel: 16, mountLevel: 10 },
  { id: 'f-22', name: 'WindWalker', jobClass: 'Atirador de Elite', level: 98, status: 'Online', role: 'DPS', power: '1.05M', glory: '380K', feathersLevel: 14, mountLevel: 9 },
  { id: 'f-23', name: 'StringsPoem', jobClass: 'Menestrel / Trovador', level: 99, status: 'Online', role: 'Suporte', power: '940K', glory: '360K', feathersLevel: 14, mountLevel: 9 },
  { id: 'f-24', name: 'StormGust99', jobClass: 'Arquimago', level: 99, status: 'Online', role: 'DPS', power: '1.32M', glory: '490K', feathersLevel: 17, mountLevel: 11 },
  { id: 'f-25', name: 'KyrieEleison', jobClass: 'Sumo Sacerdote', level: 97, status: 'Online', role: 'Healer', power: '960K', glory: '340K', feathersLevel: 13, mountLevel: 8 },

  // Time 6 (Defense & Control)
  { id: 'f-26', name: 'GuardianAngel', jobClass: 'Paladino', level: 99, status: 'Online', role: 'Tank', power: '1.42M', glory: '560K', feathersLevel: 18, mountLevel: 12 },
  { id: 'f-27', name: 'SpiralPierce', jobClass: 'Lorde Cavaleiro', level: 98, status: 'Online', role: 'Tank', power: '1.15M', glory: '440K', feathersLevel: 15, mountLevel: 10 },
  { id: 'f-28', name: 'LandProtector', jobClass: 'Professor / Sábio', level: 99, status: 'Online', role: 'Suporte', power: '990K', glory: '380K', feathersLevel: 15, mountLevel: 9 },
  { id: 'f-29', name: 'Resurrection', jobClass: 'Sumo Sacerdote', level: 98, status: 'Online', role: 'Healer', power: '1.18M', glory: '460K', feathersLevel: 16, mountLevel: 10 },
  { id: 'f-30', name: 'ShadowChaser', jobClass: 'Desordeiro / Stalker', level: 97, status: 'Online', role: 'DPS', power: '880K', glory: '320K', feathersLevel: 13, mountLevel: 8 },

  // Time 7 (Spellcasters & Support)
  { id: 'f-31', name: 'MeteorStorm', jobClass: 'Arquimago', level: 99, status: 'Online', role: 'DPS', power: '1.36M', glory: '510K', feathersLevel: 17, mountLevel: 11 },
  { id: 'f-32', name: 'LordOfVermin', jobClass: 'Arquimago', level: 99, status: 'Online', role: 'DPS', power: '1.20M', glory: '450K', feathersLevel: 16, mountLevel: 10 },
  { id: 'f-33', name: 'KaahiSoul', jobClass: 'Espiritualista', level: 98, status: 'Online', role: 'Suporte', power: '910K', glory: '340K', feathersLevel: 14, mountLevel: 9 },
  { id: 'f-34', name: 'Benediction', jobClass: 'Sumo Sacerdote', level: 99, status: 'Online', role: 'Healer', power: '1.26M', glory: '480K', feathersLevel: 17, mountLevel: 11 },
  { id: 'f-35', name: 'BioCannibal', jobClass: 'Criador / Alquimista', level: 98, status: 'Online', role: 'Suporte', power: '1.02M', glory: '390K', feathersLevel: 15, mountLevel: 9 },

  // Time 8 (Flex Squad)
  { id: 'f-36', name: 'SonicBlowX', jobClass: 'Algoz / Assassino', level: 99, status: 'Online', role: 'DPS', power: '1.24M', glory: '460K', feathersLevel: 16, mountLevel: 10 },
  { id: 'f-37', name: 'SharpShooter', jobClass: 'Atirador de Elite', level: 99, status: 'Online', role: 'DPS', power: '1.18M', glory: '440K', feathersLevel: 15, mountLevel: 10 },
  { id: 'f-38', name: 'GrandCross', jobClass: 'Paladino', level: 98, status: 'Online', role: 'Tank', power: '1.34M', glory: '520K', feathersLevel: 17, mountLevel: 11 },
  { id: 'f-39', name: 'HeavenDrive', jobClass: 'Professor / Sábio', level: 97, status: 'Online', role: 'Suporte', power: '930K', glory: '350K', feathersLevel: 14, mountLevel: 9 },
  { id: 'f-40', name: 'Magnificat', jobClass: 'Sumo Sacerdote', level: 99, status: 'Online', role: 'Healer', power: '1.14M', glory: '430K', feathersLevel: 16, mountLevel: 10 },
];

