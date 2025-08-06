import { useState, useCallback, useMemo } from 'react';

interface PaginationOptions {
  /** Initial page index (0-based) */
  initialPage?: number;
  /** Initial number of items per page */
  initialPageSize?: number;
  /** Total number of items */
  totalItems?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Custom hook for handling pagination state and calculations
 * @param options - Pagination configuration options
 * @returns Pagination state and handler functions
 */
const usePagination = (options: PaginationOptions = {}) => {
  const {
    initialPage = 0,
    initialPageSize = 10,
    totalItems = 0,
    pageSizeOptions = [5, 10, 25, 50],
    onPageChange,
    onPageSizeChange
  } = options;

  // State for current page and page size
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0;
  }, [totalItems, pageSize]);

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      // Ensure page is within bounds
      const boundedPage = Math.max(0, Math.min(newPage, totalPages - 1));
      setPage(boundedPage);
      
      if (onPageChange) {
        onPageChange(boundedPage);
      }
    },
    [totalPages, onPageChange]
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      
      // Adjust current page if necessary to keep the same data visible
      const firstItemIndex = page * pageSize;
      const newPage = Math.floor(firstItemIndex / newPageSize);
      setPage(newPage);
      
      if (onPageSizeChange) {
        onPageSizeChange(newPageSize);
      }
      
      if (onPageChange) {
        onPageChange(newPage);
      }
    },
    [page, pageSize, onPageChange, onPageSizeChange]
  );

  // Calculate pagination metadata
  const metadata = useMemo(() => {
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    return {
      startIndex,
      endIndex,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages - 1,
      hasPreviousPage: page > 0,
      isFirstPage: page === 0,
      isLastPage: page === totalPages - 1 || totalPages === 0,
      pageItems: endIndex - startIndex,
      totalItems
    };
  }, [page, pageSize, totalItems, totalPages]);

  return {
    // Current state
    page,
    pageSize,
    totalPages,
    pageSizeOptions,
    
    // Handlers
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    nextPage: useCallback(() => handlePageChange(page + 1), [handlePageChange, page]),
    previousPage: useCallback(() => handlePageChange(page - 1), [handlePageChange, page]),
    firstPage: useCallback(() => handlePageChange(0), [handlePageChange]),
    lastPage: useCallback(() => handlePageChange(totalPages - 1), [handlePageChange, totalPages]),
    
    // Metadata for rendering
    metadata
  };
};

export default usePagination;