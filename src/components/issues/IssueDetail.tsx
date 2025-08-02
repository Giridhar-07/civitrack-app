import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  Button, 
  TextField, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Divider,
  Avatar,
  CircularProgress,
  Card,
  CardMedia,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Flag as FlagIcon, 
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Issue, IssueStatus, StatusLog } from '../../types';
import IssueMap from '../map/IssueMap';
import issueService from '../../services/issueService';

interface IssueDetailProps {
  issue: Issue;
  loading: boolean;
  error: string | null;
  onStatusUpdate?: (id: string, status: IssueStatus, comment: string) => Promise<void>;
  onFlagIssue?: (id: string, reason: string) => Promise<void>;
  isAdmin?: boolean;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ 
  issue, 
  loading, 
  error, 
  onStatusUpdate, 
  onFlagIssue,
  isAdmin = false
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<IssueStatus>(issue.status);
  const [statusComment, setStatusComment] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  // Format date to a readable string
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const handleStatusDialogOpen = () => {
    setNewStatus(issue.status);
    setStatusComment('');
    setStatusDialogOpen(true);
  };

  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
  };

  const handleFlagDialogOpen = () => {
    setFlagReason('');
    setFlagDialogOpen(true);
  };

  const handleFlagDialogClose = () => {
    setFlagDialogOpen(false);
  };

  const handleStatusUpdate = async () => {
    if (!onStatusUpdate) return;
    
    setUpdating(true);
    try {
      await onStatusUpdate(issue.id, newStatus, statusComment);
      handleStatusDialogClose();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleFlagSubmit = async () => {
    if (!onFlagIssue) return;
    
    setFlagging(true);
    try {
      await onFlagIssue(issue.id, flagReason);
      handleFlagDialogClose();
    } catch (error) {
      console.error('Failed to flag issue:', error);
    } finally {
      setFlagging(false);
    }
  };

  const handlePhotoClick = (index: number) => {
    setCurrentPhotoIndex(index);
    setPhotoDialogOpen(true);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? issue.photos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === issue.photos.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 4, backgroundColor: '#1e1e1e' }}>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to Issues
      </Button>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4, backgroundColor: '#1e1e1e' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {issue.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip 
                  label={issue.status} 
                  sx={{ 
                    backgroundColor: getStatusColor(issue.status),
                    color: '#fff',
                  }} 
                />
                <Chip 
                  label={issue.category} 
                  variant="outlined"
                  sx={{ borderColor: '#666', color: '#fff' }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', color: '#aaa', mb: 1 }}>
                <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  Reported on {formatDate(issue.reportedAt)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', color: '#aaa', mb: 3 }}>
                <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {issue.location.address || `${issue.location.latitude.toFixed(6)}, ${issue.location.longitude.toFixed(6)}`}
                </Typography>
              </Box>
              
              <Typography variant="body1" paragraph>
                {issue.description}
              </Typography>
              
              {isAdmin && (
                <Button
                  variant="contained"
                  onClick={handleStatusDialogOpen}
                  startIcon={<EditIcon />}
                  sx={{ 
                    mt: 2,
                    backgroundColor: '#4CAF50',
                    '&:hover': {
                      backgroundColor: '#388E3C',
                    },
                  }}
                >
                  Update Status
                </Button>
              )}
              
              {!isAdmin && (
                <Button
                  variant="outlined"
                  onClick={handleFlagDialogOpen}
                  startIcon={<FlagIcon />}
                  color="error"
                  sx={{ mt: 2 }}
                >
                  Flag Issue
                </Button>
              )}
            </Box>
            
            {issue.photos && issue.photos.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Photos
                </Typography>
                <Grid container spacing={2}>
                  {issue.photos.map((photo, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <Card 
                        onClick={() => handlePhotoClick(index)}
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="140"
                          image={photo}
                          alt={`Issue photo ${index + 1}`}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            {issue.statusLogs && issue.statusLogs.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Status History
                </Typography>
                <Paper variant="outlined" sx={{ p: 0, backgroundColor: 'transparent', borderColor: '#444' }}>
                  {issue.statusLogs.map((log: StatusLog, index: number) => (
                    <Box key={log.id}>
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: getStatusColor(log.status), mr: 1 }}>
                            {log.status.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              Status changed to <strong>{log.status}</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(log.changedAt)} by {log.changedBy}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {log.comment && (
                          <Typography variant="body2" sx={{ pl: 5 }}>
                            {log.comment}
                          </Typography>
                        )}
                      </Box>
                      {issue.statusLogs && index < issue.statusLogs.length - 1 && <Divider sx={{ backgroundColor: '#333' }} />}
                    </Box>
                  ))}
                </Paper>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <IssueMap 
              issues={[issue]}
              center={[issue.location.latitude, issue.location.longitude]}
              zoom={15}
              height={300}
            />
          </Grid>
        </Grid>
      </Paper>
      
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusDialogClose}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained" 
            disabled={updating || newStatus === issue.status}
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
      
      {/* Flag Issue Dialog */}
      <Dialog open={flagDialogOpen} onClose={handleFlagDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Flag This Issue
          <IconButton
            aria-label="close"
            onClick={handleFlagDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            If you believe this issue is inappropriate, contains false information, or violates community guidelines, please let us know.
          </Typography>
          
          <TextField
            fullWidth
            label="Reason for Flagging"
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            placeholder="Please explain why you are flagging this issue"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFlagDialogClose}>Cancel</Button>
          <Button 
            onClick={handleFlagSubmit} 
            variant="contained" 
            color="error" 
            disabled={flagging || !flagReason.trim()}
          >
            {flagging ? <CircularProgress size={24} /> : 'Submit Flag'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Photo Viewer Dialog */}
      <Dialog 
        open={photoDialogOpen} 
        onClose={() => setPhotoDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            aria-label="close"
            onClick={() => setPhotoDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1 }}
          >
            <CloseIcon sx={{ color: '#fff' }} />
          </IconButton>
          
          {issue.photos && issue.photos.length > 0 && (
            <Box sx={{ position: 'relative' }}>
              <img 
                src={issue.photos[currentPhotoIndex]} 
                alt={`Issue photo ${currentPhotoIndex + 1}`} 
                style={{ width: '100%', height: 'auto', display: 'block' }} 
              />
              
              {issue.photos.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrevPhoto}
                    sx={{ 
                      position: 'absolute', 
                      left: 8, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                  >
                    <PrevIcon sx={{ color: '#fff' }} />
                  </IconButton>
                  
                  <IconButton
                    onClick={handleNextPhoto}
                    sx={{ 
                      position: 'absolute', 
                      right: 8, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                  >
                    <NextIcon sx={{ color: '#fff' }} />
                  </IconButton>
                  
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1
                  }}>
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {currentPhotoIndex + 1} / {issue.photos.length}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default IssueDetail;