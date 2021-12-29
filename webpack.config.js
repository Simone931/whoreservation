const slsw = require('serverless-webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = (() => {
  return {
    externals: [nodeExternals()],
    entry: slsw.lib.entries,
    target: 'node',
    mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
    resolve: {
      extensions: ['.js', '.json'],
    },
    output: {
      libraryTarget: 'commonjs',
      path: path.join(__dirname, '.webpack'),
      filename: '[name].js',
      sourceMapFilename: '[file].map',
    },
  };
})();
