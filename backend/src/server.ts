import 'reflect-metadata';
import dotenv from 'dotenv';
import { app } from './app';
import logger from './config/logger';

dotenv.config(); 

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`🚀 Servidor rodando na porta ${PORT}`);
    logger.info(`📄 Documentação disponível em http://localhost:${PORT}/docs`);
  });
} 