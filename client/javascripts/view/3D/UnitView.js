import * as THREE from 'three'
import Painter from './Painter.js'
import UnitInfoPanel from '../UnitInfoPanel.js'
import { getBoardCoords } from './coords.js'
import { THREE_CONSTS } from '../../constants/threeConsts.js'

// Shows a unit's battle events on its mesh.
export default class UnitView {
  static setHp(unit, newHp) {
    unit.hp = newHp < 0 ? 0 : newHp
    UnitInfoPanel.refreshHp(unit)

    const healthBarMesh = unit.mesh.getObjectByName('healthBar')
    healthBarMesh.scale.x = unit.hp / unit.maxHp
    healthBarMesh.position.x = ((1 - unit.hp / unit.maxHp) * THREE_CONSTS.HEALTHBAR_WIDTH) / 2

    const damagedHealthMesh = unit.mesh.getObjectByName('damagedHealthBar')

    function animateHealthDamage() {
      if (damagedHealthMesh.scale.x > healthBarMesh.scale.x) {
        damagedHealthMesh.scale.x -= 0.01
        damagedHealthMesh.position.x =
          ((1 - damagedHealthMesh.scale.x) * THREE_CONSTS.HEALTHBAR_WIDTH) / 2
        requestAnimationFrame(animateHealthDamage)
      } else {
        damagedHealthMesh.scale.x = healthBarMesh.scale.x
        damagedHealthMesh.position.x =
          ((1 - damagedHealthMesh.scale.x) * THREE_CONSTS.HEALTHBAR_WIDTH) / 2
      }
    }
    animateHealthDamage()
  }

  static setMp(unit, newMp) {
    if (newMp < 0) newMp = 0
    if (newMp > unit.maxMp) newMp = unit.maxMp
    unit.mp = newMp
    UnitInfoPanel.refreshMp(unit)

    const manaBarMesh = unit.mesh.getObjectByName('manaBar')
    manaBarMesh.scale.x = unit.mp / unit.maxMp
    manaBarMesh.position.x = ((1 - unit.mp / unit.maxMp) * THREE_CONSTS.MANABAR_WIDTH) / 2
  }

  static die(unit) {
    UnitView.setHp(unit, 0)
    Painter.scene.remove(unit.mesh)
  }

  static attack(unit, target) {
    // rotate unit toward target
    const bodyMesh = unit.mesh.getObjectByName('unitBody')
    bodyMesh.lookAt(target.mesh.position)

    // move unit to target
    const duration = 12
    let i = 0
    function animate() {
      if (i < duration / 2) bodyMesh.translateZ(0.2)
      else bodyMesh.translateZ(-0.2)
      if (++i < duration) requestAnimationFrame(animate)
    }
    animate()
  }

  static move(unit, nextX, nextY) {
    const beforeCoords = getBoardCoords(unit.x, unit.y)
    const nextCoords = getBoardCoords(nextX, nextY)
    const nextLocation = new THREE.Vector3(...nextCoords)
    const bodyMesh = unit.mesh.getObjectByName('unitBody')
    nextLocation.setY(new THREE.Box3().setFromObject(bodyMesh).getCenter(new THREE.Vector3()).y)
    bodyMesh.lookAt(nextLocation)

    const toMoveCoords = {
      x: nextCoords[0] - beforeCoords[0],
      z: nextCoords[2] - beforeCoords[2],
    }

    const durationToMove = 240 / unit.speed
    let i = 0
    const animateMove = () => {
      if (++i > durationToMove) return
      unit.mesh.position.x += toMoveCoords.x / durationToMove
      unit.mesh.position.z += toMoveCoords.z / durationToMove
      requestAnimationFrame(animateMove)
    }

    animateMove()
  }
}
