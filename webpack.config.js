const path = require('path');
const { merge: webpackMerge } = require('webpack-merge');

// build multiple outputs
module.exports = [];

const outputs = [
  // core flureeContext library (standard)
  // larger version for wide compatibilty
  {
    entry: [
      // main lib
      './lib/index.js',
    ],
    filenameBase: 'flureeContext',
    targets: {
      // use slightly looser browserslist defaults
      browsers: 'defaults, > 0.25%',
    },
  },
  // smaller version using features from browsers with ES Modules support
  {
    entry: [
      // main lib
      './lib/index.js',
    ],
    filenameBase: 'flureeContext.esm',
    targets: {
      esmodules: true,
    },
  },
];

outputs.forEach((info) => {
  // common to bundle and minified
  const common = {
    entry: {
      flureeContext: info.entry,
    },
    // enable for easier debugging
    //optimization: {
    //  minimize: false
    //},
    module: {
      rules: [
        {
          //   test: /\.js$/,
          //   include: [
          //     {
          //       // exclude node_modules by default
          //       exclude: /(node_modules)/,
          //     },
          //     {
          //       // include specific packages
          //       include: [
          //         /(node_modules\/canonicalize)/,
          //         /(node_modules\/lru-cache)/,
          //         /(node_modules\/rdf-canonize)/,
          //         /(node_modules\/yallist)/,
          //       ],
          //     },
          //   ],
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage',
                    corejs: '3.9',
                    // TODO: remove for babel 8
                    bugfixes: true,
                    //debug: true,
                    targets: info.targets,
                  },
                ],
              ],
              plugins: [
                [
                  '@babel/plugin-proposal-object-rest-spread',
                  { useBuiltIns: true },
                ],
                '@babel/plugin-transform-modules-commonjs',
                '@babel/plugin-transform-runtime',
              ],
            },
          },
        },
      ],
    },
    plugins: [
      //new webpack.DefinePlugin({
      //})
    ],
    // node: {
    //   Buffer: false,
    //   crypto: false,
    //   process: false,
    //   setImmediate: false,
    // },
  };

  // plain unoptimized unminified bundle
  const bundle = webpackMerge(common, {
    mode: 'development',
    output: {
      /* eslint-disable-next-line */
      path: path.join(__dirname, 'dist'),
      filename: info.filenameBase + '.js',
      library: info.library || '[name]',
      libraryTarget: info.libraryTarget || 'umd',
    },
  });
  if (info.library === null) {
    delete bundle.output.library;
  }
  if (info.libraryTarget === null) {
    delete bundle.output.libraryTarget;
  }

  // optimized and minified bundle
  const minify = webpackMerge(common, {
    mode: 'production',
    output: {
      /* eslint-disable-next-line */
      path: path.join(__dirname, 'dist'),
      filename: info.filenameBase + '.min.js',
      library: info.library || '[name]',
      libraryTarget: info.libraryTarget || 'umd',
    },
    devtool: 'cheap-module-source-map',
  });
  if (info.library === null) {
    delete minify.output.library;
  }
  if (info.libraryTarget === null) {
    delete minify.output.libraryTarget;
  }

  module.exports.push(bundle);
  module.exports.push(minify);
});
