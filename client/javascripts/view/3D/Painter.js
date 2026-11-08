import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import UnitInfoPanel from '../UnitInfoPanel.js'
import { inventoryDrag } from '../inventoryDrag.js'
import { itemImageSrc } from '../itemView.js'
import Cat from './Cat.js'
import Player from '../../state/Player.js'
import Socket from '../../net/Socket.js'
import blood from './effects/blood.js'
import { CLIENT_MESSAGES } from '../../../../shared/protocol.js'
import { THREE_CONSTS } from '../../constants/threeConsts.js'
import { getBoardCoords } from './coords.js'
import { objectPool } from './effects/objectPool.js'

export default class Painter {
  static board = new Array(6).fill(null).map(() => new Array(5).fill(null))
  static enemyQueue = new Array(7).fill(null)
  static allyQueue = new Array(7).fill(null)
  static draggingObject = null
  static isDragging = false
  static textures = {}
  static running = false

  static init() {
    //scene
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()

    // camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(0, THREE_CONSTS.PLATE_RADIUS * 9, -(THREE_CONSTS.PLATE_RADIUS * 10))
    this.camera.lookAt(0, 0, -THREE_CONSTS.PLATE_RADIUS * 2.8)
    this.scene.add(this.camera)

    // light
    const light = new THREE.HemisphereLight(0xdddddd, 0x000000, 1)
    light.position.set(0, THREE_CONSTS.PLATE_RADIUS * 5, 0)
    this.scene.add(light)

    // pointlight
    const pointLight = new THREE.PointLight(
      0xeeeeee,
      25 * Math.pow(THREE_CONSTS.PLATE_RADIUS, 1.5),
      0,
      1.5
    )
    pointLight.position.set(0, THREE_CONSTS.PLATE_RADIUS * 4, 0)
    pointLight.castShadow = true
    this.scene.add(pointLight)

    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.domElement.id = 'scene'
    document.getElementById('game').appendChild(this.renderer.domElement)

    // TODO: CONTROL
    // controls;
    // Painter.controls = new OrbitControls(
    //     this.camera,
    //     this.renderer.domElement
    // );

    //effect
    this.outlineEffect = new OutlineEffect(Painter.renderer)

    // interaction
    this.mouse = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()

    // 항상켜져있음 ,,
    window.addEventListener('resize', onResize)
    this.renderer.domElement.addEventListener('pointerdown', onPointerDown)
    this.renderer.domElement.addEventListener('pointermove', onPointerMove)
    this.renderer.domElement.addEventListener('pointerup', onPointerUp)
    this.renderer.domElement.addEventListener('dragover', onDragOver)
    this.renderer.domElement.addEventListener('drop', onDrop)

    // effect
    this.hitObjectPool = new objectPool(blood, 100)

    // textures
    this.textureLodaer = new THREE.TextureLoader()
    this.textures.background = this.textureLodaer.load(
      '/images/grounds/background.jpg',
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(THREE_CONSTS.PLATE_RADIUS * 5, THREE_CONSTS.PLATE_RADIUS * 5)
      }
    )
    this.textures.board = this.textureLodaer.load('/images/grounds/board.jpg')
    this.textures.queue = this.textureLodaer.load('/images/grounds/queue.jpg')

    //font

    var loader = new FontLoader()
    loader.load(
      'https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json',
      (font) => {
        Painter.font = font
      }
    )

    this.drawBackground()
    this.drawBoard()
  }

  static drawBoard() {
    // floor
    const floorGeometry = new THREE.PlaneGeometry(
      THREE_CONSTS.PLATE_RADIUS * 50,
      THREE_CONSTS.PLATE_RADIUS * 50
    )
    const floorMaterial = new THREE.MeshLambertMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotateX(Math.PI / 2)
    floor.position.set(0, 0, 0)
    floor.visible = false
    floor.name = 'floor'
    this.scene.add(floor)

    // board
    let plateGeometry = new THREE.CylinderGeometry(
      THREE_CONSTS.PLATE_RADIUS,
      THREE_CONSTS.PLATE_RADIUS,
      THREE_CONSTS.PLATE_HEIGHT,
      6
    )
    let material = new THREE.MeshLambertMaterial({
      map: this.textures.board,
    })

    THREE_CONSTS.COORDINATES.BOARD.forEach((row, i) => {
      row.forEach((coord, j) => {
        const plate = new THREE.Mesh(plateGeometry, material)
        plate.position.set(coord[0], coord[1], coord[2])
        plate.boardCoords = {
          y: i,
          x: j,
        }
        if (i >= 3) plate.name = 'allyPlate'
        else plate.name = 'enemyPlate'
        this.scene.add(plate)
      })
    })

    // queue
    const boxGeometry = new THREE.BoxGeometry(
      THREE_CONSTS.BOX_WIDTH,
      THREE_CONSTS.BOX_HEIGHT,
      THREE_CONSTS.BOX_DEPTH
    )

    // 1 x 7 ally queue
    material = new THREE.MeshLambertMaterial({
      map: this.textures.queue,
    })

    THREE_CONSTS.COORDINATES.ALLY_QUEUE.forEach((coord, i) => {
      const cube = new THREE.Mesh(boxGeometry, material)
      cube.translateX(coord[0])
      cube.translateY(coord[1])
      cube.translateZ(coord[2])
      cube.name = 'allyPlate'
      cube.boardCoords = {
        y: 6,
        x: i,
      }
      this.scene.add(cube)
    })

    // 1 x 7 enemy queue
    material = new THREE.MeshLambertMaterial({
      map: this.textures.queue,
    })
    THREE_CONSTS.COORDINATES.ENEMY_QUEUE.forEach((coord, i) => {
      const cube = new THREE.Mesh(boxGeometry, material)
      cube.translateX(coord[0])
      cube.translateY(coord[1])
      cube.translateZ(coord[2])
      cube.name = 'enemyPlate'
      this.scene.add(cube)
    })
  }

  static drawBackground() {
    const backgroundGeometry = new THREE.PlaneGeometry(
      THREE_CONSTS.PLATE_RADIUS * 50,
      THREE_CONSTS.PLATE_RADIUS * 50
    )
    const backgroundMaterial = new THREE.MeshLambertMaterial({
      map: this.textures.background,
      side: THREE.DoubleSide,
    })
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial)
    background.rotateX(Math.PI / 2)
    background.position.set(0, -THREE_CONSTS.PLATE_RADIUS / 10, 0)
    background.name = 'background'
    this.scene.add(background)

    const loader = new GLTFLoader()

    loader.load(
      'models/concrete_fence/scene.gltf',
      function (gltf) {
        let object = gltf.scene.clone()

        object.scale.set(0.05, 0.05, 0.05)
        object.rotateY(-Math.PI + 0.1)
        object.position.set(-27, 0, 7)
        Painter.scene.add(object)

        object = gltf.scene.clone()
        object.scale.set(0.05, 0.05, 0.05)
        object.rotateY(-Math.PI)
        object.position.set(-23, 0, 5)
        Painter.scene.add(object)

        object = gltf.scene.clone()
        object.scale.set(0.05, 0.05, 0.05)
        object.rotateY(-Math.PI - 0.1)
        object.position.set(-19, 0, 1)
        Painter.scene.add(object)

        object = gltf.scene.clone()
        object.scale.set(0.05, 0.05, 0.05)
        object.rotateY(Math.PI - 0.2)
        object.position.set(-18, 0, -10)
        Painter.scene.add(object)
      },
      undefined,
      function (error) {
        console.log(error)
      }
    )

    loader.load(
      'models/box/scene.gltf',
      function (gltf) {
        let object = gltf.scene
        object.scale.set(0.05, 0.05, 0.05)
        object.position.set(20, 0, -4)
        object.rotateY(-(Math.PI / 2) + 0.1)
        Painter.scene.add(object)
      },
      undefined,
      function (error) {
        console.error(error)
      }
    )
    loader.load(
      'models/elec/scene.gltf',
      function (gltf) {
        let object = gltf.scene.clone()
        object.scale.set(2, 2, 2)
        object.position.set(-12, 0, 9)
        object.rotateY(Math.PI / 20)
        Painter.scene.add(object)

        object = gltf.scene.clone()
        object.scale.set(2, 2, 2)
        object.position.set(-15, 0, 9)
        object.rotateY(-Math.PI / 12)
        Painter.scene.add(object)

        object = gltf.scene.clone()
        object.scale.set(2, 2, 2)
        object.position.set(12, 0, -11)
        object.rotateY(Math.PI)
        Painter.scene.add(object)

        object = gltf.scene.clone()
        object.scale.set(2, 2, 2)
        object.position.set(16, 0, 11)
        object.rotateY(Math.PI / 12)
        Painter.scene.add(object)
      },
      undefined,
      function (error) {
        console.error(error)
      }
    )

    loader.load(
      'models/cabinet/scene.gltf',
      function (gltf) {
        let object = gltf.scene
        object.scale.set(8, 8, 8)
        object.position.set(0, 16, 22)
        object.rotateY(-Math.PI)
        Painter.scene.add(object)
      },
      undefined,
      function (error) {
        console.error(error)
      }
    )
  }

  static clearUnits() {
    this.scene.children.forEach((child) => {
      if (child.name === 'unit') this.scene.remove(child)
    })
    this.running = false
  }

  static startRender() {
    if (!this.running) {
      this.running = true
      this.animate()
    }
  }

  static animate() {
    if (!Painter.running) return
    requestAnimationFrame(Painter.animate)
    const dt = Painter.clock.getDelta()
    Painter.hitObjectPool.Update(dt)
    Painter.outlineEffect.render(Painter.scene, Painter.camera)
  }

  static set _board(newBoard) {
    cancelDragging()
    this.board.forEach((row) => {
      row.forEach((unit) => {
        if (unit) {
          this.scene.remove(unit.mesh)
        }
      })
    })

    this.board = newBoard

    this.board.forEach((row) => {
      row.forEach((unit) => {
        if (unit) this.drawUnit(unit, true)
      })
    })
  }

  static set _allyQueue(newQueue) {
    cancelDragging()
    this.allyQueue.forEach((unit, i) => {
      if (unit) this.scene.remove(unit.mesh)
    })

    this.allyQueue = newQueue

    this.allyQueue.forEach((unit, i) => {
      if (unit) this.drawUnit(unit, false)
    })
  }

  static drawUnit(unit, onBoard) {
    if (!unit.mesh) this.createUnitMesh(unit)
    const coords = onBoard
      ? getBoardCoords(unit.x, unit.y)
      : getQueueCoords(unit.x, unit.owner === Player.player.id)
    unit.mesh.position.set(
      coords[0],
      coords[1] + (THREE_CONSTS.CAT_HEIGHT + THREE_CONSTS.PLATE_HEIGHT) / 2,
      coords[2]
    )
    this.scene.add(unit.mesh)
  }

  static createUnitMesh(unit) {
    unit.mesh = new THREE.Group()
    unit.mesh.name = 'unit'

    const bodyMesh = new Cat(unit)
    bodyMesh.name = 'unitBody'
    bodyMesh.unit = unit
    if (unit.owner != Player.player.id) bodyMesh.rotateY(Math.PI)
    unit.mesh.add(bodyMesh)

    // health bar
    const healthBarY =
      THREE_CONSTS.CAT_HEIGHT +
      THREE_CONSTS.ITEM_WIDTH +
      THREE_CONSTS.MANABAR_HEIGHT +
      THREE_CONSTS.STATS_GAP * 2

    const healthBarBackgroundMesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        THREE_CONSTS.HEALTHBAR_WIDTH,
        THREE_CONSTS.HEALTHBAR_HEIGHT,
        THREE_CONSTS.HEALTHBAR_DEPTH / 3
      ),
      new THREE.MeshBasicMaterial({ color: 0x00000 })
    )
    healthBarBackgroundMesh.name = 'healthBarBackground'
    healthBarBackgroundMesh.position.set(0, healthBarY, 0)
    unit.mesh.add(healthBarBackgroundMesh)

    const damagedHealthMesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        THREE_CONSTS.HEALTHBAR_WIDTH,
        THREE_CONSTS.HEALTHBAR_HEIGHT,
        THREE_CONSTS.HEALTHBAR_DEPTH / 2
      ),
      new THREE.MeshBasicMaterial({ color: 0xcc0000 })
    )
    damagedHealthMesh.name = 'damagedHealthBar'
    damagedHealthMesh.position.set(0, healthBarY, 0)
    unit.mesh.add(damagedHealthMesh)

    const healthBarMesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        THREE_CONSTS.HEALTHBAR_WIDTH,
        THREE_CONSTS.HEALTHBAR_HEIGHT,
        THREE_CONSTS.HEALTHBAR_DEPTH
      ),
      new THREE.MeshBasicMaterial({ color: 0x00aa00 })
    )
    healthBarMesh.name = 'healthBar'
    healthBarMesh.position.set(0, healthBarY, 0)
    unit.mesh.add(healthBarMesh)

    const manaBarMesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        THREE_CONSTS.MANABAR_WIDTH,
        THREE_CONSTS.MANABAR_HEIGHT,
        THREE_CONSTS.MANABAR_HEIGHT / 10
      ),
      new THREE.MeshBasicMaterial({ color: 0x0044aa })
    )
    manaBarMesh.name = 'manaBar'
    manaBarMesh.position.set(0, healthBarY - THREE_CONSTS.HEALTHBAR_HEIGHT, 0)
    manaBarMesh.position.x = THREE_CONSTS.MANABAR_WIDTH / 2
    manaBarMesh.scale.x = 0
    unit.mesh.add(manaBarMesh)

    // items
    this.createItemMesh(unit)
  }

  static createItemMesh(unit) {
    let count = 0
    unit.mesh.children.forEach((child) => {
      if (child.name === 'item') count++
    })
    unit.items.forEach((item, i) => {
      if (i < count) return
      const itemMesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          THREE_CONSTS.ITEM_WIDTH,
          THREE_CONSTS.ITEM_WIDTH,
          THREE_CONSTS.HEALTHBAR_HEIGHT / 10
        ),
        new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load(itemImageSrc(item)),
        })
      )
      itemMesh.name = 'item'
      itemMesh.position.set(
        (1 - i) * (THREE_CONSTS.ITEM_WIDTH + THREE_CONSTS.STATS_GAP),
        THREE_CONSTS.CAT_HEIGHT,
        0
      )
      itemMesh.item = item
      unit.mesh.add(itemMesh)
    })
  }

  static hitEffect(attacker, target, damage) {
    this.scene.add(
      this.hitObjectPool.GetObject(target.mesh.position, attacker.mesh.position).object
    )
  }

  static sellUnitOnKeypress() {
    Painter.raycaster.setFromCamera(Painter.mouse, Painter.camera)
    const intersects = Painter.raycaster.intersectObjects(Painter.scene.children)
    intersects.forEach((intersect) => {
      const object = intersect.object
      if (object.parent.name === 'unitBody') {
        if (object.parent.unit.owner !== Player.player.id) return
        if (object.parent.unit.inBattle) return
        Socket.sendMsg(CLIENT_MESSAGES.REQ_SELL_CAT, {
          uid: object.parent.unit.uid,
        })
      }
    })
  }

  static castEffect(unit) {
    const textGeo = new TextGeometry(unit.skill.name + '!', {
      font: Painter.font,
      size: 0.6,
      depth: 0.1,
    })
    const textMaterial = new THREE.MeshBasicMaterial({
      color: 0xcc4444,
    })
    const textMesh = new THREE.Mesh(textGeo, textMaterial)
    textMesh.rotateY(Math.PI)
    textMesh.position.set(
      unit.mesh.position.x + THREE_CONSTS.PLATE_RADIUS / 2,
      THREE_CONSTS.CAT_HEIGHT * 2,
      unit.mesh.position.z
    )
    Painter.scene.add(textMesh)

    // move unit to target
    const duration = 33
    let i = 0
    function moveText() {
      if (i++ < duration) {
        textMesh.translateY(0.05)
        textMesh.material.opacity -= 0.03
        requestAnimationFrame(moveText)
      } else Painter.scene.remove(textMesh)
    }
    moveText()
  }
}

function getQueueCoords(x, isAlly) {
  if (isAlly) return [...THREE_CONSTS.COORDINATES.ALLY_QUEUE[x]]
  return [...THREE_CONSTS.COORDINATES.ENEMY_QUEUE[x]]
}

function onResize() {
  Painter.camera.aspect = window.innerWidth / window.innerHeight
  Painter.camera.updateProjectionMatrix()
  Painter.renderer.setSize(window.innerWidth, window.innerHeight)
}

function onPointerDown(event) {
  // console.log("pointerdown");
  Painter.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  Painter.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  Painter.dragStart = Painter.mouse.clone()

  const unitObject = getRaycastedUnitObject()
  console.log(unitObject)
  if (unitObject) {
    if (unitObject.unit.inBattle) return
    Painter.isDragging = true
    Painter.draggingObject = unitObject
  }
  UnitInfoPanel.hide()
}

function onPointerMove(event) {
  Painter.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  Painter.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  if (!Painter.isDragging) {
    return
  }
  if (inventoryDrag.active) {
    inventoryDrag.active = false
    return
  }

  const floor = getRaycastedIntersect('floor')
  if (floor) {
    Painter.draggingObject.parent.position.set(
      floor.point.x,
      THREE_CONSTS.CAT_HEIGHT / 1.5,
      floor.point.z
    )
  }
}

function onPointerUp(event) {
  Painter.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  Painter.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  // click 판정
  if (
    Painter.mouse.x <= Painter.dragStart.x + 0.1 &&
    Painter.mouse.x >= Painter.dragStart.x - 0.1 &&
    Painter.mouse.y <= Painter.dragStart.y + 0.1 &&
    Painter.mouse.y >= Painter.dragStart.y - 0.1
  )
    onPointerClick(event)

  if (!Painter.isDragging) return

  const allyPlate = getRaycastedIntersect('allyPlate').object
  if (allyPlate)
    Socket.sendMsg(CLIENT_MESSAGES.REQ_PUT_CAT, {
      uid: Painter.draggingObject.unit.uid,
      to: {
        x: allyPlate.boardCoords.x,
        y: allyPlate.boardCoords.y - 3,
      },
    })
  cancelDragging()
}

function cancelDragging() {
  if (!Painter.isDragging) return
  Painter.isDragging = false
  Painter.drawUnit(Painter.draggingObject.unit, Painter.draggingObject.unit.y !== 3)
  Painter.draggingObject = null
}

function onPointerClick(event) {
  Painter.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  Painter.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  const unitObject = getRaycastedUnitObject()
  if (unitObject) UnitInfoPanel.show(unitObject.unit)
}

function onDragOver(event) {
  event.preventDefault()
}

function onDrop(event) {
  if (!inventoryDrag.active) return

  Painter.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  Painter.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  const unitObject = getRaycastedUnitObject()
  if (unitObject) {
    if (unitObject.unit.owner !== Player.player.id) return
    Socket.sendMsg(CLIENT_MESSAGES.REQ_GIVE_ITEM, {
      item: {
        x: parseInt(inventoryDrag.id.split('-')[2]),
        y: parseInt(inventoryDrag.id.split('-')[1]),
      },
      uid: unitObject.unit.uid,
    })
  }

  inventoryDrag.active = false
}

function getRaycastedUnitObject() {
  Painter.raycaster.setFromCamera(Painter.mouse, Painter.camera)
  const intersects = Painter.raycaster.intersectObjects(Painter.scene.children)
  for (let i = 0; i < intersects.length; ++i) {
    const object = intersects[i].object
    if (object.parent.name === 'unitBody') return object.parent
  }
  return null
}

function getRaycastedIntersect(name) {
  Painter.raycaster.setFromCamera(Painter.mouse, Painter.camera)
  const intersects = Painter.raycaster.intersectObjects(Painter.scene.children)
  for (let i = 0; i < intersects.length; ++i) {
    const object = intersects[i].object
    if (object.name === name) return intersects[i]
  }
  return null
}
