import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection } from './config/db.js';

// Caminhos para __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega as variáveis de ambiente
import 'dotenv/config';

// Importa as rotas
import analysisRoutes from './routes/analysisRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';

// Configuração do Swagger
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Cria a aplicação Express
const app = express();

// Middlewares básicos
app.use(helmet()); // Segurança HTTP
app.use(cors()); // Habilita CORS
app.use(express.json()); // Parse de JSON
app.use(express.urlencoded({ extended: true })); // Parse de formulários

// Logging em desenvolvimento
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Testa a conexão com o banco de dados
if (process.env.NODE_ENV !== 'test') {
  testConnection().catch(console.error);
}

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Trash API',
      version: '1.0.0',
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
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor Local'
      }
    ]
  },
  apis: [path.join(__dirname, 'routes/*.js')]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Rotas da API
app.use('/api', analysisRoutes);
app.use('/api/device', deviceRoutes);

// Rota da documentação Swagger
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Smart Trash API - Documentação'
  })
);

// Rota de saúde
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: pool ? true : false,
      host: process.env.DB_HOST,
      name: process.env.DB_NAME
    }
  });
});

// Rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
