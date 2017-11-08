const path = require('path')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config')

module.exports = Object.assign({}, webpackConfig, {
  devtool: 'eval',
  plugins: webpackConfig.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
  ]),
})
