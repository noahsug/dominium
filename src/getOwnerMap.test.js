import getOwnerMap from './getOwnerMap'
import rg from 'ripgrep-js'
import { ownerFileName } from './config'

test('reads owners from owners files', async () => {
  rg.__setMockResults([
    { match: 'Al Bob Clare', file: `src/a/${ownerFileName}` },
    { match: 'Clare', file: `src/b/${ownerFileName}` },
  ])
  const changedFiles = ['src/a/f1', 'src/a/aa/f2', 'src/b/f1', 'src/c/f1']
  const ownerMap = await getOwnerMap(changedFiles)
  expect(ownerMap).toEqual(
    expect.objectContaining({
      Al: ['src/a/f1', 'src/a/aa/f2'],
      Bob: ['src/a/f1', 'src/a/aa/f2'],
      Clare: ['src/a/f1', 'src/a/aa/f2', 'src/b/f1'],
      unowned: ['src/c/f1'],
    })
  )
})
