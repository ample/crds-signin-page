#!/bin/bash
if [[ ! -z "${TEAMCITY_TEST_BUILD}" ]];
then
	echo "DEBUG Starting live integration tests"
	curl --location --request POST 'https://ci.crossroads.net/app/rest/buildQueue' \
	--header 'Content-Type: application/xml' \
	--header 'Origin: https://ci.crossroads.net' \
	--header 'Authorization: Bearer '${TEAMCITY_ACCESS_TOKEN}'' \
	--data-raw '<build>
		<buildType id="'${TEAMCITY_TEST_BUILD}'"/>
	</build>';
else
	echo "DEBUG Not running live integration tests"
fi