
const path = require('path');

const outputDirName = 'dist';
const bundleFilename = 'spider-engine.js';

const resolve = _path => path.resolve(__dirname, _path);

Object.assign(exports, {
    entry: './src/spider-engine.ts',
    output: {
        path: resolve(`../${outputDirName}`),
        filename: bundleFilename,
        libraryTarget: 'commonjs',
        publicPath: `/${outputDirName}/`,
        chunkFilename: '[name].js'
    },
    resolve: path => resolve(path),
    postBuild: compiler => {
        compiler.hooks.afterEmit.tap('spider-engine-postbuild', (compilation) => {
            require('./post-build').postBuild(resolve(`../${outputDirName}/${bundleFilename}`));
        });
    }    
});
