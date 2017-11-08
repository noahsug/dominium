import fetch from 'node-fetch-json'
import _ from 'underscore'

const accessToken = '16a890797521394521bd64dfc235f2502ab58366'
const gitUrl = 'https://git.musta.ch/api/v3'
const org = 'airbnb'
// process.env.AUTH_TOKEN

async function getTeams() {
  const teams = {}
  let page = 0
  let next = await getNextTeams(page)
  while (!_.isEmpty(next)) {
    Object.assign(teams, next)
    page += 1000
    next = await getNextTeams(page)
  }
  return teams
}

async function getNextTeams(page) {
  const url = [
    gitUrl,
    '/orgs/',
    org,
    '/teams',
    '?per_page=1',
    `&access_token=${accessToken}`,
    `&page=${page}`,
  ].join('')
  const data = await fetch(url, { method: 'GET' })
  const teams = {}
  for (const team of data) {
    teams[team.name] = team.id
  }
  return teams
}

export default { getTeams }
