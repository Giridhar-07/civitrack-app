import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme, PaletteMode } from '@mui/material';

interface ThemeContextType {
  /** Current theme mode */
  mode: PaletteMode;
  /** Current theme object */
  theme: Theme;
  /** Toggle between light and dark mode */
  toggleTheme: () => void;
  /** Set theme mode explicitly */
  setMode: (mode: PaletteMode) => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  theme: createTheme(),
  toggleTheme: () => {},
  setMode: () => {}
});

// Theme configuration
const getTheme = (mode: PaletteMode): Theme => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#4CAF50' : '#81C784',
        light: mode === 'light' ? '#81C784' : '#A5D6A7',
        dark: mode === 'light' ? '#388E3C' : '#2E7D32',
        contrastText: '#fff'
      },
      secondary: {
        main: mode === 'light' ? '#2196F3' : '#64B5F6',
        light: mode === 'light' ? '#64B5F6' : '#90CAF9',
        dark: mode === 'light' ? '#1976D2' : '#1565C0',
        contrastText: '#fff'
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#fff' : '#1e1e1e'
      },
      text: {
        primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
        secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
      },
      error: {
        main: mode === 'light' ? '#f44336' : '#e57373'
      },
      warning: {
        main: mode === 'light' ? '#ff9800' : '#ffb74d'
      },
      info: {
        main: mode === 'light' ? '#2196f3' : '#64b5f6'
      },
      success: {
        main: mode === 'light' ? '#4caf50' : '#81c784'
      }
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12
          },
          elevation1: {
            boxShadow: mode === 'light'
              ? '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)'
              : '0px 2px 1px -1px rgba(255,255,255,0.12), 0px 1px 1px 0px rgba(255,255,255,0.08), 0px 1px 3px 0px rgba(255,255,255,0.05)'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: 'hidden'
          }
        }
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 16,
            '&:last-child': {
              paddingBottom: 16
            }
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8
            }
          }
        }
      }
    }
  });
};

/**
 * Provider component for theme context
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeContext = useThemeProvider();
  
  return (
    <ThemeContext.Provider value={themeContext}>
      <MuiThemeProvider theme={themeContext.theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};

/**
 * Implementation of the theme provider
 */
const useThemeProvider = (): ThemeContextType => {
  // Get initial theme preference from localStorage or system preference
  const getInitialMode = (): PaletteMode => {
    const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      return savedMode;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };

  const [mode, setMode] = useState<PaletteMode>(getInitialMode);
  const [theme, setTheme] = useState<Theme>(getTheme(mode));

  // Update theme when mode changes
  useEffect(() => {
    const newTheme = getTheme(mode);
    setTheme(newTheme);
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Toggle between light and dark mode
  const toggleTheme = useCallback(() => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  // Set mode explicitly
  const setThemeMode = useCallback((newMode: PaletteMode) => {
    setMode(newMode);
  }, []);

  return {
    mode,
    theme,
    toggleTheme,
    setMode: setThemeMode
  };
};

export default useTheme;