
pushd ../../
rm -rf docs/build/html
popd

./generate-guide.sh
./generate-api.sh
