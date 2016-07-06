const { readFile, writeFile, createWriteStream, stat } = require('fs')
const { PNG } = require('pngjs')
const jpg = require('jpeg-js')
const { nfcall } = require('q')

const png = new PNG()

const handlers = {
  png: png.parse.bind(png),
  jpg: (buf, cb) => cb(null, jpg.decode(buf)),
  jpeg: (buf, cb) => cb(null, jpg.decode(buf))
}

const factory = (img, carryExt) => ({

  w: img.width,
  h: img.height,
  curW: 0,
  curH: 0,
  curC: 0,

  carryExt,

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

  binary (value, size = 8) {
    const str = value.toString(2)
    if (str.length === size) { return str }
    return (Array(size).join('0') + str).slice(-size)
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
    const bits = this.binary(byte)
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

    if (!outs[this.carryExt]) { return }
    return outs[this.carryExt]()
  }

})

/**
 * Encode secret data inside carry image
 * and save result into separate file.
 */
const encode = (carry, out, secret) => {

  const carryExt = carry.substr(carry.lastIndexOf('.') + 1)
  const outExt = out.substr(out.lastIndexOf('.') + 1)
  if (!handlers[carryExt]) { return Promise.reject('carrier file type not supported.') }
  if (outExt !== 'png') { return Promise.reject('output file needs to be a png.') }

  return Promise.all([nfcall(stat, carry), nfcall(stat, secret)])
    .then(() => Promise.all([nfcall(readFile, carry), nfcall(readFile, secret)]))
    .then(([cData, sData]) => Promise.all([nfcall(handlers[carryExt], cData), sData]))
    .then(([p, sData]) => new Promise(resolve => {
      if (p.data.length < (sData.length + 64) * 8) {
        throw new Error('carrier not big enough for secret.')
      }

      const steg = factory(p, carryExt)
      steg.putBits(steg.binary(sData.length, 64))
      sData.forEach(b => steg.putByte(b))

      const stream = steg.result().pipe(createWriteStream(out))
      stream.on('finish', resolve)
    }))

}

/**
 * Decode carrier image data into output.
 */
const decode = (carry, out) => {

  const carryExt = carry.substr(carry.lastIndexOf('.') + 1)
  if (carryExt !== 'png') { return Promise.reject('carrier file needs to be a png.') }

  return nfcall(stat, carry)
    .then(() => nfcall(readFile, carry))
    .then(data => nfcall(handlers.png, data))
    .then(p => {
      const steg = factory(p)
      const length = parseInt(steg.readBits(64), 2)
      const buf = Buffer.alloc(length)

      for (let i = 0; i < length; ++i) {
        const byte = parseInt(steg.readByte(), 2)
        buf[i] = byte
      }

      return nfcall(writeFile, out, buf)
    })

}

module.exports = { encode, decode }
