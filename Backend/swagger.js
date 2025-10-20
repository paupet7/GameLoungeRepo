const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GameLounge API',
      version: '1.0.0',
      description: 'REST API for GameLounge - hierarchical game discussion platform',
      contact: {
        name: 'GameLounge Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['guest', 'client', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Game: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            imageUrl: { type: 'string' },
            genre: { type: 'string' },
            createdBy: { type: 'string', format: 'uuid' },
            createdByUsername: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Theme: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            gameId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            createdBy: { type: 'string', format: 'uuid' },
            createdByUsername: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            themeId: { type: 'string', format: 'uuid' },
            gameId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
            content: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Games', description: 'Game management endpoints' },
      { name: 'Themes', description: 'Theme management endpoints' },
      { name: 'Comments', description: 'Comment management endpoints' }
    ]
  },
  apis: ['./index.js'] // Path to API docs
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = swaggerSpec;