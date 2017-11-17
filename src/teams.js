// TODO: Implement

import getTeamMembers from './getTeamMembers'

async function replaceTeamsWithOwners(ownerMap) {
  //const result = {}
  //for (const teamOrOwner of teamsAndOwners) {
  //  const ownersFromTeam = teams[teamOrOwner]
  //  if (ownersFromTeam) {
  //    ownersFromTeam.forEach(owner => {
  //      if (owner) result[owner] = true
  //    })
  //  } else {
  //    result[ownerOrTeam] = true
  //  }
  //}
  //return Object.keys(result)
}

async function replaceOwnersWithTeams(pullRequests) {}

export default { replaceTeamsWithOwners, replaceOwnersWithTeams }
