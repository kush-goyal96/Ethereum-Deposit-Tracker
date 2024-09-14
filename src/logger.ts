import winston from 'winston';
import path from 'path';
import LokiTransport from 'winston-loki';

// Create a logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!require('fs').existsSync(logsDir)) {
  require('fs').mkdirSync(logsDir);
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Info log file transport
    new winston.transports.File({
      filename: path.join(logsDir, 'info.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format((info) => info.level !== 'error' ? info : false)()
      )
    }),
    // Error log file transport
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    // Loki transport
    new LokiTransport({
      host: 'http://localhost:3100', // Replace with your Loki server URL
      labels: { app: 'your-app-name' }, // Customize labels as needed
      json: true,
    }),
  ]
});

export default logger;