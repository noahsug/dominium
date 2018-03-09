import _ from 'underscore'
import getPullRequests from './getPullRequests'
import config from './config'

function prsEqual(actualPrs, expectedPrs) {
  expectedPrs = _.sortBy(expectedPrs, pr => pr.owners.join(','))
  actualPrs = _.sortBy(actualPrs, pr => pr.owners.join(','))

  expect(actualPrs.length).toBe(expectedPrs.length)
  actualPrs.forEach((actual, i) => {
    const expected = expectedPrs[i]
    expect(actual.owners).toEqual(expected.owners)
    expect(actual.files).toEqual(expected.files)
  })
}

test('splits PRs by owner', () => {
  const prs = getPullRequests({
    A: ['1', '2'],
    B: ['3', '4', '5'],
    C: ['6', '7', '8', '9'],
  })
  prsEqual(prs, [
    { owners: ['A'], files: ['1', '2'] },
    { owners: ['B'], files: ['3', '4', '5'] },
    { owners: ['C'], files: ['6', '7', '8', '9'] },
  ])
})

test('gets 1 prs when covered by 1 group of 2+ owners', () => {
  const prs = getPullRequests({
    A: ['1', '2'],
    B: ['1', '2', '3'],
    C: ['1', '2', '3'],
    D: ['3'],
  })
  prsEqual(prs, [{ owners: ['B', 'C'], files: ['1', '2', '3'] }])
})

test('gets 2 prs when covered by 2 groups of 2+ owners', () => {
  const prs = getPullRequests({
    A: ['1', '2'],
    B: ['1', '2', '3', '4'],
    C: ['3', '4'],
    D: ['4'],
  })
  prsEqual(prs, [
    { owners: ['A', 'B'], files: ['1', '2'] },
    { owners: ['B', 'C'], files: ['3', '4'] },
  ])
})

test('reduces # of prs by adding remaining files from single owner', () => {
  const prs = getPullRequests({
    A: ['1', '2', '3'],
    B: ['4'],
    C: ['1', '2', '3', '4', '5'],
  })
  prsEqual(prs, [{ owners: ['A', 'C'], files: ['1', '2', '3', '4', '5'] }])
})

test('covers all files', () => {
  const prs = getPullRequests({
    A: ['1', '2', '3'],
    B: ['3', '4', '5'],
    C: ['5', '6'],
  })
  prsEqual(prs, [
    { owners: ['A'], files: ['1', '2', '3'] },
    { owners: ['B'], files: ['4', '5'] },
    { owners: ['C'], files: ['6'] },
  ])
})

test('correctly assigns owners', () => {
  const prs = getPullRequests({
    A: ['1', '2', '3'],
    B: ['3', '4', '5'],
    C: ['5'],
    D: ['6'],
    E: ['6'],
  })
  prsEqual(prs, [
    { owners: ['A'], files: ['1', '2', '3'] },
    { owners: ['B'], files: ['4', '5'] },
    { owners: ['D', 'E'], files: ['6'] },
  ])
})

test('splits prs that are over max file limit', () => {
  const initial = config.maxFiles
  config.maxFiles = 3

  const prs = getPullRequests({
    A: ['1', '2'],
    B: ['3', '4', '5'],
    C: ['6', '7', '8', '9'],
  })
  prsEqual(prs, [
    { owners: ['A'], files: ['1', '2'] },
    { owners: ['B'], files: ['3', '4', '5'] },
    { owners: ['C'], files: ['6', '7'] },
    { owners: ['C'], files: ['8', '9'] },
  ])

  config.maxFiles = initial
})
