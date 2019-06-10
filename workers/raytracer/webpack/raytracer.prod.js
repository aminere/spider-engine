
const path = require('path');
const webpack = require('webpack');

const resolve = _path => path.resolve(__dirname, _path);

const tsSources = [
  resolve("../src"),
  resolve("../../../src/math"),
  resolve("../../../src/graphics/Color.ts"),
  resolve("../../../src/graphics/FrameBuffer.ts"),
  resolve("../../../src/core/ObjectPool.ts"),
  resolve("../../../src/io/Debug.ts")
];

module.exports = {  
  entry: './src/Raytracer-worker.ts',
  output: {
    path: path.resolve(__dirname, "../dist"),	
	  filename: 'spider_raytracer_prod.js',	
	  publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        include: tsSources,
        loader: 'tslint-loader',
        options: {
          typeCheck: true
        }
      },
      {
        test: /\.tsx?$/,
        include: tsSources,
        use: ['ts-loader']
      },
      {
        loader: 'file-loader',
        exclude: [
          /\.html$/,
          // We have to write /\.(js|jsx)(\?.*)?$/ rather than just /\.(js|jsx)$/
          // because you might change the hot reloading server from the custom one
          // to Webpack's built-in webpack-dev-server/client?/, which would not
          // get properly excluded by /\.(js|jsx)$/ because of the query string.
          // Webpack 2 fixes this, but for now we include this hack.
          // https://github.com/facebookincubator/create-react-app/issues/1713
          /\.(js|jsx)(\?.*)?$/,
          /\.(ts|tsx)(\?.*)?$/,
          /\.css$/,
          /\.json$/
        ],
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      }
    ]
  },  
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    })
  ],  
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {      
      "@core": resolve("../../../src/core"),
      "@graphics": resolve("../../../src/graphics"),      
      "@io": resolve("../../../src/io"),
      "@math": resolve("../../../src/math")      
    }
  },
  mode: 'production'
};
