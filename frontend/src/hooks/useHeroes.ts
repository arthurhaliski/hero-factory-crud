import { useState, useCallback, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { HeroListResponse } from '@/types/hero';
import { toast } from 'sonner';

export function useHeroes(initialPage = 1, initialSearch = '') {
  const [heroesData, setHeroesData] = useState<HeroListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchHeroes = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    try {
      let endpoint = `/heroes?page=${page}&limit=10`;
      if (search.trim()) {
        endpoint += `&search=${encodeURIComponent(search.trim())}`;
      }
      const data = await apiClient<HeroListResponse>(endpoint); 
      setHeroesData(data);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Failed to fetch heroes:', err);
      toast.error(err.message || 'Erro ao buscar heróis.');
      setHeroesData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setIsLoading(true);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchHeroes(1, value);
    }, 500);
    
    setSearchTimeout(timeout);
  }, [fetchHeroes, searchTimeout]);

  const handlePageChange = useCallback((page: number) => {
    fetchHeroes(page, searchTerm);
  }, [fetchHeroes, searchTerm]);

  // Limpa o timeout quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Fetch inicial
  useEffect(() => {
    fetchHeroes(currentPage, searchTerm);
  }, [fetchHeroes, currentPage, searchTerm]);

  return {
    heroesData,
    isLoading,
    currentPage,
    searchTerm,
    handleSearch,
    handlePageChange,
    refetch: () => fetchHeroes(currentPage, searchTerm)
  };
} 