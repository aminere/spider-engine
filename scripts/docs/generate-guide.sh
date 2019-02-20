
pushd ../..

pushd docs
sphinx-build -M html "source" "build"
popd

node scripts/docs/postProcess.js

popd