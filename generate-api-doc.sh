
publicEngineDir="../github/spiderengine"

rm -rf ${publicEngineDir}/src
cp -r src ${publicEngineDir}

pushd ${publicEngineDir}/scripts/docs
	./generate-api.sh
popd
