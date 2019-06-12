#!/bin/bash

if [ "${BRANCH}" == "master" ]; then
    echo "Setting Secrets for PRODUCTION"
    export OKTA_CLIENT_ID=${OKTA_CLIENT_ID_PRODUCTION}
elif [ "${BRANCH}" == "release" ]; then
    echo "Setting Secrets for DEMO"
    export OKTA_CLIENT_ID=${OKTA_CLIENT_ID_SANDBOX}
else
    echo "Setting Secrets for INT"
    export OKTA_CLIENT_ID=${OKTA_CLIENT_ID_SANDBOX}
fi

parcel build *.html