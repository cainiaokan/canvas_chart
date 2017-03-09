function buildConfig(env) {
  var config = require('./config/' + env + '.js')
  // console.log(JSON.stringify(config, null, 2))
  return config
}

module.exports = buildConfig;