import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default class Cat {
  constructor(unit) {
    this.mesh = new THREE.Group()

    console.log(unit)
    // load model from public/models/cat by unit.id
    let loader = new GLTFLoader()
    loader.load(`/models/cat/${unit.id}.glb`, (glb) => {
      glb.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      glb.scene.scale.set(2, 2, 2)
      // rotate z 90
      glb.scene.rotation.z = -Math.PI / 2
      glb.scene.rotation.x = -Math.PI / 2
      this.mesh.add(glb.scene)
    })

    // add clickable mesh (2x2x2)
    let geometry = new THREE.BoxGeometry(2, 0.5, 2)
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0, transparent: true })
    let clickableMesh = new THREE.Mesh(geometry, material)
    clickableMesh.position.y = -1
    this.mesh.add(clickableMesh)

    return this.mesh
  }
}

function calcSize(unit) {
  let size = 0.7
  size *= ((unit.maxHp * Math.sqrt(unit.armor)) / 300 + 7) / 8
  size = Math.min(size, 1.2)
  size = Math.max(size, 0.5)
  return size
}
