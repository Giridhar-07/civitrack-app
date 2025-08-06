import React, { useState, useCallback, createContext, useContext } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  autoHideDuration?: number;
}

interface NotificationContextType {
  /** Current notifications */
  notifications: Notification[];
  /** Show a notification with specified type */
  showNotification: (options: { message: string; type: NotificationType; autoHideDuration?: number }) => string;
  /** Show a success notification */
  showSuccess: (message: string, autoHideDuration?: number) => string;
  /** Show an error notification */
  showError: (message: string, autoHideDuration?: number) => string;
  /** Show an info notification */
  showInfo: (message: string, autoHideDuration?: number) => string;
  /** Show a warning notification */
  showWarning: (message: string, autoHideDuration?: number) => string;
  /** Close a notification by id */
  closeNotification: (id: string) => void;
  /** Close all notifications */
  closeAll: () => void;
}

// Create context with default values
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  showNotification: () => '',
  showSuccess: () => '',
  showError: () => '',
  showInfo: () => '',
  showWarning: () => '',
  closeNotification: () => {},
  closeAll: () => {}
});

/**
 * Provider component for notification context
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notification = useNotificationProvider();
  return <NotificationContext.Provider value={notification}>{children}</NotificationContext.Provider>;
};

/**
 * Hook to use notification context
 */
export const useNotification = (): NotificationContextType => {
  return useContext(NotificationContext);
};

/**
 * Implementation of the notification provider
 */
const useNotificationProvider = (): NotificationContextType => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Generate a unique ID for notifications
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }, []);

  // Show a notification of specified type
  const showNotification = useCallback(
    (message: string, type: NotificationType, autoHideDuration = 5000): string => {
      const id = generateId();
      const notification: Notification = {
        id,
        message,
        type,
        autoHideDuration
      };

      setNotifications(prev => [...prev, notification]);

      // Auto-close notification after specified duration
      if (autoHideDuration > 0) {
        setTimeout(() => {
          closeNotification(id);
        }, autoHideDuration);
      }

      return id;
    },
    [generateId]
  );

  // Close a notification by ID
  const closeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Close all notifications
  const closeAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper functions for different notification types
  const showSuccess = useCallback(
    (message: string, autoHideDuration?: number) => {
      return showNotification(message, 'success', autoHideDuration);
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, autoHideDuration?: number) => {
      return showNotification(message, 'error', autoHideDuration);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, autoHideDuration?: number) => {
      return showNotification(message, 'info', autoHideDuration);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, autoHideDuration?: number) => {
      return showNotification(message, 'warning', autoHideDuration);
    },
    [showNotification]
  );

  // Create a wrapper for showNotification that accepts an options object
  const showNotificationWrapper = useCallback(
    (options: { message: string; type: NotificationType; autoHideDuration?: number }) => {
      return showNotification(options.message, options.type, options.autoHideDuration);
    },
    [showNotification]
  );

  return {
    notifications,
    showNotification: showNotificationWrapper,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    closeNotification,
    closeAll
  };
};

export default useNotification;
export type { Notification, NotificationType };