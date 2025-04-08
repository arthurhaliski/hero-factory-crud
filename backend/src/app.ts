import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import heroRoutes from './routes/hero.routes';
import { errorHandler } from './middlewares/errorHandler';
import logger from './config/logger';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

const app = express();

// Middlewares
app.use(helmet());
app.use(pinoHttp({ logger }));
app.use(cors());
app.use(express.json());

// Configuração do Rate Limiter
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Aplicar o middleware de rate limiting apenas nas rotas da API
app.use('/api', apiLimiter);

// Rotas
app.use('/api', heroRoutes);

// Rota de healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rota da Documentação Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use(errorHandler);

export { app }; 