import path from 'path'
import cosmiconfig from 'cosmiconfig'

const explorer = cosmiconfig('dominium', { sync: true })
const loadedConfig = (explorer.load('.') || { config: {} }).config
const args = process.argv.slice(2)

const config = {
  ownersFileName: loadedConfig.ownersFileName || 'MANDATORY_REVIEWERS',
  ownersCommentTag: loadedConfig.ownersCommentTag || 'MANDATORY_REVIEWERS',
  gitPath: process.cwd(),
}

export default config
