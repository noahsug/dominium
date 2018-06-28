#!/usr/bin/env node

import program from 'commander'
import { version } from '../package'
import config, { setConfig } from './config'
import run from './run'

program
  .version(version)
  .option(
    '--owners-file',
    `name of file containing list of owners, default 'MANDATORY_REVIEWERS'`
  )
  .option('--max-files', 'max number of files per branch, default Infinity')
  .parse(process.argv)

setConfig({
  ownersFileName: program.ownersFile,
  maxFiles: program.maxFiles,
  gitPath: process.cwd(),
})
run()
