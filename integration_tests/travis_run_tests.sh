#!/bin/bash
shopt -s nocasematch; #ignore case

if [ "${RUN_CYPRESS}" != "true" ];
then
    exit 0
fi

body="{\"request\": { \"branch\":\"$HEAD\", \"config\": {\"env\": { \"RUN_CYPRESS\": \"$RUN_CYPRESS\", \"DEBUG_NetlifyContext\": \"$CONTEXT\"}}}}"

curl -s -X POST \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-H "Travis-API-Version: 3" \
-H "Authorization: token $TRAVIS_CI" \
-d "$body" \
https://api.travis-ci.com/repo/crdschurch%2Fcrds-signin-page/requests