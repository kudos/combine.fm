const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'node',
  entry: './public/src/entry-server.js',
  output: {
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, './public/dist'),
    publicPath: '/dist/',
    filename: 'js/build-server.js',
  },
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'public/src'),
    ],
    extensions: ['.js', '.json', '.vue', '.css'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'global.GENTLY': false,
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, './node_modules/bulma/css'),
      to: path.resolve(__dirname, './public/dist/css/'),
    }]),
  ],
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },
  devtool: '#source-map',
};
