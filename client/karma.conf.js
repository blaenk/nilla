'use strict';

const webpackConfig = require('./webpack.config');

webpackConfig.devtool = 'inline-source-map';

webpackConfig.externals = Object.assign({}, webpackConfig.externals, {
  'cheerio': 'window',
  'react/addons': true,
  'react/lib/ExecutionEnvironment': true,
  'react/lib/ReactContext': true
});

module.exports = function(config) {
  config.set({
    frameworks: ['chai', 'mocha'],
    files: [
      'test/**/*.js'
    ],
    preprocessors: {
      'test/**/*.js': ['webpack', 'sourcemap']
    },
    coverageReporter: {
      type: 'lcovonly'
    },
    webpack: webpackConfig,
    webpackServer: {
      noInfo: true
    },
    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-webpack',
      'karma-phantomjs-launcher',
      'karma-spec-reporter',
      'karma-sourcemap-loader',
      'karma-coverage'
    ],
    // exclude: [],
    reporters: ['spec', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['PhantomJS'],
    singleRun: true,
    concurrency: Infinity
  });
};
