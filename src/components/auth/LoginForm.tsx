import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Paper, Link, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authService, { LoginCredentials } from '../../services/authService';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Submitting login form with credentials:', { email: credentials.email });
      const response = await authService.login(credentials);
      console.log('Login successful, navigating to home page');
      
      // Add a small delay before navigation to ensure token is stored
      setTimeout(() => {
        navigate('/');
      }, 100);
      
      return response;
    } catch (err: any) {
      console.error('Login failed:', err);
      
      // Extract detailed error message from response
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle different error types
      if (err.errorCode === 'NETWORK_ERROR' || err.errorCode === 'TIMEOUT_ERROR') {
        // Handle network errors
        errorMessage = err.message || 'Network connection issue. Please check your internet connection and try again.';
      } else if (err.statusCode === 401) {
        // Handle authentication errors
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.message) {
        // Use the error message if available
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4, backgroundColor: '#000', color: '#fff', borderRadius: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Sign In
      </Typography>
      
      {error && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
          {error.split('\n').map((line, index) => (
            <Typography key={index} color="error" variant="body2" sx={{ mb: index < error.split('\n').length - 1 ? 1 : 0 }}>
              {line}
            </Typography>
          ))}
        </Box>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={credentials.email}
          onChange={handleChange}
          helperText="Enter your registered email address"
          FormHelperTextProps={{
            sx: { color: '#aaa' }
          }}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#444',
              },
              '&:hover fieldset': {
                borderColor: '#666',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#aaa',
            },
            '& .MuiInputBase-input': {
              color: '#fff',
            },
          }}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={credentials.password}
          onChange={handleChange}
          helperText="Password must contain uppercase, lowercase, and number"
          FormHelperTextProps={{
            sx: { color: '#aaa' }
          }}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#444',
              },
              '&:hover fieldset': {
                borderColor: '#666',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#aaa',
            },
            '& .MuiInputBase-input': {
              color: '#fff',
            },
          }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ 
            mt: 2, 
            mb: 2, 
            py: 1.5,
            backgroundColor: '#4CAF50',
            '&:hover': {
              backgroundColor: '#388E3C',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
        </Button>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#aaa' }}>
            Don't have an account?{' '}
            <Link 
              onClick={() => navigate('/register')} 
              sx={{ 
                cursor: 'pointer', 
                color: '#4CAF50',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Register here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginForm;