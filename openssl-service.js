const openssl = require('async-openssl')
const fs = require('fs/promises')

module.exports = {
  exec (command) {
    return openssl(command)
  },
  async  getAndDeleteKeyPair (filePrivKey, filePubKey) {
    const [publicKey, privateKey] = await Promise.all([
      fs.readFile(filePubKey, 'utf8'),
      fs.readFile(filePrivKey, 'utf8')
    ])
    await Promise.all([
      fs.unlink(filePubKey),
      fs.unlink(filePrivKey)
    ])

    return { publicKey, privateKey }
  }
}
