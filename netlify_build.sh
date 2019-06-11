#!/bin/bash

export OKTA_CLIENT_ID=testclientid

if [ "${BRANCH}" == "master" ]; then
    echo "Setting Secrets for PRODUCTION"
elif [ "${BRANCH}" == "release" ]; then
    echo "Setting Secrets for DEMO"
else
    echo "Setting Secrets for INT"
fi

parcel build *.html