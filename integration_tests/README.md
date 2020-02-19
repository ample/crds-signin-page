# Integration tests

Integration tests can be run against a live environment (int.crossroads.net) or a locally hosted environment.

Before either, cd into the integration_tests/ dir and install necessary packages with
```bash
npm install
```

## Test a live environment
### Quick start

Running this suite against int.crossroads.net is already fully configured and takes only 2 steps.

1. Set these environment variables:
```
VAULT_ROLE_ID
VAULT_SECRET_ID
```
They can be set globally or locally as long as they're accessible in the terminal you're in.

2. Run Cypress tests
Cypress test can run in interactive with the [Test Runner](https://docs.cypress.io/guides/core-concepts/test-runner.html#Overview) or headless mode.
Interactive mode provides a friendly UI and lots of debugability. Run with:
```bash
npm run run_ui_int
```

To run in headless mode:
```bash
npm run run_headless_int
```
Note this runs tests in Chrome, which still opens and displays a browser when tests are running.

## Test a locally hosted environment

You'll need to follow the [Readme](../README.md) at the top level of this repo to start the app locally.

Once the app is running, open a new terminal and follow the [Quick start](#quick_start) instructions for setting environment variables.
Once environment variables are set, run tests in interactive mode with:
```bash
npm run run_ui_localhost
```

Or run in headless mode:
```bash
npm run run_headless_localhost
```


## Run with Docker

Docker containers and docker-compose files for running this suite can be found in the /docker directory.
To run these, Docker and docker-compose must be installed, Docker must be running (with Linux containers) and required environment variables must be set. Aside from that no other installation is necessary.

### Test int.crossrossroads.net with Docker

1. Set these environment variables:
```
VAULT_ROLE_ID
VAULT_SECRET_ID
CYP_DASHBOARD_RECORD_KEY
DOCKER_TAG(optional)
```
They can be set globally or locally as long as they're accessible in the terminal you're in.
To get the CYP_DASHBOARD_RECORD_KEY, run cypress in interactive mode -> open settings ...TODO

2. Run docker-compose
Run the docker-compose file at ../docker/integration-tests-only/docker-compose.yml

For example:
```bash
docker-compose -f ./docker/integration-tests-only/docker-compose.yml up --build --abort-on-container-exit --exit-code-from integration_tests
```
This will rebuild the image on each run and exit the container after tests have finished running.
This will also report the results to the [Cypress Dashboard](https://dashboard.cypress.io/projects/g5abyp/runs)

### Host and test service within Docker

1. Set these environment variables:
```
VAULT_ROLE_ID
VAULT_SECRET_ID
CYP_DASHBOARD_RECORD_KEY
OKTA_BASE_URL
OKTA_CLIENT_ID
OKTA_REDIRECT_URI
CRDS_APP_ENDPOINT
CRDS_GATEWAY_ENDPOINT
CRDS_COOKIE_PREFIX
CRDS_CMS_ENDPOINT
CONTENTFUL_ACCESS_TOKEN
CONTENTFUL_SPACE_ID
CONTENTFUL_ENV
DOCKER_TAG (optional)
```
They can be set globally or locally as long as they're accessible in the terminal you're in.
To get the CYP_DASHBOARD_RECORD_KEY, run cypress in interactive mode -> open settings ...TODO

2. Run docker-compose
Run the docker-compose file at ../docker/service-and-integration-tests/docker-compose.yml

For example:
```bash
docker-compose -f ./docker/service-and-integration-tests/docker-compose.yml up --build --abort-on-container-exit --exit-code-from integration_tests
```
This will rebuild the image on each run and exit the container after tests have finished running.
This will also report the results to the [Cypress Dashboard](https://dashboard.cypress.io/projects/g5abyp/runs)