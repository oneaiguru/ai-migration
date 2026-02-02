/**
 * Mock Authentication Service for demo build.
 * Provides in-memory credentials without any backend dependency.
 */

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: number;
      email: string;
      name: string;
      role: string;
      department: string;
    };
    expiresAt: string;
  };
  error?: string;
}

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';
const MOCK_TOKEN = 'mock-demo-token';
const MOCK_USER = {
  id: 1,
  email: 'planner@wfm.demo',
  name: 'Demo Planner',
  role: 'admin',
  department: 'Contact Center'
};

const safeStorage = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  remove(key: string) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
};

class MockAuthService {
  private authToken: string | null = null;

  constructor() {
    this.authToken = safeStorage.get(TOKEN_KEY);
    if (!this.authToken) {
      this.authToken = MOCK_TOKEN;
      safeStorage.set(TOKEN_KEY, MOCK_TOKEN);
      safeStorage.set(USER_KEY, JSON.stringify(MOCK_USER));
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  getCurrentUser() {
    const raw = safeStorage.get(USER_KEY);
    if (!raw) return MOCK_USER;
    try {
      return JSON.parse(raw);
    } catch {
      return MOCK_USER;
    }
  }

  async login(email: string, _password: string): Promise<LoginResponse> {
    const user = { ...MOCK_USER, email };
    this.authToken = MOCK_TOKEN;
    safeStorage.set(TOKEN_KEY, MOCK_TOKEN);
    safeStorage.set(USER_KEY, JSON.stringify(user));

    return {
      success: true,
      data: {
        token: MOCK_TOKEN,
        user,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }

  async logout(): Promise<{ success: boolean; error?: string }> {
    this.authToken = null;
    safeStorage.remove(TOKEN_KEY);
    safeStorage.remove(USER_KEY);
    return { success: true };
  }
}

export const realAuthService = new MockAuthService();
export type { LoginRequest, LoginResponse };
export default realAuthService;
