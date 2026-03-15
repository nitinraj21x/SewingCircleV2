import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, useLogin, useLogout } from './AuthContext';
import { adminAPI } from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  adminAPI: {
    login: vi.fn(),
    logout: vi.fn(),
    logoutAll: vi.fn(),
    verifyToken: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide auth context when used within AuthProvider', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('logoutAll');
    });
  });

  describe('Authentication state', () => {
    it('should initialize with not authenticated when no tokens', async () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });

    it('should provide auth context properties', async () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('logoutAll');
    });
  });

  describe('login function', () => {
    it('should successfully login with valid credentials', async () => {
      const mockAdmin = { username: 'admin', id: '123' };
      const credentials = { username: 'admin', password: 'password' };
      adminAPI.login.mockResolvedValue({ admin: mockAdmin });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login(credentials);
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.admin).toEqual(mockAdmin);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockAdmin);
    });

    it('should handle login failure', async () => {
      const credentials = { username: 'admin', password: 'wrong' };
      const errorMessage = 'Invalid credentials';
      adminAPI.login.mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login(credentials);
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe(errorMessage);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout function', () => {
    it('should successfully logout', async () => {
      const mockAdmin = { username: 'admin', id: '123' };
      adminAPI.login.mockResolvedValue({ admin: mockAdmin });
      adminAPI.logout.mockResolvedValue({});

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Login first
      await act(async () => {
        await result.current.login({ username: 'admin', password: 'password' });
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(adminAPI.logout).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });
  });

  describe('Custom hooks', () => {
    it('useLogin should return login function', async () => {
      const mockAdmin = { username: 'admin', id: '123' };
      adminAPI.login.mockResolvedValue({ admin: mockAdmin });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useLogin(), { wrapper });

      expect(typeof result.current).toBe('function');

      let loginResult;
      await act(async () => {
        loginResult = await result.current({ username: 'admin', password: 'password' });
      });

      expect(loginResult.success).toBe(true);
    });

    it('useLogout should return logout functions', async () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useLogout(), { wrapper });

      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('logoutAll');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.logoutAll).toBe('function');
    });
  });
});
