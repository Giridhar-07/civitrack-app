import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface FallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetErrorBoundary: () => void;
}

// Default fallback component to display when an error occurs
const DefaultFallback: React.FC<FallbackProps> = ({ error, errorInfo, resetErrorBoundary }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        m: 2, 
        backgroundColor: '#1e1e1e',
        color: '#fff',
        borderRadius: 2,
        border: '1px solid #f44336'
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom color="error">
        Something went wrong
      </Typography>
      
      <Typography variant="body1" paragraph>
        {error?.message || 'An unexpected error occurred'}
      </Typography>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={resetErrorBoundary}
        >
          Try Again
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => window.location.href = '/'}
        >
          Go to Homepage
        </Button>
      </Box>
      
      {process.env.NODE_ENV === 'development' && errorInfo && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Error Details (visible in development only):
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              p: 2, 
              backgroundColor: '#121212', 
              color: '#f44336',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.8rem',
              maxHeight: '200px'
            }}
          >
            {errorInfo.componentStack}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      errorInfo
    });
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return fallback;
      }
      
      return (
        <DefaultFallback 
          error={error} 
          errorInfo={errorInfo} 
          resetErrorBoundary={this.resetErrorBoundary} 
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
export { DefaultFallback };
export type { FallbackProps };