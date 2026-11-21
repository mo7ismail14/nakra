import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Loads data on mount (and when deps change).
 *   const { data, loading, error, reload, setData } = useApi(() => restaurantsApi.get(id), [id]);
 * Pair it with <AsyncContent> to render loading / error states.
 */
export function useApi(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const callId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(async () => {
    const id = ++callId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await loader();
      if (id === callId.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === callId.current) setState({ data: null, loading: false, error });
    }
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  const setData = useCallback(
    (updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })),
    [],
  );

  return { ...state, reload, setData };
}
