import Player from './Player.js'

export default class Game {
  static init(players) {
    Game.players = players.map((id) => {
      const p = Player.getPlayerById(id)
      if (p) return p
      else return new Player(id)
    })
  }
}
