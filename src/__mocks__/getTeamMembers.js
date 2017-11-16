async function getTeamMembers() {
  return getTeams.__teamMembers
}

getTeamMembers.__setMockTeamMembers = teams => {
  getTeamMembers.__teamMembers = teams
}

export default getTeamMembers
