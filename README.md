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


## Roadmap

1. GET /config
1. POST /config/status for faster status configuration
1. Mock response data
1. Override specific paths
1. Redirects
1. Run on multiple ports:
  1. Configuration
  1. 1-n servers based on configuration
1. Release npm package

