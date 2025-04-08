import 'reflect-metadata'; // Importar para tsyringe
import { container } from 'tsyringe'; // Importar container
import { Request, Response, NextFunction } from 'express';
import { HeroController } from './hero.controller';
import { HeroService } from '../services/hero.service';
import { CreateHeroDTO, UpdateHeroDTO, Hero } from '../types/hero';
import { AppError } from '../errors/AppError'; // Import if testing error handling

jest.mock('../utils/catchAsync', () => ({
  catchAsync: (fn: any) => fn,
}));

jest.mock('../services/hero.service', () => {
  return {
    HeroService: jest.fn().mockImplementation(() => {
      return {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        activate: jest.fn(),
      };
    })
  };
});

const MockHeroService = HeroService as jest.MockedClass<typeof HeroService>;

const mockRequest = (params = {}, query = {}, body = {}): Partial<Request> => ({
  params,
  query,
  body,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('HeroController', () => {
  let controller: HeroController;
  let mockServiceInstance: jest.Mocked<HeroService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    container.clearInstances(); 

    controller = container.resolve(HeroController);

    mockServiceInstance = controller['service'] as jest.Mocked<HeroService>; 

    res = mockResponse();
    next = mockNext;
  });

  describe('create', () => {
    it('should call service.create with request body and return 201 with formatted hero', async () => {
      const inputData: CreateHeroDTO = { name: 'Test', nickname: 'Tester', dateOfBirth: new Date(), universe: 'U', mainPower: 'P', avatarUrl: 'url' };
      const createdHero: Hero = { ...inputData, id: 'uuid-1', isActive: true, createdAt: new Date(), updatedAt: new Date() };
      const formattedHero = { 
          id: createdHero.id,
          name: createdHero.name,
          nickname: createdHero.nickname,
          date_of_birth: createdHero.dateOfBirth.toISOString(),
          universe: createdHero.universe,
          main_power: createdHero.mainPower,
          avatar_url: createdHero.avatarUrl,
          is_active: createdHero.isActive,
          created_at: createdHero.createdAt.toISOString(),
          updated_at: createdHero.updatedAt.toISOString(),
      };
      req = mockRequest({}, {}, inputData);
      mockServiceInstance.create.mockResolvedValue(createdHero);

      await controller.create(req as Request, res as Response, next);

      expect(mockServiceInstance.create).toHaveBeenCalledWith(inputData);
      expect(mockServiceInstance.create).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(formattedHero); 
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw an error if service.create throws an error', async () => {
      const inputData: CreateHeroDTO = { name: 'Test', nickname: 'Tester', dateOfBirth: new Date(), universe: 'U', mainPower: 'P', avatarUrl: 'url' };
      const testError = new Error('Service failed');
      req = mockRequest({}, {}, inputData);
      mockServiceInstance.create.mockRejectedValueOnce(testError);

      await expect(controller.create(req as Request, res as Response, next)).rejects.toThrow(testError);

      expect(mockServiceInstance.create).toHaveBeenCalledWith(inputData);
      expect(mockServiceInstance.create).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const mockHero1: Hero = { id: 'uuid-1', name: 'H1', nickname: 'N1', dateOfBirth: new Date(), universe: 'U', mainPower: 'P', avatarUrl: 'url1', isActive: true, createdAt: new Date(Date.now() - 10000), updatedAt: new Date() }; // Older
    const mockHero2: Hero = { id: 'uuid-2', name: 'H2', nickname: 'N2', dateOfBirth: new Date(), universe: 'U', mainPower: 'P', avatarUrl: 'url2', isActive: true, createdAt: new Date(), updatedAt: new Date() }; // Newer
    const formattedHero1 = { id: 'uuid-1', name: 'H1', nickname: 'N1', date_of_birth: mockHero1.dateOfBirth.toISOString(), universe: 'U', main_power: 'P', avatar_url: 'url1', is_active: true, created_at: mockHero1.createdAt.toISOString(), updated_at: mockHero1.updatedAt.toISOString() };
    const formattedHero2 = { id: 'uuid-2', name: 'H2', nickname: 'N2', date_of_birth: mockHero2.dateOfBirth.toISOString(), universe: 'U', main_power: 'P', avatar_url: 'url2', is_active: true, created_at: mockHero2.createdAt.toISOString(), updated_at: mockHero2.updatedAt.toISOString() };

    it('should call service.findAll with parsed query parameters and return formatted response', async () => {
      const page = '2';
      const limit = '5';
      const search = 'term';
      const serviceResult = { heroes: [mockHero2, mockHero1], total: 12 };
      req = mockRequest({}, { page, limit, search });
      mockServiceInstance.findAll.mockResolvedValue(serviceResult);
      const expectedPage = 2;
      const expectedLimit = 5;
      const expectedTotalPages = Math.ceil(serviceResult.total / expectedLimit);

      await controller.findAll(req as Request, res as Response, next);

      expect(mockServiceInstance.findAll).toHaveBeenCalledWith(expectedPage, expectedLimit, search);
      expect(mockServiceInstance.findAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        heroes: [formattedHero2, formattedHero1],
        total: serviceResult.total,
        page: expectedPage,
        totalPages: expectedTotalPages,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call service.findAll with default parameters if query params are missing', async () => {
        const serviceResult = { heroes: [mockHero2], total: 1 };
        req = mockRequest({}, {});
        mockServiceInstance.findAll.mockResolvedValue(serviceResult);
        const defaultPage = 1;
        const defaultLimit = 10;
        const expectedTotalPages = Math.ceil(serviceResult.total / defaultLimit);
  
        await controller.findAll(req as Request, res as Response, next);
  
        expect(mockServiceInstance.findAll).toHaveBeenCalledWith(defaultPage, defaultLimit, undefined);
        expect(mockServiceInstance.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({
          heroes: [formattedHero2],
          total: serviceResult.total,
          page: defaultPage,
          totalPages: expectedTotalPages,
        });
        expect(next).not.toHaveBeenCalled();
      });

    it('should throw an error if service.findAll throws an error', async () => {
      const testError = new Error('Service failed to find all');
      req = mockRequest({}, { page: '1', limit: '10' });
      mockServiceInstance.findAll.mockRejectedValueOnce(testError);

      await expect(controller.findAll(req as Request, res as Response, next)).rejects.toThrow(testError);

      expect(mockServiceInstance.findAll).toHaveBeenCalledWith(1, 10, undefined);
      expect(mockServiceInstance.findAll).toHaveBeenCalledTimes(1);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    const heroId = 'test-uuid';
    const mockHero: Hero = { id: heroId, name: 'Found Hero', nickname: 'Finder', dateOfBirth: new Date(), universe: 'U', mainPower: 'P', avatarUrl: 'url', isActive: true, createdAt: new Date(), updatedAt: new Date() };
    const formattedHero = { 
        id: heroId, 
        name: 'Found Hero', 
        nickname: 'Finder', 
        date_of_birth: mockHero.dateOfBirth.toISOString(), 
        universe: 'U', 
        main_power: 'P', 
        avatar_url: 'url', 
        is_active: true, 
        created_at: mockHero.createdAt.toISOString(), 
        updated_at: mockHero.updatedAt.toISOString() 
    };

    it('should call service.findById with the id from params and return 200 with formatted hero', async () => {
        req = mockRequest({ id: heroId });
        mockServiceInstance.findById.mockResolvedValue(mockHero);

        await controller.findById(req as Request, res as Response, next);

        expect(mockServiceInstance.findById).toHaveBeenCalledWith(heroId);
        expect(mockServiceInstance.findById).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(formattedHero);
        expect(res.status).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should throw an error if service.findById throws an error', async () => {
        const testError = new AppError('Hero not found', 404); 
        req = mockRequest({ id: heroId });
        mockServiceInstance.findById.mockRejectedValueOnce(testError);

        await expect(controller.findById(req as Request, res as Response, next)).rejects.toThrow(testError);

        expect(mockServiceInstance.findById).toHaveBeenCalledWith(heroId);
        expect(mockServiceInstance.findById).toHaveBeenCalledTimes(1);
        expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const heroId = 'test-update-uuid';
    const requestBody: UpdateHeroDTO = { nickname: 'Updated Nickname', mainPower: 'Updated Power' };
    
    const mockHeroReturnedByService: Hero = { 
        id: heroId, 
        name: 'Original Name',
        nickname: requestBody.nickname!,
        dateOfBirth: new Date('1990-01-01T00:00:00.000Z'),
        universe: 'Original Universe', 
        mainPower: requestBody.mainPower!,
        avatarUrl: 'original_url', 
        isActive: true, 
        createdAt: new Date('2023-01-01T10:00:00.000Z'),
        updatedAt: new Date('2023-01-01T12:00:00.000Z')
    };

    const expectedFormattedResponse = { 
        id: mockHeroReturnedByService.id,
        name: mockHeroReturnedByService.name,
        nickname: mockHeroReturnedByService.nickname,
        date_of_birth: mockHeroReturnedByService.dateOfBirth.toISOString(),
        universe: mockHeroReturnedByService.universe,
        main_power: mockHeroReturnedByService.mainPower,
        avatar_url: mockHeroReturnedByService.avatarUrl,
        is_active: mockHeroReturnedByService.isActive,
        created_at: mockHeroReturnedByService.createdAt.toISOString(),
        updated_at: mockHeroReturnedByService.updatedAt.toISOString(),
    };

    it('should call service.update with id and body, and return 200 with formatted hero', async () => {
      req = mockRequest({ id: heroId }, {}, requestBody);
      mockServiceInstance.update.mockResolvedValue(mockHeroReturnedByService);

      await controller.update(req as Request, res as Response, next);

      expect(mockServiceInstance.update).toHaveBeenCalledWith(heroId, requestBody);
      expect(mockServiceInstance.update).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(expectedFormattedResponse);
      expect(res.status).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw an error if service.update throws an error', async () => {
      const testError = new AppError('Cannot update inactive hero', 400); 
      req = mockRequest({ id: heroId }, {}, requestBody); 
      mockServiceInstance.update.mockRejectedValueOnce(testError);

      await expect(controller.update(req as Request, res as Response, next)).rejects.toThrow(testError);

      expect(mockServiceInstance.update).toHaveBeenCalledWith(heroId, requestBody); 
      expect(mockServiceInstance.update).toHaveBeenCalledTimes(1);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const heroId = 'delete-uuid';
    const deletedHeroMock: Hero = { id: heroId, name: 'To Be Deleted', nickname: 'Deleter', dateOfBirth: new Date(), universe: 'U', mainPower: 'P', avatarUrl: 'url', isActive: false, createdAt: new Date(), updatedAt: new Date() };
    const formattedDeletedHero = { 
        id: deletedHeroMock.id,
        name: deletedHeroMock.name,
        nickname: deletedHeroMock.nickname,
        date_of_birth: deletedHeroMock.dateOfBirth.toISOString(),
        universe: deletedHeroMock.universe,
        main_power: deletedHeroMock.mainPower,
        avatar_url: deletedHeroMock.avatarUrl,
        is_active: deletedHeroMock.isActive,
        created_at: deletedHeroMock.createdAt.toISOString(),
        updated_at: deletedHeroMock.updatedAt.toISOString(),
    };

    it('should call service.delete with id and return 200 with formatted (inactive) hero', async () => {
        req = mockRequest({ id: heroId });
        mockServiceInstance.delete.mockResolvedValue(deletedHeroMock);

        await controller.delete(req as Request, res as Response, next);

        expect(mockServiceInstance.delete).toHaveBeenCalledWith(heroId);
        expect(mockServiceInstance.delete).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(formattedDeletedHero);
        expect(res.status).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should throw an error if service.delete throws an error', async () => {
        const testError = new AppError('Hero not found to delete', 404);
        req = mockRequest({ id: heroId });
        mockServiceInstance.delete.mockRejectedValueOnce(testError);

        await expect(controller.delete(req as Request, res as Response, next)).rejects.toThrow(testError);

        expect(mockServiceInstance.delete).toHaveBeenCalledWith(heroId);
        expect(mockServiceInstance.delete).toHaveBeenCalledTimes(1);
        expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('activate', () => {
    const heroId = 'activate-uuid';
    const activatedHeroMock: Hero = { id: heroId, name: 'To Be Activated', nickname: 'Activator', dateOfBirth: new Date(), universe: 'U', mainPower: 'P', avatarUrl: 'url', isActive: true, createdAt: new Date(), updatedAt: new Date() };
    const formattedActivatedHero = { 
        id: activatedHeroMock.id,
        name: activatedHeroMock.name,
        nickname: activatedHeroMock.nickname,
        date_of_birth: activatedHeroMock.dateOfBirth.toISOString(),
        universe: activatedHeroMock.universe,
        main_power: activatedHeroMock.mainPower,
        avatar_url: activatedHeroMock.avatarUrl,
        is_active: activatedHeroMock.isActive,
        created_at: activatedHeroMock.createdAt.toISOString(),
        updated_at: activatedHeroMock.updatedAt.toISOString(),
    };

    it('should call service.activate with id and return 200 with formatted (active) hero', async () => {
        req = mockRequest({ id: heroId });
        mockServiceInstance.activate.mockResolvedValue(activatedHeroMock);

        await controller.activate(req as Request, res as Response, next);

        expect(mockServiceInstance.activate).toHaveBeenCalledWith(heroId);
        expect(mockServiceInstance.activate).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(formattedActivatedHero);
        expect(res.status).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should throw an error if service.activate throws an error', async () => {
        const testError = new AppError('Hero not found to activate', 404);
        req = mockRequest({ id: heroId });
        mockServiceInstance.activate.mockRejectedValueOnce(testError);

        await expect(controller.activate(req as Request, res as Response, next)).rejects.toThrow(testError);

        expect(mockServiceInstance.activate).toHaveBeenCalledWith(heroId);
        expect(mockServiceInstance.activate).toHaveBeenCalledTimes(1);
        expect(res.json).not.toHaveBeenCalled();
    });
  });

}); 