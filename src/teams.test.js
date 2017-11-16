import getTeamMembers from './getTeamMembers'
import { teamPrefix } from './config'

test('reads owners from owners files', async () => {
  getTeamMembers.__setMockTeamMembers({
    [`${teamPrefix}A`]: ['Al', 'Clare'],
    [`${teamPrefix}B`]: ['Clare'],
    [`${teamPrefix}C`]: ['Al', 'Bob'],
  })
  const ownerMap = {
    [`${teamPrefix}A`]: ['src/a/f1'],
    [`${teamPrefix}B`]: ['src/b/f2', 'src/b/bb/f3'],
    [`${teamPrefix}C`]: ['src/a/aa/f4', 'src/c/f5'],
    Al: ['src/a/f1', 'src/d/f9'],
    Dean: ['src/d/f9'],
  }
  replaceTeamsWithOwners(ownerMap)
  expect(ownerMap).toEqual(
    expect.objectContaining({
      Al: ['src/a/f1', 'src/d/f9', 'src/a/aa/f4', 'src/c/f5'],
      Bob: ['src/a/aa/f4', 'src/c/f5'],
      Clare: ['src/a/f1', 'src/b/f2', 'src/b/bb/f3'],
      Dean: ['src/d/f9'],
    })
  )
})
