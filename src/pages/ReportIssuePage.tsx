import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import IssueForm from '../components/issues/IssueForm';
import Layout from '../components/layout/Layout';
import authService from '../services/authService';

const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const auth = await authService.isAuthenticated();
        setIsAuthenticated(auth);
        setLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography>Loading...</Typography>
        </Container>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            You need to be logged in to report an issue.
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Report a Civic Issue
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Help improve your community by reporting issues that need attention
          </Typography>
        </Box>
        
        <IssueForm />
      </Container>
    </Layout>
  );
};

export default ReportIssuePage;