const webpack = require('webpack');
const NodemonPlugin = require('nodemon-webpack-plugin');

console.log(`${__dirname}/src/server.mock-data.ts`);

module.exports = {
  entry: `${__dirname}/src/server.mock-data.ts`,
  target: 'node',
  externals: [/(node_modules|main\..*\.js)/],
  mode: 'development',
  output: {
      filename: 'server.mock-data.js', // output file
      path: `${__dirname}/dist`,
  },
  resolve: {
      extensions: ['.ts', '.js'],
      modules: [
          `${__dirname}/node_modules`,
          'node_modules',
          __dirname
      ]
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  },
  watch: true,
  plugins: [
    new NodemonPlugin({
      watch: [`${__dirname}/dist/server.mock-data.js`],
    }),
  ],
};
