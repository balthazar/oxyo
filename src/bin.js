#!/usr/bin/env node
import cmd from 'commander'

import oxyo from '.'
import { version } from '../package.json'

cmd
  .version(version)
  .description(`Either encode secret data into an output file based on the carrier image or decode it from said file into another.
  Not providing a secret file implies that the program will attempt a decode of the carrier image into the output.`)
  .usage('-c <carry> -o <output> -s [secret]')
  .option('-c, --carry <carry>', 'Carrier image')
  .option('-o, --out <out>', 'Output file')
  .option('-s, --secret [secret]', 'The secret to encode')
  .parse(process.argv)

cmd.parse(process.argv)

if (!cmd.carry || !cmd.out) {
  cmd.outputHelp()
  process.exit(-1)
}

oxyo[cmd.secret ? 'encode' : 'decode'](cmd.carry, cmd.out, cmd.secret)
  .catch(err => {
    console.log(`oxyo: ${err.message || err}`) // eslint-disable-line
    process.exit(1)
  })
