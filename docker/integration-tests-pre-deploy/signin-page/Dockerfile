#cypress is using this
FROM node:13.3.0
WORKDIR /signin-page

#TODO work on copying only what's needed
COPY . ./

RUN npm ci

# FROM cypress/included:3.8.1
# WORKDIR /pre-deploy-integration

# COPY ./integration_tests ./

# ENV CI=1
# RUN npm ci

# RUN npx cypress verify

# RUN chmod +x wait-for-it.sh

#TODO can run both in one container? not service-service?