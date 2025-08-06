import { useState, useCallback, useMemo } from 'react';

type FilterValue = string | number | boolean | null | undefined;
type FilterValues = Record<string, FilterValue>;
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  field: string;
  direction: SortDirection;
}

interface FilteringOptions<T> {
  /** Initial filter values */
  initialFilters?: FilterValues;
  /** Initial sort configuration */
  initialSort?: SortConfig;
  /** Data to be filtered and sorted */
  data?: T[];
  /** Custom filter function */
  filterFn?: (item: T, filters: FilterValues) => boolean;
  /** Custom sort function */
  sortFn?: (a: T, b: T, sortConfig: SortConfig) => number;
  /** Callback when filters change */
  onFiltersChange?: (filters: FilterValues) => void;
  /** Callback when sort changes */
  onSortChange?: (sortConfig: SortConfig) => void;
}

/**
 * Custom hook for handling filtering and sorting of data
 * @param options - Filtering and sorting configuration options
 * @returns Filtering and sorting state and handler functions
 */
const useFiltering = <T extends Record<string, any>>(
  options: FilteringOptions<T> = {}
) => {
  const {
    initialFilters = {},
    initialSort = { field: '', direction: null },
    data = [],
    filterFn,
    sortFn,
    onFiltersChange,
    onSortChange
  } = options;

  // State for filters and sort
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);

  // Default filter function
  const defaultFilterFn = useCallback(
    (item: T, filters: FilterValues): boolean => {
      // If no filters are applied, return true
      if (Object.keys(filters).length === 0) return true;

      // Check if item matches all filters
      return Object.entries(filters).every(([key, value]) => {
        // Skip null, undefined, or empty string filters
        if (value === null || value === undefined || value === '') return true;

        const itemValue = item[key];

        // Handle different filter value types
        if (typeof value === 'string') {
          // Case-insensitive string comparison
          return String(itemValue).toLowerCase().includes(value.toLowerCase());
        } else if (typeof value === 'number') {
          // Exact number match
          return itemValue === value;
        } else if (typeof value === 'boolean') {
          // Boolean match
          return itemValue === value;
        }

        return false;
      });
    },
    []
  );

  // Default sort function
  const defaultSortFn = useCallback(
    (a: T, b: T, sortConfig: SortConfig): number => {
      if (!sortConfig.field || !sortConfig.direction) return 0;

      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      // Handle different value types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
    },
    []
  );

  // Handle filter change
  const handleFilterChange = useCallback(
    (key: string, value: FilterValue) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);

      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
    },
    [filters, onFiltersChange]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (field: string) => {
      let direction: SortDirection = 'asc';

      // Toggle sort direction if clicking the same field
      if (sortConfig.field === field) {
        if (sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.direction === 'desc') direction = null;
        else direction = 'asc';
      }

      const newSortConfig = { field, direction };
      setSortConfig(newSortConfig);

      if (onSortChange) {
        onSortChange(newSortConfig);
      }
    },
    [sortConfig, onSortChange]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({});

    if (onFiltersChange) {
      onFiltersChange({});
    }
  }, [onFiltersChange]);

  // Reset sort
  const resetSort = useCallback(() => {
    const newSortConfig = { field: '', direction: null };
    setSortConfig(newSortConfig);

    if (onSortChange) {
      onSortChange(newSortConfig);
    }
  }, [onSortChange]);

  // Apply filtering and sorting to data
  const filteredAndSortedData = useMemo(() => {
    // Apply filters
    const filteredData = data.filter(item =>
      filterFn ? filterFn(item, filters) : defaultFilterFn(item, filters)
    );

    // Apply sorting if a sort field is specified
    if (sortConfig.field && sortConfig.direction) {
      return [...filteredData].sort((a, b) =>
        sortFn ? sortFn(a, b, sortConfig) : defaultSortFn(a, b, sortConfig)
      );
    }

    return filteredData;
  }, [data, filters, sortConfig, filterFn, sortFn, defaultFilterFn, defaultSortFn]);

  return {
    // Current state
    filters,
    sortConfig,
    filteredData: filteredAndSortedData,
    
    // Handlers
    setFilter: handleFilterChange,
    setSort: handleSortChange,
    resetFilters,
    resetSort,
    
    // Helper to set multiple filters at once
    setFilters: useCallback(
      (newFilters: FilterValues) => {
        setFilters(newFilters);
        if (onFiltersChange) {
          onFiltersChange(newFilters);
        }
      },
      [onFiltersChange]
    )
  };
};

export default useFiltering;
export type { FilterValue, FilterValues, SortConfig, SortDirection };