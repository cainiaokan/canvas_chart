var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

var webpackMerge = require('webpack-merge')

const commonConfig = require('./base.js')

module.exports = webpackMerge(commonConfig, {
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '../dist'),
    filename: '/static/js/[name]-[chunkhash:8].js',
    chunkFilename: '[name]-[chunkhash:8].js',
    sourceMapFilename: '[file].map',
    publicPath: 'http://chart.quchaogu.com'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract(['css-loader?sourceMap', 'csso-loader?-comments'])
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract(['css-loader?sourceMap', 'csso-loader?-comments', 'less-loader'])
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
              limit: 100000,
              name: '[path][name]-[hash:8].[ext]'
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
            name: '[path][name]-[hash:8].[ext]'
          }
        }
      }
    ]
  },
  plugins: [
    // 配置生产环境变量
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        BROWSER: JSON.stringify(true)
      }
    }),

    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      beautify: false,
      mangle: {
          screw_ie8: true,
          keep_fnames: true
      },
      compress: {
          screw_ie8: true
      },
      comments: false
    }),

    new webpack.HashedModuleIdsPlugin(),

    // 配置公共css chunk，使得common.css成为独立的文件，不会被编译到bundle中去
    new ExtractTextPlugin('static/style/bundle-[contenthash:8].css')
  ]
})