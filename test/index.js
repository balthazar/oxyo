import 'babel-register'
import test from 'ava'
import { nfcall } from 'q'
import { stat, readFile } from 'fs'

import oxyo from '../src'

/**
 * Main
 */
test.serial('encode an image without any errors', t =>
  oxyo.encode('./fixtures/ny.jpg', './tmp/out1.png', './fixtures/apercu.jpeg')
    .then(() => nfcall(stat, './tmp/out1.png'))
    .then(() => t.pass())
)

test.serial('decode the secret embedded in the output image and compare it to original', t =>
  oxyo.decode('./tmp/out1.png', './tmp/decoded.jpeg')
    .then(() => Promise.all([
      nfcall(readFile, './fixtures/apercu.jpeg'),
      nfcall(readFile, './tmp/decoded.jpeg')
    ]))
    .then(([original, decoded]) => {
      t.is(original.compare(decoded), 0, 'original and decoded buffers should be exactly the same.')
      t.pass()
    })
)

/**
* Basic error handling
*/
test('require should export two functions', t => {
t.truthy(oxyo.encode)
t.truthy(oxyo.decode)
t.is(Object.keys(oxyo).length, 2)
})

test('should fail to encode when output is not a png', t =>
oxyo.encode('./fixtures/ny.jpg', './tmp/out1.jpg', './fixtures/apercu.jpeg')
  .catch(err => t.is(err, 'output file needs to be a png.'))
)

test('should fail to encode when carrier is neither a png or jpg', t =>
oxyo.encode('./fixtures/ny.gif', './tmp/out1.png', './fixtures/apercu.jpeg')
  .catch(err => t.is(err, 'carrier file type not supported.'))
)

test('should fail to decode when carrier is not a png', t =>
oxyo.decode('./tmp/out1.jpg', './tmp/decoded.png')
  .catch(err => t.is(err, 'carrier file needs to be a png.'))
)
