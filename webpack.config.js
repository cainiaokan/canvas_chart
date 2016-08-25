var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  entry: {
    vendor: [
      'react',
      'react-dom',
      './src/vendor/hidpi-canvas-polyfill.js'
    ],
    chart: './src/index.tsx',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]-[hash:8].js',
    chunkFilename: '[name]-[hash:8].js',
    publicPath: '/'
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'ts'
      },
      {
        test: /style\/common\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css', 'csso?-comments', 'postcss')
      },
      {
        test: /\.less$/,
        loader: 'style!css!csso?comments=false!postcss!less'
      },
      {
        test: /\.png$/,
        loader: 'url?mimetype=image/png'
      },
      {
        test: /\.gif$/,
        loader: 'url?mimetype=image/gif'
      },
      {
        test: /\.jpg$/,
        loader: 'url?mimetype=image/jpg'
      }
    ]
  },
  plugins: [
    // 配置公共chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: '[name]-[hash:8].js'
    }),

    // 配置生产环境变量
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }),

    // 配置公共css chunk，使得common.css成为独立的文件，不会被编译到bundle中去
    new ExtractTextPlugin('style/common-[contenthash:8].css'),

    new HtmlWebpackPlugin({
      title: '趣炒股-专业看盘工具',
      filename: 'index.html',
      chunks: ['vendor', 'chart'],
      template: './src/index.ejs'
    })
  ],
  resolve: {
    root: [
      // path.resolve('./src/common')
    ],
    alias: {
    },
    extensions: ['', '.js', '.ts', '.tsx']
  }
}