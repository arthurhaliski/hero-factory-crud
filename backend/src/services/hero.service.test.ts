import 'reflect-metadata';
import { container } from 'tsyringe';
import { HeroService } from './hero.service';
import { HeroRepository } from '../repositories/hero.repository';
import { NotFoundError, BadRequestError } from '../errors/AppError';
import { Hero } from '../types/hero';

jest.mock('../repositories/hero.repository');

const MockHeroRepository = HeroRepository as jest.MockedClass<typeof HeroRepository>; 

const createMockHero = (overrides: Partial<Hero> = {}): Hero => ({
  id: 'uuid-1',
  name: 'Test Hero',
  nickname: 'Tester',
  dateOfBirth: new Date('1990-01-01T00:00:00.000Z'),
  universe: 'Testverse',
  mainPower: 'Testing',
  avatarUrl: 'http://example.com/avatar.jpg',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('HeroService', () => {
  let heroService: HeroService;
  let mockRepository: jest.Mocked<HeroRepository>; 

  beforeEach(() => {
    jest.clearAllMocks();
    container.clearInstances();

    mockRepository = new MockHeroRepository() as jest.Mocked<HeroRepository>; 

    container.registerInstance(HeroRepository, mockRepository);

    heroService = container.resolve(HeroService);
  });

  describe('findById', () => {
    it('should return a hero when found', async () => {
      const mockHero = createMockHero();
      mockRepository.findById.mockResolvedValue(mockHero);

      const result = await heroService.findById('uuid-1');

      expect(result).toEqual(mockHero);
      expect(mockRepository.findById).toHaveBeenCalledWith('uuid-1');
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when hero is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const findPromise = heroService.findById('non-existent-uuid');

      await expect(findPromise).rejects.toThrow(NotFoundError);
      await expect(findPromise).rejects.toThrow('Hero not found');

      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-uuid');
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should call repository.create with correct data and return the created hero', async () => {
      const inputData = {
        name: 'New Hero',
        nickname: 'Newbie',
        dateOfBirth: new Date('2000-05-15T00:00:00.000Z'),
        universe: 'Newverse',
        mainPower: 'Creation',
        avatarUrl: 'http://example.com/new.jpg',
      };

      const expectedHero = createMockHero({
        id: 'new-uuid',
        ...inputData,
      });

      mockRepository.create.mockResolvedValue(expectedHero);

      const result = await heroService.create(inputData);

      expect(result).toEqual(expectedHero);
      expect(mockRepository.create).toHaveBeenCalledWith(inputData);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const heroId = 'existing-uuid';
    const updateData = {
      name: 'Updated Hero Name',
      mainPower: 'Updated Power',
    };

    it('should update the hero and return the updated data when hero exists and is active', async () => {
      const existingHero = createMockHero({ id: heroId, isActive: true });
      const updatedHeroData = { ...existingHero, ...updateData, updatedAt: new Date() }; // Simula a atualização

      mockRepository.findById.mockResolvedValue(existingHero);
      mockRepository.update.mockResolvedValue(updatedHeroData);

      const result = await heroService.update(heroId, updateData);

      expect(result).toEqual(updatedHeroData);
      expect(mockRepository.findById).toHaveBeenCalledWith(heroId);
      expect(mockRepository.update).toHaveBeenCalledWith(heroId, updateData);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when trying to update a non-existent hero', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const updatePromise = heroService.update('non-existent-uuid', updateData);

      await expect(updatePromise).rejects.toThrow(NotFoundError);
      await expect(updatePromise).rejects.toThrow('Hero not found');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when trying to update an inactive hero', async () => {
      const heroId = 'inactive-hero-uuid';
      const inactiveHero = createMockHero({ id: heroId, isActive: false });
      const updateData = { name: 'TryingToUpdate' };

      mockRepository.findById.mockResolvedValue(inactiveHero);

      const updatePromise = heroService.update(heroId, updateData);

      await expect(updatePromise).rejects.toThrow(NotFoundError);
      await expect(updatePromise).rejects.toThrow('Hero not found');

      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(mockRepository.findById).toHaveBeenCalledWith(heroId);
    });
  });

  describe('delete', () => {
    it('should call repository.delete and return the (soft) deleted hero when hero exists', async () => {
      const heroId = 'existing-uuid';
      const deletedHeroData = { id: heroId, name: 'Test Hero', isActive: false } as Hero;

      mockRepository.delete.mockResolvedValueOnce(deletedHeroData);

      const result = await heroService.delete(heroId);

      expect(result).toEqual(deletedHeroData);
      expect(mockRepository.delete).toHaveBeenCalledWith(heroId);
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when trying to delete a non-existent hero', async () => {
      const nonExistentId = 'non-existent-uuid';
      mockRepository.delete.mockRejectedValueOnce(new NotFoundError('Hero not found'));

      const deletePromise = heroService.delete(nonExistentId);

      await expect(deletePromise).rejects.toThrow(NotFoundError);
      await expect(deletePromise).rejects.toThrow('Hero not found');

      expect(mockRepository.delete).toHaveBeenCalledWith(nonExistentId);
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('activate', () => {
    const heroId = 'existing-uuid';

    it('should call repository.activate and return the activated hero when hero exists and is inactive', async () => {
      const inactiveHero = createMockHero({ id: heroId, isActive: false });
      const activatedHeroData = { ...inactiveHero, isActive: true, updatedAt: new Date() }; 

      mockRepository.findById.mockResolvedValue(inactiveHero);
      mockRepository.activate.mockResolvedValue(activatedHeroData);

      const result = await heroService.activate(heroId);

      expect(result).toEqual(activatedHeroData);
      expect(mockRepository.findById).toHaveBeenCalledWith(heroId);
      expect(mockRepository.activate).toHaveBeenCalledWith(heroId);
      expect(mockRepository.activate).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestError when trying to activate an already active hero', async () => {
      const activeHero = createMockHero({ id: heroId, isActive: true });

      mockRepository.findById.mockResolvedValue(activeHero);

      const activatePromise = heroService.activate(heroId);

      await expect(activatePromise).rejects.toThrow(BadRequestError);
      await expect(activatePromise).rejects.toThrow('Hero is already active');

      expect(mockRepository.activate).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when trying to activate a non-existent hero', async () => {
      mockRepository.findById.mockResolvedValue(null);
 
       const activatePromise = heroService.activate('non-existent-uuid');
 
       await expect(activatePromise).rejects.toThrow(NotFoundError);
       await expect(activatePromise).rejects.toThrow('Hero not found');
 
       expect(mockRepository.activate).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should call repository.findAll with default pagination when no args provided', async () => {
      const mockHeroes = [createMockHero({ id: 'uuid-1' }), createMockHero({ id: 'uuid-2' })];
      const mockTotal = 50;
      mockRepository.findAll.mockResolvedValue({ heroes: mockHeroes, total: mockTotal });

      const result = await heroService.findAll();

      expect(result).toEqual({ heroes: mockHeroes, total: mockTotal });
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, undefined);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should call repository.findAll with provided pagination and search term', async () => {
      const mockHeroes = [createMockHero({ id: 'uuid-3' })];
      const mockTotal = 1;
      const page = 2;
      const limit = 5;
      const search = 'search-term';
      mockRepository.findAll.mockResolvedValue({ heroes: mockHeroes, total: mockTotal });

      const result = await heroService.findAll(page, limit, search);

      expect(result).toEqual({ heroes: mockHeroes, total: mockTotal });
      expect(mockRepository.findAll).toHaveBeenCalledWith(page, limit, search);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty list and total 0 when repository returns no heroes', async () => {
      const mockHeroes: Hero[] = [];
      const mockTotal = 0;
      mockRepository.findAll.mockResolvedValue({ heroes: mockHeroes, total: mockTotal });

      const result = await heroService.findAll(1, 10, 'non-matching-search');

      expect(result).toEqual({ heroes: [], total: 0 });
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, 'non-matching-search');
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });
}); 