import { Request } from 'express';
import { CreateHeroDTO, UpdateHeroDTO } from './hero';

export interface HeroParams extends Record<string, string> {
  id: string;
}

export interface HeroQuery extends Record<string, string | string[] | undefined> {
  page?: string;
  limit?: string;
  search?: string;
}

export interface CreateHeroRequest extends Request {
  body: CreateHeroDTO;
}

export interface UpdateHeroRequest extends Request<HeroParams> {
  body: UpdateHeroDTO;
}

export interface GetHeroRequest extends Request<HeroParams> {}

export interface ListHeroesRequest extends Request<{}, any, any, HeroQuery> {} 