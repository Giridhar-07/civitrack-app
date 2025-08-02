import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  Button, 
  IconButton,
  Checkbox,
  CardActionArea,
  CardActions
} from '@mui/material';
import { 
  Flag as FlagIcon, 
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Issue, IssueStatus } from '../../types';

interface IssueCardProps {
  issue: Issue;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (issue: Issue) => void;
  onFlag?: (issue: Issue) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ 
  issue, 
  selectable = false, 
  selected = false, 
  onSelect, 
  onFlag 
}) => {
  const navigate = useNavigate();

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

  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(issue);
    } else {
      navigate(`/issues/${issue.id}`);
    }
  };

  const handleFlagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFlag) {
      onFlag(issue);
    }
  };

  return (
    <Card 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#1e1e1e',
        borderRadius: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
        },
        border: selected ? '2px solid #4CAF50' : 'none'
      }}
    >
      <CardActionArea onClick={handleCardClick} sx={{ flexGrow: 1 }}>
        {issue.photos && issue.photos.length > 0 && (
          <CardMedia
            component="img"
            height="140"
            image={issue.photos[0]}
            alt={issue.title}
          />
        )}
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '80%' }}>
              {issue.title}
            </Typography>
            
            {selectable && (
              <Checkbox 
                checked={selected} 
                onClick={(e) => e.stopPropagation()} 
                onChange={() => onSelect && onSelect(issue)}
                sx={{ p: 0, color: '#4CAF50', '&.Mui-checked': { color: '#4CAF50' } }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip 
              label={issue.status} 
              size="small" 
              sx={{ 
                backgroundColor: getStatusColor(issue.status),
                color: '#fff',
                mr: 1
              }} 
            />
            <Chip 
              label={issue.category} 
              size="small" 
              variant="outlined"
              sx={{ borderColor: '#666', color: '#fff' }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
            {issue.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#aaa', mb: 1 }}>
            <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {issue.location.address || `${issue.location.latitude.toFixed(6)}, ${issue.location.longitude.toFixed(6)}`}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#aaa' }}>
            <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              Reported on {formatDate(issue.reportedAt)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
      
      <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
        <Button 
          size="small" 
          startIcon={<CommentIcon />}
          onClick={() => navigate(`/issues/${issue.id}`)}
          sx={{ color: '#4CAF50' }}
        >
          Details
        </Button>
        
        {onFlag && (
          <IconButton 
            size="small" 
            onClick={handleFlagClick}
            aria-label="flag issue"
            sx={{ color: '#f44336' }}
          >
            <FlagIcon fontSize="small" />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );
};

export default IssueCard;