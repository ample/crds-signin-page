FROM cypress/included:4.0.1
WORKDIR /sign-in-integration-tests

COPY ./integration_tests ./

ENV CI=1
RUN npm ci

RUN npx cypress verify

RUN chmod +x wait-for-it.sh