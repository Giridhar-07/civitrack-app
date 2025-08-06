# CiviTrack Custom Hooks

This directory contains custom React hooks that provide reusable functionality across the CiviTrack application. These hooks follow best practices for state management, API interactions, and UI components.

## API and Data Fetching Hooks

### `useApi`

A hook for making API calls with loading, error, and data states.

```typescript
const { data, loading, error, execute, reset } = useApi(
  apiCall,
  {
    immediate: false,
    deps: [],
    initialData: null,
    resetOnFetch: true,
    onSuccess: (data) => {},
    onError: (error) => {}
  }
);
```

### `useApiForm`

A hook for handling form submissions with API calls, including validation and error handling.

```typescript
const { 
  data, submitting, submitted, error, fieldErrors,
  handleChange, handleSubmit, resetForm, setFields 
} = useApiForm(
  submitFn,
  {
    initialData: {},
    validate: (data) => ({}),
    onSuccess: (response) => {},
    onError: (error) => {},
    resetOnSuccess: false
  }
);
```

## UI and State Management Hooks

### `usePagination`

A hook for handling pagination state and calculations.

```typescript
const {
  page, pageSize, totalPages, pageSizeOptions,
  setPage, setPageSize, nextPage, previousPage, firstPage, lastPage,
  metadata
} = usePagination({
  initialPage: 0,
  initialPageSize: 10,
  totalItems: 0,
  pageSizeOptions: [5, 10, 25, 50],
  onPageChange: (page) => {},
  onPageSizeChange: (pageSize) => {}
});
```

### `useFiltering`

A hook for handling filtering and sorting of data.

```typescript
const {
  filters, sortConfig, filteredData,
  setFilter, setSort, resetFilters, resetSort, setFilters
} = useFiltering({
  initialFilters: {},
  initialSort: { field: '', direction: null },
  data: [],
  filterFn: (item, filters) => true,
  sortFn: (a, b, sortConfig) => 0,
  onFiltersChange: (filters) => {},
  onSortChange: (sortConfig) => {}
});
```

### `useFormValidation`

A hook for form validation with support for multiple validation rules.

```typescript
const {
  formData, errors, touched, isValid,
  handleChange, handleBlur, validateForm, resetForm, setFields, getFieldError
} = useFormValidation({
  initialData: {},
  validationRules: {
    field1: [validationRules.required(), validationRules.minLength(3)],
    field2: [validationRules.email()]
  },
  validateOnChange: true,
  validateAllFields: true
});
```

## Authentication and Notification Hooks

### `useAuth`

A hook for handling authentication state and operations.

```typescript
const {
  user, isAuthenticated, loading, error,
  login, register, logout, clearError
} = useAuth();
```

### `useNotification`

A hook for displaying notifications to the user.

```typescript
const {
  notifications,
  showSuccess, showError, showInfo, showWarning,
  closeNotification, closeAll
} = useNotification();
```

### `useTheme`

A hook for managing theme preferences.

```typescript
const { mode, theme, toggleTheme, setMode } = useTheme();
```

## Usage

All hooks can be imported from the index file:

```typescript
import { 
  useApi, useApiForm, usePagination, useFiltering,
  useFormValidation, useAuth, useNotification, useTheme,
  validationRules
} from '../hooks';
```

Or individually:

```typescript
import useApi from '../hooks/useApi';
```

## Providers

Some hooks require providers to be set up in the application tree:

```tsx
// In App.tsx
import { 
  ThemeProvider, AuthProvider, NotificationProvider 
} from '../hooks';

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <NotificationProvider>
        <YourApp />
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
);
```