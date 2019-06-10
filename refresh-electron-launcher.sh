
rm -rf ./launcher/electron/dist
rm -rf ./launcher/electron/public
mkdir ./launcher/electron/dist
#cp ./dist/spider_electron_dev.js ./launcher/electron/dist/spider_electron_dev.js
cp ./dist/spider_electron_prod.js ./launcher/electron/dist/spider_electron_prod.js
cp -R ./public ./launcher/electron/public

pushd launcher/electron
npm run build-windows
popd