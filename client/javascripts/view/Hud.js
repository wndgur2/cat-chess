import Synergy from './Synergy.js'
import { getItemImage } from './itemView.js'
import Unit from '../state/Unit.js'
import { COST_COLORS } from '../constants/consts.js'

// In-game DOM outside the 3D scene. Most of it only shows the local player.
export default class Hud {
  static renderPlayers(players) {
    let playersEl = document.getElementById('playersHp')
    playersEl.innerHTML = ''
    players.forEach((player) => {
      let playerDiv = document.createElement('div')
      playerDiv.id = `player-${player.id}`
      playerDiv.className = 'player'
      let playerId = document.createElement('div')
      playerId.innerHTML = player.id
      playerDiv.appendChild(playerId)
      let playerHp = document.createElement('div')
      playerHp.id = `${player.id}-hp`
      playerHp.innerHTML = player.hp
      playerDiv.appendChild(playerHp)
      playerDiv.appendChild(document.createElement('div'))
      playersEl.appendChild(playerDiv)
    })
  }

  static renderTime(time) {
    document.getElementById('timer').innerHTML = time
  }

  static renderHp(player) {
    let el = document.getElementById(`${player.id}-hp`)
    if (el) el.innerHTML = player.hp
  }

  static renderMoney(player) {
    if (!player.isLocal) return
    document.getElementById('money').innerHTML = player.money
  }

  static renderExp(player) {
    if (!player.isLocal) return
    document.getElementById('curExp').innerHTML = player.exp
    document.getElementById('maxExp').innerHTML = player.maxExp
  }

  static renderLevel(player) {
    if (!player.isLocal) return
    document.getElementById('level').innerHTML = player.level
  }

  static renderShop(player) {
    if (!player.isLocal) return
    const shop = player.shop
    let shopListEl = document.getElementsByClassName('shopListWrapper')
    for (let i = 0; i < shop.length; i++) {
      if (!shop[i]) {
        shopListEl[i].style.visibility = 'hidden'
        continue
      }
      const unitPrototype = Unit.CATS.find((cat) => cat.id === shop[i].id)
      shopListEl[i].style.visibility = 'visible'
      let shopImageWrapper = shopListEl[i].getElementsByClassName('shopImageWrapper')[0]
      shopImageWrapper.style.backgroundImage = `url(/images/portraits/${unitPrototype.id}.jpg)`

      let name = shopListEl[i].getElementsByClassName('shopUnitName')[0]
      name.innerHTML = unitPrototype.name
      name.style.color = COST_COLORS[unitPrototype.cost]

      let cost = shopListEl[i].getElementsByClassName('shopUnitCost')[0]
      cost.innerHTML = unitPrototype.cost

      let synergiesEl = shopListEl[i].getElementsByClassName('shopSynergies')[0]

      synergiesEl.innerHTML = ''

      for (let synergy of shop[i].synergies)
        synergiesEl.appendChild(Synergy.getSynergy(synergy).display())
    }
  }

  static renderItems(player) {
    if (!player.isLocal) return
    const items = player.items
    for (let i = 0; i < items.length; i++) {
      let itemEl = document.getElementById(`inventory-${parseInt(i / 2)}-${i % 2}`)
      if (!items[i]) {
        itemEl.innerHTML = ''
        itemEl.draggable = false
        continue
      }
      itemEl.draggable = true
      itemEl.innerHTML = ''
      itemEl.appendChild(getItemImage(items[i]))
    }
  }

  static renderSynergies(player) {
    if (!player.isLocal) return
    const synergies = player.synergies
    let synergiesEl = document.getElementById('synergies')
    synergiesEl.innerHTML = ''
    for (let synergy in synergies) {
      synergiesEl.appendChild(
        Synergy.getSynergy(synergy).display(synergies[synergy] ? synergies[synergy].length : 0),
      )
    }
  }

  static addDamage(player, unit, damage) {
    if (player.damageChart[unit.uid]) {
      player.damageChart[unit.uid] += damage
      document.getElementById(`${unit.uid}-damage`).innerHTML = `${unit.name}${'★'.repeat(
        unit.tier,
      )}: ${player.damageChart[unit.uid]}`
    } else {
      player.damageChart[unit.uid] = damage
      const damageChartEl = document.getElementById('damage')
      const damageEl = document.createElement('div')
      damageEl.id = `${unit.uid}-damage`
      damageEl.className = 'damage'
      damageEl.innerHTML = `${unit.name}${'★'.repeat(unit.tier)}: ${damage}`
      damageEl.style.color = unit.color
      damageChartEl.appendChild(damageEl)
    }
  }

  static clearDamage() {
    document.getElementById('damage').innerHTML = ''
  }
}
