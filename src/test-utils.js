const http = require("http");
const supertest = require("supertest");

/**
 * Wraps supertest and provides a way to call arbitrary methods via parameter.
 */
const request = (app, method, url) => {
  if (!method || !url) {
    return supertest(app);
  }
  if (typeof app === "function") {
    app = http.createServer(app);
  }
  return new supertest.Test(app, method, url);
};

module.exports = { request };
