import request from 'supertest'; 
import { app } from '../src/app'; 
import prisma from '../src/config/prisma'; 
import { Hero, HeroResponse } from '../src/types/hero';


let existingHero: Hero;
let secondHero: Hero;
const existingHeroNickname = 'the-flash'; 

beforeEach(async () => {
  await prisma.hero.deleteMany({}); 
  
  try {
    existingHero = await prisma.hero.create({
      data: {
        name: 'Barry Allen',
        nickname: existingHeroNickname,
        dateOfBirth: new Date('1990-03-29'),
        universe: 'DC',
        mainPower: 'Speed Force',
        avatarUrl: 'http://example.com/flash.jpg'
      }
    });

    secondHero = await prisma.hero.create({
      data: {
        name: 'Wally West',
        nickname: 'kid-flash', 
        dateOfBirth: new Date('1995-12-10'),
        universe: 'DC',
        mainPower: 'Speed Force Connection',
        avatarUrl: 'http://example.com/kidflash.jpg'
      }
    });
  } catch (error) {
    throw error;
  }
});

afterAll(async () => {
  await prisma.hero.deleteMany({});
  await prisma.$disconnect();
});

describe('Hero API Integration Tests', () => {

  describe('POST /api/heroes', () => {
    it('should create a new hero and return 201 status with the hero object', async () => {
      const heroData = {
        name: 'Integration Test Hero',
        nickname: 'Integrator',
        dateOfBirth: '1995-05-15T00:00:00.000Z',
        universe: 'TestVerse',
        mainPower: 'Testing',
        avatarUrl: 'http://example.com/avatar.jpg'
      };
      const response = await request(app).post('/api/heroes').send(heroData).expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(heroData.name);
      expect(response.body.nickname).toBe(heroData.nickname);
      expect(response.body.date_of_birth).toBe(heroData.dateOfBirth);
      expect(response.body.universe).toBe(heroData.universe);
      expect(response.body.main_power).toBe(heroData.mainPower);
      expect(response.body.avatar_url).toBe(heroData.avatarUrl);
      expect(response.body.is_active).toBe(true);
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');

      const dbHero = await prisma.hero.findUnique({ where: { id: response.body.id } });
      expect(dbHero).not.toBeNull();
      expect(dbHero?.name).toBe(heroData.name);
      expect(dbHero?.nickname).toBe(heroData.nickname);
      expect(dbHero?.dateOfBirth.toISOString()).toBe(heroData.dateOfBirth);
      expect(dbHero?.isActive).toBe(true);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidHeroData = {
        nickname: 'Incomplete',
        dateOfBirth: '2000-01-01T00:00:00.000Z',
        universe: 'TestVerse',
        mainPower: 'Testing'
      };

      const response = await request(app)
        .post('/api/heroes')
        .send(invalidHeroData)
        .expect(400); 

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message'); 
      expect(response.body).toHaveProperty('errors'); 
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(response.body.errors.some((err: any) => err.path.includes('name'))).toBe(true);
      expect(response.body.errors.some((err: any) => err.path.includes('avatarUrl'))).toBe(true);
    });

    it('should return 409 Conflict if nickname already exists', async () => {
      const conflictingHeroExists = await prisma.hero.findFirst({ 
        where: { nickname: existingHeroNickname } 
      });
      if (!conflictingHeroExists) {
        throw new Error('Test setup failed: conflicting hero does not exist before test!');
      }

      const newHeroData = { name: 'Jay Garrick', nickname: existingHeroNickname, dateOfBirth: '1940-01-25', universe: 'DC', mainPower: 'Speed Aura', avatarUrl: 'http://example.com/jay.jpg' };
      const response = await request(app).post('/api/heroes').send(newHeroData);
      
      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toEqual('Hero creation failed: nickname already exists.');
    });
  });

  describe('GET /api/heroes', () => {
    it('should return a list of active heroes (created in main beforeEach)', async () => {
      const response = await request(app).get('/api/heroes').expect(200);
      expect(response.body.heroes).toBeInstanceOf(Array);
      expect(response.body.heroes.length).toBe(2); 
      expect(response.body.heroes.some((h: HeroResponse) => h.id === existingHero.id)).toBe(true);
      expect(response.body.heroes.some((h: HeroResponse) => h.id === secondHero.id)).toBe(true);
      expect(response.body.heroes.every((h: HeroResponse) => h.is_active === true)).toBe(true); 
    });

    it('should return a specific page of heroes', async () => {
       await prisma.hero.create({data: {name: 'Third', nickname: 'pagi', dateOfBirth: new Date(), universe: 'U', mainPower: 'P', avatarUrl: 'a.jpg'}});
       const response = await request(app).get('/api/heroes?page=2&limit=2').expect(200);
       expect(response.body.heroes).toBeInstanceOf(Array); 
       expect(response.body.heroes.length).toBe(1); 
       expect(response.body.page).toBe(2);
       expect(response.body.totalPages).toBe(2);
       expect(response.body.total).toBe(3);
     });

     it('should return heroes matching the search term (nickname - existingHero)', async () => {
       const response = await request(app).get(`/api/heroes?search=${existingHeroNickname}`).expect(200);
       expect(response.body.heroes).toBeInstanceOf(Array); 
       expect(response.body.heroes.length).toBe(1);
       expect(response.body.heroes[0].id).toBe(existingHero.id);
       expect(response.body.total).toBe(1);
     });
     
     it('should return empty list if search term does not match', async () => {
        const response = await request(app).get('/api/heroes?search=NonExistentTerm').expect(200);
        expect(response.body).toHaveProperty('heroes');
        expect(response.body).toHaveProperty('total', 0);
        expect(response.body.heroes.length).toBe(0);
     });

     it('should return 400 if pagination parameters are invalid', async () => {
        const response = await request(app).get('/api/heroes?page=abc&limit=-5').expect(400);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('message', 'Validation Failed');
        expect(response.body).toHaveProperty('errors');
        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body.errors.some((e: any) => e.path === 'query.page')).toBe(true);
        expect(response.body.errors.some((e: any) => e.path === 'query.limit')).toBe(true);
     });
  });

  describe('GET /api/heroes/:id', () => {
    it('should return existingHero directly in body if ID exists and hero is active', async () => {
      if (!existingHero) throw new Error('Test setup failed: existingHero is undefined');
      const response = await request(app).get(`/api/heroes/${existingHero.id}`).expect(200);
      expect(response.body.id).toBe(existingHero.id);
      expect(response.body.nickname).toBe(existingHero.nickname);
      expect(response.body.is_active).toBe(true);
    });

    it('should return 404 if hero ID exists but hero is inactive', async () => {
      if (!secondHero) throw new Error('Test setup failed: secondHero is undefined');
      try {
        await prisma.hero.update({ where: { id: secondHero.id }, data: { isActive: false } });
      } catch (error) {
        throw error;
      }
      await request(app).get(`/api/heroes/${secondHero.id}`).expect(404);
    });

    it('should return 400 if hero ID is not a valid UUID', async () => {
        const invalidId = 'not-a-uuid';
        const response = await request(app).get(`/api/heroes/${invalidId}`).expect(400);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('message', 'Validation Failed');
        expect(response.body).toHaveProperty('errors');
        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body.errors.some((e: any) => e.path === 'params.id')).toBe(true);
        expect(response.body.errors[0].message).toContain('UUID');
    });
  });

  describe('PUT /api/heroes/:id', () => {
    it('should update existingHero and return the updated hero directly in body', async () => {
      if (!existingHero) throw new Error('Test setup failed: existingHero is undefined');
      const updateData = { nickname: 'Updated Flash', mainPower: 'Enhanced Speed' };
      const response = await request(app).put(`/api/heroes/${existingHero.id}`).send(updateData).expect(200);
      expect(response.body.nickname).toBe(updateData.nickname);
      expect(response.body.main_power).toBe(updateData.mainPower); 
      expect(response.body.id).toBe(existingHero.id);
      const dbHero = await prisma.hero.findUnique({ where: { id: existingHero.id } });
      expect(dbHero?.nickname).toBe(updateData.nickname);
      expect(dbHero?.mainPower).toBe(updateData.mainPower);
    });

    it('should return 404 if hero ID to update does not exist', async () => {
      const nonExistentId = 'b1eebc11-1c0b-4ef8-bb6d-6bb9bd380a11';
      const updateData = { name: 'Non Existent' };
      const response = await request(app).put(`/api/heroes/${nonExistentId}`).send(updateData);
      expect(response.status).toBe(404);
      expect(response.body.message).toEqual('Hero not found');
    });

    it('should return 400 if hero ID is not a valid UUID', async () => {
       const invalidId = 'invalid-update-id';
       const updateData = { nickname: 'Irrelevant' };
       const response = await request(app).put(`/api/heroes/${invalidId}`).send(updateData).expect(400);
       expect(response.body.status).toBe('error');
       expect(response.body.message).toBe('Validation Failed');
       expect(response.body.errors.some((e: any) => e.path === 'params.id')).toBe(true);
    });

    it('should return 400 if update data is invalid', async () => {
       const invalidUpdateData = { name: 'A', nickname: 123 };
       const response = await request(app).put(`/api/heroes/${existingHero.id}`).send(invalidUpdateData).expect(400);
       expect(response.body.status).toBe('error');
       expect(response.body.message).toBe('Validation Failed');
       expect(response.body.errors.some((e: any) => e.path === 'body.name')).toBe(true);
       expect(response.body.errors.some((e: any) => e.path === 'body.nickname')).toBe(true);
    });

    it('should return 409 Conflict if updating to an existing nickname', async () => {
      if (!existingHero || !secondHero) throw new Error('Test setup failed: heroes are undefined');
      const updateData = { nickname: existingHeroNickname }; 
      const response = await request(app).put(`/api/heroes/${secondHero.id}`).send(updateData);

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toEqual('Hero update failed: nickname already exists.');
    });
  });

  describe('DELETE /api/heroes/:id', () => {
    it('should deactivate secondHero and return the deactivated hero', async () => {
      if (!secondHero) throw new Error('Test setup failed: secondHero is undefined');
      const response = await request(app).delete(`/api/heroes/${secondHero.id}`).expect(200);
      expect(response.body.id).toBe(secondHero.id);
      expect(response.body.is_active).toBe(false);
      const dbHero = await prisma.hero.findUnique({ where: { id: secondHero.id } });
      expect(dbHero?.isActive).toBe(false);
    });

    it('should return 404 if hero ID to delete does not exist', async () => {
       const nonExistentId = 'b1eebc11-1c0b-4ef8-bb6d-6bb9bd380a22';
       const response = await request(app).delete(`/api/heroes/${nonExistentId}`);
       expect(response.status).toBe(404);
       expect(response.body.message).toBe(`Hero with ID ${nonExistentId} not found`);
     });
     
    it('should return 400 if hero ID is not a valid UUID', async () => {
       const invalidId = 'invalid-delete-id';
       const response = await request(app).delete(`/api/heroes/${invalidId}`).expect(400);
       expect(response.body.status).toBe('error');
       expect(response.body.message).toBe('Validation Failed');
       expect(response.body.errors.some((e: any) => e.path === 'params.id')).toBe(true);
    });
  });

  describe('PATCH /api/heroes/:id/activate', () => {
    beforeEach(async () => {
      if (!secondHero) throw new Error('Test setup failed: secondHero is undefined in PATCH beforeEach');
      await prisma.hero.update({ where: { id: secondHero.id }, data: { isActive: false } });
    });

    it('should activate secondHero (inactive) and return the updated hero directly in body', async () => {
      if (!secondHero) throw new Error('Test setup failed: secondHero is undefined');
      const response = await request(app).patch(`/api/heroes/${secondHero.id}/activate`).expect(200);
      expect(response.body.id).toBe(secondHero.id);
      expect(response.body.is_active).toBe(true);
    });
  
    it('should return 400 if trying to activate existingHero (already active)', async () => {
      if (!existingHero) throw new Error('Test setup failed: existingHero is undefined');
      const response = await request(app).patch(`/api/heroes/${existingHero.id}/activate`);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Hero is already active');
    });

    it('should return 404 if hero ID to activate does not exist', async () => {
       const nonExistentId = 'b1eebc11-1c0b-4ef8-bb6d-6bb9bd380a33';
       const response = await request(app).patch(`/api/heroes/${nonExistentId}/activate`);
       expect(response.status).toBe(404);
       expect(response.body.message).toEqual('Hero not found'); 
     });
  });
}); 