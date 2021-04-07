const {
  matchRoute,
  matchesRequest,
  sortRoutesBySpecificity,
  compareFunction,
} = require("./matcher.js");

describe("matchRoute", () => {
  test("returns null when no matching route", () => {
    const response = matchRoute([])({ path: "/path", method: "GET" });
    expect(response).toEqual(null);
  });

  test("returns fully configured route of specific path", () => {
    const expectedReturn = {
      status: 200,
      body: { match: "ok" },
      headers: { "Content-Type": "application/json" },
    };
    const match = {
      ...expectedReturn,
      path: "/path",
    };
    const response = matchRoute([match])({ path: "/path", method: "GET" });
    expect(response).toEqual(expectedReturn);
  });

  test("falls back to less specific route if status is missing", () => {
    const specificMatch = {
      path: "/path",
      body: { match: "ok" },
      headers: { "Content-Type": "application/json" },
    };
    const fallback = {
      status: 200,
      body: {},
      headers: {},
    };
    const expectedReturn = {
      status: 200,
      body: { match: "ok" },
      headers: { "Content-Type": "application/json" },
    };
    const response = matchRoute([specificMatch, fallback])({ path: "/path", method: "GET" });
    expect(response).toEqual(expectedReturn);
  });

  test("skips unrelated routes", () => {
    const specificMatch = {
      path: "/path",
      body: { match: "ok" },
      headers: { "Content-Type": "application/json" },
    };
    const unrelated = {
      path: "/unrelated",
      status: 200,
      body: {},
      headers: {},
    };
    const fallback = {
      status: 404,
      body: {},
      headers: {},
    };
    const expectedReturn = {
      status: 404,
      body: { match: "ok" },
      headers: { "Content-Type": "application/json" },
    };
    const response = matchRoute([specificMatch, unrelated, fallback])({
      path: "/path",
      method: "GET",
    });
    expect(response).toEqual(expectedReturn);
  });

  test("more specific null body is not overridden by fallbacks", () => {
    const specificMatch = {
      path: "/path",
      body: null,
      headers: { "Content-Type": "application/json" },
    };
    const fallback = {
      status: 200,
      body: { match: "ok" },
      headers: {},
    };
    const expectedReturn = {
      status: 200,
      body: null,
      headers: { "Content-Type": "application/json" },
    };
    const response = matchRoute([specificMatch, fallback])({ path: "/path", method: "GET" });
    expect(response).toEqual(expectedReturn);
  });

  test("more specific null headers is not overridden by fallbacks", () => {
    const specificMatch = {
      path: "/path",
      body: { match: "ok" },
      headers: null,
    };
    const fallback = {
      status: 200,
      body: null,
      headers: { "Content-Type": "application/json" },
    };
    const expectedReturn = {
      status: 200,
      body: { match: "ok" },
      headers: null,
    };
    const response = matchRoute([specificMatch, fallback])({ path: "/path", method: "GET" });
    expect(response).toEqual(expectedReturn);
  });

  test("more specific null status is overridden by fallbacks (as invalid)", () => {
    const specificMatch = {
      path: "/path",
      status: null,
      body: { match: "ok" },
      headers: { "Content-Type": "application/json" },
    };
    const fallback = {
      status: 200,
      body: {},
      headers: {},
    };
    const expectedReturn = {
      status: 200,
      body: { match: "ok" },
      headers: { "Content-Type": "application/json" },
    };
    const response = matchRoute([specificMatch, fallback])({ path: "/path", method: "GET" });
    expect(response).toEqual(expectedReturn);
  });
});

describe("sortRoutesBySpecificity", () => {
  test("with no routes returns []", () => {
    expect(sortRoutesBySpecificity([])).toEqual([]);
  });

  test("with one route returns input", () => {
    expect(sortRoutesBySpecificity([{ path: "/" }])).toEqual([{ path: "/" }]);
  });

  test("sorts correctly", () => {
    const unsorted = [
      { path: "/some/different/path" },
      { path: "/path/v1", method: "POST" },
      { method: "GET" },
      { path: "/path" },
      { path: "/path/v1/concrete", createdAt: new Date("2021-03-27T12:00:00.000Z") },
      { path: "/path/:param/:param" },
      { path: "/path/v1/:param" },
      { path: "/path/v1", method: "GET" },
      { path: "/path/v1/concrete", createdAt: new Date("2021-03-28T12:00:00.000Z") },
      { path: "/path/v1" },
      { path: "/some/:param/path" },
      { path: "/some/path/without/param" },
      { path: "/:param/different/path" },
      { path: "/path/v1/concrete", method: "GET" },
      { path: "/some/:param/:param" },
      { path: "/some/different/path", method: "GET" },
      { path: "/some/path/without/param", query: { param: "true" } },
      { path: "/some/:param" },
      { path: "/some/:param", query: { with: "url", param: "true" } },
      { path: "/some/path", query: { with: "url", param: "true" } },
      { path: "/some/path", method: "POST", query: { with: "url", param: "true" } },
      {},
    ];

    const sorted = [
      { path: "/some/path/without/param", query: { param: "true" } },
      { path: "/some/path/without/param" },
      { path: "/path/v1/concrete", method: "GET" },
      { path: "/some/different/path", method: "GET" },
      { path: "/some/different/path" },
      { path: "/path/v1/concrete", createdAt: new Date("2021-03-28T12:00:00.000Z") },
      { path: "/path/v1/concrete", createdAt: new Date("2021-03-27T12:00:00.000Z") },
      { path: "/path/v1/:param" },
      { path: "/some/:param/path" },
      { path: "/:param/different/path" },
      { path: "/path/:param/:param" },
      { path: "/some/:param/:param" },
      { path: "/some/path", method: "POST", query: { with: "url", param: "true" } },
      { path: "/path/v1", method: "POST" },
      { path: "/path/v1", method: "GET" },
      { path: "/some/path", query: { with: "url", param: "true" } },
      { path: "/path/v1" },
      { path: "/some/:param", query: { with: "url", param: "true" } },
      { path: "/some/:param" },
      { path: "/path" },
      { method: "GET" },
      {},
    ];

    expect(sortRoutesBySpecificity(unsorted)).toEqual(sorted);
  });
});

describe("compareFunction", () => {
  describe("sorting rules", () => {
    describe("later timestamps come before earlier timestamps", () => {
      test("returns -1 when a before b", () => {
        const a = { createdAt: new Date(Date.now() + 1) };
        const b = { createdAt: new Date(Date.now()) };
        expect(compareFunction(a, b)).toBe(-1);
      });

      test("returns 1 when b before a", () => {
        const a = { createdAt: new Date(Date.now() + 1) };
        const b = { createdAt: new Date(Date.now()) };
        expect(compareFunction(b, a)).toBe(1);
      });

      test("returns 0 when equal", () => {
        const a = { createdAt: new Date(Date.now()) };
        expect(compareFunction(a, a)).toBe(0);
      });

      test("returns 0 when no timestamp", () => {
        expect(compareFunction({}, {})).toBe(0);
      });
    });

    describe("with method before without method", () => {
      test("returns -1 when a before b", () => {
        const a = { method: "GET" };
        const b = {};
        expect(compareFunction(a, b)).toBe(-1);
      });

      test("returns 1 when b before a", () => {
        const a = { method: "GET" };
        const b = {};
        expect(compareFunction(b, a)).toBe(1);
      });

      test("returns 0 when equal with method", () => {
        const a = { method: "GET" };
        expect(compareFunction(a, a)).toBe(0);
      });

      test("returns 0 when equal without method", () => {
        expect(compareFunction({}, {})).toBe(0);
      });
    });
    describe("later occurring variables before earlier ones", () => {
      test("returns -1 when a before b", () => {
        const a = { path: "/path/v1/bla/:param/:param" };
        const b = { path: "/:param/v1/bla/:param/concrete-id" };
        expect(compareFunction(a, b)).toBe(-1);
      });
      test("returns 1 when b before a", () => {
        const a = { path: "/path/v1/bla/:param" };
        const b = { path: "/:param/v1/bla/concrete-id" };
        expect(compareFunction(b, a)).toBe(1);
      });
      test("returns 0 when equal", () => {
        const a = { path: "/path/v1/bla/:param" };
        expect(compareFunction(a, a)).toBe(0);
      });

      test("returns 0 when irrelevant", () => {
        const a = { path: "/path/v1/bla" };
        const b = { path: "/path/v1/bla" };
        expect(compareFunction(a, b)).toBe(0);
      });
    });

    describe("less variables before more variables", () => {
      test("returns -1 when a before b", () => {
        const a = { path: "/path/v1/:param" };
        const b = { path: "/path/:param/:param" };
        expect(compareFunction(a, b)).toBe(-1);
      });

      test("returns 1 when b before a", () => {
        const a = { path: "/path/v1/:param" };
        const b = { path: "/path/:param/:param" };
        expect(compareFunction(b, a)).toBe(1);
      });

      test("returns 0 when equal", () => {
        const a = { path: "/path/v1/:param" };
        expect(compareFunction(a, a)).toBe(0);
      });

      test("returns 0 when irrelevant", () => {
        const a = { path: "/path/v1" };
        expect(compareFunction(a, a)).toBe(0);
      });
    });

    describe("more segments before less segments", () => {
      test("returns -1 when a before b", () => {
        const a = { path: "/api/v1/very/specific" };
        const b = { path: "/api" };
        expect(compareFunction(a, b)).toBe(-1);
      });

      test("returns 1 when b before a", () => {
        const a = { path: "/api/v1/very/specific" };
        const b = { path: "/api" };
        expect(compareFunction(b, a)).toBe(1);
      });

      test("returns 0 when equal", () => {
        const a = { path: "/api/v1/very/specific" };
        expect(compareFunction(a, a)).toBe(0);
      });
    });

    describe("exact query matches before path without url parameter", () => {
      test("returns -1 when a before b", () => {
        const a = { path: "/api/v1", query: { with: "url", params: "true" } };
        const b = { path: "/api/v1" };
        expect(compareFunction(a, b)).toBe(-1);
      });

      test("returns 1 when b before a", () => {
        const a = { path: "/api/v1", query: { with: "url", params: "true" } };
        const b = { path: "/api/v1" };
        expect(compareFunction(b, a)).toBe(1);
      });

      test("returns 0 when equal", () => {
        const a = { path: "/api/v1", query: { with: "url", params: "true" } };
        expect(compareFunction(a, a)).toBe(0);
      });
    });

    describe("more exact query matches before less url parameter matches", () => {
      test("returns -1 when a before b", () => {
        const a = { path: "/api/v1", query: { with: "url", params: "true" } };
        const b = { path: "/api/v1", query: { with: "url" } };
        expect(compareFunction(a, b)).toBe(-1);
      });

      test("returns 1 when b before a", () => {
        const a = { path: "/api/v1", query: { with: "url", params: "true" } };
        const b = { path: "/api/v1", query: { with: "url" } };
        expect(compareFunction(b, a)).toBe(1);
      });

      test("returns 0 when equal", () => {
        const a = { path: "/api/v1", query: { with: "url", params: "true" } };
        expect(compareFunction(a, a)).toBe(0);
      });
    });
  });
});

describe("matchesRequest", () => {
  describe("with equal path", () => {
    test("returns false if method is different", () => {
      const result = matchesRequest(
        { method: "GET", path: "/api/v1/specific" },
        { method: "POST", path: "/api/v1/specific" }
      );
      expect(result).toBe(false);
    });

    test("returns true if method is the same", () => {
      const result = matchesRequest(
        { method: "GET", path: "/api/v1/specific" },
        { method: "GET", path: "/api/v1/specific" }
      );
      expect(result).toBe(true);
    });

    test("returns true if method is not specified", () => {
      const result = matchesRequest(
        { method: "GET", path: "/api/v1/specific" },
        { path: "/api/v1/specific" }
      );
      expect(result).toBe(true);
    });
  });

  describe("with matching method", () => {
    test("returns true if path not specified", () => {
      const result = matchesRequest({ method: "GET", path: "/api/v1/specific" }, {});
      expect(result).toBe(true);
    });

    test("returns false if path not related", () => {
      const result = matchesRequest(
        { method: "GET", path: "/api/v1/specific" },
        { path: "/different" }
      );
      expect(result).toBe(false);
    });

    test("returns true if path equal", () => {
      const result = matchesRequest(
        { method: "GET", path: "/api/v1/specific" },
        { path: "/api/v1/specific" }
      );
      expect(result).toBe(true);
    });

    test("returns false if number of segments not equal", () => {
      const result = matchesRequest({ path: "/api/v1/specific" }, { path: "/api/v1/specific/id" });
      expect(result).toBe(false);
    });

    test("returns true if matcher has one param and otherwise matching path", () => {
      const result = matchesRequest({ path: "/api/v1/specific" }, { path: "/api/v1/:param" });
      expect(result).toBe(true);
    });

    test("returns true if matcher has multiple params and otherwise matching path", () => {
      const result = matchesRequest(
        { path: "/api/v1/specific" },
        { path: "/:param1/:param2/:param3" }
      );
      expect(result).toBe(true);
    });
  });

  describe("with matching query", () => {
    test("returns true if request and matcher query params are equal", () => {
      const request = { query: { p1: "true", p2: "cow" } };
      const matcher = request;
      expect(matchesRequest(request, matcher)).toBe(true);
    });

    test("returns true if request has more params than matcher", () => {
      const request = { query: { p1: "true", p2: "cow" } };
      const matcher = { query: { p1: "true" } };
      expect(matchesRequest(request, matcher)).toBe(true);
    });

    test("returns false if request misses params", () => {
      const request = { query: { p1: "true" } };
      const matcher = { query: { p1: "true", p2: "cow" } };
      expect(matchesRequest(request, matcher)).toBe(false);
    });

    test("returns false if param value not matching", () => {
      const request = { query: { p1: "true", p2: "dog" } };
      const matcher = { query: { p1: "true", p2: "cow" } };
      expect(matchesRequest(request, matcher)).toBe(false);
    });

    test("returns true if matcher has no query", () => {
      const request = { query: { p1: "true", p2: "dog" } };
      const matcher = {};
      expect(matchesRequest(request, matcher)).toBe(true);
    });

    test("returns false if request has no query", () => {
      const request = {};
      const matcher = { query: { p1: "true", p2: "cow" } };
      expect(matchesRequest(request, matcher)).toBe(false);
    });

    test("returns true if neither has a query", () => {
      const request = {};
      const matcher = {};
      expect(matchesRequest(request, matcher)).toBe(true);
    });
  });
});
