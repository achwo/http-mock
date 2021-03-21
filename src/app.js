const express = require("express");
const { createLogger, requestLogger, errorLogger } = require("./logging.js");

/**
 * @param {Object} arg
 * @param {Object} arg.config The general config
 * @param {number} arg.config.port The port on which the app runs
 * @param {number} arg.config.logLevel The port on which the app runs
 * @param {Object} arg.baseMapping The mapping used if nothing else is configured
 * @param {Object} arg.overrides Overrides done by using the /config-Endpoint
 */
exports.createApp = ({ config, baseMapping }) => {
  const app = express();
  const overrides = {};

  app.use(requestLogger(config.logLevel));
  app.use(express.json());

  app.post("/config", (req, res) => {
    const status = req.body.status;
    overrides.status = status;
    res.status(200).json();
  });

  app.get("/config", (req, res) => {
    res.json({ baseMapping, overrides });
  });

  app.all("*", (req, res) => {
    const status = overrides.status || baseMapping.status;
    res.status(status).json();
  });

  app.use(errorLogger(config.logLevel));

  return app;
};
