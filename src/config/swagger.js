/**
 * Configuração do Swagger para documentação da API
 */
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Trash API',
      version,
      description: 'API para o sistema de lixeira inteligente',
      contact: {
        name: 'Suporte',
        email: 'suporte@smarttrash.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.smarttrash.com',
        description: 'Servidor de Produção'
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
        Analysis: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID da análise'
            },
            object_detected: {
              type: 'string',
              description: 'Objeto detectado na imagem'
            },
            confidence: {
              type: 'number',
              format: 'float',
              description: 'Nível de confiança da classificação (0 a 1)'
            },
            is_organic: {
              type: 'boolean',
              description: 'Se o objeto é orgânico'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora da análise'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Mensagem de erro'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // Caminho para os arquivos de rotas
};

const specs = swaggerJsdoc(options);

export default function setupSwagger(app) {
  // Rota da documentação Swagger
  app.use('/api-docs', 
    swaggerUi.serve, 
    swaggerUi.setup(specs, {
      explorer: true,
      customSiteTitle: 'Smart Trash API - Documentação',
      customCss: '.swagger-ui .topbar { display: none }',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true
      }
    })
  );

  // Rota para o JSON do Swagger
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Documentação da API disponível em /api-docs');
}
