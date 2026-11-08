import Battle from '../../state/Battle.js'
import Game from '../../state/Game.js'
import { GAME_STATES } from '../../../../shared/protocol.js'
import { THREE_CONSTS } from '../../constants/threeConsts.js'

function getBoardCoords(x, z) {
  switch (Game.state) {
    case GAME_STATES.ARRANGE:
      return [...THREE_CONSTS.COORDINATES.BOARD[z + 3][x]]
    case GAME_STATES.FINISH:
      return [...THREE_CONSTS.COORDINATES.BOARD[z + 3][x]]
    case GAME_STATES.BATTLE:
      return Battle.reversed
        ? [...THREE_CONSTS.COORDINATES.BOARD[5 - z][4 - x]]
        : [...THREE_CONSTS.COORDINATES.BOARD[z][x]]
    case GAME_STATES.READY:
      return Battle.reversed
        ? [...THREE_CONSTS.COORDINATES.BOARD[5 - z][4 - x]]
        : [...THREE_CONSTS.COORDINATES.BOARD[z][x]]
    default:
      console.log('getBoardCoords: invalid state')
      return [0, 0, 0]
  }
}

export { getBoardCoords }
