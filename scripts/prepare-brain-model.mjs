// Rebuild the local asset without Blender. Run with Node 22: node scripts/prepare-brain-model.mjs [cached-source.glb]
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const sourceUrl = 'https://cdn.humanatlas.io/digital-objects/ref-organ/brain-male/v1.3/assets/3d-vh-m-allen-brain.glb'
async function download() {
  const response = await fetch(sourceUrl)
  if (!response.ok) throw new Error(`Source HTTP ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}
const source = process.argv[2] ? await readFile(process.argv[2]) : await download()
if (createHash('sha256').update(source).digest('hex') !== '2b9ad5b53e40e9f0936da74f7be38d2eed15604e26358c3870a0ea13499b9a35') throw new Error('Source has changed; inspect geometry and anatomical mapping before updating the pinned checksum')
if (source.readUInt32LE(0) !== 0x46546c67) throw new Error('Expected a GLB model')
const jsonLength = source.readUInt32LE(12)
const gltf = JSON.parse(source.toString('utf8', 20, 20 + jsonLength))
const bin = source.subarray(28 + jsonLength)
if (gltf.nodes.some(node => node.matrix || node.translation || node.rotation || node.scale)) throw new Error('Unexpected source transforms; inspect before rebuilding')
const chunks = [], views = [], accessors = []
let offset = 0
const minimum = [Infinity, Infinity, Infinity], maximum = [-Infinity, -Infinity, -Infinity]
function values(index) {
  const a = gltf.accessors[index], v = gltf.bufferViews[a.bufferView]
  const start = (v.byteOffset || 0) + (a.byteOffset || 0)
  const components = a.type === 'VEC3' ? 3 : 1
  const size = a.componentType === 5126 ? 4 : 2
  const stride = v.byteStride || components * size
  return Array.from({ length: a.count * components }, (_, i) => {
    const at = start + Math.floor(i / components) * stride + (i % components) * size
    return size === 4 ? bin.readFloatLE(at) : bin.readUInt16LE(at)
  })
}
for (const mesh of gltf.meshes) for (const p of mesh.primitives) {
  const a = gltf.accessors[p.attributes.POSITION]
  for (let k = 0; k < 3; k++) { minimum[k] = Math.min(minimum[k], a.min[k]); maximum[k] = Math.max(maximum[k], a.max[k]) }
}
const center = minimum.map((v, k) => (v + maximum[k]) / 2)
const radius = Math.max(...maximum.map((v, k) => (v - minimum[k]) / 2))
function append(bytes, accessor, target, stride) {
  const padding = (4 - bytes.length % 4) % 4
  const view = { buffer: 0, byteOffset: offset, byteLength: bytes.length, target, ...(stride ? { byteStride: stride } : {}) }
  views.push(view)
  chunks.push(bytes, Buffer.alloc(padding))
  offset += bytes.length + padding
  accessors.push({ bufferView: views.length - 1, ...accessor })
  return accessors.length - 1
}
for (const mesh of gltf.meshes) for (const p of mesh.primitives) {
  const positions = values(p.attributes.POSITION), normals = values(p.attributes.NORMAL), indices = values(p.indices)
  const pos = Buffer.alloc(positions.length / 3 * 8), normal = Buffer.alloc(normals.length / 3 * 4)
  const min = [32767, 32767, 32767], max = [-32767, -32767, -32767]
  positions.forEach((value, i) => {
    const k = i % 3, q = Math.round((value - center[k]) / radius * 32767)
    pos.writeInt16LE(q, Math.floor(i / 3) * 8 + k * 2)
    min[k] = Math.min(min[k], q); max[k] = Math.max(max[k], q)
  })
  normals.forEach((value, i) => normal.writeInt8(Math.round(Math.max(-1, Math.min(1, value)) * 127), Math.floor(i / 3) * 4 + i % 3))
  const ind = Buffer.alloc(indices.length * 2)
  indices.forEach((value, i) => ind.writeUInt16LE(value, i * 2))
  p.attributes = {
    POSITION: append(pos, { componentType: 5122, normalized: true, count: positions.length / 3, type: 'VEC3', min, max }, 34962, 8),
    NORMAL: append(normal, { componentType: 5120, normalized: true, count: normals.length / 3, type: 'VEC3' }, 34962, 4),
  }
  p.indices = append(ind, { componentType: 5123, count: indices.length, type: 'SCALAR' }, 34963)
  p.material = 0
}
gltf.asset = { version: '2.0', generator: 'HYY Blog / prepare-brain-model.mjs', copyright: 'Kristen Browne; Heidi Schlehlein. 2023. 3D Reference Organ for Brain, Male v1.3. HuBMAP HRA. CC BY 4.0.' }
gltf.extensionsUsed = ['KHR_mesh_quantization']
gltf.extensionsRequired = ['KHR_mesh_quantization']
gltf.materials = [{ name: 'Neutral anatomy', pbrMetallicRoughness: { baseColorFactor: [0.65, 0.44, 0.38, 1], metallicFactor: 0, roughnessFactor: 0.75 } }]
gltf.accessors = accessors; gltf.bufferViews = views; gltf.buffers = [{ byteLength: offset }]
const body = Buffer.concat(chunks)
const text = Buffer.from(JSON.stringify(gltf))
const json = Buffer.concat([text, Buffer.alloc((4 - text.length % 4) % 4, 0x20)])
const header = Buffer.alloc(20), binHeader = Buffer.alloc(8)
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + json.length + body.length, 8)
header.writeUInt32LE(json.length, 12); header.writeUInt32LE(0x4e4f534a, 16)
binHeader.writeUInt32LE(body.length, 0); binHeader.writeUInt32LE(0x004e4942, 4)
const output = new URL('../public/models/brain/', import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL('brain.glb', output), Buffer.concat([header, json, binHeader, body]))
const manifest = { sourceUrl, sourcePage: 'https://purl.humanatlas.io/ref-organ/brain-male/v1.3', doi: 'https://doi.org/10.48539/HBM929.XKCL.339', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', authors: ['Kristen Browne', 'Heidi Schlehlein'], sourceSha256: createHash('sha256').update(source).digest('hex'), modifications: 'Recentered and uniformly rescaled; quantized positions to 16-bit and normals to 8-bit; replaced materials. All 283 original meshes and anatomical names preserved. No new anatomical geometry.', meshCount: gltf.meshes.length, bytes: 28 + json.length + body.length, sourceBytes: source.length, sourceCenter: center, sourceRadius: radius }
await writeFile(new URL('provenance.json', output), JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify(manifest, null, 2))
