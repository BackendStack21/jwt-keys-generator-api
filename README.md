# JWT Keys Generator API
*A simple and secure JSON Web Token (JWT) signing/verification keys generator that uses OpenSSL.*
> WE DON'T DO tracking, tracing or logging of API usage!  
> This is an API for the community 💚 

This project allows Web browser and API clients to easily generate JWT signing/verification keys supported by the [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) library. The following algorithms are currently supported:

| alg Parameter Value | Digital Signature or MAC Algorithm                                     |
|---------------------|------------------------------------------------------------------------|
| HS256               | HMAC using SHA-256 hash algorithm                                      |
| HS384               | HMAC using SHA-384 hash algorithm                                      |
| HS512               | HMAC using SHA-512 hash algorithm                                      |
| RS256               | RSASSA-PKCS1-v1_5 using SHA-256 hash algorithm                         |
| RS384               | RSASSA-PKCS1-v1_5 using SHA-384 hash algorithm                         |
| RS512               | RSASSA-PKCS1-v1_5 using SHA-512 hash algorithm                         |
| PS256               | RSASSA-PSS using SHA-256 hash algorithm (only node ^6.12.0 OR >=8.0.0) |
| PS384               | RSASSA-PSS using SHA-384 hash algorithm (only node ^6.12.0 OR >=8.0.0) |
| PS512               | RSASSA-PSS using SHA-512 hash algorithm (only node ^6.12.0 OR >=8.0.0) |
| ES256               | ECDSA using P-256 curve and SHA-256 hash algorithm                     |
| ES384               | ECDSA using P-384 curve and SHA-384 hash algorithm                     |
| ES512               | ECDSA using P-521 curve and SHA-512 hash algorithm                     |

> See: https://github.com/auth0/node-jsonwebtoken/blob/master/README.md#algorithms-supported

## Considerations:
* For `RS*` and `PS*` algorithms, RSA keys are generated. The key size can be 1024, 2048, 3072 or 4096 bits. 
* For `HS*` keys, there is only private key (aka `secret`) and it is randomly generated using OpenSSL. 
* All keys are expected to be generated on the backend using `OpenSSL` to increase security. 

## Frontend 
- Official URL: https://jwt-keys.21no.de/ (COMING SOON)

## Backend API
- Official URL: `https://jwt-keys.21no.de/api/generate/:ALGORITHM?bytes=BYTES&bits=BITS`

### Examples:
- Generate RS256 key pair: https://jwt-keys.21no.de/api/generate/RS256?bits=2048
- Generate PS256 key pair: https://jwt-keys.21no.de/api/generate/PS256?bits=2048
- Generate HS256 key pair: https://jwt-keys.21no.de/api/generate/HS256?bytes=32
- Generate ES512 key pair: https://jwt-keys.21no.de/api/generate/ES512

### Parameters
#### bytes (optional)
For HMAC (HS*) secret keys, we need to pass the number of random bytes to be generated. 
Supported values: bytes >= 12 && bytes <= 160

The `bytes` query parameter is optional and only used for HS* algorithms. Default value is: 32

#### bits (optional)
> See: https://github.com/certbot/certbot/issues/2080
Supported values, one of: 1024, 2048, 3072, 4096

The `bits` query parameter is optional and only used for RS* and PS* algorithms. Default value is: 3072

# Run it using Docker
Docker image is publicly available so you can run it on your own infrastructure:
```bash
docker run --rm -p 3000:3000 kyberneees/jwt-keys-generator-api:latest
```

# LICENSE

```
MIT License

Copyright (c) 2023 BackendStack21.js

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```