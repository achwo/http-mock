const { createApp } = require("./src/app.js");

const baseMapping = {
  status: 200,
  body: {},
  headers: {},
};

const config = {
  port: 3000,
  logLevel: "debug",
};

const app = createApp({
  config,
  baseMapping,
});

app.listen(config.port, () => {
  console.log(`Listening on ${config.port}`);
});
