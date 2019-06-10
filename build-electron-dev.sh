echo Building Engine

echo npm install..
npm install

echo building engine electron dev
npm run build-electron-dev

pushd workers/raytracer
npm run build-dev
popd
