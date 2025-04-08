import 'reflect-metadata';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { HeroRepository } from '../../../src/repositories/hero.repository';
import { ConflictError, NotFoundError } from '../../../src/errors/AppError';
import prisma from '../../../src/config/prisma';
import { CreateHeroDTO, UpdateHeroDTO } from '../../../src/types/hero';

jest.mock('../../../src/config/prisma', () => ({
  hero: {
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation(async (calls) => {
    return Promise.all(calls.map((call: any) => call));
  }),
}));

const createPrismaError = (code: string, target: string[] | null): PrismaClientKnownRequestError => {
  return new PrismaClientKnownRequestError('prisma message', { code, clientVersion: 'mock', meta: { target } });
};

describe('HeroRepository - Unit Tests', () => {
  let heroRepository: HeroRepository;
  let mockPrismaHero: any;

  beforeEach(() => {
    jest.clearAllMocks();
    heroRepository = new HeroRepository(); 
    mockPrismaHero = prisma.hero; 
  });

  describe('create', () => {
    it('should throw ConflictError with correct message when Prisma throws P2002', async () => {
      const createData: CreateHeroDTO = { 
        name: 'Test', 
        nickname: 'tester', 
        dateOfBirth: new Date('2000-01-01'),
        universe: 'TEST_UNIVERSE', 
        mainPower: 'Testing',   
        avatarUrl: 'http://example.com/avatar.jpg' 
      }; 
      const prismaError = createPrismaError('P2002', ['nickname']);
      
      mockPrismaHero.findFirst.mockResolvedValueOnce(null);
      mockPrismaHero.create.mockRejectedValueOnce(prismaError);

      await expect(heroRepository.create(createData)).rejects.toThrow(
        new ConflictError('Hero creation failed: nickname already exists.')
      );
      
      const expectedPrismaPayload = {
        data: createData 
      };
      expect(mockPrismaHero.create).toHaveBeenCalledWith(expectedPrismaPayload);
      expect(mockPrismaHero.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should throw ConflictError with correct message when Prisma throws P2002', async () => {
      const heroId = 'test-uuid';
      const updateData: UpdateHeroDTO = { nickname: 'new-tester' };
      const prismaError = createPrismaError('P2002', ['nickname']);

      mockPrismaHero.findFirst.mockResolvedValueOnce(null);
      mockPrismaHero.update.mockRejectedValueOnce(prismaError);

      await expect(heroRepository.update(heroId, updateData)).rejects.toThrow(
        new ConflictError('Hero update failed: nickname already exists.')
      );

      expect(mockPrismaHero.update).toHaveBeenCalledWith({
        where: { id: heroId },
        data: { ...updateData, dateOfBirth: undefined }, 
      });
      expect(mockPrismaHero.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when Prisma throws P2025', async () => {
      const heroId = 'non-existent-id';
      const updateData: UpdateHeroDTO = { name: 'Updated Hero' };
      const prismaError = createPrismaError('P2025', null);

      mockPrismaHero.findFirst.mockResolvedValueOnce(null);
      mockPrismaHero.update.mockRejectedValueOnce(prismaError);

      await expect(heroRepository.update(heroId, updateData)).rejects.toThrow(
        new NotFoundError(`Hero with ID ${heroId} not found`)
      );

      expect(mockPrismaHero.update).toHaveBeenCalledWith({
        where: { id: heroId },
        data: { ...updateData, dateOfBirth: undefined },
      });
    });
  });

  describe('delete', () => {
    it('should throw NotFoundError when Prisma throws P2025', async () => {
      const heroId = 'non-existent-id';
      const prismaError = createPrismaError('P2025', null);

      mockPrismaHero.update.mockRejectedValueOnce(prismaError);

      await expect(heroRepository.delete(heroId)).rejects.toThrow(
        new NotFoundError(`Hero with ID ${heroId} not found`)
      );

      expect(mockPrismaHero.update).toHaveBeenCalledWith({
        where: { id: heroId },
        data: { isActive: false },
      });
    });

    it('should return the deactivated hero when delete is successful', async () => {
      const heroId = 'existing-id';
      const mockHero = { id: heroId, isActive: false };
      
      mockPrismaHero.update.mockResolvedValueOnce(mockHero);

      const result = await heroRepository.delete(heroId);
      expect(result).toEqual(mockHero);

      expect(mockPrismaHero.update).toHaveBeenCalledWith({
        where: { id: heroId },
        data: { isActive: false },
      });
    });
  });

  describe('activate', () => {
    it('should throw NotFoundError when Prisma throws P2025', async () => {
      const heroId = 'non-existent-id';
      const prismaError = createPrismaError('P2025', null);

      mockPrismaHero.update.mockRejectedValueOnce(prismaError);

      await expect(heroRepository.activate(heroId)).rejects.toThrow(
        new NotFoundError(`Hero with ID ${heroId} not found`)
      );

      expect(mockPrismaHero.update).toHaveBeenCalledWith({
        where: { id: heroId },
        data: { isActive: true },
      });
    });

    it('should return true when activation is successful', async () => {
      const heroId = 'existing-id';
      
      mockPrismaHero.update.mockResolvedValueOnce({ id: heroId, isActive: true });

      const result = await heroRepository.activate(heroId);
      expect(result).toEqual({ id: heroId, isActive: true });

      expect(mockPrismaHero.update).toHaveBeenCalledWith({
        where: { id: heroId },
        data: { isActive: true },
      });
    });
  });

  describe('findAll', () => {
    const mockHeroes = [
      { id: '1', name: 'Hero One', nickname: 'One', isActive: true, createdAt: new Date('2024-01-01') },
      { id: '2', name: 'Hero Two', nickname: 'Two', isActive: false, createdAt: new Date('2024-01-02') }, 
      { id: '3', name: 'Hero Three', nickname: 'Three', isActive: true, createdAt: new Date('2024-01-03') },
      { id: '4', name: 'Another One', nickname: 'Four', isActive: true, createdAt: new Date('2024-01-04') },
    ];

    it('should return paginated heroes and total count without search term', async () => {
      const page = 1;
      const limit = 2;
      const expectedSkip = 0;
      const expectedHeroes = mockHeroes.slice(0, 2); 
      const expectedTotal = mockHeroes.length;

      mockPrismaHero.findMany.mockResolvedValueOnce(expectedHeroes);
      mockPrismaHero.count.mockResolvedValueOnce(expectedTotal);

      const result = await heroRepository.findAll(page, limit);

      expect(result).toEqual({ heroes: expectedHeroes, total: expectedTotal });
      expect(mockPrismaHero.findMany).toHaveBeenCalledWith({
        where: {}, 
        skip: expectedSkip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaHero.count).toHaveBeenCalledWith({ where: {} }); 
    });

    it('should return paginated heroes and total count with search term', async () => {
      const page = 1;
      const limit = 5;
      const search = 'One';
      const expectedSkip = 0;
      const filteredHeroes = mockHeroes.filter(h => h.name.includes(search) || h.nickname.includes(search));
      const expectedTotal = filteredHeroes.length;

      mockPrismaHero.findMany.mockResolvedValueOnce(filteredHeroes);
      mockPrismaHero.count.mockResolvedValueOnce(expectedTotal);

      const result = await heroRepository.findAll(page, limit, search);

      const expectedWhere = {
        OR: [
          { name: { contains: search } },
          { nickname: { contains: search } },
        ],
      };

      expect(result).toEqual({ heroes: filteredHeroes, total: expectedTotal });
      expect(mockPrismaHero.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: expectedSkip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaHero.count).toHaveBeenCalledWith({ where: expectedWhere });
    });

    it('should handle pagination correctly (e.g., page 2)', async () => {
      const page = 2;
      const limit = 2;
      const expectedSkip = 2;
      const expectedHeroes = mockHeroes.slice(2, 4); // Next 2 heroes
      const expectedTotal = mockHeroes.length;

      mockPrismaHero.findMany.mockResolvedValueOnce(expectedHeroes);
      mockPrismaHero.count.mockResolvedValueOnce(expectedTotal);

      const result = await heroRepository.findAll(page, limit);

      expect(result).toEqual({ heroes: expectedHeroes, total: expectedTotal });
      expect(mockPrismaHero.findMany).toHaveBeenCalledWith({
        where: {}, 
        skip: expectedSkip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaHero.count).toHaveBeenCalledWith({ where: {} });
    });
  });
}); 