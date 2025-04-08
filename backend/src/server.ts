import 'reflect-metadata'; // Deve ser o primeiro import
import dotenv from 'dotenv';
import { app } from './app'; // Importa a instância configurada do app
import logger from './config/logger';

// Carrega as variáveis de ambiente PRIMEIRO
dotenv.config(); 

const PORT = process.env.PORT || 3001;

// Only start the server if this script is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`🚀 Servidor rodando na porta ${PORT}`);
    logger.info(`📄 Documentação disponível em http://localhost:${PORT}/docs`);
  });
} 