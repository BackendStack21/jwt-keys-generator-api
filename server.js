const restana = require('restana')
const opensslService = require('./openssl-service')
const fs = require('fs/promises')
const { v4: uuidv4 } = require('uuid')
const assert = require('assert')
const { AssertionError } = require('assert')

const ALLOWED_BITS = [1024, 2048, 3072, 4096]

let OPENSSL_VERSION

async function getAndDeleteKeyPair (filePrivKey, filePubKey) {
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
        await opensslService(`genrsa -out ${filePrivKey} ${bits}`)
        await opensslService(`rsa -in ${filePrivKey} -pubout -out ${filePubKey}`)

        const { privateKey, publicKey } = await getAndDeleteKeyPair(filePrivKey, filePubKey)

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
        const secret = (await opensslService(`rand -base64 ${bytes}`)).toString().trim()

        res.send({
          secret,
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

        await opensslService(`ecparam -genkey -name ${curve} -noout -out ${filePrivKey}`)
        await opensslService(`ec -in ${filePrivKey} -pubout -out ${filePubKey}`)

        const { privateKey, publicKey } = await getAndDeleteKeyPair(filePrivKey, filePubKey)

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

opensslService('version').then(version => {
  OPENSSL_VERSION = version.toString().trim()

  app.start(process.env.PORT || 3000)
}).catch(err => {
  console.error('OpenSSL integration failed: ' + err.message)
})
