'use strict'

/* global describe, it */
const expect = require('chai').expect
const { spawn } = require('child_process')
const axios = require('axios')
const jwt = require('jsonwebtoken')

describe('JWT Generator API', () => {
  let server

  it('initialize', function (done) {
    this.timeout(3000)

    server = spawn('node', ['server.js'], {
      shell: true,
      detached: true,
      stdio: 'inherit',
      env: {
      }
    })

    setTimeout(() => {
      done()
    }, 2800)
  })

  it('service should be healthy', async () => {
    const url = 'http://localhost:3000/api/health/status'

    const options = {
      method: 'GET',
      url
    }

    const { status } = await axios.request(options)
    expect(status).equals(200)
  })

  it('should 404 on unsupported algorithm', async () => {
    const url = 'http://localhost:3000/api/generate/XS'

    const options = {
      method: 'GET',
      url
    }

    try {
      await axios.request(options)
      throw new Error('Should fail!')
    } catch (err) {
      expect(err.response.status).equals(404)
      expect(err.response.data).equals('Unsupported algorithm!')
    }
  })

  it('should check bits for RS* algorithms', async () => {
    const url = 'http://localhost:3000/api/generate/RS256?bits=512'

    const options = {
      method: 'GET',
      url
    }

    try {
      await axios.request(options)
      throw new Error('Should fail!')
    } catch (err) {
      expect(err.response.status).equals(400)
      expect(err.response.data).equals('Unsupported bits size! Expecting one of: [1024, 2048, 3072, 4096]')
    }
  })

  it('should check bytes for HS* algorithms', async () => {
    const url = 'http://localhost:3000/api/generate/RS256?bytes=6'

    const options = {
      method: 'GET',
      url
    }

    try {
      await axios.request(options)
      throw new Error('Should fail!')
    } catch (err) {
      expect(err.response.status).equals(400)
      expect(err.response.data).equals('Invalid bytes value! Expecting: bytes >= 12 && bytes <= 160')
    }
  })

  it('service should get OpenSSL version', async () => {
    const url = 'http://localhost:3000/api/openssl-version'

    const options = {
      method: 'GET',
      url
    }

    const { status } = await axios.request(options)
    expect(status).equals(200)
  })

  const SYMMETRIC_ALGORITHMS = ['HS256', 'HS384', 'HS512']
  SYMMETRIC_ALGORITHMS.forEach(algorithm => {
    it(`should get valid ${algorithm} key`, async () => {
      const url = `http://localhost:3000/api/generate/${algorithm}`

      const options = {
        method: 'GET',
        url
      }

      const { status, data: { secret } } = await axios.request(options)
      expect(status).equals(200)

      const token = jwt.sign({ algorithm }, secret, {
        algorithm
      })
      expect(jwt.verify(token, secret)).contains({ algorithm })
    })
  })

  const RSA_BITS = [1024, 2048, 3072, 4096]
  RSA_BITS.forEach(bits => {
    it(`should get RSA ${bits} bits key`, async function () {
      this.timeout(5000)

      const url = `http://localhost:3000/api/generate/RS256?bits=${bits}`

      const options = {
        method: 'GET',
        url
      }

      const { status, data: { bits: keySize } } = await axios.request(options)
      expect(status).equals(200)
      expect(bits).equals(keySize)
    })
  })

  const ASYMMETRIC_ALGORITHMS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512']
  ASYMMETRIC_ALGORITHMS.forEach(algorithm => {
    it(`should get valid ${algorithm} key`, async function () {
      this.timeout(5000)

      const url = `http://localhost:3000/api/generate/${algorithm}`

      const options = {
        method: 'GET',
        url
      }

      const { status, data: { publicKey, privateKey } } = await axios.request(options)
      expect(status).equals(200)

      const token = jwt.sign({ algorithm }, privateKey, {
        algorithm
      })
      expect(jwt.verify(token, publicKey)).contains({ algorithm })
    })
  })

  it('shutdown', function (done) {
    process.kill(-server.pid)

    done()
  })
})
