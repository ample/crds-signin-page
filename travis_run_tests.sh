#!/bin/bash
# TODO reconfigure for signin page
shopt -s nocasematch; #ignore case

#Skip all testing against preview branches
# if [ "$CONTEXT" != "production" ];
if [ "${RUN_CYPRESS}" != "true" ];
then
    exit 0
fi

body="{\"request\": { \"branch\":\"$HEAD\", \"config\": {\"env\": { \"RUN_CYPRESS\": \"$RUN_CYPRESS\", \"VAULT_SECRET_ID\": \"$VAULT_SECRET_ID\", \"VAULT_ROLE_ID\": \"$VAULT_ROLE_ID\", \"DEBUG_NetlifyContext\": \"$CONTEXT\"}}}}"

curl -s -X POST \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-H "Travis-API-Version: 3" \
-H "Authorization: token $TRAVIS_CI" \
-d "$body" \
https://api.travis-ci.com/repo/crdschurch%2Fcrds-signin-page/requests