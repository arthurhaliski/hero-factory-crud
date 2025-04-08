import { Router } from 'express';
import { container } from 'tsyringe';
import { HeroController } from '../controllers/hero.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createHeroSchema,
  updateHeroSchema,
  getHeroSchema,
  listHeroesSchema
} from '../validators/hero.validators';

/**
 * @openapi
 * components:
 *   schemas:
 *     HeroResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the Hero.
 *           example: a1b2c3d4-e5f6-7890-1234-567890abcdef
 *         name:
 *           type: string
 *           description: The real name of the hero.
 *           example: Clark Kent
 *         nickname:
 *           type: string
 *           description: The hero alias.
 *           example: Superman
 *         date_of_birth:
 *           type: string
 *           format: date-time
 *           description: The hero's date of birth in ISO 8601 format.
 *           example: 1938-04-18T00:00:00.000Z
 *         universe:
 *           type: string
 *           description: The universe the hero belongs to.
 *           example: DC
 *         main_power:
 *           type: string
 *           description: The hero's main power.
 *           example: Super strength
 *         avatar_url:
 *           type: string
 *           format: url
 *           description: URL of the hero's avatar image.
 *           example: http://example.com/superman.jpg
 *         is_active:
 *           type: boolean
 *           description: Indicates if the hero record is active.
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the hero was created.
 *           example: 2024-01-01T10:00:00.000Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the last update.
 *           example: 2024-01-01T11:00:00.000Z
 *     HeroListResponse:
 *       type: object
 *       properties:
 *         heroes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HeroResponse'
 *         total:
 *           type: integer
 *           description: Total number of heroes matching the query.
 *           example: 42
 *         page:
 *           type: integer
 *           description: The current page number.
 *           example: 1
 *         totalPages:
 *           type: integer
 *           description: The total number of pages.
 *           example: 5
 *     CreateHeroBody:
 *       type: object
 *       required:
 *         - name
 *         - nickname
 *         - dateOfBirth
 *         - universe
 *         - mainPower
 *         - avatarUrl
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           example: Bruce Wayne
 *         nickname:
 *           type: string
 *           minLength: 3
 *           example: Batman
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Use YYYY-MM-DD or ISO 8601 format.
 *           example: 1972-04-17
 *         universe:
 *           type: string
 *           example: DC
 *         mainPower:
 *           type: string
 *           example: Intellect, gadgets
 *         avatarUrl:
 *           type: string
 *           format: url
 *           example: http://example.com/batman.jpg
 *     UpdateHeroBody:
 *       type: object
 *       description: Fields to update for the hero. All fields are optional.
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           example: Bruce Wayne
 *         nickname:
 *           type: string
 *           minLength: 3
 *           example: Batman
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Use YYYY-MM-DD or ISO 8601 format.
 *           example: 1972-04-17
 *         universe:
 *           type: string
 *           example: DC
 *         mainPower:
 *           type: string
 *           example: Intellect, gadgets, martial arts
 *         avatarUrl:
 *           type: string
 *           format: url
 *           example: http://example.com/batman_updated.jpg
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Hero not found
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *                 example: body.name
 *               message:
 *                 type: string
 *                 example: Field 'name' must be at least 3 characters long.
 *   parameters:
 *      HeroIdParam:
 *        name: id
 *        in: path
 *        required: true
 *        description: ID of the Hero (UUID format).
 *        schema:
 *          type: string
 *          format: uuid
 *      ListHeroesQueryPage:
 *        name: page
 *        in: query
 *        description: Page number for pagination (default 1).
 *        schema:
 *          type: integer
 *          minimum: 1
 *          default: 1
 *      ListHeroesQueryLimit:
 *        name: limit
 *        in: query
 *        description: Number of items per page (default 10, max 100).
 *        schema:
 *          type: integer
 *          minimum: 1
 *          maximum: 100
 *          default: 10
 *      ListHeroesQuerySearch:
 *        name: search
 *        in: query
 *        description: Search term for name or nickname.
 *        schema:
 *          type: string
 */

const router = Router();
const heroController = container.resolve(HeroController);

/**
 * @openapi
 * /heroes:
 *   get:
 *     summary: List all heroes
 *     tags:
 *       - Heroes
 *     parameters:
 *       - $ref: '#/components/parameters/ListHeroesQueryPage'
 *       - $ref: '#/components/parameters/ListHeroesQueryLimit'
 *       - $ref: '#/components/parameters/ListHeroesQuerySearch'
 *     responses:
 *       200:
 *         description: A list of heroes with pagination info.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeroListResponse'
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.get(
  '/heroes', 
  validateRequest(listHeroesSchema), 
  heroController.findAll.bind(heroController)
);

/**
 * @openapi
 * /heroes/{id}:
 *   get:
 *     summary: Get a hero by ID
 *     tags:
 *       - Heroes
 *     parameters:
 *       - $ref: '#/components/parameters/HeroIdParam'
 *     responses:
 *       200:
 *         description: Details of the hero.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeroResponse'
 *       400:
 *         description: Invalid ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Hero not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.get(
  '/heroes/:id', 
  validateRequest(getHeroSchema),
  heroController.findById.bind(heroController)
);

/**
 * @openapi
 * /heroes:
 *   post:
 *     summary: Create a new hero
 *     tags:
 *       - Heroes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHeroBody'
 *     responses:
 *       201:
 *         description: Hero created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeroResponse'
 *       400:
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict (e.g., nickname already exists).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.post(
  '/heroes', 
  validateRequest(createHeroSchema),
  heroController.create.bind(heroController)
);

/**
 * @openapi
 * /heroes/{id}:
 *   put:
 *     summary: Update an existing hero
 *     tags:
 *       - Heroes
 *     parameters:
 *       - $ref: '#/components/parameters/HeroIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHeroBody'
 *     responses:
 *       200:
 *         description: Hero updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeroResponse'
 *       400:
 *         description: Invalid input data or trying to update an inactive hero.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Hero not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict (e.g., nickname already exists).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.put(
  '/heroes/:id', 
  validateRequest(updateHeroSchema),
  heroController.update.bind(heroController)
);

/**
 * @openapi
 * /heroes/{id}:
 *   delete:
 *     summary: Deactivate a hero (soft delete)
 *     tags:
 *       - Heroes
 *     parameters:
 *       - $ref: '#/components/parameters/HeroIdParam'
 *     responses:
 *       200:
 *         description: Hero deactivated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeroResponse' 
 *       400:
 *         description: Invalid ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Hero not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.delete(
  '/heroes/:id', 
  validateRequest(getHeroSchema),
  heroController.delete.bind(heroController)
);

/**
 * @openapi
 * /heroes/{id}/activate:
 *   patch:
 *     summary: Activate an inactive hero
 *     tags:
 *       - Heroes
 *     parameters:
 *       - $ref: '#/components/parameters/HeroIdParam'
 *     responses:
 *       200:
 *         description: Hero activated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeroResponse' 
 *       400:
 *         description: Invalid ID format or hero is already active.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Hero not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.patch(
  '/heroes/:id/activate', 
  validateRequest(getHeroSchema),
  heroController.activate.bind(heroController)
);

export default router; 