"use strict";

const webpack = require('webpack');
const fs = require('fs');
const path = require('path');

const getConfig = require('hjs-webpack');

const NODE_ENV = process.env.NODE_ENV;
const isDev = NODE_ENV === 'development';

const root = path.resolve(__dirname);
const src = path.join(root, 'src');
// const modules = path.join(root, 'node_modules');
const dest = path.join(root, 'dist');

const config = getConfig({
  isDev,
  "in": path.join(src, 'app.js'),
  out: dest,
  clearBeforeBuild: true,
  devServer: {
    port: 4000,
    hostname: "0.0.0.0"
  },
  modules: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
      }
    ]
  }
});

module.exports = config;
