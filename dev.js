var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var config = require('./webpack.config')

var compiler = webpack(config)

var server = new WebpackDevServer(compiler, {
  contentBase: __dirname,
  compress: false
})

server.listen(8088, 'localhost', function () {})