import getPullRequests from './getPullRequests'

function prsAreEqual(actualPrs, expectedPrs) {
  expect(actualPrs.length).toBe(expectedPrs.length)
  actualPrs.forEach((actual, i) => {
    const expected = expectedPrs[i]
    expect(actual.owners).toEqual(expected.owners)
    expect(actual.files).toEqual(expected.files)
  })
}

test('gets 1 prs when covered by 1 group of 2+ owners', () => {
  const prs = getPullRequests({
    A: ['1', '2'],
    B: ['1', '2', '3'],
    C: ['1', '2', '3'],
    D: ['3'],
  })
  prsAreEqual(prs, [{ owners: ['B', 'C'], files: ['1', '2', '3'] }])
})

test('gets 2 prs when covered by 2 groups of 2+ owners', () => {
  const prs = getPullRequests({
    A: ['1', '2'],
    B: ['1', '2', '3', '4'],
    C: ['3', '4'],
    D: ['4'],
  })
  prsAreEqual(prs, [
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
  prsAreEqual(prs, [{ owners: ['A', 'C'], files: ['1', '2', '3', '4', '5'] }])
})

test('covers all files', () => {
  const prs = getPullRequests({
    A: ['1', '2', '3'],
    B: ['3', '4', '5'],
    C: ['5', '6'],
  })
  prsAreEqual(prs, [
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
  prsAreEqual(prs, [
    { owners: ['A'], files: ['1', '2', '3'] },
    { owners: ['B'], files: ['4', '5'] },
    { owners: ['D', 'E'], files: ['6'] },
  ])
})
