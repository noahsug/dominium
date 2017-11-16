import { gitApiUrl, accessToken } from './config'

async function fetchList(apiPath) {
  let results = []
  let page = 1
  let nextPage = await getNext(apiPath, page)
  while (nextPage.length) {
    results = results.concat(nextPage)
    page += 1
    nextPage = await getNext(apiPath, page)
  }
  return results
}

async function getNext(apiPath, page) {
  const url = [
    gitApiUrl,
    apiPath,
    '?per_page=100',
    `&access_token=${accessToken}`,
    `&page=${page}`,
  ].join('')
  return await fetch(url, { method: 'GET' })
}
