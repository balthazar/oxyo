import { readFile, writeFile, createWriteStream, stat } from 'fs'
import { PNG } from 'pngjs'
import { nfcall } from 'q'
import jpg from 'jpeg-js'

import { getExt, binary, text, encrypt, decrypt } from './utils'

const handlers = {
  png: (buf, cb) => new PNG().parse(buf, cb),
  jpg: (buf, cb) => cb(null, jpg.decode(buf)),
  jpeg: (buf, cb) => cb(null, jpg.decode(buf))
}

const factory = (img, carryExt) => ({

  w: img.width,
  h: img.height,
  curW: 0,
  curH: 0,
  curC: 0,

  move () {
    ++this.curC
    if (this.curC === 3) {
      this.curC = 0
      ++this.curW
      if (this.curW === this.w) {
        this.curW = 0
        ++this.curH
        if (this.curH === this.h) {
          throw new Error('max capacity of carrier reached.')
        }
      }
    }
  },

  putBit (bit) {
    const i = (this.w * this.curH + this.curW) * 4 + this.curC
    img.data[i] = img.data[i] & ~1 | bit
    this.move()
  },

  putBits (bits) {
    for (let i = 0; i < bits.length; ++i) {
      this.putBit(bits[i])
    }
  },

  putByte (byte) {
    const bits = binary(byte)
    this.putBits(bits)
  },

  readBit () {
    const out = img.data[(this.w * this.curH + this.curW) * 4 + this.curC] & 1
    this.move()
    return out
  },

  readBits (n) {
    const out = []
    for (let i = 0; i < n; ++i) {
      out.push(this.readBit())
    }
    return out.join('')
  },

  readByte () {
    return this.readBits(8)
  },

  result () {
    const jpgOut = () => {
      const out = new PNG({ width: this.w, height: this.h })
      out.data = img.data
      return out.pack()
    }

    const outs = {
      png: () => img.pack(),
      jpg: jpgOut,
      jpeg: jpgOut
    }

    if (!outs[carryExt]) { return }
    return outs[carryExt]()
  }

})

/**
 * Encode secret data inside carry image
 * and save result into separate file.
 */
const encode = (carry, out, password, secret) => {

  const carryExt = getExt(carry)
  const secretExt = getExt(secret)

  if (!handlers[carryExt]) { return Promise.reject('carrier file type not supported.') }
  if (getExt(out) !== 'png') { return Promise.reject('output file needs to be a png.') }
  if (secretExt.length > 6) { return Promise.reject('secret extension length not supported.') }

  return Promise.all([nfcall(stat, carry), nfcall(stat, secret)])
    .then(() => Promise.all([nfcall(readFile, carry), nfcall(readFile, secret)]))
    .then(([cData, sData]) => Promise.all([nfcall(handlers[carryExt], cData), encrypt(sData, password)]))
    .then(([p, sData]) => new Promise(resolve => {
      if (p.data.length < (sData.length + 8 + 6) * 8 + 1) {
        throw new Error('carrier not big enough.')
      }

      const steg = factory(p, carryExt)
      steg.putBit(password ? 1 : 0)
      steg.putBits(binary(secretExt, 48))
      steg.putBits(binary(sData.length, 64))
      sData.forEach(b => steg.putByte(b))

      const stream = steg.result().pipe(createWriteStream(out))
      stream.on('finish', resolve)
    }))

}

/**
 * Decode carrier image data into output.
 */
const decode = (carry, out, password) => {

  if (getExt(carry) !== 'png') { return Promise.reject('carrier file needs to be a png.') }
  if (getExt(out)) { return Promise.reject('the output extension will be automatically added.') }

  return nfcall(stat, carry)
    .then(() => nfcall(readFile, carry))
    .then(data => nfcall(handlers.png, data))
    .then(p => {
      const steg = factory(p)
      const hasPassword = !!parseInt(steg.readBit(), 2)
      if (hasPassword && !password) { throw new Error('file encrypted, a password is required.') }

      const ext = text(steg.readBits(48))
      const length = parseInt(steg.readBits(64), 2)
      const buf = Buffer.alloc ? Buffer.alloc(length) : new Buffer(length)

      for (let i = 0; i < length; ++i) {
        const byte = parseInt(steg.readByte(), 2)
        buf[i] = byte
      }

      return nfcall(writeFile, `${out}${ext && `.${ext}`}`, decrypt(buf, hasPassword && password))
    })

}

export default { encode, decode }
