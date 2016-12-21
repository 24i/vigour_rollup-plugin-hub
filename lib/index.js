const template = require('fs').readFileSync(`${__dirname}/inject.js`).toString()
const { createFilter } = require('rollup-pluginutils')
const h = require('hub.js')

module.exports = (options = {}) => {
  const filter = createFilter( options.include, options.exclude )
  const host = options.host || `(location.host||'localhost').split(':')[0]`
  const port = options.port || 35729
  const hub = h({ port })
  const inject = template.replace('$HOST', host).replace('$PORT', port)
  let entry

  return {
    name: 'hub',
    transform (code, id) {
      if (!filter(id)) return null
      if (!entry) entry = id
      if (entry === id) return `${inject}\n${code}`
    },
    onwrite (options, bundle) {
      hub.set({ reload: Date.now() })
    }
  }
}
