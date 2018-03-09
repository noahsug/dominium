import getOwnerMap from './getOwnerMap'
import rg from 'ripgrep-js'
import config from './config'

test('reads owners from owners files', async () => {
  rg.__setMockResults([
    { match: 'Al Bob Clare', file: `src/a/${config.ownersFileName}` },
    { match: 'Clare', file: `src/b/${config.ownersFileName}` },
  ])
  const changedFiles = ['src/a/f1', 'src/a/aa/f2', 'src/b/f1', 'src/c/f1']
  const ownerMap = await getOwnerMap(changedFiles)
  expect(ownerMap).toEqual(
    expect.objectContaining({
      Al: ['src/a/f1', 'src/a/aa/f2'],
      Bob: ['src/a/f1', 'src/a/aa/f2'],
      Clare: ['src/a/f1', 'src/a/aa/f2', 'src/b/f1'],
      'no owner': ['src/c/f1'],
    })
  )
})
