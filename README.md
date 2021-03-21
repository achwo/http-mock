# http-mock

http-mock allows you to return mock data from any path you want.

## Configure via Endpoint

http-mock allows you to configure the default status code:

```sh
curl -I http://localhost:3000/test-path # returns 200

curl -X POST http://localhost:3000/config \
  -H "Content-Type: application/json" \
  -d '{"status": 404}'

curl -I http://localhost:3000/test-path # returns 404
```

## Show configuration

The current config is accessible via GET /config.

## Roadmap

- [x] GET /config
- [ ] Mock response data
- [ ] Override specific paths
- [ ] Redirects
- [ ] Run on multiple ports:
  - [ ] Configuration
  - [ ] 1-n servers based on configuration
- [ ] Release npm package
