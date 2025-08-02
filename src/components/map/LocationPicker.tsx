import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { Location } from '../../types';
import IssueMap from './IssueMap';

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [location, setLocation] = useState<Location | null>(initialLocation || null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          
          if (!initialLocation) {
            setLocation({ latitude, longitude });
            onLocationSelect({ latitude, longitude });
            // Reverse geocode to get address
            fetchAddress(latitude, longitude);
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, [initialLocation, onLocationSelect]);

  // Fetch address from coordinates using a geocoding service
  const fetchAddress = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      // In a real app, you would use a geocoding service like Google Maps or Nominatim
      // For this example, we'll simulate a delay and set a placeholder address
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      
      // In a real implementation, you would do something like:
      // const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      // const data = await response.json();
      // setAddress(data.display_name);
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Address not found');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (newLocation: Location) => {
    setLocation(newLocation);
    onLocationSelect(newLocation);
    fetchAddress(newLocation.latitude, newLocation.longitude);
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      const [latitude, longitude] = userLocation;
      setLocation({ latitude, longitude });
      onLocationSelect({ latitude, longitude });
      fetchAddress(latitude, longitude);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Select Location
      </Typography>
      
      <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: '#1e1e1e' }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Click on the map to select the location of the issue, or use your current location.
        </Typography>
        
        <Button 
          variant="outlined" 
          onClick={handleUseCurrentLocation}
          disabled={!userLocation}
          sx={{ mb: 2 }}
        >
          Use My Current Location
        </Button>
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Address"
            value={address}
            disabled
            InputProps={{
              endAdornment: loading ? <CircularProgress size={20} /> : null,
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
              '& .MuiInputLabel-root': {
                color: '#aaa',
              },
              '& .MuiInputBase-input': {
                color: '#fff',
              },
            }}
          />
        </Box>
      </Paper>
      
      <IssueMap 
        issues={[]}
        center={location ? [location.latitude, location.longitude] : userLocation || [51.505, -0.09]}
        zoom={15}
        height="400px"
        selectable={true}
        onLocationSelect={handleLocationSelect}
      />
      
      {location && (
        <Typography variant="body2" sx={{ mt: 2, color: '#aaa' }}>
          Selected coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </Typography>
      )}
    </Box>
  );
};

export default LocationPicker;