import { Request, Response } from 'express';
import { HeroService } from '../services/hero.service';
import { Hero, HeroResponse } from '../types/hero';
import { catchAsync } from '../utils/catchAsync';
import { formatHeroApiResponse } from '../utils/formatters';
import { injectable, inject } from 'tsyringe';

@injectable()
export class HeroController {
  constructor(
    @inject(HeroService) private readonly service: HeroService
  ) {}

  create = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const hero = await this.service.create(req.body);
    res.status(201).json(formatHeroApiResponse(hero));
  });

  findAll = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string || '1', 10); 
    const limit = parseInt(req.query.limit as string || '10', 10);
    const search = req.query.search as string | undefined;

    const { heroes, total } = await this.service.findAll(page, limit, search);
      
    res.json({
      heroes: heroes.map(formatHeroApiResponse),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  });

  findById = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const hero = await this.service.findById(req.params.id);
    res.json(formatHeroApiResponse(hero));
  });

  update = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const hero = await this.service.update(req.params.id, req.body);
    res.json(formatHeroApiResponse(hero));
  });

  delete = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const hero = await this.service.delete(req.params.id);
    res.json(formatHeroApiResponse(hero));
  });

  activate = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const hero = await this.service.activate(req.params.id);
    res.json(formatHeroApiResponse(hero));
  });
} 