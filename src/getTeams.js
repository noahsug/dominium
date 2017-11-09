import fetch from 'node-fetch-json'
import _ from 'underscore'
import fs from 'fs'
import config from './config'
import path from 'path'

const teamsPath = path.resolve(config.writePath, 'teams.json')
const accessToken = '16a890797521394521bd64dfc235f2502ab58366'
const gitUrl = 'https://git.musta.ch/api/v3'
const org = 'airbnb'
// process.env.AUTH_TOKEN

async function getTeams() {
  if (config.noCache) return await writeTeams()
  let teams
  try {
    teams = await readTeams()
  } catch (e) {
    teams = await writeTeams()
  }
  return teams
}

async function writeTeams() {
  const teams = await fetchTeams()
  return new Promise(resolve => {
    fs.writeFile(teamsPath, JSON.stringify(teams), (err, result) => {
      if (err) throw new Error(`Failed to write teams: ${err}`)
      resolve(teams)
    })
  })
}

async function fetchTeams() {
  const teams = {}
  let page = 1
  let next = await getNextTeams(page)
  while (!_.isEmpty(next)) {
    Object.assign(teams, next)
    page += 1
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
    '?per_page=100',
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

async function readTeams() {
  return new Promise((resolve, reject) => {
    fs.readFile(teamsPath, 'utf8', (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(JSON.parse(result))
      }
    })
  })
}

let teams
async function cachedGetTeams() {
  if (!teams) teams = await getTeams()
  return teams
}

export default cachedGetTeams
