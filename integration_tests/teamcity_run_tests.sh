#!/bin/bash
# TEAMCITY_TEST_BUILD must equal the Teamcity build id, ex "WebApps_SignInPage_2Development"
if [[ -z "${TEAMCITY_TEST_BUILD}" ]];
then
  exit 0
fi

curl --location --request POST 'https://ci.crossroads.net/app/rest/buildQueue' \
--header 'Content-Type: application/xml' \
--header 'Origin: https://ci.crossroads.net' \
--header 'Authorization: Bearer '${TEAMCITY_ACCESS_TOKEN}'' \
--data-raw '<build>
	<buildType id="'${TEAMCITY_TEST_BUILD}'"/>
</build>';