const webpack = require('webpack');
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
        enforce: 'pre',
        include: commonConfig.resolve(__dirname, "../src"),
        use: "source-map-loader"
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
    extensions: [".ts", ".js"]
  },
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.PLATFORM': JSON.stringify('electron'),
      'process.env.CONFIG': JSON.stringify('standalone')
    }),
    {
      // post-build
      apply: compiler => commonConfig.postBuild(compiler)
    }
  ]
};