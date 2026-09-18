export type PlayerStatus = 'Online' | 'Ausente' | 'Longe' | 'Líder';

export type PlayerRole = 'DPS' | 'Tank' | 'Healer' | 'Suporte';

export type UserRole = 'ADMIN' | 'VIEWER' | 'GUEST';

export type AppTheme = 'classic' | 'parchment';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
}

export interface JobClassInfo {
  id: string;
  name: string;
  role: PlayerRole;
  badgeBg: string; // Background color for top banner in card
  textColor: string;
  iconName: string;
}

export interface Player {
  id: string;
  name: string;
  jobClass: string;
  level: number;
  status: PlayerStatus;
  role: PlayerRole;
  isLeader?: boolean;
  featherLevel?: number | string;
  feathersLevel?: number | string;
  power?: number | string;
  glory?: number | string;
  mountLevel?: number | string;
  powerAndGlory?: number | string; // legacy support
}

export interface DragItemData {
  type: 'FROM_ROSTER' | 'FROM_GRID';
  player: Player;
  fromTeamIndex?: number;
  fromSlotIndex?: number;
  fromField?: 'primary' | 'secondary';
}
