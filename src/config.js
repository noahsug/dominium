import path from 'path'

const args = process.argv.slice(2)

const config = {
  gitPath: process.cwd(),
  writePath: path.resolve(process.argv[1], '../'),
  dryRun: args.includes('--dryrun'),
  noCache: args.includes('--no-cache'),
  ownerFileName: 'MANDATORY_REVIEWERS',
  teamPrefix: 'airbnb/',
  noOwnerBranchName: 'unowned',
  gitApiUrl: 'https://git.musta.ch/api/v3',
  accessToken: process.env.AUTH_TOKEN,
}

console.log(process.env.AUTH_TOKEN)

export default config
