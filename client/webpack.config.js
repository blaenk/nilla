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

const src = path.join(root, 'src');
const test = path.join(root, 'test');

const config = {};

config.plugins = [];

config.bail = true;
config.cache = true;

config.resolve = {};
config.resolve.alias = {
  common: path.join(src, 'common'),
  reducers: path.join(src, 'reducers'),
  selectors: path.join(src, 'selectors'),
  actions: path.join(src, 'actions'),
  styles: path.join(src, 'styles'),
  containers: path.join(src, 'containers'),
  components: path.join(src, 'components')
};

config.entry = {
  app: ['./src/app.js']
};

config.output = {
  path: path.resolve(root, 'build/assets'),
  publicPath: '/assets/',
  filename: '[name].js'
};

if (NODE_ENV == 'production') {
  config.devtool = 'cheap-module-source-map';
} else {
  config.devtool = 'eval';
}

config.plugins.push(new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify(NODE_ENV)
  },
  __NODE_ENV__: JSON.stringify(NODE_ENV)
}));

config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
config.plugins.push(new webpack.optimize.DedupePlugin());

if (NODE_ENV == 'production') {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compressor: {
      screw_ie8: true,
      warnings: false
    },
    mangle: {
      screw_ie8: true
    },
    output: {
      comments: false,
      screw_ie8: true
    }
  }));
}

config.plugins.push(new ExtractTextPlugin('app.css'));

config.module = {};

config.preLoaders = [];

config.preLoaders.push({
  test: /\.js$/,
  loader: 'eslint',
  include: [src, test]
});

config.module.loaders = [];

config.module.loaders.push({
  test: /isIterable/,
  loader: 'imports?Symbol=>false'
});

config.module.loaders.push({
  test: /\.js$/,
  include: [src, test],
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
