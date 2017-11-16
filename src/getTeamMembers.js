import fetch from 'node-fetch-json'
import _ from 'underscore'
import fs from 'fs'
import path from 'path'
import config from './config'
import github from './github'
import { memoize } from './utils'

const teamsPath = path.resolve(config.writePath, 'teams.json')

async function getTeamMembers(team) {
  // const teams = await getTeams()
  const path = `/teams/${teamId}/members`
}

const getTeams = memoize(async () => {
  if (config.noCache) return await writeTeams()
  let teams
  try {
    teams = await readTeams()
  } catch (e) {
    teams = await writeTeams()
  }
  return teams
})

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
  // '/orgs/airbnb/teams'
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

export default getTeamMembers
