const express = require("express");
const { requestLogger, errorLogger } = require("./logging.js");
const { sortRoutesBySpecificity, matchRoute } = require("./matcher.js");

/**
 * @param {Object} arg
 * @param {Object} arg.config The general config
 * @param {number} arg.config.port The port on which the app runs
 * @param {number} arg.config.logLevel The port on which the app runs
 * @param {Object} arg.baseMapping The mapping used if nothing else is configured
 */
exports.createApp = ({ config, mapping }) => {
  const app = express();
  let routeMatches = convertRouteMatches(mapping);
  const globalMatch = { type: "globalMatch" };

  app.use(requestLogger(config.logLevel));
  app.use(express.json());

  app.post("/config/routes", (req, res) => {
    const newRoutes = convertRouteMatches(req.body);
    routeMatches = routeMatches.concat(newRoutes);
    res.status(200).json();
  });

  app.post("/config", (req, res) => {
    globalMatch.status = req.body.status;
    globalMatch.headers = req.body.headers;
    globalMatch.body = req.body.body;
    res.status(200).json();
  });

  app.get("/config", (_req, res) => {
    const allMatchers = sortRoutesBySpecificity([...routeMatches, globalMatch]);
    res.json(allMatchers);
  });

  app.all("*", (req, res) => {
    const allMatchers = sortRoutesBySpecificity([...routeMatches, globalMatch, { status: 200 }]);

    const { headers, status, body } = matchRoute(allMatchers)({
      method: req.method,
      path: req.path,
      query: req.query,
    });
    res.set(headers).status(status).json(body);
  });

  app.use(errorLogger(config.logLevel));

  return app;
};

const convertRouteMatches = (matches) => {
  if (!matches) {
    return [];
  }
  return matches.map((r) => {
    return Object.assign(r, {
      createdAt: new Date(Date.now()),
      type: "routeMatch",
    });
  });
};
