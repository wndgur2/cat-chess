const Connection = require('./Connection.js')
const Player = require('../game/Player.js')
const Game = require('../game/Game.js')
const { getPlayerById, getPlayerByConnection } = require('../game/playerRegistry.js')
const { CLIENT_MESSAGES, SERVER_MESSAGES } = require('../../shared/protocol.js')
const webSocket = require('ws')

// Messages that act on a player who is already registered.
const PLAYER_HANDLERS = {
  [CLIENT_MESSAGES.REQ_SURRENDER]: (p) => p.surrender(),
  [CLIENT_MESSAGES.REQ_BUY_CAT]: (p, data) => p.buyCat(data.index),
  [CLIENT_MESSAGES.REQ_PUT_CAT]: (p, data) => p.putCat(data.uid, data.to),
  [CLIENT_MESSAGES.REQ_SELL_CAT]: (p, data) => p.sellCat(data.uid),
  [CLIENT_MESSAGES.REQ_RELOAD]: (p) => p.reload(),
  [CLIENT_MESSAGES.REQ_BUY_EXP]: (p) => p.buyExp(),
  [CLIENT_MESSAGES.REQ_GIVE_ITEM]: (p, data) => p.giveItem(data.item, data.uid),
}

function handleMessage(connection, from, type, data) {
  switch (type) {
    case CLIENT_MESSAGES.REQ_NEW_ID:
      connection.send(SERVER_MESSAGES.RES_NEW_ID, Player.getNewId())
      return
    case CLIENT_MESSAGES.START_MATCHING:
      Game.startMatching(from, connection)
      return
    case CLIENT_MESSAGES.CANCEL_MATCHING:
      Game.cancelMatching(from)
      return
  }

  const handler = PLAYER_HANDLERS[type]
  const p = getPlayerById(from)
  if (handler && p) handler(p, data)
}

module.exports = (server) => {
  const wss = new webSocket.Server({ server })

  wss.on('connection', (ws, req) => {
    console.log('New client connected')
    const connection = new Connection(ws)

    ws.on('message', (message) => {
      let msg = JSON.parse(message)
      let { from, type, data } = msg
      console.log(msg)
      try {
        handleMessage(connection, from, type, data)
      } catch (e) {
        console.error(e)
      }
    })

    ws.on('error', (error) => {
      console.error(error)
    })

    ws.on('close', () => {
      console.log('Client disconnected')
      const p = getPlayerByConnection(connection)
      if (p) {
        if (Game.matchingPlayers.includes(p)) {
          Game.cancelMatching(p.id)
          console.log('Matching canceled', Game.matchingPlayers)
        }
      }
    })
  })
}
