import Socket from '../net/Socket.js'
import Unit from './Unit.js'

export default class Player {
  static player = null
  static players = []
  /**
   * @param {String} id
   * @returns {Player}
   */
  static getPlayerById(id) {
    return Player.players.find((player) => player.id === id)
  }

  constructor(id) {
    Player.players.push(this)
    this.id = id
    if (id === Socket.id) Player.player = this
    this.board = [
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
    ]
    this.queue = [null, null, null, null, null, null, null]
    this.items = [null, null, null, null, null, null]
    this.synergies = {}
    this.damageChart = {}
  }

  get isLocal() {
    return this.id === Socket.id
  }

  setBoard(newBoard) {
    // 여기랑 큐 client data에서 생성하도록?
    // 2성은? ... 언어 설정(디바이스 설정) 때문에
    this.board = newBoard.map((row) => row.map((cat) => (cat ? new Unit(cat) : null)))
  }

  setQueue(newQueue) {
    this.queue = newQueue.map((cat) => (cat ? new Unit(cat) : null))
  }
}
