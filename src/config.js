import path from 'path'
import cosmiconfig from 'cosmiconfig'

const explorer = cosmiconfig('dominium', { sync: true })
const loadedConfig = (explorer.load('.') || { config: {} }).config
const args = process.argv.slice(2)

const config = {
  ownerFileName: loadedConfig.ownerFileName || 'MANDATORY_REVIEWERS',
  ownerCommentTag: loadedConfig.ownerCommentTag || 'MANDATORY_REVIEWERS',
  noOwnerBranchSuffix: loadedConfig.noOwnerBranchSuffix || 'unowned',
  accessToken: loadedConfig.accessToken || process.env.AUTH_TOKEN,
  teamPrefix: loadedConfig.teamPrefix || '',
  gitApiUrl: loadedConfig.gitApiUrl,
  gitPath: process.cwd(),
}

export default config
