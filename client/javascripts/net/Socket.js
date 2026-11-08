import { CLIENT_MESSAGES, SERVER_MESSAGES } from '../../../shared/protocol.js'
import { getCookie } from '../utils.js'

// Transport only. What a message means is decided by the handlers passed to init().
export default class Socket {
  static socket = null
  static id = getCookie('tempId')
  static handlers = null

  /**
   * @param {{ onMessage: Function, onReady: Function, onDisconnected: Function }} handlers
   */
  static init(handlers) {
    Socket.handlers = handlers
    Socket.connect()
  }

  static connect() {
    const url = `wss://${window.location.host}`
    Socket.socket = new WebSocket(url)

    Socket.socket.onopen = function (event) {
      console.log(`web socket connected to ${url}.`)

      if (!Socket.id) Socket.sendMsg(CLIENT_MESSAGES.REQ_NEW_ID, null)
      else Socket.handlers.onReady()
    }

    Socket.socket.onmessage = function (event) {
      const { type, data } = JSON.parse(event.data)

      if (type === SERVER_MESSAGES.RES_NEW_ID) {
        if (Socket.id) return
        Socket.id = data
        document.cookie = `tempId=${encodeURIComponent(data)}`
        Socket.handlers.onReady()
        return
      }

      Socket.handlers.onMessage(type, data)
    }

    Socket.socket.onclose = function (event) {
      Socket.handlers.onDisconnected()
      console.log('Socket disconnected, reconnection on progress...')
      Socket.connect()
    }

    Socket.socket.onerror = function (event) {
      console.error(event)
    }
  }

  static sendMsg(type, data) {
    Socket.socket.send(
      JSON.stringify({
        from: Socket.id,
        type: type,
        data: data,
      }),
    )
  }
}
