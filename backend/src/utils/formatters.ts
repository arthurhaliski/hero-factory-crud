import { Hero, HeroResponse } from '../types/hero';

/**
 * Formata um objeto Hero do banco de dados para o formato de resposta da API.
 */
export const formatHeroApiResponse = (hero: Hero): HeroResponse => {
  return {
    id: hero.id,
    name: hero.name,
    nickname: hero.nickname,
    date_of_birth: hero.dateOfBirth.toISOString(),
    universe: hero.universe,
    main_power: hero.mainPower,
    avatar_url: hero.avatarUrl,
    is_active: hero.isActive,
    created_at: hero.createdAt.toISOString(),
    updated_at: hero.updatedAt.toISOString(),
  };
}; 