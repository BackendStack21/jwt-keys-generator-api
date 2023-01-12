const restana = require('restana')
const opensslService = require('./openssl-service')
const { v4: uuidv4 } = require('uuid')
const assert = require('assert')
const { AssertionError } = require('assert')

const ALLOWED_BITS = [1024, 2048, 3072, 4096]
let OPENSSL_VERSION

const app = restana({})

app.get(['/api/openssl-version', '/api/health/status'], async (req, res) => {
  res.send(OPENSSL_VERSION)
})

app.get('/api/generate/:algorithm', async (req, res) => {
  const { algorithm } = req.params
  const bits = parseInt(req.query.bits || 3072)
  const bytes = parseInt(req.query.bytes || 32)

  const filePrefix = `./keys/${uuidv4()}`
  const filePubKey = `${filePrefix}-public.pem`
  const filePrivKey = `${filePrefix}-private.pem`

  try {
    assert.ok(ALLOWED_BITS.includes(bits), 'Unsupported bits size! Expecting one of: [1024, 2048, 3072, 4096]')
    assert.ok(bytes >= 12 && bytes <= 160, 'Invalid bytes value! Expecting: bytes >= 12 && bytes <= 160')

    switch (algorithm) {
      case 'RS256':
      case 'RS384':
      case 'RS512':
      case 'PS256':
      case 'PS384':
      case 'PS512': {
        await opensslService.exec(`genrsa -out ${filePrivKey} ${bits}`)
        await opensslService.exec(`rsa -in ${filePrivKey} -pubout -out ${filePubKey}`)

        const { privateKey, publicKey } = await opensslService.getAndDeleteKeyPair(filePrivKey, filePubKey)

        res.send({
          privateKey,
          publicKey,
          algorithm,
          bits,
          openssl: OPENSSL_VERSION
        })
        break
      }
      case 'HS256':
      case 'HS384':
      case 'HS512': {
        const secret = await opensslService.exec(`rand -base64 ${bytes}`)

        res.send({
          secret: secret.toString().trim(),
          algorithm,
          bytes,
          openssl: OPENSSL_VERSION
        })
        break
      }
      case 'ES256':
      case 'ES384':
      case 'ES512': {
        let curve = 'secp521r1'
        if (algorithm === 'ES256') {
          curve = 'secp256r1'
        } else if (algorithm === 'ES384') {
          curve = 'secp384r1'
        }

        await opensslService.exec(`ecparam -genkey -name ${curve} -noout -out ${filePrivKey}`)
        await opensslService.exec(`ec -in ${filePrivKey} -pubout -out ${filePubKey}`)

        const { privateKey, publicKey } = await opensslService.getAndDeleteKeyPair(filePrivKey, filePubKey)

        res.send({
          privateKey,
          publicKey,
          algorithm,
          openssl: OPENSSL_VERSION,
          curve
        })
        break
      }
      default:
        res.send('Unsupported algorithm!', 404)
    }
  } catch (err) {
    if (err instanceof AssertionError) {
      res.send(err.message, 400)
    } else {
      res.send(err.message, 500)
    }
  }
})

opensslService.exec('version').then(version => {
  OPENSSL_VERSION = version.toString().trim()

  const PORT = process.env.PORT || 3000
  app.start(PORT)
  console.log('API successfully running on port: ' + PORT)
}).catch(err => {
  console.error('OpenSSL integration failed: ' + err.message)
})
