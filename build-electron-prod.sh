echo Building Engine

echo npm install..
npm install

echo building engine electron prod
npm run build-electron-prod

pushd workers/raytracer
npm run build-prod
popd
