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
  const overrides = {
    routes: [],
  };

  app.use(requestLogger(config.logLevel));
  app.use(express.json());

  app.post("/config/routes", (req, res) => {
    overrides.routes = overrides.routes.concat(req.body.routes);
    res.status(200).json();
  });

  app.post("/config", (req, res) => {
    overrides.status = req.body.status;
    overrides.headers = req.body.headers;
    overrides.body = req.body.body;
    res.status(200).json();
  });

  app.get("/config", (_req, res) => {
    res.json({ baseMapping, overrides });
  });

  app.all("*", (req, res) => {
    const route = findMatchingRoute(req.path, req.method, overrides.routes);
    let status;
    let body;
    let headers;

    if (!route) {
      status = overrides.status || baseMapping.status;
      body = overrides.body || baseMapping.body;
      headers = overrides.headers || baseMapping.headers;
    } else {
      status = route.status;
      body = route.body;
      headers = route.headers;
    }
    res.set(headers).status(status).json(body);
  });

  app.use(errorLogger(config.logLevel));

  return app;
};

const findMatchingRoute = (path, method, routes) => {
  const equalRoutes = routes.filter((r) => {
    if (r.method) {
      return r.path === path && r.method === method;
    }
    return r.path === path;
  });
  if (equalRoutes.length < 1) {
    return null;
  }
  return equalRoutes[equalRoutes.length - 1];
};
