import prisma from '../config/prisma';
import { Hero, CreateHeroDTO, UpdateHeroDTO } from '../types/hero';
import { injectable, singleton } from 'tsyringe';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { Prisma } from '@prisma/client';

@singleton()
@injectable()
export class HeroRepository {
  async create(data: CreateHeroDTO): Promise<Hero> {
    const existing = await prisma.hero.findFirst({ where: { nickname: data.nickname } });
    if (existing) {
      throw new ConflictError(`Hero creation failed: nickname already exists.`);
    }

    try {
      return await prisma.hero.create({
        data: {
          ...data,
          dateOfBirth: new Date(data.dateOfBirth),
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        const field = (error.meta?.target as string[])?.join(', ') || 'unique constraint';
        throw new ConflictError(`Hero creation failed: ${field} already exists.`);
      }
      throw error;
    }
  }

  async findAll(page: number, limit: number, search?: string): Promise<{ heroes: Hero[]; total: number }> {
    const skip = (page - 1) * limit;
    const whereClause: Prisma.HeroWhereInput = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { nickname: { contains: search } },
      ];
    }

    const countWhereClause = { ...whereClause };

    const [heroes, total] = await prisma.$transaction([
      prisma.hero.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.hero.count({ where: countWhereClause }),
    ]);

    return { heroes, total };
  }

  async findById(id: string): Promise<Hero | null> {
    const hero = await prisma.hero.findUnique({
      where: { id },
    });
    return hero;
  }

  async update(id: string, data: UpdateHeroDTO): Promise<Hero> {
    if (data.nickname) {
      const existing = await prisma.hero.findFirst({
        where: { 
          nickname: data.nickname, 
          id: { not: id }
        } 
      });
      if (existing) {
        throw new ConflictError(`Hero update failed: nickname already exists.`);
      }
    }

    try {
      return await prisma.hero.update({
        where: { id },
        data: {
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError(`Hero with ID ${id} not found`);
        } else if (error.code === 'P2002') {
          const field = (error.meta?.target as string[])?.join(', ') || 'unique constraint';
          throw new ConflictError(`Hero update failed: ${field} already exists.`);
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<Hero> {
    try {
      return await prisma.hero.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError(`Hero with ID ${id} not found`);
      }
      throw error;
    }
  }

  async activate(id: string): Promise<Hero> {
    try {
      return await prisma.hero.update({
        where: { id },
        data: { isActive: true },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError(`Hero with ID ${id} not found`);
      }
      throw error;
    }
  }
} 