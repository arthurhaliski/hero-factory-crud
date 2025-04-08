'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { HeroListResponse, HeroResponse } from '@/types/hero';
import { Button } from '@/components/button';
import { Heading } from '@/components/heading';
import { Input, InputGroup } from '@/components/input';
import { Pagination } from '@/components/custom-pagination';
import { HeroCard } from '@/components/hero-card';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { ViewHeroModal } from '@/components/view-hero-modal';
import { CreateHeroModal } from '@/components/create-hero-modal';
import { EditHeroModal } from '@/components/edit-hero-modal';
import { toast } from "sonner";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { HeroCardSkeleton } from '@/components/hero-card-skeleton';

export default function HomePage() {
  const [heroesData, setHeroesData] = useState<HeroListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedHero, setSelectedHero] = useState<HeroResponse | null>(null);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'toggle' | null>(null);
  const [confirmHeroId, setConfirmHeroId] = useState<string | null>(null);
  const [confirmHeroIsActive, setConfirmHeroIsActive] = useState<boolean | null>(null);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);

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

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsLoading(true);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchHeroes(1, value);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handlePageChange = (page: number) => {
    fetchHeroes(page, searchTerm);
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = (refresh?: boolean) => {
    setIsCreateModalOpen(false);
    if (refresh) fetchHeroes(currentPage, searchTerm);
  };
  
  const openEditModal = (hero: HeroResponse) => {
    if (!hero.is_active) return;
    setSelectedHero(hero);
    setIsEditModalOpen(true);
  };
  const closeEditModal = (refresh?: boolean) => {
    setIsEditModalOpen(false);
    setSelectedHero(null);
    if (refresh) fetchHeroes(currentPage, searchTerm);
  };
  
  const openViewModal = (hero: HeroResponse) => {
    setSelectedHero(hero);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedHero(null);
  };
  
  const openConfirmModal = (action: 'delete' | 'toggle', id: string, isActive?: boolean) => {
    setConfirmAction(action);
    setConfirmHeroId(id);
    setConfirmHeroIsActive(isActive ?? null);
    setIsConfirmModalOpen(true);
  };
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
    setConfirmHeroId(null);
    setConfirmHeroIsActive(null);
  };

  const handleConfirmedAction = async () => {
    if (!confirmAction || !confirmHeroId) return;
    
    setIsConfirmingAction(true);
    
    let endpoint = '';
    let method: 'PUT' | 'DELETE' | 'PATCH' = 'PUT';
    let successMsg = '';
    let errorMsg = '';

    if (confirmAction === 'delete') {
      endpoint = `/heroes/${confirmHeroId}`;
      method = 'DELETE';
      successMsg = 'Herói desativado com sucesso!';
      errorMsg = 'Erro ao desativar o herói.';
    } else if (confirmAction === 'toggle') {
      if (confirmHeroIsActive) {
        endpoint = `/heroes/${confirmHeroId}`;
        method = 'DELETE';
        successMsg = 'Herói desativado com sucesso!';
        errorMsg = 'Erro ao desativar o herói.';
      } else {
        endpoint = `/heroes/${confirmHeroId}/activate`;
        method = 'PATCH';
        successMsg = 'Herói ativado com sucesso!';
        errorMsg = 'Erro ao ativar o herói.';
      }
    }
    
    closeConfirmModal();

    try {
       await apiClient(endpoint, { method });
       toast.success(successMsg);
       fetchHeroes(currentPage, searchTerm);
    } catch (err: any) {
       console.error(`Failed to ${confirmAction} hero:`, err);
       toast.error(err.message || errorMsg);
    } finally {
        setIsConfirmingAction(false);
    }
  };

  useEffect(() => {
    fetchHeroes(currentPage, searchTerm);
  }, [fetchHeroes, currentPage, searchTerm]);

  return (
    (<div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4 border-b border-zinc-200 pb-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Hero Factory</Heading>
          <div className="mt-4 flex flex-col sm:flex-row max-w-xl gap-4">
            <div className="flex-1">
              <InputGroup>
                <MagnifyingGlassIcon />
                <Input 
                  name="search" 
                  placeholder="Pesquisar heróis..." 
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </InputGroup>
            </div>
          </div>
        </div>
        <Button onClick={openCreateModal}>Criar herói</Button>
      </div>
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <HeroCardSkeleton key={index} />
          ))}
        </div>
      )}
      {!isLoading && heroesData && heroesData.heroes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {heroesData.heroes.map((hero) => (
            <HeroCard 
              key={hero.id} 
              hero={hero} 
              onView={openViewModal}
              onEdit={openEditModal}
              onToggleActive={(id, isActive) => openConfirmModal('toggle', id, isActive)} 
              onDelete={(id) => openConfirmModal('delete', id)}
            />
          ))}
        </div>
      )}
      {!isLoading && searchTerm && heroesData && heroesData.heroes.length === 0 && (
         <div className="text-center py-10 text-zinc-500">
           <p>Nenhum herói encontrado para sua busca.</p>
        </div>
      )}
      {!isLoading && !searchTerm && (!heroesData || heroesData.heroes.length === 0) && (
         <div className="text-center py-10 text-zinc-500">
           <p>Nenhum herói cadastrado ainda.</p>
           <Button onClick={openCreateModal} className="mt-4">Criar primeiro herói</Button>
        </div>
      )}
      {!isLoading && heroesData && heroesData.heroes.length > 0 && (
        (<div className="mt-8 pt-4 pb-4 border-t border-zinc-200 dark:border-zinc-700/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Mostrando {' '}
            <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>
            {' '}-{' '}
            <span className="font-medium">{Math.min(currentPage * 10, heroesData.total)}</span>
            {' '}
            de{' '}
            <span className="font-medium">{heroesData.total}</span>
            {' '}
            heróis
          </p>
          {heroesData.totalPages > 1 && (
             <Pagination 
              currentPage={currentPage} 
              pageCount={heroesData.totalPages}
              onPageChange={handlePageChange} 
            />
          )}
        </div>)
      )}
      {isConfirmModalOpen && (
        <ConfirmationModal 
          isOpen={isConfirmModalOpen}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmedAction}
          title={
            confirmAction === 'delete' ? 'Excluir Herói' : 
            (confirmHeroIsActive ? 'Desativar Herói' : 'Ativar Herói')
          }
          message={
            confirmAction === 'delete' ? `Tem certeza que deseja excluir (desativar) o herói?` : 
            (confirmHeroIsActive ? `Tem certeza que deseja desativar o herói?` : `Tem certeza que deseja ativar o herói?`)
          }
          confirmButtonText={
            confirmAction === 'delete' ? 'Excluir' : 
            (confirmHeroIsActive ? 'Desativar' : 'Ativar')
          }
          confirmButtonColor={
            confirmAction === 'delete' ? 'red' : 
            (confirmHeroIsActive ? 'red' : 'green')
          }
          isConfirming={isConfirmingAction}
        />
      )}
      {isViewModalOpen && selectedHero && (
        <ViewHeroModal 
          isOpen={isViewModalOpen} 
          onClose={closeViewModal} 
          hero={selectedHero} 
        />
      )}
      {isCreateModalOpen && (
         <CreateHeroModal 
           isOpen={isCreateModalOpen} 
           onClose={closeCreateModal} 
         />
      )}
      {isEditModalOpen && selectedHero && (
        <EditHeroModal 
          isOpen={isEditModalOpen} 
          onClose={closeEditModal} 
          hero={selectedHero} 
        />
      )}
    </div>)
  );
}
