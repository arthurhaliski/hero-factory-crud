import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

// Configuração base do logger
const loggerConfig: pino.LoggerOptions = {
  level: isDevelopment ? 'debug' : 'info', // Log mais verboso em dev
};

// Adiciona pino-pretty apenas em desenvolvimento para logs legíveis
if (isDevelopment) {
  loggerConfig.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', // Formato de hora mais legível
      ignore: 'pid,hostname', // Ignora campos menos úteis no dev
    },
  };
}

const logger = pino(loggerConfig);

export default logger; 