'use client';

import { HeroResponse } from '@/types/hero';
import { Modal } from './modal';
import { DescriptionList, DescriptionTerm, DescriptionDetails } from './description-list';
import { formatDate } from '@/lib/utils';
import { Avatar } from '@/components/avatar';
import { Heading } from './heading';
import { clsx } from 'clsx';
import { useMemo } from 'react';

interface ViewHeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  hero: HeroResponse;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export function ViewHeroModal({ isOpen, onClose, hero }: ViewHeroModalProps) {
  const heroInitials = getInitials(hero.nickname || hero.name);
  
  const statusClassName = useMemo(() => 
    clsx(
      'absolute bottom-0 right-3 block size-3.5 rounded-full',
      'border-2 border-white dark:border-zinc-800',
      hero.is_active ? 'bg-green-500' : 'bg-zinc-400 dark:bg-zinc-500'
    ), 
    [hero.is_active]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg"> 
      <div className="flex flex-col items-center p-4 space-y-4">
        <div className="relative">
          <Avatar
            src={hero.avatar_url}
            initials={heroInitials}
            alt={`Avatar of ${hero.nickname}`}
            className="w-24 h-24 rounded-full"
          />
          <span 
            className={statusClassName}
            title={hero.is_active ? 'Ativo' : 'Inativo'}
          />
        </div>
        
        <Heading>{hero.nickname}</Heading>

        <DescriptionList className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
          <div className="sm:col-span-1">
            <DescriptionTerm>Nome completo:</DescriptionTerm>
            <DescriptionDetails>{hero.name}</DescriptionDetails>
          </div>
          <div className="sm:col-span-1">
            <DescriptionTerm>Data de nascimento:</DescriptionTerm>
            <DescriptionDetails>{formatDate(hero.date_of_birth)}</DescriptionDetails>
          </div>
          <div className="sm:col-span-1">
            <DescriptionTerm>Universo:</DescriptionTerm>
            <DescriptionDetails>{hero.universe}</DescriptionDetails>
          </div>
           <div className="sm:col-span-1">
            <DescriptionTerm>Habilidade:</DescriptionTerm>
            <DescriptionDetails>{hero.main_power}</DescriptionDetails>
          </div>
        </DescriptionList>
      </div>
    </Modal>
  );
} 