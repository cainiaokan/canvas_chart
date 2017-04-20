var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var webpackMerge = require('webpack-merge')

const commonConfig = require('./base.js')

module.exports = webpackMerge(commonConfig, {
  watch: true,
  output: {
    path: path.join(__dirname, '../dist'),
    filename: '/static/js/[name].js',
    chunkFilename: '[name].js',
    sourceMapFilename: '[name].map',
    publicPath: 'http://chart.quchaogu.com'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract(['css-loader'])
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract(['css-loader', 'less-loader'])
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true,
              progressive: true,
              optimizationLevel: 3,
              pngquant: {
                quality: '65-80'
              }
            }
          },
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: '[path][name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/i,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000,
            name: '[path][name].[ext]'
          }
        }
      }
    ]
  },
  plugins: [
    // 配置生产环境变量
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('dev'),
        BROWSER: JSON.stringify(true)
      }
    }),

    // 配置公共css chunk，使得common.css成为独立的文件，不会被编译到bundle中去
    new ExtractTextPlugin('static/style/bundle.css')
  ]
})