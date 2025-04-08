'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateHeroDTO, UpdateHeroDTO, HeroResponse } from '@/types/hero';
import { Button } from './button';
import { Input } from './input';
import { Field, Label, FieldGroup, Fieldset, ErrorMessage } from './fieldset';
import { useEffect } from 'react';

const heroFormSchema = z.object({
  name: z.string().min(3, 'Nome completo deve ter no mínimo 3 caracteres.'),
  nickname: z.string().min(3, 'Nome de guerra deve ter no mínimo 3 caracteres.'),
  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento deve estar no formato YYYY-MM-DD.')
    .refine((dateStr: string) => !isNaN(new Date(dateStr).getTime()), 'Data de nascimento inválida.'),
  universe: z.string().min(1, 'Universo não pode estar vazio.'),
  mainPower: z.string().min(1, 'Habilidade não pode estar vazio.'),
  avatarUrl: z.string()
    .url('Avatar deve ser uma URL válida.')
    .or(z.literal('')),
});

type HeroFormData = z.infer<typeof heroFormSchema>;

interface HeroFormProps {
  initialData?: HeroResponse | null; 
  onSubmit: (data: CreateHeroDTO | UpdateHeroDTO) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const formatDateForInput = (isoDateString: string | undefined | null): string => {
  if (!isoDateString) return '';
  try {
    return new Date(isoDateString).toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export function HeroForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: HeroFormProps) {
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isDirty } 
  } = useForm<HeroFormData>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      dateOfBirth: formatDateForInput(initialData.date_of_birth),
      avatarUrl: initialData.avatar_url ?? '', // Ensure empty string if null/undefined
      mainPower: initialData.main_power ?? ''
    } : {
      name: '',
      nickname: '',
      dateOfBirth: '',
      universe: '',
      mainPower: '',
      avatarUrl: '',
    },
  });

  useEffect(() => {
    reset(initialData ? {
      ...initialData,
      dateOfBirth: formatDateForInput(initialData.date_of_birth),
      avatarUrl: initialData.avatar_url ?? '',
      mainPower: initialData.main_power ?? ''
    } : {
      name: '',
      nickname: '',
      dateOfBirth: '',
      universe: '',
      mainPower: '',
      avatarUrl: '',
    });
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<HeroFormData> = async (data: HeroFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Fieldset>
        <FieldGroup>
          <Field>
            <Label>Nome completo</Label>
            <Input 
              {...register('name')} 
              placeholder="Digite o nome completo"
              disabled={isSubmitting}
              invalid={!!errors.name}
            />
            {errors.name && <ErrorMessage className="text-red-600 dark:text-red-400">{errors.name.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Nome de guerra</Label>
            <Input 
              {...register('nickname')} 
              placeholder="Digite o nome de guerra"
              disabled={isSubmitting}
              invalid={!!errors.nickname}
            />
            {errors.nickname && <ErrorMessage className="text-red-600 dark:text-red-400">{errors.nickname.message}</ErrorMessage>}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field>
              <Label>Data de nascimento</Label>
              <Input 
                type="date" 
                {...register('dateOfBirth')} 
                placeholder="Digite a data" 
                disabled={isSubmitting}
                invalid={!!errors.dateOfBirth}
              />
              {errors.dateOfBirth && <ErrorMessage className="text-red-600 dark:text-red-400">{errors.dateOfBirth.message}</ErrorMessage>}
            </Field>

            <Field>
              <Label>Universo</Label>
              <Input 
                {...register('universe')} 
                placeholder="Digite o universo" 
                disabled={isSubmitting}
                invalid={!!errors.universe}
              />
              {errors.universe && <ErrorMessage className="text-red-600 dark:text-red-400">{errors.universe.message}</ErrorMessage>}
            </Field>
          </div>

          <Field>
            <Label>Habilidade</Label>
            <Input 
              {...register('mainPower')} 
              placeholder="Digite a habilidade"
              disabled={isSubmitting}
              invalid={!!errors.mainPower}
            />
            {errors.mainPower && <ErrorMessage className="text-red-600 dark:text-red-400">{errors.mainPower.message}</ErrorMessage>}
          </Field>

          <Field>
            <Label>Avatar</Label>
            <Input 
              type="url" 
              {...register('avatarUrl')} 
              placeholder="Digite a URL" 
              disabled={isSubmitting}
              invalid={!!errors.avatarUrl}
            />
            {errors.avatarUrl && <ErrorMessage className="text-red-600 dark:text-red-400">{errors.avatarUrl.message}</ErrorMessage>}
          </Field>
        </FieldGroup>
      </Fieldset>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-700">
         <Button 
            type="button" 
            plain 
            onClick={onCancel} 
            disabled={isSubmitting}
          >
           Cancelar
         </Button>
         <Button 
            type="submit" 
            color="blue" 
            disabled={isSubmitting || (!!initialData && !isDirty)}
          >
           {isSubmitting ? (initialData ? 'Salvando...' : 'Criando...') : (initialData ? 'Salvar' : 'Criar')}
         </Button>
      </div>
    </form>
  );
} 