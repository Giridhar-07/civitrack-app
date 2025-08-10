import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import authService, { LoginCredentials, RegisterData } from '../services/authService';
import { User } from '../types';
import useApi from './useApi';

interface AuthState {
  /** Current authenticated user */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is loading */
  loading: boolean;
  /** Authentication error if any */
  error: string | null;
}

interface AuthContextType extends AuthState {
  /** Login with email and password */
  login: (credentials: LoginCredentials) => Promise<boolean>;
  /** Register a new user */
  register: (userData: RegisterData) => Promise<boolean>;
  /** Logout current user */
  logout: () => void;
  /** Clear any auth errors */
  clearError: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  clearError: () => {}
});

/**
 * Provider component for authentication context
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};

/**
 * Implementation of the authentication provider
 */
const useAuthProvider = (): AuthContextType => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });

  // Use our custom API hook for login
  const loginApi = useApi(
    (credentials: LoginCredentials) => authService.login(credentials),
    {
      onSuccess: (data) => {
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      },
      onError: (error) => {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          loading: false,
          error: error.message
        }));
      }
    }
  );

  // Use our custom API hook for registration
  const registerApi = useApi(
    (userData: RegisterData) => authService.register(userData),
    {
      onSuccess: (data) => {
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      },
      onError: (error) => {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          loading: false,
          error: error.message
        }));
      }
    }
  );

  // Use our custom API hook for getting current user
  const getCurrentUserApi = useApi(
    () => authService.getCurrentUser(),
    {
      onSuccess: (user) => {
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      },
      onError: (error) => {
        // Check if this is a network error or timeout
        const isNetworkError = 
          error?.errorCode === 'TIMEOUT_ERROR' || 
          error?.errorCode === 'NETWORK_ERROR' || 
          error?.message?.includes('Network error') || 
          error?.message?.includes('timeout');
        
        // Only clear auth state if it's not a network error
        if (!isNetworkError) {
          // If getting current user fails with a non-network error, clear auth state
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
          // Also clear token as it might be invalid
          authService.logout();
        } else {
          // For network errors, keep the user logged in but mark as not loading
          console.log('Network error during authentication, keeping user logged in');
          setAuthState(prev => ({
            ...prev,
            loading: false
          }));
        }
      }
    }
  );

  // Check authentication status on mount and when token changes
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication status');
      if (authService.isAuthenticated()) {
        console.log('Token found, attempting to get current user');
        try {
          await getCurrentUserApi.execute();
          console.log('Successfully retrieved current user');
        } catch (error: any) {
          console.error('Error getting current user:', error);
          // Only clear auth state if it's not a network error
          if (error?.errorCode !== 'TIMEOUT_ERROR' && error?.errorCode !== 'NETWORK_ERROR') {
            console.log('Non-network error, clearing auth state');
            // Error is handled by the API hook
            setAuthState({
              user: null,
              isAuthenticated: false,
              loading: false,
              error: null
            });
            // Clear token as it might be invalid
            authService.logout();
          } else {
            // For network errors, keep the user logged in
            console.log('Network error, keeping user logged in');
            setAuthState(prev => ({
              ...prev,
              loading: false
            }));
          }
        }
      } else {
        console.log('No token found, user is not authenticated');
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
      }
    };

    checkAuth();
    
    // Add event listener for storage changes to detect login/logout in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        console.log('Token changed in storage, refreshing authentication state');
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Remove getCurrentUserApi dependency to prevent infinite loop

  // Clear error function
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    clearError();
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await loginApi.execute(credentials);
      console.log('Login API result:', !!result ? 'success' : 'failed');
      return !!result;
    } catch (error: any) {
      console.error('Login error in useAuth:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to login'
      }));
      return false;
    }
  }, [loginApi, clearError, setAuthState]);

  // Register function
  const register = useCallback(async (userData: RegisterData): Promise<boolean> => {
    clearError();
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await registerApi.execute(userData);
      console.log('Register API result:', !!result ? 'success' : 'failed');
      return !!result;
    } catch (error: any) {
      console.error('Register error in useAuth:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to register'
      }));
      return false;
    }
  }, [registerApi, clearError, setAuthState]);

  // Logout function
  const logout = useCallback(() => {
    console.log('Logout function called');
    authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
    console.log('Auth state reset after logout');
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    clearError
  };
};

export default useAuth;