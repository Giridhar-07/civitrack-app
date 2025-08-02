import React, { useState } from 'react';
import { 
  Grid, 
  Box, 
  Typography, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Pagination, 
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  SelectChangeEvent
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import IssueCard from './IssueCard';
import { Issue, IssueStatus, IssueCategory } from '../../types';

interface IssueListProps {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  onFlagIssue?: (issue: Issue) => void;
  selectable?: boolean;
  selectedIssues?: Issue[];
  onSelectIssue?: (issue: Issue) => void;
}

const IssueList: React.FC<IssueListProps> = ({ 
  issues, 
  loading, 
  error, 
  onFlagIssue,
  selectable = false,
  selectedIssues = [],
  onSelectIssue
 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const issuesPerPage = 9;

  // Filter issues based on search term and filters
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? issue.status === statusFilter : true;
    const matchesCategory = categoryFilter ? issue.category === categoryFilter : true;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Paginate issues
  const indexOfLastIssue = page * issuesPerPage;
  const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
  const currentIssues = filteredIssues.slice(indexOfFirstIssue, indexOfLastIssue);
  const totalPages = Math.ceil(filteredIssues.length / issuesPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleStatusFilterChange = (e: SelectChangeEvent<string>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleCategoryFilterChange = (e: SelectChangeEvent<string>) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const isIssueSelected = (issue: Issue): boolean => {
    return selectedIssues.some(selected => selected.id === issue.id);
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#1e1e1e' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search issues..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#aaa' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#444',
                  },
                  '&:hover fieldset': {
                    borderColor: '#666',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label" sx={{ color: '#aaa' }}>Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
                sx={{ 
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#444',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#666',
                  },
                  '& .MuiInputBase-input': {
                    color: '#fff',
                  },
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {Object.values(IssueStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="category-filter-label" sx={{ color: '#aaa' }}>Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                label="Category"
                onChange={handleCategoryFilterChange}
                sx={{ 
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#444',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#666',
                  },
                  '& .MuiInputBase-input': {
                    color: '#fff',
                  },
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {Object.values(IssueCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : filteredIssues.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No issues found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentIssues.map((issue) => (
              <Grid item xs={12} sm={6} md={4} key={issue.id}>
                <IssueCard 
                  issue={issue} 
                  onFlag={onFlagIssue}
                  selectable={selectable}
                  selected={isIssueSelected(issue)}
                  onSelect={onSelectIssue}
                />
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default IssueList;