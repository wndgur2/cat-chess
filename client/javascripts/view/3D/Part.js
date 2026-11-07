import * as THREE from 'three'
export default class Part {
  constructor(width, depth, height, position, rotation, image, size = 0.7) {
    this.width = width * size
    this.depth = depth * size
    this.height = height * size
    this.geometry = new THREE.BoxGeometry(this.width, this.depth, this.height)
    const texture = new THREE.TextureLoader().load(image)
    this.material = new THREE.MeshBasicMaterial({
      map: texture,
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)

    this.mesh.position.x = position.x * size
    this.mesh.position.y = position.y * size
    this.mesh.position.z = position.z * size

    this.mesh.rotation.x = rotation.x
    this.mesh.rotation.y = rotation.y
    this.mesh.rotation.z = rotation.z

    return this.mesh
  }
}

function normalizeColor(n) {
  n = parseInt((n + 128) / 2)
  return n.toString(16).padStart(2, '0')
}
