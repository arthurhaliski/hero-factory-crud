'use client';

import { useHeroes } from '@/hooks/useHeroes';
import { useHeroActions } from '@/hooks/useHeroActions';
import { Button } from '@/components/button';
import { Heading } from '@/components/heading';
import { Input, InputGroup } from '@/components/input';
import { Pagination } from '@/components/custom-pagination';
import { HeroCard } from '@/components/hero-card';
import { HeroCardSkeleton } from '@/components/hero-card-skeleton';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { memo, lazy, Suspense } from 'react';

// Lazy loading de componentes pesados
const ConfirmationModal = lazy(() => import('@/components/confirmation-modal').then(mod => ({ default: mod.ConfirmationModal })));
const ViewHeroModal = lazy(() => import('@/components/view-hero-modal').then(mod => ({ default: mod.ViewHeroModal })));
const CreateHeroModal = lazy(() => import('@/components/create-hero-modal').then(mod => ({ default: mod.CreateHeroModal })));
const EditHeroModal = lazy(() => import('@/components/edit-hero-modal').then(mod => ({ default: mod.EditHeroModal })));

// Fallback para os modais durante o carregamento
const ModalFallback = () => <div className="fixed inset-0 bg-black/30 flex items-center justify-center">Carregando...</div>;

// Componentes de estado de tela memoizados para evitar re-renders
const EmptySearch = memo(({ searchTerm, onCreateClick }: { searchTerm: string, onCreateClick: () => void }) => (
  <div className="text-center py-10 text-zinc-500">
    <p>Nenhum herói encontrado para sua busca.</p>
  </div>
));
EmptySearch.displayName = 'EmptySearch';

const EmptyHeroes = memo(({ onCreateClick }: { onCreateClick: () => void }) => (
  <div className="text-center py-10 text-zinc-500">
    <p>Nenhum herói cadastrado ainda.</p>
    <Button onClick={onCreateClick} className="mt-4">Criar primeiro herói</Button>
  </div>
));
EmptyHeroes.displayName = 'EmptyHeroes';

export default function HomePage() {
  const { 
    heroesData, 
    isLoading, 
    currentPage, 
    searchTerm, 
    handleSearch, 
    handlePageChange,
    refetch
  } = useHeroes();

  const {
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    isConfirmModalOpen,
    selectedHero,
    confirmAction,
    confirmHeroId,
    confirmHeroIsActive,
    isConfirmingAction,
    
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmedAction
  } = useHeroActions(refetch);

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
        <EmptySearch searchTerm={searchTerm} onCreateClick={openCreateModal} />
      )}
      {!isLoading && !searchTerm && (!heroesData || heroesData.heroes.length === 0) && (
        <EmptyHeroes onCreateClick={openCreateModal} />
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
      
      {/* Modais carregados com Suspense e lazy loading */}
      <Suspense fallback={<ModalFallback />}>
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
        {isViewModalOpen && selectedHero && (
          <ViewHeroModal 
            isOpen={isViewModalOpen}
            onClose={closeViewModal}
            hero={selectedHero}
          />
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
      </Suspense>
    </div>)
  );
}
