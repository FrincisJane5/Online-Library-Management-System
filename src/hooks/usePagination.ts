// Import useState for tracking the current page, and useMemo for efficient slicing
import { useState, useMemo } from 'react';

/**
 * usePagination — splits an array into pages and tracks the current page.
 *
 * @param items     The full array of items to paginate
 * @param pageSize  How many items to show per page (default: 10)
 */
export function usePagination<T>(items: T[], pageSize = 10) {
  // Track which page the user is currently on (1-indexed)
  const [page, setPage] = useState(1);

  // Calculate total number of pages; at least 1 even if items is empty
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Clamp the current page so it never exceeds totalPages (e.g. after filtering reduces results)
  const safePage = Math.min(page, totalPages);

  // Slice the items array to only the items on the current page
  // useMemo avoids re-slicing on every render unless items, safePage, or pageSize changes
  const paged = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );

  // Reset to page 1 when items change (e.g. after filter) — call this after applying a search filter
  const reset = () => setPage(1);

  return {
    paged,       // The items for the current page
    page: safePage,  // The current page number (clamped)
    totalPages,  // Total number of pages
    setPage,     // Function to jump to a specific page
    reset,       // Function to go back to page 1
    total: items.length, // Total number of items (before pagination)
  };
}
