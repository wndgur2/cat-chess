// Wire contract between src/ and client/. Both sides import from here.

const GAME_STATES = {
  ARRANGE: 'arrange',
  READY: 'ready',
  BATTLE: 'battle',
  FINISH: 'finish',
}

const CLIENT_MESSAGES = {
  REQ_NEW_ID: 'reqNewId',
  START_MATCHING: 'startMatching',
  CANCEL_MATCHING: 'cancelMatching',
  REQ_SURRENDER: 'reqSurrender',
  REQ_BUY_CAT: 'reqBuyCat',
  REQ_PUT_CAT: 'reqPutCat',
  REQ_SELL_CAT: 'reqSellCat',
  REQ_RELOAD: 'reqReload',
  REQ_BUY_EXP: 'reqBuyExp',
  REQ_GIVE_ITEM: 'reqGiveItem',
}

const SERVER_MESSAGES = {
  RES_NEW_ID: 'resNewId',
  GAME_MATCHED: 'gameMatched',
  GAME_END: 'gameEnd',
  PLAYER_DATA: 'playerData',
  TIME_UPDATE: 'timeUpdate',
  STAGE_UPDATE: 'stageUpdate',
  STATE_UPDATE: 'stateUpdate',
  BOARD_UPDATE: 'boardUpdate',
  QUEUE_UPDATE: 'queueUpdate',
  EXP_UPDATE: 'expUpdate',
  LEVEL_UPDATE: 'levelUpdate',
  MONEY_UPDATE: 'moneyUpdate',
  SHOP_UPDATE: 'shopUpdate',
  ITEM_UPDATE: 'itemUpdate',
  HP_UPDATE: 'hpUpdate',
  SYNERGIES_UPDATE: 'synergiesUpdate',
  WINNING_UPDATE: 'winningUpdate',
  LOSING_UPDATE: 'losingUpdate',
  BATTLE_READY: 'battleReady',
  BATTLE_INIT: 'battleInit',
  UNIT_ATTACK: 'unitAttack',
  UNIT_CAST: 'unitCast',
  UNIT_MANA_GEN: 'unitManaGen',
  UNIT_MOVE: 'unitMove',
  UNIT_DIE: 'unitDie',
  UNIT_ITEM_UPDATE: 'unitItemUpdate',
}

module.exports = { GAME_STATES, CLIENT_MESSAGES, SERVER_MESSAGES }
