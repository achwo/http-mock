const { createApp } = require("./src/app.js");

const baseConfig = {
  status: 200,
};

const config = {
  port: 3000,
  logLevel: "debug",
};

const app = createApp({
  config,
  baseConfig,
});

app.listen(config.port, () => {
  console.log(`Listening on ${config.port}`);
});
