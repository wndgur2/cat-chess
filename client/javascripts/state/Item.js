export default class Item {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.desc = data.desc
    this.img = data.img
    this.ad = data.ad
    this.hp = data.hp
    this.armor = data.armor
    this.range = data.range
    this.speed = data.speed
  }

  getStat() {
    let type = this.ad
      ? '공격력'
      : this.hp
        ? '체력'
        : this.armor
          ? '방어력'
          : this.range
            ? '사거리'
            : this.speed
              ? '민첩'
              : ''
    let stat = this.ad || this.hp || this.armor || this.range || this.speed
    return `${type} +${stat}`
  }
}
