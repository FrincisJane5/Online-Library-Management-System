// Import React hooks for state and side effects
import { useEffect, useState } from 'react';

/**
 * useDebounce — delays updating a value until the user stops changing it.
 *
 * Useful for search inputs: instead of firing an API call on every keystroke,
 * we wait until the user pauses typing for `delay` milliseconds.
 *
 * @param value  The rapidly-changing value to debounce (e.g. a search string)
 * @param delay  How many milliseconds to wait after the last change (default: 300ms)
 * @returns      The debounced value — only updates after the delay has passed
 */
export function useDebounce<T>(value: T, delay = 300): T {
  // Store the debounced (delayed) copy of the value
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Set a timer: after `delay` ms, update the debounced value to match the latest input
    const t = setTimeout(() => setDebounced(value), delay);

    // Cleanup: if `value` changes before the timer fires, cancel the old timer
    // This is what creates the "wait until user stops typing" effect
    return () => clearTimeout(t);
  }, [value, delay]); // Re-run whenever value or delay changes

  return debounced; // Return the delayed value
}
