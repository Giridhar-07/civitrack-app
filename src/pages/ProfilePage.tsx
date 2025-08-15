import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
  History as HistoryIcon,
  Bookmark as BookmarkIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import IssueList from '../components/issues/IssueList';
import Layout from '../components/layout/Layout';
import { Issue, User } from '../types';
import authService from '../services/authService';
import issueService from '../services/issueService';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit profile state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    username: ''
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get current user
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        // Initialize edit form data
        if (currentUser) {
          setEditFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            username: currentUser.username || ''
          });
        }
        
        // Get user's issues
        if (currentUser && currentUser.id) {
          const issues = await issueService.getIssuesByUser();
          setUserIssues(issues);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleEditDialogOpen = () => {
    if (user) {
      setEditFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || ''
      });
    }
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updatedUser = await api.put<User>('/auth/profile', editFormData);
      
      // Update local user state
      setUser(updatedUser.data);
      setEditDialogOpen(false);
      setSnackbar({ 
        open: true, 
        message: 'Profile updated successfully!', 
        severity: 'success' 
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSnackbar({ 
        open: true, 
        message: error?.message || 'Failed to update profile. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'User not found. Please log in again.'}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} lg={3}>
            <Paper elevation={3} sx={{ p: 3, backgroundColor: '#1e1e1e', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: theme.palette.primary.main,
                    fontSize: '2.5rem',
                    mb: 2
                  }}
                >
                  {(user?.name?.[0] ?? user?.username?.[0] ?? '?').toUpperCase()}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Issues Reported
                </Typography>
                <Typography variant="body1">
                  {userIssues.length}
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<EditIcon />}
                onClick={handleEditDialogOpen}
                sx={{ mb: 2 }}
              >
                Edit Profile
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8} lg={9}>
            <Paper elevation={3} sx={{ backgroundColor: '#1e1e1e', borderRadius: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  aria-label="profile tabs"
                  sx={{ 
                    '& .MuiTab-root': { 
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 500,
                      py: 2
                    } 
                  }}
                >
                  <Tab 
                    icon={<HistoryIcon />} 
                    iconPosition="start" 
                    label="My Issues" 
                    {...a11yProps(0)} 
                  />
                  <Tab 
                    icon={<BookmarkIcon />} 
                    iconPosition="start" 
                    label="Saved Issues" 
                    {...a11yProps(1)} 
                  />
                </Tabs>
              </Box>
              
              <TabPanel value={tabValue} index={0}>
                {userIssues.length > 0 ? (
                  <IssueList 
                    issues={userIssues} 
                    loading={false} 
                    error={null} 
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      No Issues Reported
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      You haven't reported any civic issues yet.
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => navigate('/report')}
                      sx={{ 
                        mt: 2,
                        backgroundColor: '#4CAF50',
                        '&:hover': {
                          backgroundColor: '#388E3C',
                        },
                      }}
                    >
                      Report an Issue
                    </Button>
                  </Box>
                )}
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    No Saved Issues
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    You haven't saved any issues for later reference.
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/')}
                    sx={{ 
                      mt: 2,
                      backgroundColor: '#2196F3',
                      '&:hover': {
                        backgroundColor: '#1976D2',
                      },
                    }}
                  >
                    Browse Issues
                  </Button>
                </Box>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Edit Profile Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleEditDialogClose} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            Edit Profile
            <IconButton
              aria-label="close"
              onClick={handleEditDialogClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={editFormData.name}
              onChange={handleInputChange('name')}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editFormData.email}
              onChange={handleInputChange('email')}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Username"
              value={editFormData.username}
              onChange={handleInputChange('username')}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose}>Cancel</Button>
            <Button 
              onClick={handleSaveProfile} 
              variant="contained" 
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default ProfilePage;