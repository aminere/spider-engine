
pushd ..\..\

pushd docs
call make html
popd

call node scripts/docs/postProcess.js

call typedoc --out docs/build/html/api --mode file --ignoreCompilerErrors --excludePrivate --readme none src

popd