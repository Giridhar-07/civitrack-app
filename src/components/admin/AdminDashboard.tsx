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
  Avatar,
  InputAdornment
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
import { useApi, useFiltering, usePagination, useTheme, useNotification } from '../../hooks';
// Add missing imports
import statusRequestService from '../../services/statusRequestService';
import { StatusRequest, StatusRequestAction, StatusRequestState } from '../../types';
import { ChangeCircle as RequestIcon, Check as CheckIcon, Clear as RejectIcon } from '@mui/icons-material';

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
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Use our custom hook for API calls
  const { 
    data: issues = [], 
    loading, 
    error: apiError,
    execute: fetchIssues
  } = useApi(issueService.getAllIssues);
  
  // Status requests API call
  const {
    data: statusRequestsData,
    loading: statusRequestsLoading,
    error: statusRequestsError,
    execute: fetchStatusRequests
  } = useApi(statusRequestService.adminGetStatusRequests);
  
  const [flaggedIssues, setFlaggedIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Use our custom filtering hook
  const {
    filters,
    setFilter,
    filteredData: filteredIssues
  } = useFiltering({
    data: issues ?? [],
    initialFilters: {
      searchTerm: '',
      status: 'all',
      category: 'all'
    },
    filterFn: (issue, filters) => {
      const searchTermLower = filters.searchTerm ? String(filters.searchTerm).toLowerCase() : '';
      const titleStr = issue.title !== undefined && issue.title !== null ? issue.title.toString().toLowerCase() : '';
      const descriptionStr = issue.description !== undefined && issue.description !== null ? issue.description.toString().toLowerCase() : '';
      const matchesSearch = !filters.searchTerm || 
        titleStr.includes(searchTermLower) || 
        descriptionStr.includes(searchTermLower);
      
      const matchesStatus = filters.status === 'all' || issue.status === filters.status;
      const matchesCategory = filters.category === 'all' || issue.category === filters.category;
      
      return matchesSearch && matchesStatus && matchesCategory;
    }
  });

  // Status requests filtering
  const {
    filters: statusRequestFilters,
    setFilter: setStatusRequestFilter,
    filteredData: filteredStatusRequests
  } = useFiltering({
    data: statusRequestsData?.statusRequests ?? [],
    initialFilters: {
      searchTerm: '',
      status: 'all'
    },
    filterFn: (request, filters) => {
      const searchTermLower = filters.searchTerm ? String(filters.searchTerm).toLowerCase() : '';
      const matchesSearch = !filters.searchTerm || 
        (request.requestedBy && request.requestedBy.toLowerCase().includes(searchTermLower)) ||
        (request.issue?.title && request.issue.title.toLowerCase().includes(searchTermLower));
      
      const matchesStatus = filters.status === 'all' || request.status === filters.status;
      
      return matchesSearch && matchesStatus;
    }
  });
  
  // Use our custom pagination hook
  const {
    page,
    pageSize: rowsPerPage,
    setPage,
    setPageSize: setRowsPerPage,
    metadata
  } = usePagination({
    initialPage: 0,
    initialPageSize: 10,
    totalItems: filteredIssues.length
  });

  // Status requests pagination
  const {
    page: statusRequestsPage,
    pageSize: statusRequestsRowsPerPage,
    setPage: setStatusRequestsPage,
    setPageSize: setStatusRequestsRowsPerPage
  } = usePagination({
    initialPage: 0,
    initialPageSize: 10,
    totalItems: filteredStatusRequests.length
  });
  
  // Stats
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
    flaggedIssues: 0,
    totalUsers: 0,
    pendingStatusRequests: 0
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

  // Status request review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedStatusRequest, setSelectedStatusRequest] = useState<StatusRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<StatusRequestAction>('approve');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all issues
      await fetchIssues();
      
      // Fetch status requests
      await fetchStatusRequests();
      
      // In a real app, you would have an admin service to get users
      // For demo purposes, we'll just create some mock users
      const mockUsers = [
        { id: '1', username: 'johndoe', name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: new Date('2023-01-15') },
        { id: '2', username: 'janesmith', name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: new Date('2023-02-20') },
        { id: '3', username: 'adminuser', name: 'Admin User', email: 'admin@example.com', role: 'admin', createdAt: new Date('2022-12-01') },
      ] as User[];
      setUsers(mockUsers);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showError('Failed to load dashboard data. Please try again later.');
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

  // Handlers for Status Requests pagination
  const handleStatusRequestsChangePage = (event: unknown, newPage: number) => {
    setStatusRequestsPage(newPage);
  };

  const handleStatusRequestsChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusRequestsRowsPerPage(parseInt(event.target.value, 10));
    setStatusRequestsPage(0);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter('status', event.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter('category', event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter('searchTerm', event.target.value);
    setPage(0);
  };

  const handleStatusRequestSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusRequestFilter('searchTerm', event.target.value);
    setStatusRequestsPage(0);
  };

  const handleStatusRequestStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusRequestFilter('status', event.target.value);
    setStatusRequestsPage(0);
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

  const handleReviewStatusRequest = (request: StatusRequest, action: StatusRequestAction) => {
    setSelectedStatusRequest(request);
    setReviewAction(action);
    setReviewComment('');
    setReviewDialogOpen(true);
  };

  const handleReviewDialogClose = () => {
    setReviewDialogOpen(false);
    setSelectedStatusRequest(null);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!selectedStatusRequest) return;

    setReviewing(true);
    try {
      await statusRequestService.adminReviewStatusRequest(
        selectedStatusRequest.id,
        reviewAction,
        reviewComment
      );

      showSuccess(`Status request ${reviewAction}d successfully`);
      
      // Refresh status requests
      await fetchStatusRequests();
      
      handleReviewDialogClose();
    } catch (error) {
      console.error('Failed to review status request:', error);
      showError('Failed to review status request. Please try again.');
    } finally {
      setReviewing(false);
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
  const formatDate = (date: string | Date): string => {
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

  // Get color based on status request state
  const getStatusRequestStateColor = (state: StatusRequestState): string => {
    switch (state) {
      case 'pending':
        return '#ff9800'; // Orange
      case 'approved':
        return '#4caf50'; // Green
      case 'rejected':
        return '#f44336'; // Red
      default:
        return '#9e9e9e'; // Grey
    }
  };

  // Calculate stats based on issues data
  useEffect(() => {
    if (issues && issues.length > 0) {
      // Filter flagged issues
      const flagged = issues.filter(issue => issue.flags && issue.flags.length > 0);
      setFlaggedIssues(flagged);
      
      // Calculate stats
      const resolved = issues.filter(issue => issue.status === IssueStatus.RESOLVED).length;
      const pending = issues.filter(issue => 
        issue.status !== IssueStatus.RESOLVED && issue.status !== IssueStatus.CLOSED
      ).length;
      
      const pendingStatusRequests = statusRequestsData?.statusRequests?.filter(
        request => request.status === 'pending'
      ).length || 0;
      
      setStats({
        totalIssues: issues.length,
        resolvedIssues: resolved,
        pendingIssues: pending,
        flaggedIssues: flagged.length,
        totalUsers: users.length,
        pendingStatusRequests
      });
    }
  }, [issues, users, statusRequestsData]);

  // Get paginated issues
  const paginatedIssues = filteredIssues.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Get paginated status requests
  const paginatedStatusRequests = filteredStatusRequests.slice(
    statusRequestsPage * statusRequestsRowsPerPage, 
    statusRequestsPage * statusRequestsRowsPerPage + statusRequestsRowsPerPage
  );

  const handleStatusUpdate = async () => {
    if (!selectedIssue || !newStatus) return;
    
    setUpdating(true);
    try {
      await issueService.updateIssueStatus(selectedIssue.id, newStatus, statusComment);
      
      // Update the issues list
      const updatedIssues = issues ? issues.map(issue => 
        issue.id === selectedIssue.id 
          ? { ...issue, status: newStatus } 
          : issue 
      ) : [];
      await fetchIssues(); // Refetch issues from API after update
      
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
      setErrorMessage('Failed to update issue status. Please try again.');
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
      const updatedIssues = issues?.filter(issue => issue.id !== issueToDelete) ?? [];
      await fetchIssues(); // Refetch issues from API after deletion
      
      // Remove from flagged issues if present
      const updatedFlagged = flaggedIssues.filter(issue => issue.id !== issueToDelete);
      setFlaggedIssues(updatedFlagged);
      
      // Update stats
      updateStats(updatedIssues);
      
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Failed to delete issue:', error);
      setErrorMessage('Failed to delete issue. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError?.message || JSON.stringify(apiError) || 'An error occurred'}
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
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#9c27b0', color: '#fff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="div">
                    Requests
                  </Typography>
                  <RequestIcon fontSize="large" />
                </Box>
                <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                  {stats.pendingStatusRequests}
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
          <Tab 
            label={(
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>Status Requests</span>
                {stats.pendingStatusRequests > 0 && (
                  <Chip 
                    label={stats.pendingStatusRequests} 
                    size="small" 
                    color="warning" 
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                )}
              </Box>
            )} 
            {...a11yProps(2)} 
          />
          <Tab label="User Management" {...a11yProps(3)} />
        </Tabs>
      </Box>
      
      {/* All Issues Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField
            label="Search Issues"
            variant="outlined"
            size="small"
            value={filters.searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Status"
              value={filters.status}
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
              value={filters.category}
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
          sx={{ 
            color: '#fff',
            '.MuiTablePagination-selectIcon': {
              color: '#aaa',
            },
          }}
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
      
      {/* Status Requests Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField
            label="Search Requests"
            variant="outlined"
            size="small"
            value={statusRequestFilters.searchTerm}
            onChange={handleStatusRequestSearchChange}
            placeholder="Search by requester or issue title..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <TextField
            select
            label="Status"
            value={statusRequestFilters.status}
            onChange={handleStatusRequestStatusFilterChange}
            variant="outlined"
            size="small"
            sx={{ minWidth: 150 }}
            InputProps={{
              startAdornment: <FilterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
        </Box>

        {statusRequestsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : statusRequestsError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load status requests. Please try again later.
          </Alert>
        ) : paginatedStatusRequests.length > 0 ? (
          <>
            <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e' }}>
              <Table sx={{ minWidth: 650 }} aria-label="status requests table">
                <TableHead>
                  <TableRow>
                    <TableCell>Issue</TableCell>
                    <TableCell>Requested By</TableCell>
                    <TableCell>Current Status</TableCell>
                    <TableCell>Requested Status</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedStatusRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {request.issue?.title || `Issue #${request.issueId}`}
                        </Typography>
                      </TableCell>
                      <TableCell>{request.requestedBy}</TableCell>
                      <TableCell>
                        <Chip 
                          label={request.currentStatus} 
                          size="small"
                          sx={{ 
                            backgroundColor: getStatusColor(request.currentStatus as IssueStatus),
                            color: '#fff',
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.requestedStatus} 
                          size="small"
                          sx={{ 
                            backgroundColor: getStatusColor(request.requestedStatus as IssueStatus),
                            color: '#fff',
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {request.reason || 'No reason provided'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status} 
                          size="small"
                          sx={{ 
                            backgroundColor: getStatusRequestStateColor(request.status),
                            color: '#fff',
                          }} 
                        />
                      </TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          aria-label="view issue"
                          onClick={() => handleViewIssue(request.issueId)}
                          size="small"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {request.status === 'pending' && (
                          <>
                            <IconButton 
                              aria-label="approve"
                              onClick={() => handleReviewStatusRequest(request, 'approve')}
                              size="small"
                              color="success"
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              aria-label="reject"
                              onClick={() => handleReviewStatusRequest(request, 'reject')}
                              size="small"
                              color="error"
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredStatusRequests.length}
              rowsPerPage={statusRequestsRowsPerPage}
              page={statusRequestsPage}
              onPageChange={handleStatusRequestsChangePage}
              onRowsPerPageChange={handleStatusRequestsChangeRowsPerPage}
              sx={{ 
                color: '#fff',
                '.MuiTablePagination-selectIcon': {
                  color: '#aaa',
                },
              }}
            />
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No Status Requests
            </Typography>
            <Typography variant="body1" color="text.secondary">
              There are currently no status change requests from users.
            </Typography>
          </Box>
        )}
      </TabPanel>
      
      {/* User Management Tab */}
      <TabPanel value={tabValue} index={3}>
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

      {/* Status Request Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={handleReviewDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewAction === 'approve' ? 'Approve' : 'Reject'} Status Request
          <IconButton
            aria-label="close"
            onClick={handleReviewDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedStatusRequest && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Issue: {selectedStatusRequest.issue?.title || `Issue #${selectedStatusRequest.issueId}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Requested by: {selectedStatusRequest.requestedBy}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Status Change Request:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Chip 
                    label={selectedStatusRequest.currentStatus} 
                    size="small"
                    sx={{ 
                      backgroundColor: getStatusColor(selectedStatusRequest.currentStatus as IssueStatus),
                      color: '#fff',
                    }} 
                  />
                  <Typography>→</Typography>
                  <Chip 
                    label={selectedStatusRequest.requestedStatus} 
                    size="small"
                    sx={{ 
                      backgroundColor: getStatusColor(selectedStatusRequest.requestedStatus as IssueStatus),
                      color: '#fff',
                    }} 
                  />
                </Box>
                {selectedStatusRequest.reason && (
                  <Typography variant="body2" color="text.secondary">
                    Reason: {selectedStatusRequest.reason}
                  </Typography>
                )}
              </Box>
              
              <TextField
                fullWidth
                label={`${reviewAction === 'approve' ? 'Approval' : 'Rejection'} Comment (Optional)`}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                placeholder={`Add a comment explaining your ${reviewAction} decision`}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReviewDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmitReview} 
            variant="contained" 
            disabled={reviewing}
            color={reviewAction === 'approve' ? 'success' : 'error'}
          >
            {reviewing ? <CircularProgress size={24} /> : (reviewAction === 'approve' ? 'Approve' : 'Reject')}
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