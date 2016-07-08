import crypto from 'crypto'
import { basename } from 'path'

/**
 * Get extension of a filepath
 */
export const getExt = filepath => {
  const base = basename(filepath)
  if (base.indexOf('.') === -1) { return '' }
  return base.substr(base.lastIndexOf('.') + 1)
}

/**
 * Left pad a string
 */
const leftPad = (str, size) => !str ? Array(size + 1).join('0')
  : str.length < size ? (Array(size).join('0') + str).slice(-size) : str

/**
 * Convert a value in its binary equivalent
 */
export const binary = (value, size = 8) => {
  if (typeof value !== 'string') { return leftPad(value.toString(2), size) }
  return leftPad(value.split('').map(c => leftPad(c.charCodeAt().toString(2), 8)).join(''), size)
}

/**
 * Convert binary to text
 */
export const text = bin => bin.match(/.{8}/g).map(o => {
  const int = parseInt(o, 2)
  return int ? String.fromCharCode(int) : ''
}).join('')

/**
 * Encrypt the buffer if a password is given
 */
export const encrypt = (buf, password) => {
  if (!password) { return buf }
  const cipher = crypto.createCipher('aes-256-ctr', password)
  return Buffer.concat([cipher.update(buf), cipher.final()])
}

/**
 * Decrypt the buffer if a password is given
 */
export const decrypt = (buf, password) => {
  if (!password) { return buf }
  const decipher = crypto.createDecipher('aes-256-ctr', password)
  return Buffer.concat([decipher.update(buf), decipher.final()])
}
