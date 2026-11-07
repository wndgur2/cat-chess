import Item from './Item.js'
import { COST_COLORS } from '../constants/consts.js'

export default class Unit {
  static async fetchData() {
    await fetch('/data/cats')
      .then((res) => res.json())
      .then((data) => {
        Unit.CATS = data
        return data
      })
    await fetch('/data/creeps')
      .then((res) => res.json())
      .then((data) => {
        Unit.CREEPS = data
        return data
      })
  }

  constructor(data) {
    // 스태틱 데이터는 client에 fetch된 데이터서, 나머진 서버에서 불러오기
    this.name = Unit.CATS.concat(Unit.CREEPS).find((unit) => unit.id === data.id).name
    this.desc = Unit.CATS.concat(Unit.CREEPS).find((unit) => unit.id === data.id).desc
    this.id = data.id
    this.uid = data.uid
    this.tier = data.tier
    this.skill = data.skill
    this.synergies = data.synergies
    this.ad = data.ad
    this.speed = data.speed
    this.range = data.range
    this.maxHp = data.maxHp
    this.hp = data.hp
    this.maxMp = data.maxMp
    this.mp = data.mp
    this.armor = data.armor
    this.originalCost = data.originalCost
    this.cost = data.cost
    this.owner = data.owner
    this.items = data.items.map((item) => (item ? new Item(item) : null))

    this.x = data.x
    this.y = data.y

    this.inBattle = false
    this.focused = false

    this.color = COST_COLORS[this.originalCost]

    /**
     * Built by Painter the first time the unit is drawn.
     * @type {import('three').Group}
     */
    this.mesh = null
  }
}
