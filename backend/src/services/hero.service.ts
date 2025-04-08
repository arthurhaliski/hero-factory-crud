import { HeroRepository } from '../repositories/hero.repository';
import { Hero, CreateHeroDTO, UpdateHeroDTO } from '../types/hero';
import { NotFoundError, BadRequestError } from '../errors/AppError';
import { injectable, inject, singleton } from 'tsyringe';

@singleton()
@injectable()
export class HeroService {
  private readonly repository: HeroRepository;

  constructor(
    @inject(HeroRepository) repository: HeroRepository
  ) {
    this.repository = repository;
  }

  async create(data: CreateHeroDTO): Promise<Hero> {
    return this.repository.create(data);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ heroes: Hero[]; total: number }> {
    return this.repository.findAll(page, limit, search);
  }

  async findById(id: string): Promise<Hero> {
    const hero = await this.repository.findById(id);
    if (!hero || !hero.isActive) {
      throw new NotFoundError('Hero not found');
    }
    return hero;
  }

  async update(id: string, data: UpdateHeroDTO): Promise<Hero> {
    await this.findById(id); 
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<Hero> {
    return this.repository.delete(id);
  }

  async activate(id: string): Promise<Hero> {
    const hero = await this.repository.findById(id);
    
    if (!hero) {
      throw new NotFoundError('Hero not found');
    }

    if (hero.isActive) {
       throw new BadRequestError('Hero is already active');
    }
    
    return this.repository.activate(id);
  }
} 