const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'GameLounge API',
    description: 'RESTful API for GameLounge gaming community platform',
    version: '1.0.0',
    contact: {
      name: 'Paulius Petruškevičius',
      email: 'your.email@example.com'
    }
  },
  host: 'https://game-lounge-repo.vercel.app/',
  basePath: '/api',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Games', description: 'Game management' },
    { name: 'Themes', description: 'Discussion themes' },
    { name: 'Comments', description: 'Comment operations' },
    { name: 'Users', description: 'User management' }
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"'
    }
  },
  definitions: {
    RegisterDto: {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'securePassword123'
    },
    LoginDto: {
      email: 'john@example.com',
      password: 'securePassword123'
    },
    Game: {
      id: 'uuid',
      title: 'Call of Duty',
      description: 'First-person shooter',
      genre: 'FPS',
      imageUrl: 'https://example.com/image.jpg',
      createdBy: 'uuid',
      createdByUsername: 'admin',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z'
    },
    Theme: {
      id: 'uuid',
      gameId: 'uuid',
      title: 'Best Weapons',
      description: 'Discuss the best weapons',
      createdBy: 'uuid',
      createdByUsername: 'admin',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z'
    },
    Comment: {
      id: 'uuid',
      themeId: 'uuid',
      gameId: 'uuid',
      userId: 'uuid',
      username: 'john_doe',
      content: 'Great game!',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z'
    }
  }
};

const outputFile = './api-spec.json';
const endpointsFiles = ['./index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('✅ API specification generated successfully!');
});