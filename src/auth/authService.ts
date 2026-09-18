import { User, AuthSession, UserRole } from '../types';

const USERS_STORAGE_KEY = 'ragnarok_guild_users_v1';
const SESSION_STORAGE_KEY = 'ragnarok_guild_session_v1';

// Initial default users for the application
const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin-1',
    username: 'admin',
    name: 'Líder da Guilda (Admin)',
    email: 'admin@hearmearoar.com',
    role: 'ADMIN',
    password: 'admin',
    createdAt: '2026-01-01',
  },
  {
    id: 'user-viewer-1',
    username: 'viewer',
    name: 'Membro Observador (Viewer)',
    email: 'viewer@hearmearoar.com',
    role: 'VIEWER',
    password: 'viewer',
    createdAt: '2026-01-02',
  },
];

export const getStoredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
};

export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users', err);
  }
};

export const getStoredSession = (): AuthSession => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed && parsed.role) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read session', err);
  }
  return {
    user: null,
    role: 'GUEST',
    isAuthenticated: false,
  };
};

export const saveSession = (session: AuthSession): void => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save session', err);
  }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session', err);
  }
};

export const authenticateUser = async (
  identifier: string,
  passwordAttempt: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Simulate standard network latency for professional feel
  await new Promise((resolve) => setTimeout(resolve, 450));

  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanPassword = passwordAttempt.trim();

  if (!cleanIdentifier) {
    return { success: false, error: 'Por favor, informe seu usuário ou e-mail.' };
  }
  if (!cleanPassword) {
    return { success: false, error: 'Por favor, informe sua senha.' };
  }

  const users = getStoredUsers();
  const match = users.find(
    (u) =>
      u.username.toLowerCase() === cleanIdentifier ||
      u.email.toLowerCase() === cleanIdentifier
  );

  if (!match) {
    return {
      success: false,
      error: 'Credenciais inválidas: usuário ou e-mail não encontrado.',
    };
  }

  // Support password comparison (case sensitive)
  if (match.password !== cleanPassword) {
    return {
      success: false,
      error: 'Credenciais inválidas: senha incorreta.',
    };
  }

  const safeUser: User = {
    id: match.id,
    username: match.username,
    name: match.name,
    email: match.email,
    role: match.role,
    createdAt: match.createdAt,
  };

  return { success: true, user: safeUser };
};

export const authService = {
  getStoredUsers,
  saveUsers,
  getStoredSession,
  saveSession,
  clearSession,
  logout: clearSession,
  authenticateUser,
  createGuestSession: (): AuthSession => {
    const session: AuthSession = {
      user: {
        id: 'guest-session',
        username: 'visitante',
        name: 'Visitante (Leitura)',
        email: '',
        role: 'GUEST',
        createdAt: new Date().toISOString(),
      },
      role: 'GUEST',
      isAuthenticated: true,
    };
    saveSession(session);
    return session;
  },
  createUserSession: (user: User): AuthSession => {
    const session: AuthSession = {
      user,
      role: user.role,
      isAuthenticated: true,
    };
    saveSession(session);
    return session;
  },
};

