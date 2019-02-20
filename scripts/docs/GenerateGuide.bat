
pushd ..\..\

pushd docs
call make html
popd

call node scripts/docs/postProcess.js

popd