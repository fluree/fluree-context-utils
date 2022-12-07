const path = require('path');

module.exports = {
  // specify the target environments for the build
  // in this case, we are targeting both the browser and Node.js
  target: ['web', 'node'],

  // specify the entry point for the application
  entry: './src/index.js',

  // specify the output directory and filename for the bundle
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
};
