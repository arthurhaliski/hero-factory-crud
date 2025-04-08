import { useState, useCallback } from 'react';
import { HeroResponse } from '@/types/hero';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

type ConfirmAction = 'delete' | 'toggle' | null;

export function useHeroActions(onRefetch: () => void) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedHero, setSelectedHero] = useState<HeroResponse | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmHeroId, setConfirmHeroId] = useState<string | null>(null);
  const [confirmHeroIsActive, setConfirmHeroIsActive] = useState<boolean | null>(null);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);

  // Funções para criar modal
  const openCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
  const closeCreateModal = useCallback((refresh?: boolean) => {
    setIsCreateModalOpen(false);
    if (refresh) onRefetch();
  }, [onRefetch]);
  
  // Funções para editar modal
  const openEditModal = useCallback((hero: HeroResponse) => {
    if (!hero.is_active) return;
    setSelectedHero(hero);
    setIsEditModalOpen(true);
  }, []);
  
  const closeEditModal = useCallback((refresh?: boolean) => {
    setIsEditModalOpen(false);
    setSelectedHero(null);
    if (refresh) onRefetch();
  }, [onRefetch]);
  
  // Funções para visualizar modal
  const openViewModal = useCallback((hero: HeroResponse) => {
    setSelectedHero(hero);
    setIsViewModalOpen(true);
  }, []);
  
  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedHero(null);
  }, []);
  
  // Funções para confirmar modal
  const openConfirmModal = useCallback((action: ConfirmAction, id: string, isActive?: boolean) => {
    setConfirmAction(action);
    setConfirmHeroId(id);
    setConfirmHeroIsActive(isActive ?? null);
    setIsConfirmModalOpen(true);
  }, []);
  
  const closeConfirmModal = useCallback(() => {
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
    setConfirmHeroId(null);
    setConfirmHeroIsActive(null);
  }, []);

  // Função para executar a ação confirmada
  const handleConfirmedAction = useCallback(async () => {
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
      onRefetch();
    } catch (err: any) {
      console.error(`Failed to ${confirmAction} hero:`, err);
      toast.error(err.message || errorMsg);
    } finally {
      setIsConfirmingAction(false);
    }
  }, [confirmAction, confirmHeroId, confirmHeroIsActive, closeConfirmModal, onRefetch]);

  return {
    // Estados
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    isConfirmModalOpen,
    selectedHero,
    confirmAction,
    confirmHeroId,
    confirmHeroIsActive,
    isConfirmingAction,
    
    // Ações
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmedAction
  };
} 