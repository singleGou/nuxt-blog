import * as THREE from 'three'

/** The asset already uses the brain asset's coordinate transform; do not normalize it separately. */
export function createHeadModel(source: THREE.Group) {
  const group = new THREE.Group()
  group.name = 'Head contour'
  group.add(source)
  const materials: THREE.MeshStandardMaterial[] = []
  const originalMaterials = new Set<THREE.Material>()
  source.traverse(object => {
    if (!(object as THREE.Mesh).isMesh) return
    const mesh = object as THREE.Mesh
    ;(Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(material => originalMaterials.add(material))
    const material = new THREE.MeshStandardMaterial({
      color: '#72958a', roughness: 0.72, metalness: 0,
      transparent: true, opacity: 0.5, depthWrite: false, side: THREE.FrontSide,
    })
    // Keep the face mostly transparent and emphasize the silhouette at grazing angles.
    material.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
        float headRim = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.0);
        diffuseColor.a *= 0.12 + 0.88 * headRim;
        #include <opaque_fragment>
      `)
    }
    material.customProgramCacheKey = () => 'hra-head-contour-v1'
    mesh.material = material
    mesh.renderOrder = 3
    mesh.userData.kind = 'head'
    materials.push(material)
  })
  originalMaterials.forEach(material => material.dispose())
  return { group, materials }
}

export function updateHeadAppearance(head: ReturnType<typeof createHeadModel>, visible: boolean, interior: boolean) {
  head.group.visible = visible
  head.materials.forEach(material => { material.opacity = interior ? 0.2 : 0.5 })
}

/** Fit the whole head or brain at the requested angle, including narrow/mobile viewports. */
export function getAnatomyFrame(bounds: THREE.Box3, direction: THREE.Vector3, aspect: number, fieldOfView: number) {
  const target = bounds.getCenter(new THREE.Vector3())
  const forward = direction.clone().normalize()
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize()
  const up = new THREE.Vector3().crossVectors(forward, right).normalize()
  const tanV = Math.tan(THREE.MathUtils.degToRad(fieldOfView / 2)), tanH = tanV * Math.max(0.1, aspect)
  let distance = 0
  for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
    const corner = new THREE.Vector3(x, y, z).sub(target)
    const depth = corner.dot(forward)
    distance = Math.max(distance, depth + Math.abs(corner.dot(right)) / tanH, depth + Math.abs(corner.dot(up)) / tanV)
  }
  return { target, position: target.clone().addScaledVector(forward, Math.max(5, distance * 1.1)) }
}
