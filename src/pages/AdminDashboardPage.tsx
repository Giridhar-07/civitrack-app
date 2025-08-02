import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/admin/AdminDashboard';
import Layout from '../components/layout/Layout';
import authService from '../services/authService';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // In a real application, you would check if the user is an admin
        // For this demo, we'll just check if the user is authenticated
        const isAuthenticated = await authService.isAuthenticated();
        
        // For demo purposes, we'll consider any authenticated user as an admin
        // In a real app, you would check the user's role
        setIsAdmin(isAuthenticated);
        
        if (!isAuthenticated) {
          setError('You must be logged in to access the admin dashboard.');
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify admin status. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>Loading...</Typography>
        </Container>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'You do not have permission to access this page.'}
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
            onClick={() => navigate('/')}
          >
            Go to Homepage
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <AdminDashboard />
      </Container>
    </Layout>
  );
};

export default AdminDashboardPage;