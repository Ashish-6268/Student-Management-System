import { useState, useEffect, useCallback } from 'react';

export default function useFetch(fetchFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    let isMounted = true;
    
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchFn();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err.message || 'Something went wrong');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    run();
    
    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, isLoading, error, refetch: execute };
}\n