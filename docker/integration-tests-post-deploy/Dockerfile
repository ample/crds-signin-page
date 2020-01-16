FROM cypress/included:3.8.2
WORKDIR /pre-deploy-integration

COPY ./integration_tests ./

ENV CI=1
RUN npm ci

RUN npx cypress verify
