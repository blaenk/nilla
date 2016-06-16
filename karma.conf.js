const path = require('path');
const webpackConfig = require('./webpack.config');

webpackConfig.devtool = 'inline-source-map';

webpackConfig.module.preLoaders = [
  // transpile all files except testing sources with babel as usual
  {
    test: /\.js$/,
    exclude: [
      path.resolve('client/src/'),
      path.resolve('node_modules/')
    ],
    loader: 'babel'
  },
  // transpile and instrument only testing sources with isparta
  {
    test: /\.js$/,
    include: path.resolve('client/src/'),
    // exclude: path.resolve('client/src/app.js'),
    loader: 'babel-istanbul'
  }
];

module.exports = function(config) {
  config.set({
    frameworks: ['chai', 'mocha'],
    files: [
      'tests.webpack.js'
    ],
    preprocessors: {
      'tests.webpack.js': ['webpack', 'sourcemap']
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
