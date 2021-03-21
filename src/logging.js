const winston = require("winston");
const expressWinston = require("express-winston");

const createLogger = (level) =>
  winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.errors({ stack: true })
    ),
    defaultMeta: { service: "your-service-name" },
    transports: [new winston.transports.Console({ level })],
  });

const requestLogger = (level) =>
  expressWinston.logger({
    transports: [new winston.transports.Console({ level })],
    format: winston.format.combine(winston.format.json()),
    meta: true,
    expressFormat: true,
  });

const errorLogger = (level) =>
  expressWinston.errorLogger({
    transports: [new winston.transports.Console({ level })],
    format: winston.format.combine(winston.format.colorize()),
  });

module.exports = { createLogger, requestLogger, errorLogger };
