import 'reflect-metadata';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { HeroRepository } from '../../../src/repositories/hero.repository';
import { ConflictError, NotFoundError } from '../../../src/errors/AppError';
import prisma from '../../../src/config/prisma';
import { CreateHeroDTO, UpdateHeroDTO } from '../../../src/types/hero';

// Mock the prisma client
jest.mock('../../../src/config/prisma', () => ({
  hero: {
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    // Add other methods if needed for future tests
  },
}));

// Helper to create Prisma errors
const createPrismaError = (code: string, target: string[] | null): PrismaClientKnownRequestError => {
  // Prisma error constructor needs at least message, code, clientVersion
  return new PrismaClientKnownRequestError('prisma message', { code, clientVersion: 'mock', meta: { target } });
};

describe('HeroRepository - Unit Tests', () => {
  let heroRepository: HeroRepository;
  let mockPrismaHero: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Use tsyringe container to resolve repository if it has dependencies injected
    // For now, direct instantiation is fine as it seems to have no constructor deps
    heroRepository = new HeroRepository(); 
    mockPrismaHero = prisma.hero; // Get the mocked functions
  });

  describe('create', () => {
    it('should throw ConflictError with correct message when Prisma throws P2002', async () => {
      // Provide all required fields for CreateHeroDTO
      const createData: CreateHeroDTO = { 
        name: 'Test', 
        nickname: 'tester', 
        dateOfBirth: new Date('2000-01-01'),
        universe: 'TEST_UNIVERSE', // Add missing field
        mainPower: 'Testing',    // Add missing field
        avatarUrl: 'http://example.com/avatar.jpg' // Add missing field
      }; 
      const prismaError = createPrismaError('P2002', ['nickname']);
      
      // Mock findFirst to return null (no existing hero)
      mockPrismaHero.findFirst.mockResolvedValueOnce(null);
      mockPrismaHero.create.mockRejectedValueOnce(prismaError);

      // Combine assertions: check type and message in one go
      await expect(heroRepository.create(createData)).rejects.toThrow(
        new ConflictError('Hero creation failed: nickname already exists.')
      );
      
      // Verify the call to prisma - uses the complete createData object
      const expectedPrismaPayload = {
        data: createData // The data passed should now match expected type
      };
      expect(mockPrismaHero.create).toHaveBeenCalledWith(expectedPrismaPayload);
      expect(mockPrismaHero.create).toHaveBeenCalledTimes(1);
    });

    // Add a test for successful creation if needed
  });

  describe('update', () => {
    it('should throw ConflictError with correct message when Prisma throws P2002', async () => {
      const heroId = 'test-uuid';
      const updateData: UpdateHeroDTO = { nickname: 'new-tester' };
      const prismaError = createPrismaError('P2002', ['nickname']);

      // Mock findFirst to return null (no existing hero with this nickname)
      mockPrismaHero.findFirst.mockResolvedValueOnce(null);
      mockPrismaHero.update.mockRejectedValueOnce(prismaError);

      // Combine assertions: check type and message in one go
      await expect(heroRepository.update(heroId, updateData)).rejects.toThrow(
        new ConflictError('Hero update failed: nickname already exists.')
      );

      // Verify the call to prisma
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

      // Mock findFirst to return null (no existing hero with this nickname)
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

  // Add tests for other methods (findAll, findById) as needed
}); 