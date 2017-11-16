function rg() {
  return Promise.resolve(rg.__results)
}

rg.__setMockResults = results => {
  rg.__results = results
}

export default rg
