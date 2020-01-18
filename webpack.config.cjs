const path = require('path');
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
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
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            extractCSS: true,
            loaders: {
              js: [
                {
                  loader: 'babel-loader',
                  options: {
                    babelrc: false,
                    presets: ['@babel/preset-env'],
                    plugins: [
                      require('@babel/plugin-proposal-object-rest-spread'),
                    ],
                  },
                },
              ]
            }
          },
        },
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: ['@babel/preset-env'],
            plugins: [
              require('@babel/plugin-proposal-object-rest-spread'),
            ],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ]
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style/[name].[hash:10].css',
    }),
    new VueLoaderPlugin(),
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
        return `${JSON.stringify(manifest, null, 2)}\n`;
      },
    })
  ],
};
