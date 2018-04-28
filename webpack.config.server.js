const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  mode: "none",
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
    new VueLoaderPlugin(),
  ],
  module: {
    rules: [
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
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader',
        ]
      }
    ],
  },
};
