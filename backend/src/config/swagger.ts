import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Hero Factory API',
    version: '1.0.0',
    description: 'API for managing heroes in the Hero Factory application.',
  },
  servers: [
    {
      url: `/api`,
      description: 'Development server',
    },
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 