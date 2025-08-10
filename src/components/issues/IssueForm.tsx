import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  MenuItem, 
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardMedia,
  IconButton,
  Alert
} from '@mui/material';
import { 
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { IssueCategory, Location } from '../../types';
import LocationPicker from '../map/LocationPicker';
import issueService, { IssueFormData } from '../../services/issueService';
import useApiForm from '../../hooks/useApiForm';

const IssueForm: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  
  // Initialize form with useApiForm hook
  const form = useApiForm<IssueFormData, void>(
    // Submit function
    async (data) => {
      await issueService.createIssue(data);
    },
    {
      // Initial form data
      initialData: {
        title: '',
        description: '',
        category: IssueCategory.OTHER,
        location: { latitude: 0, longitude: 0 },
        photos: []
      },
      // Success callback
      onSuccess: () => {
        setSuccess(true);
        // Clean up preview URLs
        photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      },
      // Reset form after successful submission
      resetOnSuccess: true
    }
  );

  // Destructure form state and handlers
  const { data: formData, submitting, error, fieldErrors, handleSubmit, handleChange: formHandleChange } = form;

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    formHandleChange(name as keyof IssueFormData, value);
  };

  const handleLocationSelect = (location: Location) => {
    form.setFields({ location });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Limit to 3 photos
      if (photoFiles.length + files.length > 3) {
        // Use form's error state through setFields for consistency
        form.setFields({ ...formData });
        return;
      }
      
      const newPhotoFiles = [...photoFiles, ...files];
      setPhotoFiles(newPhotoFiles);
      
      // Create preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
      // Update form data with new photos
      form.setFields({ photos: newPhotoFiles });
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotoFiles = [...photoFiles];
    const newPhotoPreviewUrls = [...photoPreviewUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPhotoPreviewUrls[index]);
    
    newPhotoFiles.splice(index, 1);
    newPhotoPreviewUrls.splice(index, 1);
    
    setPhotoFiles(newPhotoFiles);
    setPhotoPreviewUrls(newPhotoPreviewUrls);
    
    // Update form data
    form.setFields({ photos: newPhotoFiles });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic info
        if (!formData.title.trim()) {
          return false;
        }
        if (!formData.description.trim()) {
          return false;
        }
        if (!formData.category) {
          return false;
        }
        return true;
        
      case 1: // Location
        if (!formData.location || formData.location.latitude === 0 && formData.location.longitude === 0) {
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(activeStep)) return;
    
    // Use the handleSubmit from useApiForm
    handleSubmit(e);
  };

  const steps = ['Basic Information', 'Location', 'Photos', 'Review & Submit'];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Issue Details
            </Typography>
            
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#444',
                  },
                  '&:hover fieldset': {
                    borderColor: '#666',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#aaa',
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                },
              }}
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              required
              multiline
              rows={4}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#444',
                  },
                  '&:hover fieldset': {
                    borderColor: '#666',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#aaa',
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                },
              }}
            />
            
            <TextField
              select
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#444',
                  },
                  '&:hover fieldset': {
                    borderColor: '#666',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#aaa',
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                },
              }}
            >
              {Object.values(IssueCategory).map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
        
      case 1:
        return (
          <LocationPicker 
            onLocationSelect={handleLocationSelect} 
            initialLocation={formData.location.latitude !== 0 ? formData.location : undefined}
          />
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Photos
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2, color: '#aaa' }}>
              Upload up to 3 photos of the issue. This will help authorities better understand and address the problem.
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCameraIcon />}
              sx={{ mb: 3 }}
            >
              Upload Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoUpload}
                multiple
              />
            </Button>
            
            <Grid container spacing={2}>
              {photoPreviewUrls.map((url, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Card sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={url}
                      alt={`Photo ${index + 1}`}
                    />
                    <IconButton
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        },
                      }}
                      onClick={() => handleRemovePhoto(index)}
                    >
                      <DeleteIcon sx={{ color: '#fff' }} />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {photoPreviewUrls.length === 0 && (
              <Typography variant="body2" sx={{ mt: 2, color: '#aaa', fontStyle: 'italic' }}>
                No photos uploaded yet. Photos are optional but recommended.
              </Typography>
            )}
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Report
            </Typography>
            
            <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: '#1e1e1e' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Title
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.title}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
                  </Typography>
                </Grid>
                
                {photoPreviewUrls.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Photos
                    </Typography>
                    <Grid container spacing={1}>
                      {photoPreviewUrls.map((url, index) => (
                        <Grid item xs={4} key={index}>
                          <img 
                            src={url} 
                            alt={`Photo ${index + 1}`} 
                            style={{ width: '100%', height: 'auto', borderRadius: '4px' }} 
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            <Typography variant="body2" sx={{ mb: 3, color: '#aaa' }}>
              Please review your report carefully before submitting. Once submitted, you can track the status of your report in your profile.
            </Typography>
          </Box>
        );
        
      default:
        return null;
    }
  };

  if (success) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: '#1e1e1e' }}>
        <Typography variant="h5" gutterBottom color="primary">
          Issue Reported Successfully!
        </Typography>
        <Typography variant="body1" paragraph>
          Thank you for reporting this issue. Your report has been submitted and will be reviewed by the authorities.
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: '#aaa' }}>
          You will be redirected to the home page shortly...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, backgroundColor: '#1e1e1e' }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {Object.keys(fieldErrors).length > 0 && (
        <Box sx={{ mb: 2 }}>
          {Object.entries(fieldErrors)
            .filter(([_, message]) => message && message.trim())
            .map(([field, message]) => (
            <Alert severity="warning" key={field} sx={{ mb: 1 }}>
              {field}: {message}
            </Alert>
          ))}
        </Box>
      )}
      
      <Box component="form" onSubmit={handleFormSubmit}>
        {renderStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<BackIcon />}
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                type="submit"
                disabled={submitting}
                sx={{ 
                  backgroundColor: '#4CAF50',
                  '&:hover': {
                    backgroundColor: '#388E3C',
                  },
                }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Report'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<NextIcon />}
                sx={{ 
                  backgroundColor: '#4CAF50',
                  '&:hover': {
                    backgroundColor: '#388E3C',
                  },
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default IssueForm;