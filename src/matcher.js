/**
 * @param matchers is a list of matchers sorted by specificity descending
 * @param request is a request consisting of method and path.
 */
const matchRoute = (matchers) => (request) => {
  const matching = matchers.filter((m) => matchesRequest(request, m));
  if (matching.length <= 0) {
    return null;
  }

  const status = matching.map((m) => m.status).reduce(matchNotAcceptingNull);
  const body = matching.map((m) => m.body).reduce(matchAcceptingNull);
  const headers = matching.map((m) => m.headers).reduce(matchAcceptingNull);
  return { status, body, headers };
};
const matchAcceptingNull = (accu, match) => (typeof accu === "undefined" ? match : accu);
const matchNotAcceptingNull = (accu, match) => (accu ? accu : match);

const matchesRequest = (request, matcher) => {
  if (matcher.method && request.method !== matcher.method) {
    return false;
  }
  if (matcher.path) {
    const requestSplits = request.path.split("/");
    const matcherSplits = matcher.path.split("/");

    if (requestSplits.length !== matcherSplits.length) {
      return false;
    }

    for (let i = 0; i < requestSplits.length; i++) {
      if (!matcherSplits[i].startsWith(":") && requestSplits[i] !== matcherSplits[i]) {
        return false;
      }
    }
  }
  if (matcher.query && !request.query) {
    return false;
  }
  if (matcher.query && request.query) {
    for (const key in matcher.query) {
      if (!request.query[key] || request.query[key] !== matcher.query[key]) {
        return false;
      }
    }
  }
  return true;
};

const sortRoutesBySpecificity = (matches) => {
  return matches.sort(compareFunction);
};

const compareFunction = (firstEl, secondEl) => {
  const segmentCountOrder = compareSegmentCount(firstEl.path, secondEl.path);
  if (segmentCountOrder !== 0) {
    return segmentCountOrder;
  }
  const variableCountOrder = compareVariableCount(firstEl.path, secondEl.path);
  if (variableCountOrder !== 0) {
    return variableCountOrder;
  }
  const variableDepthOrder = compareVariableDepth(firstEl.path, secondEl.path);
  if (variableDepthOrder !== 0) {
    return variableDepthOrder;
  }
  const methodOrder = compareMethodExistence(firstEl.method, secondEl.method);
  if (methodOrder !== 0) {
    return methodOrder;
  }
  const queryCountOrder = compareQueryCount(firstEl.query, secondEl.query);
  if (queryCountOrder !== 0) {
    return queryCountOrder;
  }
  return compareTimestamps(firstEl.createdAt, secondEl.createdAt);
};

const compareQueryCount = (a, b) => {
  const queryCountA = queryCount(a);
  const queryCountB = queryCount(b);
  if (queryCountA > queryCountB) {
    return -1;
  }
  if (queryCountA < queryCountB) {
    return 1;
  }
  return 0;
};

const queryCount = (query) => {
  if (!query) {
    return -1;
  }
  return Object.keys(query).length;
};

const compareSegmentCount = (a, b) => {
  const segmentsA = segmentCount(a);
  const segmentsB = segmentCount(b);
  if (segmentsA > segmentsB) {
    return -1;
  }
  if (segmentsA < segmentsB) {
    return 1;
  }
  return 0;
};

const segmentCount = (path) => {
  if (!path) {
    return -1;
  }
  return path.split("/").length;
};

const compareVariableCount = (a, b) => {
  const countA = variableCount(a);
  const countB = variableCount(b);
  if (countA < countB) {
    return -1;
  }
  if (countA > countB) {
    return 1;
  }
  return 0;
};

const variableCount = (path) => {
  if (!path) {
    return -1;
  }
  return path.split("/").filter((s) => s.startsWith(":")).length;
};

const compareVariableDepth = (a, b) => {
  const lastA = lastVariableSegment(a);
  const lastB = lastVariableSegment(b);
  if (lastA > lastB) {
    return -1;
  }
  if (lastA < lastB) {
    return 1;
  }
  return 0;
};

const lastVariableSegment = (path) => {
  if (!path) {
    return -1;
  }
  return (
    path
      .split("/")
      .map((segment, index) => ({ segment, index }))
      .filter((s) => s.segment.startsWith(":"))
      .map((s) => s.index)
      .pop() || -1
  );
};

const compareMethodExistence = (a, b) => {
  if (a && !b) {
    return -1;
  }
  if (!a && b) {
    return 1;
  }
  return 0;
};

const compareTimestamps = (a, b) => {
  if (a > b) {
    return -1;
  }
  if (a < b) {
    return 1;
  }
  return 0;
};

module.exports = { matchRoute, matchesRequest, compareFunction, sortRoutesBySpecificity };
