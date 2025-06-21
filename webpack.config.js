const path = require('path');

module.exports = {
  entry: './src/PlanetKeeper.js',
  mode: 'production',
  output: {
    filename: 'my-globe.js',
    path: path.resolve(__dirname, 'dist'),
  },
};