const template = require('fs').readFileSync(`${__dirname}/inject.js`).toString()
const { createFilter } = require('rollup-pluginutils')
const h = require('hub.js')
const net = require('net')

module.exports = (options = {}) => {
  const filter = createFilter( options.include, options.exclude )
  const host = options.host || `(location.host||'localhost').split(':')[0]`
  const hub = h()
  let inject, entry

  getPort(options.port || 3000, port => {
    inject = template.replace('$HOST', host).replace('$PORT', port)
    hub.set({ port })
  })

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

function getPort (port, cb) {
  const server = net.createServer()
  server.on('error', err => getPort(++port, cb))
  server.listen(port, err => {
    server.once('close', () => cb(port))
    server.close()
  })
}
