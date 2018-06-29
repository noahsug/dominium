#!/usr/bin/env node

import program from 'commander'
import { version } from '../package'
import config, { setConfig } from './config'
import run from './run'

program
  .version(version)
  .option('--owners-file [name]', 'name of file containing list of owners')
  .option('--max-files [max]', 'max number of files per branch')
  .parse(process.argv)

setConfig({
  ownersFileName: program.ownersFile,
  maxFiles: program.maxFiles,
  gitPath: process.cwd(),
})
run()
