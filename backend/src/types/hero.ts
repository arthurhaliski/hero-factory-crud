export interface Hero {
  id: string;
  name: string;
  nickname: string;
  dateOfBirth: Date;
  universe: string;
  mainPower: string;
  avatarUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHeroDTO {
  name: string;
  nickname: string;
  dateOfBirth: Date;
  universe: string;
  mainPower: string;
  avatarUrl: string;
}

export interface UpdateHeroDTO {
  name?: string;
  nickname?: string;
  dateOfBirth?: Date;
  universe?: string;
  mainPower?: string;
  avatarUrl?: string;
}

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