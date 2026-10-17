import * as THREE from 'three'
import { regions, type RegionId } from '../data/brain'

// These are named meshes from HRA v1.3, not coordinate-based cuts or functional boundaries.
const regionParts: Record<RegionId, readonly string[]> = {
  prefrontal: ['superior_frontal_gyrus', 'middle_frontal_gyrus', 'inferior_frontal_gyrus_triangular_part', 'gyrus_rectus_straight_gyrus', 'medial_orbital_gyrus', 'anterior_intermediate_orbital_gyrus', 'posterior_intermediate_orbital_gyrus', 'lateral_orbital_gyrus'],
  parietal: ['postcentral_gyrus', 'supraparietal_lobule', 'supramarginal_gyrus', 'angular_gyrus', 'precuneus', 'paracentral_lobule_caudal_part', 'parietal_operculum'],
  temporal: ['superior_temporal_gyrus', 'middle_temporal_gyrus', 'inferior_temporal_gyrus', 'occipitotemporal_fusiform_gyrus_temporal_part', 'transverse_temporal_gyrus_Heschls_gyrus', 'planum_temporale', 'temporal_pole', 'planum_polare', 'anterior_parahippocampal_gyrus', 'posterior_parahippocampal_gyrus', 'perirhinal_gyrus_rostral_part_of_FuGt', 'gyrus_ambiens'],
  occipital: ['occipital_pole', 'cuneus', 'lingual_gyrus_medial_occipitotemporal_gyrus', 'lateral_occipitotemporal_fusiform_gyrus_occipital_part', 'inferior_occipital_gyrus', 'superior_occipital_gyrus'],
  hippocampus: ['head_of_hippocampus', 'body_of_hippocampus', 'tail_of_hippocampus'],
  cerebellum: ['cerebellar_vermis', 'paravermis_of_cerebellum', 'lateral_hemisphere_of_cerebellum'],
}
export type BrainMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
export function classifyBrainPart(name: string) {
  const part = name.replace(/^Allen_/, '').replace(/_[LR]$/, '')
  const id = (Object.keys(regionParts) as RegionId[]).find(id => regionParts[id].includes(part))
  const cortex = id && !['hippocampus', 'cerebellum'].includes(id) || /gyrus|gyri|operculum|lobule|insul|frontal_pole|olfactory|piriform/.test(part)
  const support = /white_matter|corpus_callosum|pons|medulla|midbrain|peduncle/.test(part)
  return { id, kind: id === 'hippocampus' ? 'hippocampus' : id === 'cerebellum' ? 'cerebellum' : cortex ? 'cortex' : support ? 'support' : 'internal' }
}

/** Preserve the source topology and relative positions; only center and uniformly scale it. */
export function createBrainModel(source: THREE.Group) {
  const group = new THREE.Group()
  const meshes: BrainMesh[] = []
  group.add(source)
  const bounds = new THREE.Box3().setFromObject(source)
  const center = bounds.getCenter(new THREE.Vector3())
  const size = bounds.getSize(new THREE.Vector3())
  const scale = 4.6 / Math.max(size.x, size.y, size.z)
  if (!Number.isFinite(scale) || scale <= 0) throw new Error('Invalid brain model bounds')
  source.position.sub(center)
  group.scale.setScalar(scale)
  const oldMaterials = new Set<THREE.Material>()
  source.traverse(object => {
    if (!(object as THREE.Mesh).isMesh) return
    const mesh = object as BrainMesh
    const originals = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    originals.forEach(material => oldMaterials.add(material))
    const part = classifyBrainPart(mesh.name)
    mesh.userData = { ...mesh.userData, ...part, color: regions.find(item => item.id === part.id)?.color }
    mesh.material = new THREE.MeshStandardMaterial({ color: '#c7a69a', roughness: 0.78, metalness: 0, side: THREE.DoubleSide })
    meshes.push(mesh)
  })
  oldMaterials.forEach(material => material.dispose())
  updateBrainAppearance(meshes, null, false)
  return { group, meshes }
}

export function updateBrainAppearance(meshes: BrainMesh[], selected: RegionId | null, interior: boolean) {
  for (const mesh of meshes) {
    const active = selected !== null && mesh.userData.id === selected
    // Hide unrelated deep nuclei, ventricles and tracts to keep this introduction readable.
    mesh.visible = mesh.userData.kind !== 'internal' && (!interior || ['cortex', 'hippocampus', 'cerebellum'].includes(mesh.userData.kind))
    const ghost = interior && mesh.userData.kind !== 'hippocampus'
    const material = mesh.material
    material.color.set(active ? mesh.userData.color : mesh.userData.kind === 'cerebellum' ? '#b99b8e' : '#c7a69a')
    material.emissive.set(active ? mesh.userData.color : '#000000')
    material.emissiveIntensity = active ? 0.12 : 0
    if (material.transparent !== ghost) { material.transparent = ghost; material.needsUpdate = true }
    material.opacity = ghost ? 0.055 : 1
    material.depthWrite = !ghost
    // The opaque hippocampus renders first; surrounding ghost surfaces provide spatial context.
    mesh.renderOrder = ghost ? 1 : 0
  }
}

export function disposeBrainModel(group: THREE.Group) {
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>()
  group.traverse(object => {
    if (!(object as THREE.Mesh).isMesh) return
    const mesh = object as THREE.Mesh
    geometries.add(mesh.geometry)
    ;(Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(material => materials.add(material))
  })
  geometries.forEach(geometry => geometry.dispose())
  materials.forEach(material => material.dispose())
}
