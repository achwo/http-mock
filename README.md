# http-mock

http-mock allows you to return mock data from any path you want.

## Configure via Endpoint

http-mock allows you to configure the default status code, headers and body:

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
      "path": "/test/:testid",
        "method": "GET",
        "status": 301,
        "headers": { "Location": "https://www.google.de" }
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
More specific routes take precedence over less specific ones.

## Save and reload

You can save and reload the current configuration using the
`/config/routes` and `/config`-Endpoints.

```sh
# Save
curl http://localhost:3000/config > config.json

# Load
curl -X POST http://localhost:3000/config/routes \
  -H "Content-Type: application/json" \
  -d @config.json
```

## Specificity

http-mock has a few rules defining the precedence of rules. It aims to be as
intuitive as possible.

If you are unsure why a rule was matched when you expected another one, you can
check the following rules. To get the configuration, you can also GET `/config`.
This endpoint returns the matching rules in order of descending precedence.

1. More path segments before less path segments
2. Less path variables before more path variables
3. Later occurring path variables before earlier ones
4. Rules with method match before rules without method match
5. Rules created later before rules created earlier

## Show configuration

The current config is accessible via GET /config.

## Roadmap

- [ ] Dockerfile
- [ ] Load config from file
- [ ] Release npm package
- [ ] Release Dockerfile?
- [ ] load HAR-files
