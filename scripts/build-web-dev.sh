pushd ../

echo Building Engine

echo npm install..
npm install

echo building engine web dev
npm run build-web-dev

pushd workers/raytracer
npm install
npm run build-dev
popd

popd