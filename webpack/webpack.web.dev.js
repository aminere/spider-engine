
const webpack = require('webpack');
const commonConfig = require('./common-config');

module.exports = {
  entry: commonConfig.entry,
  output: commonConfig.output,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        include: commonConfig.resolve('../src'),
        loader: 'tslint-loader'
      },      
      {
        test: /\.tsx?$/,
        enforce: 'pre',        
        include: commonConfig.resolve('../src'),
        use: 'source-map-loader'
      },
      {
        test: /\.tsx?$/,
        include: commonConfig.resolve('../src'),
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
    extensions: ['.ts', '.js']
  },
  devtool: 'eval-source-map',
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.PLATFORM': JSON.stringify('web'),
	    'process.env.CONFIG': JSON.stringify('standalone')
    }),
    {
      // post-build
      apply: compiler => commonConfig.postBuild(compiler)
    }
  ]
};