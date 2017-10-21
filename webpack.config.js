var path = require('path');
var webpack = require('webpack');

var config = {
  entry: {
    main: './app/index.jsx',
    frogger: './app/demos/frogger.jsx'
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname,'./dist')
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom',
      ReactDOMServer: 'react-dom/server',
      '$': 'jquery',
      'jQuery': 'jquery',
      '_': 'underscore',
      'window.decomp': 'poly-decomp'
    })
  ],
  module: {
    loaders: [
      { test: /\.jsx$/,
        exclude: /(node_modules|bower_components)/,
        include: [
          path.resolve(__dirname, "app")
        ],
        loader: "babel-loader"
      },
      { test: /\.scss$/,
        include: [
          path.resolve(__dirname, "app/sass")
        ],
        loader: "style-loader!css-loader!autoprefixer-loader!sass-loader"
      }
    ]
  }
};

module.exports = config;
