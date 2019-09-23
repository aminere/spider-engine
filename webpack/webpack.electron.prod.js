const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const commonConfig = require('./common-config');

module.exports = {
  target: 'async-node',
  entry: commonConfig.entry,
  output: commonConfig.output,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        include: commonConfig.resolve(__dirname, "../src"),
        loader: 'tslint-loader',
        options: {
          typeCheck: false
        }        
      },
      {
        test: /\.tsx?$/,
        include: commonConfig.resolve(__dirname, "../src"),
        loader: 'ts-loader'
      },
      {
        loader: 'file-loader',
        exclude: [
          /\.html$/,
          /\.(js|jsx)$/,
          /\.(ts|tsx)$/,
          /\.css$/,
          /\.json$/
        ],
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          keep_fnames: true
        }
      })
    ]
  },
  plugins: [
    new webpack.DefinePlugin({      
      'process.env.PLATFORM': JSON.stringify('electron'),
      'process.env.CONFIG': JSON.stringify('standalone')
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    {
      // post-build
      apply: compiler => commonConfig.postBuild(compiler)
    }
  ]
};