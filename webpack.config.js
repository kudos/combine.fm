const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;

module.exports = {
  entry: './public/src/entry-client.js',
  output: {
    path: path.resolve(__dirname, './public/dist'),
    publicPath: '/dist/',
    filename: 'js/[name].[hash:10].js',
  },
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'public/src'),
    ],
    extensions: ['.js', '.json', '.vue', '.css'],
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: true
        },
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader" }),
      },
    ],
  },
  devtool: '#source-map',
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin("style/[name].[hash:10].css"),
    new StatsWriterPlugin({
      fields: ['assets'],
      filename: 'manifest.json',
      transform(stats) {
        const manifest = {};
        stats.assets.map(asset => asset.name)
          .sort()
          .forEach((file) => {
            manifest[file.replace(/\.[a-f0-9]{10}\./, '.')] = file;
        });
        return JSON.stringify(manifest, null, 2) + '\n';
      }
    }),
  ],
};
