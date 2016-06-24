'use strict';

require('babel-register');

const process = require('process');
const webpack = require('webpack');
const path = require('path');
const precss = require('precss');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV;

const root = __dirname;

const modules = path.join(root, 'node_modules');
const src = path.join(root, "client/src");

const config = {};

config.plugins = [];

config.cache = true;

config.resolve = {};
config.resolve.root = [src, modules];
config.resolve.alias = {
  'reducers': path.join(src, 'reducers'),
  'actions': path.join(src, 'actions'),
  'styles': path.join(src, 'styles'),
  'containers': path.join(src, 'containers'),
  'components': path.join(src, 'components')
};

config.entry = {
  app: ['./client/src/app.js']
};

config.output = {
  path: path.resolve(root, 'public/assets'),
  publicPath: '/assets/',
  filename: '[name].js'
};

config.plugins.push(new webpack.DefinePlugin({
  __NODE_ENV__: JSON.stringify(NODE_ENV)
}));

config.plugins.push(new ExtractTextPlugin('app.css', {
  allChunks: true
}));

config.module = {};
config.module.loaders = [];

config.module.loaders.push({
  test: /isIterable/,
  loader: 'imports?Symbol=>false'
});

config.module.loaders.push({
  test: /\.js$/,
  include: path.resolve(root, 'client'),
  loader: 'babel',
  query: {
    presets: ['react', 'es2015']
  }
});

config.module.loaders.push({
  test: /\.json$/,
  loader: 'json'
});

config.module.loaders.push({
  test: /\.module\.less$/,
  loader: ExtractTextPlugin.extract(
    'style?sourceMap',
    [
      'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
      // 'resolve-url',
      'less?sourceMap'
    ]
  )
});

config.module.loaders.push({
  test: /\.css$/,
  include: [modules],
  loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
});

config.module.loaders.push({
  test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
  loader: 'url?limit=100000&name=[name].[ext]'
});

config.postcss = function() {
  return [precss, autoprefixer];
};

module.exports = config;
