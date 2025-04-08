export interface HeroResponse {
  id: string;
  name: string;
  nickname: string;
  date_of_birth: string; 
  universe: string;
  main_power: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroListResponse {
  heroes: HeroResponse[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateHeroDTO {
  name: string;
  nickname: string;
  dateOfBirth: string;
  universe: string;
  mainPower: string;
  avatarUrl: string;
}

export interface UpdateHeroDTO {
  name?: string;
  nickname?: string;
  dateOfBirth?: string;
  universe?: string;
  mainPower?: string;
  avatarUrl?: string;
}