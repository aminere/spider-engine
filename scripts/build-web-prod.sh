#!/bin/bash
pushd ../

echo Building Engine

echo npm install..
npm install

echo building engine web prod
npm run build-web-prod

pushd workers/raytracer
npm install
npm run build-prod
popd

popd