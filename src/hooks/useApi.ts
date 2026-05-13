// Import React hooks needed for state, side effects, memoized callbacks, and refs
import { useCallback, useEffect, useRef, useState } from 'react';

// Generic state shape for any API call:
// - data: the fetched result (null until loaded)
// - loading: true while the request is in flight
// - error: error message string if the request failed
interface State<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

/**
 * useApi — a generic hook that runs an async fetcher function and tracks its state.
 *
 * @param fetcher  A function that returns a Promise (e.g. () => api.get('/books').then(r => r.data))
 * @param deps     Dependency array — the fetcher re-runs when any of these values change
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  // Initialize state: not yet loaded, no error
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: '' });

  // Track if the component is still mounted to avoid setting state after unmount
  const mounted = useRef(true);

  // Wrap the fetch logic in useCallback so it only re-creates when deps change
  const fetch = useCallback(async () => {
    // Mark as loading and clear any previous error before starting
    setState(s => ({ ...s, loading: true, error: '' }));
    try {
      const data = await fetcher(); // Run the actual API call
      // Only update state if the component is still mounted (prevents memory leaks)
      if (mounted.current) setState({ data, loading: false, error: '' });
    } catch (err: any) {
      if (mounted.current)
        // Extract a human-readable error message from the response, or use a fallback
        setState({ data: null, loading: false, error: err?.response?.data?.message ?? 'Request failed' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps); // Re-create this function only when deps change

  useEffect(() => {
    mounted.current = true; // Mark as mounted when the effect runs
    fetch();                 // Trigger the initial fetch
    // Cleanup: mark as unmounted when the component is removed from the DOM
    return () => { mounted.current = false; };
  }, [fetch]); // Re-run whenever the fetch function changes (i.e. when deps change)

  // Return the state fields plus a refetch function so callers can manually refresh
  return { ...state, refetch: fetch };
}
