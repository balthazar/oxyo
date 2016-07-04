const { readFile, writeFile, stat } = require('fs')
const { readImage } = require('opencv')

const factory = img => ({

  w: img.width(),
  h: img.height(),
  channels: img.channels(),
  curW: 0,
  curH: 0,
  curC: 0,

  move () {
    ++this.curC
    if (this.curC === this.channels) {
      this.curC = 0
      ++this.curW
      if (this.curW === this.w) {
        this.curW = 0
        ++this.curH
        if (this.curH === this.h) {
          throw new Error('Image full.')
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
    const p = img.pixel(this.curH, this.curW)
    p[this.curC] = p[this.curC] & ~1 | bit
    img.pixel(this.curH, this.curW, p)
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
    const p = img.pixel(this.curH, this.curW)
    const out = p[this.curC] & 1
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
  }

})

const logErr = msg => console.error(`oxyo: ${msg}`)

/**
 * Encode secret data inside carry image
 * and save result into separate file.
 */
const encode = (carry, out, secret) => {

  const outExt = out.substr(out.lastIndexOf('.') + 1)
  if (outExt !== 'png') {
    return logErr('the output image needs to be a png for encoding.')
  }

  stat(carry, err => {
    if (err) { return logErr('cannot read carrier file.') }
    readImage(carry, (err, img) => {
      if (err) { return logErr('cannot read carrier file.') }

      const steg = factory(img)

      readFile(secret, (err, data) => {
        if (err) { return logErr('cannot read secret file.') }
        steg.putBits(steg.binary(data.length, 64))
        data.forEach(b => steg.putByte(b))
        img.save(out)
      })
    })
  })

}

/**
 * Decode carrier image data into output.
 */
const decode = (carry, out) => {

  stat(carry, err => {
    if (err) { return logErr('cannot read carrier file.') }
    readImage(carry, (err, img) => {
      if (err) { return logErr('cannot read carrier file.') }

      const steg = factory(img)
      const length = parseInt(steg.readBits(64), 2)
      const buf = Buffer.alloc(length)

      for (let i = 0; i < length; ++i) {
        buf[i] = parseInt(steg.readByte(), 2)
      }

      writeFile(out, buf)
    })
  })

}

module.exports = { encode, decode }
