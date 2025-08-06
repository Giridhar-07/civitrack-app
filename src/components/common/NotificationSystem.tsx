import React from 'react';
import { Snackbar, Alert, AlertTitle, Stack } from '@mui/material';
import { useNotification, Notification } from '../../hooks/useNotification';

/**
 * Component to display notifications using Material-UI Snackbars
 */
const NotificationSystem: React.FC = () => {
  const { notifications, closeNotification } = useNotification();

  // Handle notification close
  const handleClose = (id: string) => {
    closeNotification(id);
  };

  // Render a single notification
  const renderNotification = (notification: Notification) => (
    <Snackbar
      key={notification.id}
      open={true}
      autoHideDuration={notification.autoHideDuration}
      onClose={() => handleClose(notification.id)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        // Add some spacing between multiple notifications
        mb: notifications.indexOf(notification) * 8,
        // Ensure notifications stack properly
        position: 'absolute',
        // Ensure proper z-index
        zIndex: 1400 + notifications.indexOf(notification)
      }}
    >
      <Alert
        onClose={() => handleClose(notification.id)}
        severity={notification.type}
        variant="filled"
        sx={{
          width: '100%',
          boxShadow: 3,
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center'
          }
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {notifications.map(renderNotification)}
    </Stack>
  );
};

/**
 * Component to display a single notification with a title
 */
export const NotificationWithTitle: React.FC<{
  title: string;
  message: string;
  type: Notification['type'];
  onClose: () => void;
}> = ({ title, message, type, onClose }) => {
  return (
    <Alert
      severity={type}
      onClose={onClose}
      sx={{
        width: '100%',
        boxShadow: 3,
        mb: 2
      }}
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

export default NotificationSystem;