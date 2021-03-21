const request = require("supertest");
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
      },
    };
    app = createApp(arg);
  });

  ["/", "/bla", "/some-other-path", "/some/deeper/path"].forEach((path) => {
    test(`returns 200 on GET ${path} by default`, (done) => {
      request(app).get(path).expect(200, done);
    });

    test(`returns 200 on POST ${path} by default`, (done) => {
      request(app).post(path).expect(200, done);
    });

    test(`returns 200 on PATCH ${path} by default`, (done) => {
      request(app).patch(path).expect(200, done);
    });

    test(`default return value of ${path} can be configured`, (done) => {
      arg.baseMapping.status = 404;
      const appReturning404 = createApp(arg);
      request(appReturning404).get(path).expect(404, done);
    });

    test(`return value of ${path} can be set via api`, (done) => {
      async.series(
        [
          (cb) => request(app).post("/config").send({ status: 500 }).end(cb),
          (cb) => request(app).get(path).expect(500, cb),
        ],
        done
      );
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
});
