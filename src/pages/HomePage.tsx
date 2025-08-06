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
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Map as MapIcon, List as ListIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import IssueList from '../components/issues/IssueList';
import IssueMap from '../components/map/IssueMap';
import Layout from '../components/layout/Layout';
import { Issue } from '../types';
import issueService from '../services/issueService';
import { useAuth, useTheme, useApi } from '../hooks';

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>(isMobile ? 'list' : 'map');
  
  // Get user's current location
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('all');
  
  // Use our custom hook for API calls
  const { 
    data: issues = [], 
    loading, 
    error,
    execute: fetchIssues
  } = useApi(issueService.getAllIssues, { immediate: true });
  
  // Filtered issues based on search term and category
  const filteredIssues = React.useMemo(() => {
    if (!searchTerm && searchCategory === 'all') return issues;
    
    return issues?.filter(issue => {
      const matchesTerm = searchTerm ? 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) : 
        true;
        
      const matchesCategory = searchCategory !== 'all' ? 
        issue.category === searchCategory : 
        true;
        
      return matchesTerm && matchesCategory;
    });
  }, [issues, searchTerm, searchCategory]);

  useEffect(() => {
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
  }, []);

  const handleViewModeChange = (event: React.SyntheticEvent, newValue: 'list' | 'map') => {
    console.log('Changing view mode to:', newValue);
    setViewMode(newValue);
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle category filter change
  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSearchCategory(event.target.value as string);
  };
  
  // Refresh issues
  const handleRefresh = () => {
    console.log('Refreshing issues...');
    fetchIssues();
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
        
        {/* Search and filter section */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search issues"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ flexGrow: 1, minWidth: '200px' }}
            />
            <FormControl variant="outlined" size="small" sx={{ minWidth: '150px' }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={searchCategory}
                onChange={(event) => handleCategoryChange(event as any)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="roads">Roads</MenuItem>
                <MenuItem value="utilities">Utilities</MenuItem>
                <MenuItem value="parks">Parks</MenuItem>
                <MenuItem value="safety">Safety</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Box>
        </Paper>
        
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
          {error?.message || 'An error occurred'}
        </Alert>
        ) : (
          <Grid container spacing={4}>
            {(!isMobile || viewMode === 'list') && (
              <Grid item xs={12} md={6} lg={5} xl={4}>
                <IssueList 
                  issues={filteredIssues || []} 
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
                    issues={Array.isArray(filteredIssues) ? filteredIssues : []} 
                    center={userLocation || [40.7128, -74.0060]} 
                    zoom={12} 
                    height="100%"
                  />
                </Paper>
              </Grid>
            )}
            
            {filteredIssues?.length === 0 && !loading && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    No issues found matching your search criteria.
                  </Typography>
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