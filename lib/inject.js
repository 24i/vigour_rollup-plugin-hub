import __hub from 'hub.js'
const loaded = Date.now()
__hub({
  url: `ws://${$HOST}:$PORT`, //eslint-disable-line
  reload: {
    on: {
      data (val, stamp, struct) {
        const reload = struct.compute()
        if (reload > loaded) window.location.reload()
      }
    }
  }
}).subscribe(true)
