var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var WebpackChunkHash = require('webpack-chunk-hash')
var ChunkManifestPlugin = require('chunk-manifest-webpack-plugin')
var InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')

module.exports = {
  // 设置上下文路径
  context: path.resolve(__dirname, '..'),
  // chart引入的所有第三方模块清单，以后新增的第三方模块也要加入到这里来
  entry: {
    'static/js/vendor': [
      'react',
      'react-dom',
      'react-color',
      'react-datetime',
      'underscore',
      'es6-promise',
      'moment',
      'eventemitter3',
      'isomorphic-fetch',
      'iscroll',
      'spin',
      './src/vendor/hidpi-canvas-polyfill.js',
    ],
    // chart功能的入口模块
    'static/js/main': './src/index.tsx',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      }
    ]
  },
  plugins: [
    // 第三方模块
    new webpack.optimize.CommonsChunkPlugin({
      names: ['static/js/vendor', 'manifest'],
      minChunks: Infinity
    }),

    // new webpack.HashedModuleIdsPlugin(),

    new WebpackChunkHash(),

    // new ChunkManifestPlugin({
    //   filename: 'manifest.json',
    //   manifestVariable: 'webpackManifest'
    // }),

    new InlineManifestWebpackPlugin({ name: 'webpackManifest' }),

    new HtmlWebpackPlugin({
      title: '微看盘-专业看盘工具',
      filename: 'index.html',
      template: './src/index.html'
    })
  ],
  resolve: {
    alias: {
      'es6-promise': 'es6-promise/dist/es6-promise.js',
      'isomorphic-fetch': 'isomorphic-fetch/fetch-npm-browserify.js',
      'iscroll': 'iscroll/build/iscroll.js'
    },
    extensions: ['.js', '.ts', '.tsx'],
  }
}