import 'babel-register'
import test from 'ava'
import { nfcall } from 'q'
import { stat, readFile } from 'fs'

import oxyo from '../src'

/**
 * Main
 */

test.serial('should fail to encode if the secret is bigger than the carrier', t =>
  oxyo.encode('./fixtures/apercu.jpeg', './tmp/out1.png', null, './fixtures/ny.jpg')
    .catch(err => t.is(err.message, 'carrier not big enough.'))
)

test.serial('encode an image', t =>
  oxyo.encode('./fixtures/ny.jpg', './tmp/out1.png', null, './fixtures/apercu.jpeg')
    .then(() => nfcall(stat, './tmp/out1.png'))
    .then(() => t.pass())
)

test.serial('decode the secret embedded in the output image and compare it to original', t =>
  oxyo.decode('./tmp/out1.png', './tmp/decoded1', null)
    .then(() => Promise.all([
      nfcall(readFile, './fixtures/apercu.jpeg'),
      nfcall(readFile, './tmp/decoded1.jpeg')
    ]))
    .then(([original, decoded]) => {
      t.is(original.compare(decoded), 0, 'original and decoded buffers should be exactly the same.')
      t.pass()
    })
)

test.serial('encode an image with a password', t =>
  oxyo.encode('./fixtures/ny.jpg', './tmp/out2.png', 'adminadmin ;)', './fixtures/apercu.jpeg')
    .then(() => nfcall(stat, './tmp/out2.png'))
    .then(() => t.pass())
)

test.serial('should throw that a password is required', t =>
  oxyo.decode('./tmp/out2.png', './tmp/decoded2', null)
    .catch(err => t.is(err.message, 'file encrypted, a password is required.'))
)

test.serial('should fail to decode with an invalid password', t =>
  oxyo.decode('./tmp/out2.png', './tmp/decoded2', 'iamthebestscriptkiddie')
    .then(() => Promise.all([
      nfcall(readFile, './fixtures/apercu.jpeg'),
      nfcall(readFile, './tmp/decoded2.jpeg')
    ]))
    .then(([original, decoded]) => {
      t.not(original.compare(decoded), 0, 'original and decoded should not be the same.')
      t.pass()
    })
)

test.serial('should succeed to decode with an valid password', t =>
  oxyo.decode('./tmp/out2.png', './tmp/decoded2', 'adminadmin ;)')
    .then(() => Promise.all([
      nfcall(readFile, './fixtures/apercu.jpeg'),
      nfcall(readFile, './tmp/decoded2.jpeg')
    ]))
    .then(([original, decoded]) => {
      t.is(original.compare(decoded), 0, 'original and decoded should be the same.')
      t.pass()
    })
)

test.serial('should encode a binary without extension', t =>
  oxyo.encode('./fixtures/ny.jpg', './tmp/out3.png', null, './fixtures/man')
    .then(() => nfcall(stat, './tmp/out3.png'))
    .then(() => t.pass())
)

test.serial('should decode the binary without diff with the original', t =>
  oxyo.decode('./tmp/out3.png', './tmp/decoded3')
    .then(() => Promise.all([
      nfcall(readFile, './fixtures/man'),
      nfcall(readFile, './tmp/decoded3')
    ]))
    .then(([original, decoded]) => {
      t.is(original.compare(decoded), 0, 'original and decoded should be the same.')
      t.pass()
    })
)

/**
 * Basic error handling & exports
 */
test('require should export two functions', t => {
  t.truthy(oxyo.encode)
  t.truthy(oxyo.decode)
  t.is(Object.keys(oxyo).length, 2)
})

test('should fail to encode when output is not a png', t =>
  oxyo.encode('./fixtures/ny.jpg', './tmp/out1.jpg', null, './fixtures/apercu.jpeg')
    .catch(err => t.is(err, 'output file needs to be a png.'))
)

test('should fail to encode when carrier is neither a png or jpg', t =>
  oxyo.encode('./fixtures/ny.gif', './tmp/out1.png', null, './fixtures/apercu.jpeg')
    .catch(err => t.is(err, 'carrier file type not supported.'))
)

test('should fail to encode when secret extension length is greater than 6', t =>
  oxyo.encode('./fixtures/ny.png', './tmp/out1.png', null, './fixtures/apercu.microsoft')
    .catch(err => t.is(err, 'secret extension length not supported.'))
)

test('should fail to decode when carrier is not a png', t =>
  oxyo.decode('./tmp/out1.jpg', './tmp/decoded')
    .catch(err => t.is(err, 'carrier file needs to be a png.'))
)

test('should fail when providing an extension to the output in decode', t =>
  oxyo.decode('./tmp/out1.png', './tmp/decoded.jpeg')
    .catch(err => t.is(err, 'the output extension will be automatically added.'))
)
