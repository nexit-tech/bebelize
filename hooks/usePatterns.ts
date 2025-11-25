import { useState, useEffect } from 'react';
import { patternsService } from '@/lib/supabase/patterns.service';
import { Pattern } from '@/types/rendering.types';

export function usePatterns() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await patternsService.getAll();
      setPatterns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar texturas');
      console.error('Error loading patterns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPatternById = (id: string): Pattern | undefined => {
    return patterns.find(p => p.id === id);
  };

  const getPatternsByCategory = (category: string): Pattern[] => {
    return patterns.filter(p => p.category === category);
  };

  return {
    patterns,
    isLoading,
    error,
    getPatternById,
    getPatternsByCategory,
    refresh: loadPatterns
  };
}