import { GAME_STATES, SERVER_MESSAGES } from '../../../shared/protocol.js'
import Battle from '../state/Battle.js'
import Game from '../state/Game.js'
import Item from '../state/Item.js'
import Player from '../state/Player.js'
import Unit from '../state/Unit.js'
import Socket from '../net/Socket.js'
import Hud from '../view/Hud.js'
import UI from '../view/UI.js'
import UnitInfoPanel from '../view/UnitInfoPanel.js'
import User from '../view/User.js'
import Painter from '../view/3D/Painter.js'
import UnitView from '../view/3D/UnitView.js'
import { LOSE, WIN } from '../constants/texts.js'
import { getText } from '../utils.js'

const S = SERVER_MESSAGES

// Events from a battle this client has moved on from are dropped.
const forCurrentBattle = (handler) => (data) => {
  if (Battle.id != data.battleId) return
  handler(data)
}

// The one place where server messages meet state and views.
const HANDLERS = {
  [S.GAME_MATCHED]: (data) => {
    UI.gameStart()
    Game.init(data.players)
    Hud.renderPlayers(Game.players)
  },
  [S.PLAYER_DATA]: (data) => {
    const p = Player.getPlayerById(data.id)
    if (!p) return
    p.hp = data.hp
    Hud.renderHp(p)
  },
  [S.TIME_UPDATE]: (data) => {
    if (data.time) setTime(data.time)
  },
  [S.STAGE_UPDATE]: (data) => {
    Game.round = data.round
    Game.stage = data.stage
    UnitInfoPanel.hide()
  },
  [S.STATE_UPDATE]: (data) => {
    Game.state = data.state
    if (data.time) setTime(data.time)
  },
  [S.BOARD_UPDATE]: (data) => {
    const p = Player.getPlayerById(data.player)
    p.setBoard(data.board)
    if (!p.isLocal) return
    if (Game.state != GAME_STATES.ARRANGE) return
    Painter._board = [...new Array(3).fill(null).map(() => new Array(5).fill(null)), ...p.board]
  },
  [S.QUEUE_UPDATE]: (data) => {
    const p = Player.getPlayerById(data.player)
    p.setQueue(data.queue)
    if (p.isLocal) Painter._allyQueue = p.queue
  },
  [S.EXP_UPDATE]: (data) => {
    Player.player.exp = data.exp
    Player.player.maxExp = data.maxExp
    Hud.renderExp(Player.player)
  },
  [S.LEVEL_UPDATE]: (data) => {
    const p = Player.getPlayerById(data.player)
    p.level = data.level
    Hud.renderLevel(p)
  },
  [S.MONEY_UPDATE]: (data) => {
    const p = Player.getPlayerById(data.player)
    p.money = data.money
    Hud.renderMoney(p)
  },
  [S.SHOP_UPDATE]: (data) => {
    const p = Player.getPlayerById(data.player)
    // id만 받아와서 클라이언트 이름 사용하도록 개선
    p.shop = data.shop
    Hud.renderShop(p)
  },
  [S.ITEM_UPDATE]: (data) => {
    const p = Player.getPlayerById(data.player)
    p.items = data.items.map((item) => (item ? new Item(item) : null))
    Hud.renderItems(p)
  },
  [S.HP_UPDATE]: (data) => {
    const p = Player.getPlayerById(data.player)
    if (!p) return
    p.hp = data.hp
    Hud.renderHp(p)
  },
  [S.SYNERGIES_UPDATE]: (data) => {
    const p = Player.getPlayerById(data.player)
    p.synergies = data.synergies
    Hud.renderSynergies(p)
  },
  [S.WINNING_UPDATE]: (data) => {
    Player.getPlayerById(data.player).winning = parseInt(data.winning)
  },
  [S.LOSING_UPDATE]: (data) => {
    Player.getPlayerById(data.player).losing = parseInt(data.losing)
  },
  [S.BATTLE_READY]: (data) => {
    Battle.id = data.battleId
    Battle.board = data.board.map((row) => row.map((cat) => (cat ? new Unit(cat) : null)))
    Battle.ready(data.reversed)
    Painter._board = Battle.board
    Hud.clearDamage()
    UnitInfoPanel.hide()
  },
  [S.BATTLE_INIT]: () => {
    console.log('battle started.')
  },
  [S.UNIT_ATTACK]: forCurrentBattle(({ attacker, target, damage }) => {
    const attackerCat = Battle.getUnitByUid(attacker.uid)
    const targetCat = Battle.getUnitByUid(target.uid)
    if (!attackerCat || !targetCat) return

    UnitView.attack(attackerCat, targetCat)
    UnitView.setHp(targetCat, parseInt(target.hp))
    Painter.hitEffect(attackerCat, targetCat, damage)
    if (attackerCat.owner === Player.player.id)
      Hud.addDamage(Player.getPlayerById(attackerCat.owner), attackerCat, damage)
  }),
  [S.UNIT_CAST]: forCurrentBattle(({ uid }) => {
    const cat = Battle.getUnitByUid(uid)
    if (!cat) return
    UnitView.setMp(cat, cat.mp - cat.maxMp)
    Painter.castEffect(cat)
  }),
  [S.UNIT_MANA_GEN]: forCurrentBattle(({ uid, mp }) => {
    const cat = Battle.getUnitByUid(uid)
    if (!cat) return
    UnitView.setMp(cat, mp)
  }),
  [S.UNIT_MOVE]: forCurrentBattle(({ uid, nextX, nextY }) => {
    const cat = Battle.getUnitByUid(uid)
    if (!cat) return
    UnitView.move(cat, nextX, nextY)
    Battle.moveUnit(cat, nextX, nextY)
  }),
  [S.UNIT_DIE]: forCurrentBattle(({ uid }) => {
    const cat = Battle.getUnitByUid(uid)
    if (!cat) return
    UnitView.die(cat)
    Battle.removeUnit(cat)
  }),
  [S.UNIT_ITEM_UPDATE]: forCurrentBattle(({ unit }) => {
    const cat = Battle.getUnitByUid(unit.uid)
    cat.items = unit.items.map((item) => new Item(item))
    Painter.createItemMesh(cat)
  }),
  [S.GAME_END]: (data) => {
    if (data.winner === Socket.id) {
      if (User.isAuthenticated()) User.saveLog('win')
      alert(getText(WIN))
    } else {
      if (User.isAuthenticated()) User.saveLog('lose')
      alert(getText(LOSE))
    }
    UI.gameEnd()
  },
}

function setTime(time) {
  Game.time = time
  Hud.renderTime(time)
}

export function handleServerMessage(type, data) {
  const handler = HANDLERS[type]
  if (handler) handler(data)
}
