import Player from './Player.js'

export default class Battle {
  static board = []

  static ready(reversed) {
    this.reversed = reversed
    if (reversed) Battle.board = Battle.board.map((row) => row.reverse()).reverse()
    this.board.forEach((row) => {
      row.forEach((cat) => {
        if (!cat) return
        cat.inBattle = true
        cat.mp = 0
      })
    })
    Player.players.forEach((p) => (p.damageChart = {}))
  }

  static getUnitByUid(uid) {
    let unit
    this.board.forEach((row) => {
      row.forEach((u) => {
        if (!u) return
        if (u.uid == uid) unit = u
      })
    })
    return unit
  }

  static removeUnit(cat) {
    Battle.board[this.reversed ? 5 - cat.y : cat.y][this.reversed ? 4 - cat.x : cat.x] = null
  }

  static moveUnit(cat, nextX, nextY) {
    if (this.reversed) {
      Battle.board[5 - cat.y][4 - cat.x] = null
      Battle.board[5 - nextY][4 - nextX] = cat
    } else {
      Battle.board[cat.y][cat.x] = null
      Battle.board[nextY][nextX] = cat
    }
    cat.x = nextX
    cat.y = nextY
  }
}
