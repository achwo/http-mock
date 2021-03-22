const { request } = require("./test-utils.js");
const async = require("async");
const { createApp } = require("./app.js");
const logging = require("./logging.js");

jest.mock("./logging.js");
logging.requestLogger.mockImplementation(() => (_req, _res, next) => next());
logging.errorLogger.mockImplementation(() => (_req, _res, next) => next());

describe("app", () => {
  let app;
  let arg;

  beforeEach(() => {
    arg = {
      config: {},
      baseMapping: {
        status: 200,
        body: {},
        headers: {},
      },
    };
    app = createApp(arg);
  });

  ["GET", "POST", "PUT", "PATCH", "DELETE"].forEach((method) => {
    ["/", "/bla", "/some-other-path", "/some/deeper/path"].forEach((path) => {
      test(`returns 200 on ${method} ${path} by default`, (done) => {
        request(app, method, path).expect(200, done);
      });

      test(`returns configured value for ${method} ${path}`, (done) => {
        arg.baseMapping.status = 404;
        const appReturning404 = createApp(arg);
        request(appReturning404, method, path).expect(404, done);
      });

      test(`returns status value set by api for ${method} ${path}`, (done) => {
        async.series(
          [
            (cb) => request(app).post("/config").send({ status: 500 }).end(cb),
            (cb) => request(app).get(path).expect(500, cb),
          ],
          done
        );
      });

      test(`returns default response body for ${method} ${path}`, (done) => {
        request(app, method, path).expect(200, {}, done);
      });

      test(`returns body set by api for ${method} ${path}`, (done) => {
        async.series(
          [
            (cb) =>
              request(app)
                .post("/config")
                .send({ body: { status: "OK" } })
                .end(cb),
            (cb) => request(app).get(path).expect(200, { status: "OK" }, cb),
          ],
          done
        );
      });

      test(`returns headers set by api for ${method} ${path}`, (done) => {
        async.series(
          [
            (cb) =>
              request(app)
                .post("/config")
                .send({ headers: { Location: "/other-path" }, status: 301 })
                .end(cb),
            (cb) => request(app).get(path).expect(301).expect("Location", "/other-path", cb),
          ],
          done
        );
      });
    });
  });

  test("GET /config returns complete configuration", (done) => {
    async.series(
      [
        (cb) => request(app).post("/config").send({ status: 404 }).end(cb),
        (cb) =>
          request(app)
            .get("/config")
            .then((res) => expect(res.body).toMatchSnapshot())
            .then(cb),
      ],
      done
    );
  });

  test(`POST /config/routes allows to override exact route matches`, (done) => {
    async.series(
      [
        (cb) =>
          request(app)
            .post("/config/routes")
            .send({
              routes: [
                {
                  path: "/test",
                  status: 201,
                  body: { status: "created" },
                  headers: { "Content-Type": "application/json" },
                },
              ],
            })
            .end(cb),
        (cb) =>
          request(app)
            .get("/test")
            .expect(201, { status: "created" })
            .expect("Content-Type", /json/, cb),
        (cb) =>
          request(app)
            .post("/test")
            .expect(201, { status: "created" })
            .expect("Content-Type", /json/, cb),
        (cb) => request(app).get("/bla").expect(200, {}, cb),
      ],
      done
    );
  });

  test(`POST /config/routes allows to override only a specific method of a route`, (done) => {
    async.series(
      [
        (cb) =>
          request(app)
            .post("/config/routes")
            .send({
              routes: [
                {
                  path: "/test",
                  method: "GET",
                  status: 201,
                  body: { status: "created" },
                },
              ],
            })
            .end(cb),
        (cb) => request(app).get("/test").expect(201, { status: "created" }, cb),
        (cb) => request(app).post("/test").expect(200, {}, cb),
      ],
      done
    );
  });

  test(`POST /config/routes allows to set multiple routes at once`, (done) => {
    async.series(
      [
        (cb) =>
          request(app)
            .post("/config/routes")
            .send({
              routes: [
                {
                  path: "/test",
                  method: "GET",
                  status: 201,
                  body: { status: "created" },
                },
                {
                  path: "/other-path",
                  method: "GET",
                  status: 404,
                },
              ],
            })
            .end(cb),
        (cb) => request(app).get("/test").expect(201, { status: "created" }, cb),
        (cb) => request(app).get("/other-path").expect(404, "", cb),
        (cb) => request(app).post("/test").expect(200, {}, cb),
      ],
      done
    );
  });
});
