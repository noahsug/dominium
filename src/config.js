import path from 'path'

const args = process.argv.slice(2)

const config = {
  gitPath: process.argv[0],
  writePath: path.resolve(process.argv[1], '../'),
  dryRun: args.includes('--dryrun'),
  noCache: args.includes('--no-cache'),
  ownersFile: 'MANDATORY_REVIEWERS',
  teamPrefix: 'airbnb/',
  noOwnerBranchName: 'unowned',
  teams: {
    'mt-places': ['emily-zhao', 'andrew-scheuermann'],
  },
}

export default config
