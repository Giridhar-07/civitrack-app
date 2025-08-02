import React, { useState, useEffect } from 'react';
import { Container, Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import Layout from '../components/layout/Layout';
import authService from '../services/authService';

const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const auth = await authService.isAuthenticated();
        setIsAuthenticated(auth);
        
        // Redirect to home if already authenticated
        if (auth) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // If already authenticated, don't render the registration form
  if (isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, sm: 6 }, 
            borderRadius: 2,
            backgroundColor: '#1e1e1e'
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Create an Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join CiviTrack to report and track civic issues
            </Typography>
          </Box>
          
          <RegisterForm />
        </Paper>
      </Container>
    </Layout>
  );
};

export default RegisterPage;