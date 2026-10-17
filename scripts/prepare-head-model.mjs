// Node 22: node scripts/prepare-head-model.mjs [cached-VH_M_Skin.glb]
// Extract the head/upper neck from the HRA skin model, retaining its brain registration.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const sourceUrl = 'https://cdn.humanatlas.io/digital-objects/ref-organ/skin-male/v1.2/assets/VH_M_Skin.glb'
async function download() {
  const response = await fetch(sourceUrl)
  if (!response.ok) throw new Error(`Skin model HTTP ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}
const source = process.argv[2] ? await readFile(process.argv[2]) : await download()
const hash = createHash('sha256').update(source).digest('hex')
if (hash !== '8cab299d04323e6364938a271647df5671138a2177f412e741a0d6bd4536ee1c') throw new Error('Skin source changed; inspect and update the checksum deliberately')
if (source.readUInt32LE(0) !== 0x46546c67) throw new Error('Expected GLB')
const jsonLength = source.readUInt32LE(12), gltf = JSON.parse(source.toString('utf8', 20, 20 + jsonLength)), binary = source.subarray(28 + jsonLength)
if (gltf.nodes.length !== 1 || gltf.nodes[0].matrix || gltf.nodes[0].translation || gltf.nodes[0].rotation || gltf.nodes[0].scale) throw new Error('Unexpected source scene; inspect transforms')
const brain = JSON.parse(await readFile(new URL('../public/models/brain/provenance.json', import.meta.url), 'utf8'))
const cutY = 0.685 // HRA's original world units (metres); upper neck, excluding shoulders.
const primitive = gltf.meshes[0].primitives[0]
function accessor(index) {
  const a = gltf.accessors[index], v = gltf.bufferViews[a.bufferView]
  const components = a.type === 'VEC3' ? 3 : 1, start = (v.byteOffset || 0) + (a.byteOffset || 0)
  if (![5125, 5126].includes(a.componentType)) throw new Error('Unexpected source component type')
  return Array.from({ length: a.count }, (_, i) => Array.from({ length: components }, (_, k) => {
    const at = start + i * (v.byteStride || components * 4) + k * 4
    return a.componentType === 5126 ? binary.readFloatLE(at) : binary.readUInt32LE(at)
  }))
}
const rawPositions = accessor(primitive.attributes.POSITION), rawNormals = accessor(primitive.attributes.NORMAL), rawIndices = accessor(primitive.indices).flat()
const positions = [], normals = [], indices = [], vertexMap = new Map()
const vertex = index => ({ key: `v${index}`, p: rawPositions[index], n: rawNormals[index] })
function crossing(a, b) {
  const t = (cutY - a.p[1]) / (b.p[1] - a.p[1])
  const n = a.n.map((v, k) => v + (b.n[k] - v) * t), length = Math.hypot(...n)
  return { key: [a.key, b.key].sort().join(':'), p: a.p.map((v, k) => k === 1 ? cutY : v + (b.p[k] - v) * t), n: n.map(v => v / length) }
}
function add(v) {
  if (vertexMap.has(v.key)) return vertexMap.get(v.key)
  const index = positions.length / 3
  vertexMap.set(v.key, index)
  positions.push(...v.p.map((value, k) => (value - brain.sourceCenter[k]) / brain.sourceRadius))
  normals.push(...v.n)
  return index
}
for (let i = 0; i < rawIndices.length; i += 3) {
  const triangle = rawIndices.slice(i, i + 3).map(vertex), clipped = []
  for (let k = 0; k < 3; k++) {
    const a = triangle[k], b = triangle[(k + 1) % 3], insideA = a.p[1] >= cutY, insideB = b.p[1] >= cutY
    if (insideA) clipped.push(a)
    if (insideA !== insideB) clipped.push(crossing(a, b))
  }
  for (let k = 1; k < clipped.length - 1; k++) indices.push(add(clipped[0]), add(clipped[k]), add(clipped[k + 1]))
}
if (!positions.length || positions.length / 3 > 65535) throw new Error('Unexpected head size')
const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity]
positions.forEach((v, i) => { const k = i % 3; min[k] = Math.min(min[k], v); max[k] = Math.max(max[k], v) })
const parts = [Buffer.from(new Float32Array(positions).buffer), Buffer.from(new Float32Array(normals).buffer), Buffer.from(new Uint16Array(indices).buffer)]
const views = [], chunks = []
let offset = 0
parts.forEach((part, i) => {
  views.push({ buffer: 0, byteOffset: offset, byteLength: part.length, target: i === 2 ? 34963 : 34962 })
  const padding = Buffer.alloc((4 - part.length % 4) % 4)
  chunks.push(part, padding); offset += part.length + padding.length
})
const asset = {
  asset: { version: '2.0', generator: 'HYY Blog / prepare-head-model.mjs', copyright: 'Kristen Browne; Heidi Schlehlein. HRA Skin, Male v1.2. CC BY 4.0.' },
  scene: 0, scenes: [{ nodes: [0] }], nodes: [{ name: 'HRA_head_skin', mesh: 0 }],
  meshes: [{ name: 'HRA_head_skin', primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }] }],
  materials: [{ name: 'Head contour', alphaMode: 'BLEND', pbrMetallicRoughness: { baseColorFactor: [0.44, 0.59, 0.55, 0.25], metallicFactor: 0, roughnessFactor: 0.7 } }],
  accessors: [
    { bufferView: 0, componentType: 5126, count: positions.length / 3, type: 'VEC3', min, max },
    { bufferView: 1, componentType: 5126, count: normals.length / 3, type: 'VEC3' },
    { bufferView: 2, componentType: 5123, count: indices.length, type: 'SCALAR' },
  ], bufferViews: views, buffers: [{ byteLength: offset }],
}
const jsonText = Buffer.from(JSON.stringify(asset)), json = Buffer.concat([jsonText, Buffer.alloc((4 - jsonText.length % 4) % 4, 0x20)])
const header = Buffer.alloc(20), binHeader = Buffer.alloc(8), body = Buffer.concat(chunks)
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + json.length + body.length, 8); header.writeUInt32LE(json.length, 12); header.writeUInt32LE(0x4e4f534a, 16)
binHeader.writeUInt32LE(body.length, 0); binHeader.writeUInt32LE(0x004e4942, 4)
const output = new URL('../public/models/head/', import.meta.url)
await mkdir(output, { recursive: true })
const result = Buffer.concat([header, json, binHeader, body])
await writeFile(new URL('head.glb', output), result)
const provenance = { sourceUrl, sourcePage: 'https://purl.humanatlas.io/ref-organ/skin-male/v1.2', doi: 'https://doi.org/10.48539/HBM369.SBSP.863', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', authors: ['Kristen Browne', 'Heidi Schlehlein'], sourceSha256: hash, bytes: result.length, outputSha256: createHash('sha256').update(result).digest('hex'), vertices: positions.length / 3, triangles: indices.length / 3, cutY, brainSourceCenter: brain.sourceCenter, brainSourceRadius: brain.sourceRadius, modifications: 'Clipped source skin above the upper-neck plane; discarded torso and limbs, retained facial/head shape; applied the SAME translation and uniform scale as the brain asset. No independent head fitting, no face reconstruction. Neck cut is left open.' }
await writeFile(new URL('provenance.json', output), JSON.stringify(provenance, null, 2) + '\n')
console.log(JSON.stringify(provenance, null, 2))
