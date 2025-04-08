'use client';

import { useState } from 'react';
import { Modal } from './modal';
import { HeroForm } from './hero-form';
import { CreateHeroDTO, UpdateHeroDTO, HeroResponse } from '@/types/hero';
import apiClient from '@/lib/apiClient';
import { toast } from "sonner";
import { Text } from '@/components/text';

interface EditHeroModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  hero: HeroResponse;
}

export function EditHeroModal({ isOpen, onClose, hero }: EditHeroModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateHeroDTO | UpdateHeroDTO) => {
    const updateData = data as UpdateHeroDTO;
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient(`/heroes/${hero.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      toast.success('Herói atualizado com sucesso!');
      onClose(true);
    } catch (err: any) {
      console.error(`Failed to update hero ${hero.id}:`, err);
      
      let userFriendlyError = 'Erro desconhecido ao atualizar herói.';

      if (err instanceof Error && err.message) {
        if (err.message.includes('nickname already exists')) {
          userFriendlyError = 'Este nome de guerra já está em uso. Por favor, escolha outro.';
        } else if (err.message.includes('not found')) {
          userFriendlyError = 'Herói não encontrado. Ele pode ter sido removido.';
        } else {
          userFriendlyError = err.message;
        }
      } 
      else if (typeof err === 'string') {
         userFriendlyError = err;
      }

      setError(userFriendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => onClose()} 
      title="Editar herói"
      size="lg" 
    >
       {error && (
          <Text className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" style={{ color: 'red' }}>
            {error}
          </Text>
       )}
      <HeroForm 
        initialData={hero}
        onSubmit={handleSubmit} 
        onCancel={() => onClose()} 
        isSubmitting={isSubmitting} 
      />
    </Modal>
  );
} 