# FROM cypress/browsers:node13.3.0-chrome79-ff70
# to control the node & chrome version
FROM cypress/included:3.8.2
WORKDIR /pre-deploy-integration

COPY ./integration_tests ./

ENV CI=1
RUN npm ci

RUN npx cypress verify

RUN chmod +x wait-for-it.sh