import { z } from 'zod';

export const heroParamsSchema = z.object({
  id: z.string().uuid({ message: 'URL parameter \'id\' must be a valid UUID.' }),
});

export const listHeroesQuerySchema = z.object({
  page: z.coerce
    .number({ invalid_type_error: 'Query parameter \'page\' must be a number.' })
    .int({ message: 'Query parameter \'page\' must be an integer.' })
    .positive({ message: 'Query parameter \'page\' must be a positive number.' })
    .optional()
    .default(1),
  limit: z.coerce
    .number({ invalid_type_error: 'Query parameter \'limit\' must be a number.' })
    .int({ message: 'Query parameter \'limit\' must be an integer.' })
    .positive({ message: 'Query parameter \'limit\' must be a positive number.' })
    .max(100, { message: 'Query parameter \'limit\' cannot exceed 100.' })
    .optional()
    .default(10),
  search: z.string().optional(),
});

const heroBaseSchema = z.object({
  name: z.string().min(3, { message: 'Field \'name\' must be at least 3 characters long.' }),
  nickname: z.string().min(3, { message: 'Field \'nickname\' must be at least 3 characters long.' }),
  dateOfBirth: z.coerce.date({
    errorMap: (issue, ctx) => ({
      message: issue.code === 'invalid_date' 
        ? 'Field \'dateOfBirth\' must be a valid date (e.g., YYYY-MM-DD or ISO 8601 format).' 
        : ctx.defaultError,
    }),
  }),
  universe: z.string().min(1, { message: 'Field \'universe\' cannot be empty.' }),
  mainPower: z.string().min(1, { message: 'Field \'mainPower\' cannot be empty.' }),
  avatarUrl: z.string()
    .url({ message: 'Field \'avatarUrl\' must be a valid URL.' })
    .or(z.literal('')),
});

export const createHeroSchema = z.object({
  body: heroBaseSchema
});

export const updateHeroSchema = z.object({
  params: heroParamsSchema,
  body: heroBaseSchema.partial(),
});

export const getHeroSchema = z.object({
  params: heroParamsSchema,
});

export const listHeroesSchema = z.object({
  query: listHeroesQuerySchema,
}); 