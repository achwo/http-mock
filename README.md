# http-mock

http-mock allows you to return mock data from any path you want.

## Configure via Endpoint

http-mock allows you to configure the default status code and body:

```sh
curl -I http://localhost:3000/test-path # returns 200

curl -X POST http://localhost:3000/config \
  -H "Content-Type: application/json" \
  -d '{"status": 404, "body": {"status": "OK"}}'

curl -I http://localhost:3000/test-path # returns 404 and { "status": "OK" }
```

You can also override specific routes:

```sh
curl -I http://localhost:3000/test-path # returns 200

curl -X POST http://localhost:3000/config/routes \
  -H "Content-Type: application/json" \
  -d '{ "routes": [
    {
      "path": "/test",
        "method": "GET",
        "status": 201,
        "body": { "status": "created" }
    },
    {
      "path": "/other-path",
      "method": "GET",
      "status": 404
    }
  ]}'
```

You can post there multiple times, adding new routes.
Routes added later take precedence, if there are multiple matches.
At the moment, one exact matches work.

## Show configuration

The current config is accessible via GET /config.

## Roadmap

- [x] GET /config
- [x] Mock response data
- [x] Override specific paths
- [ ] Override paths with route params
- [ ] Redirects
- [ ] Run on multiple ports:
  - [ ] Configuration
  - [ ] 1-n servers based on configuration
- [ ] Release npm package
- [ ] https?
