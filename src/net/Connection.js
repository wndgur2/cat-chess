// Everything the game layer knows about a client: it can be sent a message.
class Connection {
  constructor(ws) {
    this.ws = ws
  }

  send(type, data) {
    this.ws.send(JSON.stringify({ type, data }))
  }
}

module.exports = Connection
