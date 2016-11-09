var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var cssExtractor = new ExtractTextPlugin('static/style/chart-[contenthash:8].css')

module.exports = {
  // chart引入的所有第三方模块清单，以后新增的第三方模块也要加入到这里来
  entry: {
    'static/js/vendor': [
      'react',
      'react-dom',
      'underscore',
      'es6-promise',
      'eventemitter3',
      'isomorphic-fetch',
      'd3',
      'd3-array',
      'd3-scale',
      'd3-shape',
      './src/vendor/iscroll.js',
      './src/vendor/hidpi-canvas-polyfill.js',
      './src/vendor/spin.js'
    ],
    // chart功能的入口模块
    'static/js/chart': './src/index.tsx',
    // 'static/js/chart_grid': './src/index_grid.tsx'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]-[chunkhash:8].js',
    chunkFilename: '[name]-[chunkhash:8].js',
    publicPath: 'http://chart.quchaogu.com'
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'ts',
      },
      {
        test: /style\/common\.css$/,
        loader: cssExtractor.extract(['css', 'csso?-comments', 'postcss'])
      },
      {
        test: /\.less$/,
        loader: cssExtractor.extract(['css', 'csso?-comments', 'postcss', 'less'])
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'image?{bypassOnDebug: true, progressive:true, optimizationLevel: 3, pngquant:{quality: "65-80"}}',
          'url?limit=10000&name=img/[hash:8].[name].[ext]',
        ]
      },
    ]
  },
  plugins: [
    // 第三方模块
    new webpack.optimize.CommonsChunkPlugin({
      name: 'static/js/vendor',
      minChunks: Infinity
    }),

    // manifest公共文件，避免vendor公共chunk每次chunck hash都改变造成缓存失效
    new webpack.optimize.CommonsChunkPlugin({
      name: 'static/js/manifest',
      minChunks: Infinity
    }),

    // 配置生产环境变量
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }),

    // 配置公共css chunk，使得common.css成为独立的文件，不会被编译到bundle中去
    cssExtractor,

    new HtmlWebpackPlugin({
      title: '趣炒股-专业看盘工具',
      filename: 'index.html',
      chunksSortMode: 'dependency',// 重要，确保chunk的加载顺序是正确的
      chunks: ['static/js/manifest', 'static/js/vendor', 'static/js/chart'],
      template: './src/index.ejs'
    }),

    // new HtmlWebpackPlugin({
    //   title: '趣炒股-专业看盘工具',
    //   filename: 'index-grid.html',
    //   chunksSortMode: 'dependency',
    //   chunks: ['static/js/manifest', 'static/js/vendor', 'static/js/chart_grid'],
    //   template: './src/index_grid.ejs'
    // })
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