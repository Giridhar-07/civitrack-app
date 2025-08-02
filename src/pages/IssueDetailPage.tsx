import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Alert, Snackbar } from '@mui/material';
import IssueDetail from '../components/issues/IssueDetail';
import { Issue, IssueStatus } from '../types';
import issueService from '../services/issueService';
import Layout from '../components/layout/Layout';

const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  useEffect(() => {
    const fetchIssue = async () => {
      if (!id) {
        setError('Issue ID is missing');
        setLoading(false);
        return;
      }

      try {
        const data = await issueService.getIssueById(id);
        setIssue(data);
        
        // Check if user is admin (this would typically come from auth context)
        // For demo purposes, we'll just set it to true if the user is logged in
        const token = localStorage.getItem('token');
        setIsAdmin(!!token); // Set to true if token exists
      } catch (err) {
        console.error('Error fetching issue:', err);
        setError('Failed to load issue details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  const handleStatusUpdate = async (issueId: string, status: IssueStatus, comment: string) => {
    try {
      await issueService.updateIssueStatus(issueId, status, comment);
      
      // Refresh issue data
      const updatedIssue = await issueService.getIssueById(issueId);
      setIssue(updatedIssue);
      
      setSnackbar({
        open: true,
        message: 'Issue status updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating issue status:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update issue status',
        severity: 'error'
      });
      throw err; // Re-throw to be caught by the component
    }
  };

  const handleFlagIssue = async (issueId: string, reason: string) => {
    try {
      await issueService.flagIssue(issueId, reason);
      
      setSnackbar({
        open: true,
        message: 'Issue has been flagged for review',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error flagging issue:', err);
      setSnackbar({
        open: true,
        message: 'Failed to flag issue',
        severity: 'error'
      });
      throw err; // Re-throw to be caught by the component
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {issue ? (
          <IssueDetail 
            issue={issue}
            loading={loading}
            error={error}
            onStatusUpdate={handleStatusUpdate}
            onFlagIssue={handleFlagIssue}
            isAdmin={isAdmin}
          />
        ) : (
          <Box sx={{ py: 4 }}>
            {!loading && error && (
              <Alert severity="error">{error}</Alert>
            )}
          </Box>
        )}
        
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

export default IssueDetailPage;