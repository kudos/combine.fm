const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'node',
  entry: './public/src/entry-server.js',
  output: {
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, './public/dist'),
    publicPath: '/dist/',
    filename: 'js/main-server.js',
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
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
        },
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
        },
        exclude: /node_modules/,
      },
    ],
  },
};
