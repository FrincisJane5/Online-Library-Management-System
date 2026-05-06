import { useCallback, useEffect, useRef, useState } from 'react';

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: '' });
  // Track if component is still mounted
  const mounted = useRef(true);

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: '' }));
    try {
      const data = await fetcher();
      if (mounted.current) setState({ data, loading: false, error: '' });
    } catch (err: any) {
      if (mounted.current)
        setState({ data: null, loading: false, error: err?.response?.data?.message ?? 'Request failed' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    fetch();
    return () => { mounted.current = false; };
  }, [fetch]);

  return { ...state, refetch: fetch };
}
