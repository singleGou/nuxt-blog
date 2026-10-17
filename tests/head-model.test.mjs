import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import test from 'node:test'
import ts from 'typescript'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const require = createRequire(import.meta.url), THREE = require('three')
function loadTypeScript(path, overrides = {}) {
  const url = new URL(path, import.meta.url), module = { exports: {} }, localRequire = createRequire(url)
  const compiled = ts.transpileModule(readFileSync(url, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } })
  new Function('require', 'module', 'exports', compiled.outputText)(id => overrides[id] ?? localRequire(id), module, module.exports)
  return module.exports
}
const curriculum = loadTypeScript('../data/brain.ts')
const brainApi = loadTypeScript('../utils/brainModel.ts', { '../data/brain': curriculum })
const headApi = loadTypeScript('../utils/headModel.ts')
const provenance = JSON.parse(readFileSync(new URL('../public/models/head/provenance.json', import.meta.url)))
async function parse(path) {
  const file = readFileSync(new URL(path, import.meta.url))
  return (await new GLTFLoader().parseAsync(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength), '')).scene
}
async function loadPair() {
  const brain = brainApi.createBrainModel(await parse('../public/models/brain/brain.glb'))
  const brainBounds = new THREE.Box3().setFromObject(brain.group)
  const head = headApi.createHeadModel(await parse('../public/models/head/head.glb'))
  brain.group.add(head.group)
  return { brain, head, brainBounds, headBounds: new THREE.Box3().setFromObject(head.group) }
}
test('the shipped head asset is small, traceable, finite and clipped to the upper neck', async () => {
  const file = readFileSync(new URL('../public/models/head/head.glb', import.meta.url))
  assert.equal(createHash('sha256').update(file).digest('hex'), provenance.outputSha256)
  assert.equal(file.length, provenance.bytes)
  assert.ok(file.length < 400_000)
  assert.equal(provenance.license, 'CC BY 4.0')
  assert.match(readFileSync(new URL('../public/models/head/NOTICE.txt', import.meta.url), 'utf8'), /Kristen Browne; Heidi Schlehlein/)
  const source = await parse('../public/models/head/head.glb')
  try {
    let vertices = 0, triangles = 0
    source.traverse(object => {
      if (!object.isMesh) return
      const positions = object.geometry.attributes.position, normals = object.geometry.attributes.normal, indices = object.geometry.index
      vertices += positions.count; triangles += indices.count / 3
      for (let i = 0; i < positions.count; i++) {
        assert.ok([positions.getX(i), positions.getY(i), positions.getZ(i)].every(Number.isFinite))
        const sourceY = positions.getY(i) * provenance.brainSourceRadius + provenance.brainSourceCenter[1]
        assert.ok(sourceY >= provenance.cutY - 1e-7, 'body geometry below the upper neck was retained')
        assert.ok(Math.abs(Math.hypot(normals.getX(i), normals.getY(i), normals.getZ(i)) - 1) < 0.01)
      }
      for (const index of indices.array) assert.ok(index < positions.count)
    })
    assert.equal(vertices, provenance.vertices); assert.equal(triangles, provenance.triangles)
  } finally { brainApi.disposeBrainModel(source) }
})
test('head and brain retain their common registration instead of being independently normalized', async () => {
  const { brain, head, brainBounds, headBounds } = await loadPair()
  try {
    const brainProvenance = JSON.parse(readFileSync(new URL('../public/models/brain/provenance.json', import.meta.url)))
    assert.deepEqual(provenance.brainSourceCenter, brainProvenance.sourceCenter)
    assert.equal(provenance.brainSourceRadius, brainProvenance.sourceRadius)
    assert.equal(head.group.scale.x, 1)
    assert.ok(headBounds.containsBox(brainBounds), 'the brain must sit inside the head bounding volume')
    assert.ok(headBounds.min.y < brainBounds.min.y - 1, 'neck must extend below the brain')
    assert.ok(headBounds.max.z > brainBounds.max.z, 'face/nose must extend in front of the brain')
    assert.equal(brain.meshes.length, 283)
    assert.ok(brain.meshes.every(mesh => mesh.userData.kind !== 'head'), 'head must not intercept the brain picking list')
  } finally { brainApi.disposeBrainModel(brain.group) }
})
test('the entire head fits profile, frontal and angled cameras on narrow and wide viewports', async () => {
  const { brain, brainBounds, headBounds } = await loadPair()
  try {
    for (const bounds of [brainBounds, headBounds]) for (const aspect of [0.45, 0.8, 1.25, 2]) for (const direction of [[-7.5, 1.2, 8], [-1, 0.1, 0], [1, 0.1, 0], [0, 0.1, 1]]) {
      const framing = headApi.getAnatomyFrame(bounds, new THREE.Vector3(...direction), aspect, 38)
      const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100)
      camera.position.copy(framing.position); camera.lookAt(framing.target); camera.updateMatrixWorld(true)
      for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
        const projected = new THREE.Vector3(x, y, z).project(camera)
        assert.ok(Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1 && Math.abs(projected.z) < 1, `${aspect}: model corner clipped`)
      }
    }
  } finally { brainApi.disposeBrainModel(brain.group) }
})
test('the head can be hidden and fades further in hippocampus mode without writing depth', async () => {
  const { brain, head } = await loadPair()
  try {
    headApi.updateHeadAppearance(head, true, false)
    assert.equal(head.group.visible, true)
    for (const material of head.materials) {
      assert.equal(material.opacity, 0.5); assert.equal(material.depthWrite, false)
      assert.equal(material.transparent, true); assert.equal(material.wireframe, false)
    }
    headApi.updateHeadAppearance(head, true, true)
    assert.ok(head.materials.every(material => material.opacity === 0.2))
    headApi.updateHeadAppearance(head, false, false)
    assert.equal(head.group.visible, false)
  } finally { brainApi.disposeBrainModel(brain.group) }
})
test('combined scene disposal includes the hidden head geometry and materials exactly once', async () => {
  const { brain, head } = await loadPair()
  head.group.visible = false
  const geometries = new Set(), materials = new Set()
  let geometryCount = 0, materialCount = 0
  brain.group.traverse(object => { if (object.isMesh) { geometries.add(object.geometry); materials.add(object.material) } })
  geometries.forEach(value => value.addEventListener('dispose', () => geometryCount++))
  materials.forEach(value => value.addEventListener('dispose', () => materialCount++))
  brainApi.disposeBrainModel(brain.group)
  assert.equal(geometryCount, geometries.size); assert.equal(materialCount, materials.size)
})
