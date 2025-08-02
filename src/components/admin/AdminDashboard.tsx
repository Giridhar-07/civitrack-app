import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  Avatar
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Report as ReportIcon,
  Person as PersonIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Issue, IssueStatus, IssueCategory, User } from '../../types';
import issueService from '../../services/issueService';
import authService from '../../services/authService';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
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
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [flaggedIssues, setFlaggedIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Stats
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
    flaggedIssues: 0,
    totalUsers: 0
  });

  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newStatus, setNewStatus] = useState<IssueStatus>(IssueStatus.REPORTED);
  const [statusComment, setStatusComment] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, these would be separate admin API endpoints
      // For this demo, we'll use the existing services
      
      // Fetch all issues
      const allIssues = await issueService.getAllIssues();
      setIssues(allIssues);
      
      // Filter flagged issues
      const flagged = allIssues.filter(issue => issue.flags && issue.flags.length > 0);
      setFlaggedIssues(flagged);
      
      // In a real app, you would have an admin service to get users
      // For demo purposes, we'll just create some mock users
      const mockUsers = [
        { id: '1', username: 'johndoe', name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: new Date('2023-01-15') },
        { id: '2', username: 'janesmith', name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: new Date('2023-02-20') },
        { id: '3', username: 'adminuser', name: 'Admin User', email: 'admin@example.com', role: 'admin', createdAt: new Date('2022-12-01') },
      ] as User[];
      setUsers(mockUsers);
      
      // Calculate stats
      const resolved = allIssues.filter(issue => issue.status === IssueStatus.RESOLVED).length;
      const pending = allIssues.filter(issue => issue.status !== IssueStatus.RESOLVED && issue.status !== IssueStatus.CLOSED).length;
      
      setStats({
        totalIssues: allIssues.length,
        resolvedIssues: resolved,
        pendingIssues: pending,
        flaggedIssues: flagged.length,
        totalUsers: mockUsers.length
      });
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleViewIssue = (id: string) => {
    navigate(`/issues/${id}`);
  };

  const handleEditStatusClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setStatusComment('');
    setStatusDialogOpen(true);
  };

  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setIssueToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setIssueToDelete(null);
  };

  const handleStatusUpdate = async () => {
    if (!selectedIssue || !newStatus) return;
    
    setUpdating(true);
    try {
      await issueService.updateIssueStatus(selectedIssue.id, newStatus, statusComment);
      
      // Update the issues list
      const updatedIssues = issues.map(issue => 
        issue.id === selectedIssue.id 
          ? { ...issue, status: newStatus } 
          : issue
      );
      setIssues(updatedIssues);
      
      // Update flagged issues if necessary
      if (selectedIssue.flags && selectedIssue.flags.length > 0) {
        const updatedFlagged = flaggedIssues.map(issue => 
          issue.id === selectedIssue.id 
            ? { ...issue, status: newStatus } 
            : issue
        );
        setFlaggedIssues(updatedFlagged);
      }
      
      // Update stats
      updateStats(updatedIssues);
      
      handleStatusDialogClose();
    } catch (error) {
      console.error('Failed to update status:', error);
      setError('Failed to update issue status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteIssue = async () => {
    if (!issueToDelete) return;
    
    setDeleting(true);
    try {
      // In a real app, you would call an API to delete the issue
      // For demo purposes, we'll just remove it from the state
      
      // Remove from issues list
      const updatedIssues = issues.filter(issue => issue.id !== issueToDelete);
      setIssues(updatedIssues);
      
      // Remove from flagged issues if present
      const updatedFlagged = flaggedIssues.filter(issue => issue.id !== issueToDelete);
      setFlaggedIssues(updatedFlagged);
      
      // Update stats
      updateStats(updatedIssues);
      
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Failed to delete issue:', error);
      setError('Failed to delete issue. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const updateStats = (updatedIssues: Issue[]) => {
    const resolved = updatedIssues.filter(issue => issue.status === IssueStatus.RESOLVED).length;
    const pending = updatedIssues.filter(issue => issue.status !== IssueStatus.RESOLVED && issue.status !== IssueStatus.CLOSED).length;
    const flagged = updatedIssues.filter(issue => issue.flags && issue.flags.length > 0).length;
    
    setStats({
      ...stats,
      totalIssues: updatedIssues.length,
      resolvedIssues: resolved,
      pendingIssues: pending,
      flaggedIssues: flagged
    });
  };

  // Format date to a readable string
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get color based on status
  const getStatusColor = (status: IssueStatus): string => {
    switch (status) {
      case IssueStatus.REPORTED:
        return '#f44336'; // Red
      case IssueStatus.UNDER_REVIEW:
        return '#ff9800'; // Orange
      case IssueStatus.IN_PROGRESS:
        return '#2196f3'; // Blue
      case IssueStatus.RESOLVED:
        return '#4caf50'; // Green
      case IssueStatus.CLOSED:
        return '#9e9e9e'; // Grey
      default:
        return '#f44336'; // Default to red
    }
  };

  // Filter issues based on search term, status, and category
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = searchTerm === '' || 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get paginated issues
  const paginatedIssues = filteredIssues.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Dashboard Stats */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.primary.main, color: '#fff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="div">
                    Total Issues
                  </Typography>
                  <DashboardIcon fontSize="large" />
                </Box>
                <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                  {stats.totalIssues}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#4caf50', color: '#fff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="div">
                    Resolved
                  </Typography>
                  <ReportIcon fontSize="large" />
                </Box>
                <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                  {stats.resolvedIssues}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#ff9800', color: '#fff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="div">
                    Pending
                  </Typography>
                  <WarningIcon fontSize="large" />
                </Box>
                <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                  {stats.pendingIssues}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#f44336', color: '#fff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="div">
                    Flagged
                  </Typography>
                  <FlagIcon fontSize="large" />
                </Box>
                <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                  {stats.flaggedIssues}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="admin dashboard tabs"
          sx={{ 
            '& .MuiTab-root': { 
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            } 
          }}
        >
          <Tab label="All Issues" {...a11yProps(0)} />
          <Tab 
            label={(
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>Flagged Issues</span>
                {stats.flaggedIssues > 0 && (
                  <Chip 
                    label={stats.flaggedIssues} 
                    size="small" 
                    color="error" 
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                )}
              </Box>
            )} 
            {...a11yProps(1)} 
          />
          <Tab label="User Management" {...a11yProps(2)} />
        </Tabs>
      </Box>
      
      {/* All Issues Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField
            label="Search Issues"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              variant="outlined"
              size="small"
              sx={{ minWidth: 150 }}
              InputProps={{
                startAdornment: <FilterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {Object.values(IssueStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              label="Category"
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              variant="outlined"
              size="small"
              sx={{ minWidth: 150 }}
              InputProps={{
                startAdornment: <FilterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {Object.values(IssueCategory).map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
        
        <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e' }}>
          <Table sx={{ minWidth: 650 }} aria-label="issues table">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reported By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedIssues.length > 0 ? (
                paginatedIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell component="th" scope="row">
                      {issue.title}
                    </TableCell>
                    <TableCell>{issue.category}</TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.status} 
                        size="small"
                        sx={{ 
                          backgroundColor: getStatusColor(issue.status),
                          color: '#fff',
                        }} 
                      />
                    </TableCell>
                    <TableCell>{issue.reportedBy}</TableCell>
                    <TableCell>{formatDate(issue.reportedAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        aria-label="view"
                        onClick={() => handleViewIssue(issue.id)}
                        size="small"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        aria-label="edit status"
                        onClick={() => handleEditStatusClick(issue)}
                        size="small"
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        aria-label="delete"
                        onClick={() => handleDeleteClick(issue.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No issues found matching the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredIssues.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TabPanel>
      
      {/* Flagged Issues Tab */}
      <TabPanel value={tabValue} index={1}>
        {flaggedIssues.length > 0 ? (
          <>
            <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e' }}>
              <Table sx={{ minWidth: 650 }} aria-label="flagged issues table">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Flag Reason</TableCell>
                    <TableCell>Flagged By</TableCell>
                    <TableCell>Flagged Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flaggedIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell component="th" scope="row">
                        {issue.title}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={issue.status} 
                          size="small"
                          sx={{ 
                            backgroundColor: getStatusColor(issue.status),
                            color: '#fff',
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        {issue.flags && issue.flags.length > 0 
                          ? issue.flags[0].reason 
                          : 'No reason provided'}
                      </TableCell>
                      <TableCell>
                        {issue.flags && issue.flags.length > 0 
                          ? issue.flags[0].flaggedBy 
                          : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {issue.flags && issue.flags.length > 0 
                          ? formatDate(issue.flags[0].flaggedAt) 
                          : 'Unknown'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          aria-label="view"
                          onClick={() => handleViewIssue(issue.id)}
                          size="small"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          aria-label="edit status"
                          onClick={() => handleEditStatusClick(issue)}
                          size="small"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          aria-label="delete"
                          onClick={() => handleDeleteClick(issue.id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No Flagged Issues
            </Typography>
            <Typography variant="body1" color="text.secondary">
              There are currently no issues that have been flagged by users.
            </Typography>
          </Box>
        )}
      </TabPanel>
      
      {/* User Management Tab */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e' }}>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: theme.palette.primary.main }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      {user.name}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small"
                      color={user.role === 'admin' ? 'secondary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      aria-label="view user"
                      size="small"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      aria-label="edit user"
                      size="small"
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleStatusDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Issue Status
          <IconButton
            aria-label="close"
            onClick={handleStatusDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedIssue && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Issue: {selectedIssue.title}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <TextField
                select
                fullWidth
                label="New Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                margin="normal"
                sx={{ mb: 3 }}
              >
                {Object.values(IssueStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                fullWidth
                label="Comment (Optional)"
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                margin="normal"
                multiline
                rows={4}
                placeholder="Add a comment explaining the status change"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusDialogClose}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained" 
            disabled={updating || !!(selectedIssue && newStatus === selectedIssue.status)}
            sx={{ 
              backgroundColor: '#4CAF50',
              '&:hover': {
                backgroundColor: '#388E3C',
              },
            }}
          >
            {updating ? <CircularProgress size={24} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          Confirm Deletion
          <IconButton
            aria-label="close"
            onClick={handleDeleteDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this issue? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button 
            onClick={handleDeleteIssue} 
            variant="contained" 
            color="error" 
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;