import { useState, useEffect, useCallback } from 'react';
import { patternScanner, DiscoveredPattern } from '@/lib/discovery/patternScanner';

const CACHE_KEY = 'bebelize_patterns_cache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos

interface PatternCache {
  patterns: DiscoveredPattern[];
  cached_at: number;
}

export function useDiscoveredPatterns() {
  const [patterns, setPatterns] = useState<DiscoveredPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromCache = (): DiscoveredPattern[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: PatternCache = JSON.parse(cached);
      const age = Date.now() - data.cached_at;

      if (age > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data.patterns;
    } catch {
      return null;
    }
  };

  const saveToCache = (patterns: DiscoveredPattern[]) => {
    try {
      const cache: PatternCache = {
        patterns,
        cached_at: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (err) {
      console.error('Error saving patterns cache:', err);
    }
  };

  const loadPatterns = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!forceRefresh) {
        const cached = loadFromCache();
        if (cached && cached.length > 0) {
          setPatterns(cached);
          setIsLoading(false);
          return;
        }
      }

      const discovered = await patternScanner.scanPatterns();
      setPatterns(discovered);
      saveToCache(discovered);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar texturas';
      setError(message);
      console.error('Error loading patterns:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatterns();
  }, [loadPatterns]);

  const getPatternById = useCallback((id: string): DiscoveredPattern | undefined => {
    return patterns.find(p => p.id === id);
  }, [patterns]);

  const getPatternsByCategory = useCallback((category: string): DiscoveredPattern[] => {
    return patterns.filter(p => p.category === category);
  }, [patterns]);

  const getCategories = useCallback((): string[] => {
    const categories = new Set(patterns.map(p => p.category));
    return Array.from(categories).sort();
  }, [patterns]);

  return {
    patterns,
    isLoading,
    error,
    getPatternById,
    getPatternsByCategory,
    getCategories,
    refresh: () => loadPatterns(true)
  };
}