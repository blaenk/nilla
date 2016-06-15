"use strict";

const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const getConfig = require('hjs-webpack');

const root = path.resolve(__dirname);
const src = path.join(root, 'src');
const modules = path.join(root, 'node_modules');
const dest = path.join(root, 'dist');

const NODE_ENV = process.env.NODE_ENV;
const isDev = NODE_ENV === 'development';

const config = getConfig({
  isDev,
  "in": path.join(src, 'src/app.js'),
  "out": dest,
  clearBeforeBuild: true
});

module.exports = config;
