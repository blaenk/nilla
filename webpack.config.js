'use strict';

require('babel-register');

const process = require('process');
const webpack = require('webpack');
const path = require('path');
const precss = require('precss');
const autoprefixer = require('autoprefixer');

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

config.module = {};
config.module.loaders = [];

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
  loaders: [
    'style?sourceMap',
    'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
    // 'resolve-url',
    'less?sourceMap'
  ]
});

config.module.loaders.push({
  test: /\.module\.css$/,
  loader: 'style!css?modules&localIdentName=[name]---[local]---[hash:base64:5]'
});

config.module.loaders.push({
  test: /\.css$/,
  include: [modules],
  loader: 'style!css?sourceMap'
});

config.module.loaders.push({
  test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
  loader: 'url?limit=100000&name=[name].[ext]'
});

config.postcss = function() {
  return [precss, autoprefixer];
};

config.plugins.push(new webpack.DefinePlugin({
  __NODE_ENV__: JSON.stringify(NODE_ENV)
}));

module.exports = config;
