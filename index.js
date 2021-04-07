const { createApp } = require("./src/app.js");
const mapping = require("./config/mapping.json");
const configFromFile = require("./config/config.json");

const config = {
  port: process.env.PORT || configFromFile.port || 3000,
  logLevel: process.env.LOG_LEVEL || configFromFile.logLevel || "debug",
};

const app = createApp({ config, mapping });

const server = app.listen(config.port, () => {
  console.log(`Listening on ${config.port}`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("HTTP server closed.");
  });
});
