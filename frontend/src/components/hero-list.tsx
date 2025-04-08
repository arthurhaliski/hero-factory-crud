'use client';

import React, { useCallback, useState, memo } from 'react';
import { HeroResponse } from '@/types/hero';
import { HeroCard } from './hero-card';
import { ViewHeroModal } from './view-hero-modal';
import { EditHeroModal } from './edit-hero-modal';
import { ConfirmationModal } from './confirmation-modal';
import { Button } from './button';
import apiClient from '@/lib/apiClient';
import { toast } from "sonner";
import { HeroCardSkeleton } from './hero-card-skeleton';

interface HeroListProps {
  heroes: HeroResponse[];
  isLoading?: boolean;
  onHeroUpdated: () => void;
  onHeroDeleted: () => void;
  onHeroToggled: () => void;
}

const ConfirmDeleteModal = ({ 
  isOpen, 
  entityId, 
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean; 
  entityId: string; 
  onConfirm: () => void; 
  onCancel: () => void 
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await apiClient(`/heroes/${entityId}`, { method: 'DELETE' });
      toast.success('Herói desativado com sucesso!');
      onConfirm();
    } catch (error) {
      console.error('Failed to delete hero:', error);
      toast.error('Erro ao desativar o herói.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onCancel}
      onConfirm={handleConfirm}
      title="Desativar Herói"
      message="Tem certeza que deseja desativar este herói? Ele não aparecerá nas listagens de heróis ativos."
      confirmButtonText="Desativar"
      confirmButtonColor="red"
      isConfirming={isConfirming}
    />
  );
};

const ConfirmActionModal = ({ 
  isOpen, 
  title, 
  description, 
  confirmLabel, 
  entityId, 
  action, 
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean; 
  title: string; 
  description: string; 
  confirmLabel: string; 
  entityId: string; 
  action: 'activate' | 'deactivate'; 
  onConfirm: () => void; 
  onCancel: () => void 
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      if (action === 'activate') {
        await apiClient(`/heroes/${entityId}/activate`, { method: 'PATCH' });
        toast.success('Herói ativado com sucesso!');
      } else {
        await apiClient(`/heroes/${entityId}`, { method: 'DELETE' });
        toast.success('Herói desativado com sucesso!');
      }
      onConfirm();
    } catch (error) {
      console.error(`Failed to ${action} hero:`, error);
      toast.error(`Erro ao ${action === 'activate' ? 'ativar' : 'desativar'} o herói.`);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onCancel}
      onConfirm={handleConfirm}
      title={title}
      message={description}
      confirmButtonText={confirmLabel}
      confirmButtonColor={action === 'activate' ? 'green' : 'red'}
      isConfirming={isConfirming}
    />
  );
};

const HeroListComponent = ({ 
  heroes, 
  isLoading = false, 
  onHeroUpdated, 
  onHeroDeleted,
  onHeroToggled
}: HeroListProps) => {
  const [viewHero, setViewHero] = useState<HeroResponse | null>(null);
  const [editHero, setEditHero] = useState<HeroResponse | null>(null);
  const [deleteHero, setDeleteHero] = useState<string | null>(null);
  const [toggleHero, setToggleHero] = useState<{ id: string; active: boolean } | null>(null);
  
  const handleViewHero = useCallback((hero: HeroResponse) => {
    setViewHero(hero);
  }, []);
  
  const handleEditHero = useCallback((hero: HeroResponse) => {
    setEditHero(hero);
  }, []);
  
  const handleToggleActive = useCallback((id: string, isActive: boolean) => {
    setToggleHero({ id, active: isActive });
  }, []);
  
  const handleDeleteHero = useCallback((id: string) => {
    setDeleteHero(id);
  }, []);
  
  const handleCloseView = useCallback(() => {
    setViewHero(null);
  }, []);
  
  const handleCloseEdit = useCallback((refresh?: boolean) => {
    setEditHero(null);
    if (refresh) onHeroUpdated();
  }, [onHeroUpdated]);
  
  const handleDeleteSuccess = useCallback(() => {
    setDeleteHero(null);
    onHeroDeleted();
  }, [onHeroDeleted]);
  
  const handleToggleSuccess = useCallback(() => {
    setToggleHero(null);
    onHeroToggled();
  }, [onHeroToggled]);
  
  const handleCancelDelete = useCallback(() => {
    setDeleteHero(null);
  }, []);
  
  const handleCancelToggle = useCallback(() => {
    setToggleHero(null);
  }, []);

  if (heroes.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 text-zinc-400 dark:text-zinc-500">
          <svg className="mx-auto size-12" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Nenhum herói encontrado</h3>
        <p className="mb-6 text-sm text-zinc-500 max-w-sm">
          Não há heróis disponíveis para exibição. Adicione um novo herói para começar.
        </p>
        <Button href="/heroes/new">Adicionar Herói</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <HeroCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {heroes.map((hero) => (
          <HeroCard
            key={hero.id}
            hero={hero}
            onView={handleViewHero}
            onEdit={handleEditHero}
            onToggleActive={handleToggleActive}
            onDelete={handleDeleteHero}
          />
        ))}
      </div>
      
      {viewHero && (
        <ViewHeroModal 
          hero={viewHero} 
          isOpen={!!viewHero} 
          onClose={handleCloseView} 
        />
      )}
      
      {editHero && (
        <EditHeroModal
          hero={editHero}
          isOpen={!!editHero}
          onClose={handleCloseEdit}
        />
      )}
      
      {deleteHero && (
        <ConfirmDeleteModal
          isOpen={!!deleteHero}
          entityId={deleteHero}
          onConfirm={handleDeleteSuccess}
          onCancel={handleCancelDelete}
        />
      )}
      
      {toggleHero && (
        <ConfirmActionModal
          isOpen={!!toggleHero}
          title={toggleHero.active ? 'Desativar Herói' : 'Ativar Herói'}
          description={
            toggleHero.active
              ? 'Tem certeza que deseja desativar este herói? Ele não aparecerá nas listagens de heróis ativos.'
              : 'Tem certeza que deseja ativar este herói? Ele voltará a aparecer nas listagens de heróis ativos.'
          }
          confirmLabel={toggleHero.active ? 'Desativar' : 'Ativar'}
          entityId={toggleHero.id}
          action={toggleHero.active ? 'deactivate' : 'activate'}
          onConfirm={handleToggleSuccess}
          onCancel={handleCancelToggle}
        />
      )}
    </>
  );
};

export const HeroList = memo(HeroListComponent); 