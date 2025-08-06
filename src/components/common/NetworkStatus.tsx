import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface NetworkStatusProps {
  // Optional props can be added here
}

const NetworkStatus: React.FC<NetworkStatusProps> = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  useEffect(() => {
    // Function to handle online status change
    const handleOnline = () => {
      setIsOnline(true);
      setMessage('You are back online');
      setSeverity('success');
      setShowMessage(true);
    };

    // Function to handle offline status change
    const handleOffline = () => {
      setIsOnline(false);
      setMessage('You are offline. Some features may be limited.');
      setSeverity('warning');
      setShowMessage(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check - if we're offline when component mounts, show the message
    if (!navigator.onLine) {
      handleOffline();
    }

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle closing the snackbar
  const handleClose = () => {
    setShowMessage(false);
  };

  return (
    <Snackbar
      open={showMessage}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NetworkStatus;