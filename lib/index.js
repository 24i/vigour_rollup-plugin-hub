const template = require('fs').readFileSync(`${__dirname}/inject.js`).toString()
const { createFilter } = require('rollup-pluginutils')
const MagicString = require('magic-string')
const h = require('hub.js')
const net = require('net')

module.exports = (options = {}) => {
  const filter = createFilter(options.include, options.exclude)
  const host = options.host || `(location.host||'localhost').split(':')[0]`
  const hub = h()

  let inject = template.replace('$HOST', host)
  let entry

  getPort(options.port || 3000, port => {
    inject = inject.replace('$PORT', port)
    hub.set({ port })
  })

  return {
    name: 'hub',
    transform (code, id) {
      if (!filter(id)) return null
      if (!entry) entry = id
      if (entry === id) {
        const s = new MagicString(code)
        const result = { code: s.prepend(inject).toString() }
        if (options.sourceMap !== false) result.map = s.generateMap({ hires: true })
        return result
      }
    },
    onwrite (options, bundle) {
      hub.set({ reload: Date.now() })
    }
  }
}

function getPort (port, cb) {
  const server = net.createServer()
  server.on('error', e => getPort(++port, cb))
  server.listen(port, e => {
    server.once('close', () => cb(port))
    server.close()
  })
}
