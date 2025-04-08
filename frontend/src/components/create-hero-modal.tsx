'use client';

import { useState } from 'react';
import { Modal } from './modal';
import { HeroForm } from './hero-form';
import { CreateHeroDTO, UpdateHeroDTO } from '@/types/hero';
import apiClient from '@/lib/apiClient';
import { toast } from "sonner";
import { Text } from '@/components/text';
interface CreateHeroModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
}

export function CreateHeroModal({ isOpen, onClose }: CreateHeroModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateHeroDTO | UpdateHeroDTO) => {
    const createData = data as CreateHeroDTO;
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient('/heroes', {
        method: 'POST',
        body: JSON.stringify(createData),
      });
      toast.success('Herói criado com sucesso!');
      onClose(true);
    } catch (err: any) {      
      let userFriendlyError = 'Erro desconhecido ao criar herói.';

      if (err instanceof Error && err.message) {
        if (err.message.includes('nickname already exists')) {
          userFriendlyError = 'Este nome de guerra já está em uso. Por favor, escolha outro.';
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
      title="Criar herói"
      size="lg" 
    >
      {error && (
          <Text className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" style={{ color: 'red' }}>
            {error}
          </Text>
       )}
      <HeroForm 
        onSubmit={handleSubmit} 
        onCancel={() => onClose()} 
        isSubmitting={isSubmitting} 
      />
    </Modal>
  );
} 