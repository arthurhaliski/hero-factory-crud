import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

const loggerConfig: pino.LoggerOptions = {
  level: isDevelopment ? 'debug' : 'info',
};

if (isDevelopment) {
  loggerConfig.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  };
}

const logger = pino(loggerConfig);

export default logger; 