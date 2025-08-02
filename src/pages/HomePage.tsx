import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import { Add as AddIcon, Map as MapIcon, List as ListIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import IssueList from '../components/issues/IssueList';
import IssueMap from '../components/map/IssueMap';
import Layout from '../components/layout/Layout';
import { Issue } from '../types';
import issueService from '../services/issueService';
import authService from '../services/authService';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>(isMobile ? 'list' : 'map');
  
  // Get user's current location
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const auth = await authService.isAuthenticated();
        setIsAuthenticated(auth);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a location (e.g., city center) if geolocation fails
          setUserLocation([40.7128, -74.0060]); // New York City coordinates as default
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setUserLocation([40.7128, -74.0060]); // Default coordinates
    }

    // Fetch issues
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const data = await issueService.getAllIssues();
        setIssues(data);
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Failed to load issues. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const handleViewModeChange = (event: React.SyntheticEvent, newValue: 'list' | 'map') => {
    setViewMode(newValue);
  };

  const handleReportIssue = () => {
    navigate('/report');
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Civic Issues Near You
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Browse and report civic issues in your community
            </Typography>
          </Box>
          
          {isAuthenticated && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleReportIssue}
              sx={{ 
                py: 1.5,
                px: 3,
                backgroundColor: '#4CAF50',
                '&:hover': {
                  backgroundColor: '#388E3C',
                },
              }}
            >
              Report an Issue
            </Button>
          )}
        </Box>
        
        {isMobile && (
          <Paper sx={{ mb: 3, borderRadius: 2 }}>
            <Tabs
              value={viewMode}
              onChange={handleViewModeChange}
              variant="fullWidth"
              aria-label="view mode tabs"
            >
              <Tab 
                icon={<ListIcon />} 
                label="List View" 
                value="list" 
                sx={{ py: 2 }}
              />
              <Tab 
                icon={<MapIcon />} 
                label="Map View" 
                value="map" 
                sx={{ py: 2 }}
              />
            </Tabs>
          </Paper>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {(!isMobile || viewMode === 'list') && (
              <Grid item xs={12} md={6} lg={5} xl={4}>
                <IssueList 
                  issues={issues} 
                  loading={false} 
                  error={null} 
                />
              </Grid>
            )}
            
            {(!isMobile || viewMode === 'map') && (
              <Grid item xs={12} md={6} lg={7} xl={8}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    height: { xs: 'calc(100vh - 300px)', md: 'calc(100vh - 200px)' },
                    minHeight: '500px'
                  }}
                >
                  <IssueMap 
                    issues={issues} 
                    center={userLocation || [40.7128, -74.0060]} 
                    zoom={12} 
                    height="100%"
                  />
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
        
        {!isAuthenticated && (
          <Paper 
            elevation={3} 
            sx={{ 
              mt: 4, 
              p: 3, 
              borderRadius: 2,
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.3)'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Want to report an issue?
            </Typography>
            <Typography variant="body1" paragraph>
              Sign in to report civic issues in your community and help make a difference.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate('/register')}
              >
                Create Account
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </Layout>
  );
};

export default HomePage;