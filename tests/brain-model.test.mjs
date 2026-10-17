import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import ts from 'typescript'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const require = createRequire(import.meta.url)
const THREE = require('three')
function loadTypeScript(path, overrides = {}) {
  const url = new URL(path, import.meta.url)
  const compiled = ts.transpileModule(readFileSync(url, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } })
  const localRequire = createRequire(url), module = { exports: {} }
  new Function('require', 'module', 'exports', compiled.outputText)(id => overrides[id] ?? localRequire(id), module, module.exports)
  return module.exports
}
const curriculum = loadTypeScript('../data/brain.ts')
const modelApi = loadTypeScript('../utils/brainModel.ts', { '../data/brain': curriculum })
const categories = loadTypeScript('../composables/useCategories.ts')
const file = readFileSync(new URL('../public/models/brain/brain.glb', import.meta.url))
const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
async function loadModel() { return modelApi.createBrainModel((await new GLTFLoader().parseAsync(buffer.slice(0), '')).scene) }

test('the active taxonomy has the requested four ordered categories', () => {
  assert.deepEqual(categories.CATEGORIES.map(category => category.name), ['前端开发', 'Web 3D', 'AI 应用开发', '后端开发'])
  assert.deepEqual(categories.CATEGORIES.map(category => category.slug), categories.CATEGORY_SLUGS)
})
test('the shipped GLB loads with the actual Three.js loader and retains the complete named anatomy', async () => {
  const model = await loadModel()
  try {
    assert.equal(model.meshes.length, 283)
    assert.ok(file.length < 9_000_000)
    const provenance = JSON.parse(readFileSync(new URL('../public/models/brain/provenance.json', import.meta.url)))
    assert.equal(provenance.bytes, file.length)
    assert.equal(provenance.license, 'CC BY 4.0')
    assert.match(readFileSync(new URL('../public/models/brain/NOTICE.txt', import.meta.url), 'utf8'), /Kristen Browne; Heidi Schlehlein/)
    for (const mesh of model.meshes) {
      const positions = mesh.geometry.attributes.position
      for (let i = 0; i < positions.count; i++) assert.ok([positions.getX(i), positions.getY(i), positions.getZ(i)].every(Number.isFinite), mesh.name)
      const indices = mesh.geometry.index
      assert.equal(indices.count % 3, 0)
      for (const i of indices.array) assert.ok(i < positions.count, mesh.name)
      assert.ok(mesh.name.startsWith('Allen_') || mesh.name === 'VH_M_optic_chiasm')
    }
    const bounds = new THREE.Box3().setFromObject(model.group)
    assert.ok(bounds.getCenter(new THREE.Vector3()).length() < 0.0001)
    assert.ok(Math.abs(Math.max(...bounds.getSize(new THREE.Vector3()).toArray()) - 4.6) < 0.0001)
  } finally { modelApi.disposeBrainModel(model.group) }
})
test('each educational region maps to source meshes on both sides and precentral cortex stays unmapped', async () => {
  const model = await loadModel()
  try {
    for (const region of curriculum.regions) {
      const meshes = model.meshes.filter(mesh => mesh.userData.id === region.id)
      assert.ok(meshes.some(mesh => mesh.name.endsWith('_L')), region.id)
      assert.ok(meshes.some(mesh => mesh.name.endsWith('_R')), region.id)
    }
    assert.equal(model.meshes.filter(mesh => mesh.userData.id === 'hippocampus').length, 6)
    assert.equal(modelApi.classifyBrainPart('Allen_precentral_gyrus_L').id, undefined)
    assert.equal(modelApi.classifyBrainPart('Allen_amygdalohippocampal_area_L').id, undefined)
    assert.equal(modelApi.classifyBrainPart('Allen_superior_frontal_gyrus_R').id, 'prefrontal')
  } finally { modelApi.disposeBrainModel(model.group) }
})
test('default overview is neutral and selecting one region only colors that group', async () => {
  const model = await loadModel()
  try {
    assert.ok(model.meshes.every(mesh => mesh.material.emissiveIntensity === 0))
    modelApi.updateBrainAppearance(model.meshes, 'occipital', false)
    for (const mesh of model.meshes) assert.equal(mesh.material.emissiveIntensity > 0, mesh.userData.id === 'occipital')
    modelApi.updateBrainAppearance(model.meshes, null, false)
    assert.ok(model.meshes.every(mesh => mesh.material.emissiveIntensity === 0))
  } finally { modelApi.disposeBrainModel(model.group) }
})
test('hippocampus remains opaque inside ghost cortex and restoring the whole brain resets visibility', async () => {
  const model = await loadModel()
  try {
    modelApi.updateBrainAppearance(model.meshes, 'hippocampus', true)
    for (const mesh of model.meshes.filter(mesh => mesh.visible)) {
      const ghost = mesh.userData.id !== 'hippocampus'
      assert.equal(mesh.material.transparent, ghost)
      assert.equal(mesh.material.depthWrite, !ghost)
      assert.equal(mesh.material.opacity, ghost ? 0.055 : 1)
    }
    modelApi.updateBrainAppearance(model.meshes, null, false)
    assert.ok(model.meshes.every(mesh => mesh.material.opacity === 1 && mesh.material.depthWrite && !mesh.material.transparent))
    assert.ok(model.meshes.some(mesh => mesh.userData.kind === 'support' && mesh.visible))
  } finally { modelApi.disposeBrainModel(model.group) }
})
test('all loaded geometry and materials are disposed exactly once', async () => {
  const model = await loadModel()
  const geometries = new Set(), materials = new Set()
  let disposedGeometry = 0, disposedMaterial = 0
  for (const mesh of model.meshes) { geometries.add(mesh.geometry); materials.add(mesh.material) }
  geometries.forEach(geometry => geometry.addEventListener('dispose', () => disposedGeometry++))
  materials.forEach(material => material.addEventListener('dispose', () => disposedMaterial++))
  modelApi.disposeBrainModel(model.group)
  assert.equal(disposedGeometry, geometries.size)
  assert.equal(disposedMaterial, materials.size)
})
test('every story step references a selectable region and traceable source', () => {
  const ids = new Set(curriculum.regions.map(region => region.id))
  assert.equal(curriculum.stories.length, 3)
  for (const story of curriculum.stories) {
    assert.equal(story.steps.length, 3)
    for (const step of story.steps) assert.ok(ids.has(step.region))
  }
  for (const region of curriculum.regions) assert.equal(new URL(region.source.url).protocol, 'https:')
})
test('active content folders and frontmatter categories agree', () => {
  for (const slug of categories.CATEGORY_SLUGS) {
    const directory = new URL('../content/' + slug + '/', import.meta.url)
    for (const file of readdirSync(directory).filter(file => file.endsWith('.md'))) {
      const markdown = readFileSync(new URL(file, directory), 'utf8')
      assert.equal(markdown.match(/^category:\s*["']?([^"'\r\n]+)["']?\s*$/m)?.[1], slug)
    }
  }
})
