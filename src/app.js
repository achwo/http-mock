const express = require("express");

exports.createApp = ({ baseConfig, loggers }) => {
  const app = express();
  const overrides = {
    status: null,
  };

  app.use(loggers.request);
  app.use(express.json());

  app.post("/config", (req, res) => {
    const status = req.body.status;
    overrides.status = status;
    res.status(200).json();
  });

  // app.get("/config", (req, res) => {
  //   res.json({ baseConfig, overrides });
  // });

  app.get("*", (req, res) => {
    const status = overrides.status || baseConfig.status;
    res.status(status).json();
  });

  return app;
};
