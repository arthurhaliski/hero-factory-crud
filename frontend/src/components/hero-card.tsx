'use client';

import React, { useCallback, useMemo, memo } from 'react';
import { HeroResponse } from '@/types/hero';
import { 
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem
} from '@/components/dropdown';
import { Avatar } from '@/components/avatar';
import { Subheading } from './heading';
import { clsx } from 'clsx';

interface HeroCardProps {
  hero: HeroResponse;
  onView: (hero: HeroResponse) => void;
  onEdit: (hero: HeroResponse) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const EditIcon = memo(() => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
  </svg>
));
EditIcon.displayName = 'EditIcon';

const DeleteIcon = memo(() => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-red-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
));
DeleteIcon.displayName = 'DeleteIcon';

const ActivateIcon = memo(() => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-green-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
  </svg>
));
ActivateIcon.displayName = 'ActivateIcon';

const OptionsIcon = memo(() => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
  </svg>
));
OptionsIcon.displayName = 'OptionsIcon';

const HeroCardComponent = ({ hero, onView, onEdit, onToggleActive, onDelete }: HeroCardProps) => {
  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(hero);
  }, [hero, onEdit]);

  const handleToggleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleActive(hero.id, hero.is_active);
  }, [hero.id, hero.is_active, onToggleActive]);
  
  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(hero.id);
  }, [hero.id, onDelete]);

  const handleViewClick = useCallback(() => {
    onView(hero);
  }, [hero, onView]);

  const heroInitials = useMemo(() => 
    getInitials(hero.nickname || hero.name), 
    [hero.nickname, hero.name]
  );

  const cardClassName = useMemo(() => 
    clsx(
      'group relative flex flex-col items-center gap-3 p-4',
      'bg-white dark:bg-zinc-800 rounded-lg cursor-pointer',
      'border border-zinc-950/10 dark:border-white/10'
    ), 
    []
  );

  const statusClassName = useMemo(() => 
    clsx(
      'absolute bottom-0 right-3 block size-3.5 rounded-full',
      'border-2 border-white dark:border-zinc-800',
      hero.is_active ? 'bg-green-500' : 'bg-zinc-400 dark:bg-zinc-500'
    ), 
    [hero.is_active]
  );

  return (
    <div className={cardClassName} onClick={handleViewClick}>
      <div className="relative">
        <Avatar 
          src={hero.avatar_url}
          initials={heroInitials}
          alt={`Avatar of ${hero.nickname}`}
          className="size-20 shrink-0" 
        />
        <span 
          className={statusClassName}
          title={hero.is_active ? 'Ativo' : 'Inativo'}
        />
      </div>
      
      <div className="flex-1 text-center w-full truncate">
        <Subheading className="truncate">{hero.nickname}</Subheading>
      </div>
      
      <div className="absolute top-4 right-3 z-10" onClick={(e) => e.stopPropagation()}> 
        <Dropdown>
          <DropdownButton 
            plain 
            className="-m-2" 
            style={{ padding: '4px' }} 
            aria-label="Ações para o herói"
          > 
            <OptionsIcon />
          </DropdownButton>
          <DropdownMenu anchor="bottom end">
            <DropdownItem onClick={handleEditClick} disabled={!hero.is_active} className="gap-2">
              <EditIcon /> 
              Editar
            </DropdownItem>
            {hero.is_active ? (
              <DropdownItem onClick={handleDeleteClick} className="!text-red-600 gap-2">
                <DeleteIcon /> Excluir
              </DropdownItem>
            ) : (
              <DropdownItem onClick={handleToggleClick} className="!text-green-600 gap-2">
                <ActivateIcon /> Ativar
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export const HeroCard = memo(HeroCardComponent); 