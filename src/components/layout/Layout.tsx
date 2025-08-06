import React, { useState, useEffect } from 'react';
import { Box, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import { User } from '../../types';
import authService from '../../services/authService';
import NetworkStatus from '../common/NetworkStatus';
import { useNotification } from '../../hooks/useNotification';

interface LayoutProps {
  children: React.ReactNode;
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { showNotification } = useNotification();

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification({
        type: 'success',
        message: 'You are back online. Full functionality restored.',
        autoHideDuration: 3000
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification({
        type: 'warning',
        message: 'You are offline. Some features may be limited.',
        autoHideDuration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showNotification]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error: any) {
        console.error('Failed to fetch user:', error);
        // Only logout if it's not a network or timeout error
        const isNetworkError = 
          error?.errorCode === 'TIMEOUT_ERROR' || 
          error?.errorCode === 'NETWORK_ERROR' || 
          error?.message?.includes('Network error') || 
          error?.message?.includes('timeout');
        
        if (!isNetworkError) {
          // If token is invalid, clear it
          authService.logout();
          // Don't show notification for auth errors, as they're expected when token is invalid
        } else {
          // Show a user-friendly message for network errors
          showNotification({
            type: 'info',
            message: 'Unable to verify your session due to network issues. You can continue using the app.',
            autoHideDuration: 7000
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [showNotification]);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: '#121212',
        }}
      >
        <Header user={user} onLogout={handleLogout} />
        {!isOnline && (
          <Box 
            sx={{ 
              bgcolor: 'warning.main', 
              color: 'warning.contrastText', 
              py: 0.5, 
              textAlign: 'center',
              fontSize: '0.875rem',
              fontWeight: 'medium'
            }}
          >
            You are currently offline. Some features may be limited.
          </Box>
        )}
        <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
          {children}
        </Container>
        <NetworkStatus />
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default Layout;