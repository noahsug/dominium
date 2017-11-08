const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: path.resolve('src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        include: [path.resolve('src')],
        loader: 'babel-loader',
        test: /\.js$/,
      },
    ],
  },
  target: 'node',
  plugins: [
    new webpack.IgnorePlugin(/vertx/),
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
  ],
}
