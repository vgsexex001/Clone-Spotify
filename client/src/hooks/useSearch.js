import { useState, useEffect } from 'react';
import { search as searchApi } from '../services/api';
import useDebounce from './useDebounce';

export default function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tracks: [], artists: [], albums: [] });
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults({ tracks: [], artists: [], albums: [] });
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    searchApi.query(debouncedQuery).then(data => {
      if (!cancelled) {
        setResults({
          tracks: data.tracks || [],
          artists: data.artists || [],
          albums: data.albums || [],
        });
      }
    }).catch(() => {
      if (!cancelled) setResults({ tracks: [], artists: [], albums: [] });
    }).finally(() => {
      if (!cancelled) setIsSearching(false);
    });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  return { query, setQuery, results, isSearching };
}
