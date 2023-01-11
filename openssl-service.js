const openssl = require('async-openssl')

module.exports = function (command) {
  return openssl(command)
}
