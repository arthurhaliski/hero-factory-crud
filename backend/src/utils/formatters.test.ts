import { formatHeroApiResponse } from './formatters';
import { Hero } from '../types/hero';

describe('formatHeroApiResponse', () => {
  it('should format a Hero object into the correct API response structure', () => {
    const now = new Date();
    const dob = new Date('1980-10-20T00:00:00.000Z');

    const hero: Hero = {
      id: 'test-uuid',
      name: 'Test Name',
      nickname: 'Test Nick',
      dateOfBirth: dob,
      universe: 'Test Universe',
      mainPower: 'Test Power',
      avatarUrl: 'http://test.com/img.png',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const expectedResponse = {
      id: 'test-uuid',
      name: 'Test Name',
      nickname: 'Test Nick',
      date_of_birth: dob.toISOString(),
      universe: 'Test Universe',
      main_power: 'Test Power',
      avatar_url: 'http://test.com/img.png',
      is_active: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const formatted = formatHeroApiResponse(hero);

    expect(formatted).toEqual(expectedResponse);
  });
}); 