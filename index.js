const { createApp } = require("./src/app.js");
const winston = require("winston");
const expressWinston = require("express-winston");

const baseConfig = {
  port: 3000,
  logLevel: "debug",
  status: 200,
};

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

const app = createApp({
  baseConfig,
  loggers: { request: requestLogger(baseConfig.logLevel), error: errorLogger(baseConfig.logLevel) },
});

app.listen(baseConfig.port, () => {
  console.log(`Listening on ${baseConfig.port}`);
});
