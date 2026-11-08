import Synergy from './Synergy.js'
import { getItemImage, itemInfoHtml } from './itemView.js'
import { popUp, popDown } from './Popup.js'

const imageEls = {}
const skillImageEls = {}

function getUnitImage(unit) {
  if (!imageEls[unit.id]) {
    const imageEl = document.createElement('img')
    imageEl.src = `/images/portraits/${unit.id}.jpg`
    imageEl.id = 'unitImg'
    imageEls[unit.id] = imageEl
  }
  return imageEls[unit.id]
}

function getSkillImage(unit) {
  if (!skillImageEls[unit.skill.id]) {
    const skillImageEl = document.createElement('img')
    skillImageEl.id = 'unitSkill'
    skillImageEl.src = `/images/skills/${unit.skill.id}.jpg`
    skillImageEls[unit.skill.id] = skillImageEl
  }
  return skillImageEls[unit.skill.id]
}

export default class UnitInfoPanel {
  static infoUnit

  static hydrate() {
    let itemEls = document.getElementsByClassName('item')
    for (let i = 0; i < itemEls.length; i++) {
      itemEls[i].onmousemove = itemMouseMove
      itemEls[i].onmouseout = popDown
    }

    let skillEl = document.getElementById('unitSkillWrapper')
    skillEl.onmousemove = skillMouseMove
    skillEl.onmouseout = popDown
  }

  static show(unit) {
    this.infoUnit = unit
    let unitInfoEl = document.getElementById('unitInfo')
    fillUnitInfo(unit)
    unitInfoEl.style.display = 'flex'

    let shopEl = document.getElementById('shop')
    shopEl.style.display = 'none'
  }

  static hide() {
    let unitInfoEl = document.getElementById('unitInfo')
    unitInfoEl.style.display = 'none'
    if (this.infoUnit) this.infoUnit.focused = false
    this.infoUnit = null

    let sellEl = document.getElementById('sell')
    sellEl.style.display = 'none'

    let shoplistEl = document.getElementById('shoplist')
    shoplistEl.style.display = 'flex'

    let shopEl = document.getElementById('shop')
    shopEl.style.display = 'flex'
  }

  static refreshHp(unit) {
    if (unit.focused) document.getElementById('hp').innerHTML = unit.hp
  }

  static refreshMp(unit) {
    if (unit.focused) document.getElementById('mp').innerHTML = unit.mp
  }
}

function fillUnitInfo(unit) {
  unit.focused = true
  document.getElementById('unitImgWrapper').innerHTML = ''
  document.getElementById('unitImgWrapper').appendChild(getUnitImage(unit))

  document.getElementById('unitName').innerHTML = '★'.repeat(unit.tier) + unit.name
  document.getElementById('unitName').style.color = unit.color

  let unitSynergiesEl = document.getElementById('unitSynergies')
  unitSynergiesEl.innerHTML = ''
  unit.synergies.forEach((synergy) => {
    const s = Synergy.getSynergy(synergy)
    unitSynergiesEl.appendChild(s.display())
  })
  document.getElementById('cost').innerHTML = unit.cost
  document.getElementById('hp').innerHTML = unit.hp
  document.getElementById('maxHp').innerHTML = unit.maxHp
  document.getElementById('mp').innerHTML = unit.mp
  document.getElementById('maxMp').innerHTML = unit.maxMp
  document.getElementById('ad').innerHTML = unit.ad
  document.getElementById('armor').innerHTML = unit.armor
  document.getElementById('range').innerHTML = unit.range
  document.getElementById('speed').innerHTML = unit.speed

  let unitSkillWrapperEl = document.getElementById('unitSkillWrapper')
  unitSkillWrapperEl.innerHTML = ''
  unitSkillWrapperEl.appendChild(getSkillImage(unit))

  let itemEls = document.getElementsByClassName('item')
  for (let i = 0; i < itemEls.length; i++) {
    itemEls[i].innerHTML = ''
    if (unit.items[i]) itemEls[i].appendChild(getItemImage(unit.items[i]))
  }
}

function itemMouseMove(event) {
  const item = UnitInfoPanel.infoUnit.items[this.id]
  if (item) popUp(itemInfoHtml(item), event)
}

function skillMouseMove(event) {
  const skill = UnitInfoPanel.infoUnit.skill
  popUp(`<div><span>${skill.name}</span><br /><span>${skill.desc}</span></div>`, event)
}
