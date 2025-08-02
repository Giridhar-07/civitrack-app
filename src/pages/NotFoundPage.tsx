import React from 'react';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: '#1e1e1e'
          }}
        >
          <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: { xs: '4rem', md: '6rem' } }}>
            404
          </Typography>
          
          <Typography variant="h4" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            The page you are looking for doesn't exist or has been moved.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ 
                px: 4,
                py: 1.5,
                backgroundColor: '#4CAF50',
                '&:hover': {
                  backgroundColor: '#388E3C',
                },
              }}
            >
              Go to Homepage
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => navigate(-1)}
              sx={{ px: 4, py: 1.5 }}
            >
              Go Back
            </Button>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default NotFoundPage;