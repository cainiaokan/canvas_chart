var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  entry: {
    vendor: [
      'react',
      'react-dom',
      'underscore',
      'es6-promise',
      'eventemitter3',
      'isomorphic-fetch',
      'd3',
      './src/vendor/hidpi-canvas-polyfill.js',
      './src/vendor/spin.js'
    ],
    chart: './src/index.tsx',
    chart_grid: './src/index_grid.tsx',
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
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'image?{bypassOnDebug: true, progressive:true, optimizationLevel: 3, pngquant:{quality: "65-80"}}',
          'url?limit=10000&name=img/[hash:8].[name].[ext]',
        ]
      }
    ]
  },
  plugins: [
    // 配置公共chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: '[name]-[hash:8].js',
      minChunks: Infinity
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
    }),

    new HtmlWebpackPlugin({
      title: '趣炒股-专业看盘工具',
      filename: 'index-grid.html',
      chunks: ['vendor', 'chart_grid'],
      template: './src/index_grid.ejs'
    })
  ],
  resolve: {
    root: [
      path.resolve('./src/vendor')
    ],
    alias: {
    },
    extensions: ['', '.js', '.ts', '.tsx']
  }
}