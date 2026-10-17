<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createBrainModel, updateBrainAppearance, disposeBrainModel } from '~/utils/brainModel'
import { createHeadModel, updateHeadAppearance, getAnatomyFrame } from '~/utils/headModel'
import type { RegionId } from '~/data/brain'

const props = defineProps<{ selected: RegionId | null; interior: boolean; showHead: boolean; resetKey: number; rotate: boolean; view: 'overview' | 'left' | 'right' | 'front' }>()
const emit = defineEmits<{ select: [id: RegionId]; ready: []; headReady: []; headError: []; progress: [percent: number]; error: [message: string] }>()
const host = ref<HTMLDivElement>()
let renderer: THREE.WebGLRenderer | undefined, controls: OrbitControls | undefined, camera: THREE.PerspectiveCamera | undefined
let model: ReturnType<typeof createBrainModel> | undefined
let head: ReturnType<typeof createHeadModel> | undefined
let brainBounds: THREE.Box3 | undefined, headBounds: THREE.Box3 | undefined
let frame = 0, visible = true, reducedMotion = false, stopped = false, modelAdded = false
const ready = ref(false)
let observer: ResizeObserver | undefined, visibilityObserver: IntersectionObserver | undefined
let focus: THREE.Vector3 | undefined
let focusTarget: THREE.Vector3 | undefined
let pointerStart = { x: 0, y: 0 }
const abort = new AbortController()
const overview = new THREE.Vector3(-6.5, 2.6, 5)
const headOverview = new THREE.Vector3(-7.5, 1.2, 8)
const viewPositions: Record<RegionId, [number, number, number]> = {
  prefrontal: [-5.5, 2.2, 6], parietal: [-6, 5, -1], temporal: [-8, 0.7, 1],
  occipital: [-5.5, 2, -6], hippocampus: [-7.3, 2, 3.5], cerebellum: [-6, -1.6, -5.5],
}
const axisVectors = [{ label: '前', vector: new THREE.Vector3(0, 0, 1) }, { label: '后', vector: new THREE.Vector3(0, 0, -1) }, { label: '左', vector: new THREE.Vector3(-1, 0, 0) }, { label: '右', vector: new THREE.Vector3(1, 0, 0) }]
const axes = ref(axisVectors.map(axis => ({ label: axis.label, x: 45, y: 45, depth: 0 })))
function updateAxes() {
  if (!camera) return
  const inverse = camera.quaternion.clone().invert()
  axes.value = axisVectors.map(axis => {
    const v = axis.vector.clone().applyQuaternion(inverse)
    return { label: axis.label, x: 45 + v.x * 30, y: 45 - v.y * 30, depth: v.z }
  }).sort((a, b) => a.depth - b.depth)
}
function appearance() {
  if (model) updateBrainAppearance(model.meshes, props.selected, props.interior)
  if (head) updateHeadAppearance(head, props.showHead, props.interior)
}
function frameView(direction: THREE.Vector3) {
  if (!camera || !controls || !brainBounds) return
  const bounds = props.showHead && headBounds ? headBounds : brainBounds
  const framing = getAnatomyFrame(bounds, direction, camera.aspect, camera.fov)
  focus = framing.position; focusTarget = framing.target
  if (reducedMotion) {
    camera.position.copy(focus); controls.target.copy(focusTarget)
    focus = undefined; focusTarget = undefined; controls.update()
  }
}
function focusRegion() {
  frameView(props.selected ? new THREE.Vector3(...viewPositions[props.selected]) : props.showHead ? headOverview : overview)
}
watch(() => props.selected, () => { appearance(); focusRegion() })
watch(() => props.interior, appearance)
watch(() => props.showHead, () => { appearance(); focusRegion() })
watch(() => props.resetKey, () => {
  const position = { overview: props.showHead ? headOverview : overview, left: new THREE.Vector3(-8.5, 0.8, 0), right: new THREE.Vector3(8.5, 0.8, 0), front: new THREE.Vector3(0, 0.8, 8.5) }[props.view]
  frameView(position)
})
function startDrag(event: PointerEvent) { pointerStart = { x: event.clientX, y: event.clientY } }
function cancelFocus() { focus = undefined; focusTarget = undefined }
function contextLost(event: Event) { event.preventDefault(); emit('error', '3D 图形上下文已中断。可以重试，或通过结构列表继续阅读。') }
function pick(event: PointerEvent) {
  if (!host.value || !camera || !model || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return
  const bounds = host.value.getBoundingClientRect(), ray = new THREE.Raycaster()
  ray.setFromCamera(new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1), camera)
  // Unmapped opaque parts still occlude mapped structures: never select through the brain.
  const hit = ray.intersectObjects(model.meshes.filter(mesh => mesh.visible && mesh.material.opacity > 0.5))[0]
  if (hit?.object.userData.id) emit('select', hit.object.userData.id as RegionId)
}
async function loadModel() {
  const response = await fetch('/models/brain/brain.glb', { signal: abort.signal })
  if (!response.ok) throw new Error(`Model HTTP ${response.status}`)
  const total = Number(response.headers.get('content-length'))
  let buffer: ArrayBuffer
  if (response.body && total) {
    const reader = response.body.getReader(), chunks: Uint8Array[] = []
    let loaded = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value); loaded += value.length
      emit('progress', Math.min(99, Math.round(loaded / total * 100)))
    }
    const bytes = new Uint8Array(loaded)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
    buffer = bytes.buffer
  } else buffer = await response.arrayBuffer()
  const gltf = await new GLTFLoader().parseAsync(buffer, '')
  if (stopped) { disposeBrainModel(gltf.scene); return }
  return createBrainModel(gltf.scene)
}
async function loadHead() {
  try {
    const response = await fetch('/models/head/head.glb', { signal: abort.signal })
    if (!response.ok) throw new Error(`Head model HTTP ${response.status}`)
    const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), '')
    if (stopped) { disposeBrainModel(gltf.scene); return }
    head = createHeadModel(gltf.scene)
    model!.group.add(head.group)
    headBounds = new THREE.Box3().setFromObject(model!.group)
    emit('headReady')
  } catch (cause) {
    if (!stopped) { console.warn('[brain-atlas] Head outline failed to load', cause); emit('headError') }
  }
}

onMounted(async () => {
  if (!host.value) { emit('error', '无法创建画布，请重试。'); return }
  try {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    host.value.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.copy(overview)
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = !reducedMotion; controls.enablePan = false
    controls.minDistance = 5; controls.maxDistance = 35; controls.autoRotateSpeed = 0.5
    controls.addEventListener('start', cancelFocus)
    scene.add(new THREE.HemisphereLight('#fff5ee', '#505b60', 1.7))
    const key = new THREE.DirectionalLight('#fff0e4', 3)
    key.position.set(-4, 7, 5); scene.add(key)
    const rim = new THREE.DirectionalLight('#e1eaf0', 1.8)
    rim.position.set(4, 2, -4); scene.add(rim)
    const resize = () => {
      if (!host.value || !renderer || !camera) return
      const { width, height } = host.value.getBoundingClientRect()
      if (!width || !height) return
      const oldAspect = camera.aspect
      camera.aspect = width / height; camera.updateProjectionMatrix()
      if (ready.value && Math.abs(oldAspect - camera.aspect) > 0.001 && controls) frameView((focus ?? camera.position).clone().sub(focusTarget ?? controls.target))
      renderer.setSize(width, height, false); renderer.render(scene, camera); updateAxes()
      if (modelAdded && !ready.value) { ready.value = true; emit('ready') }
    }
    observer = new ResizeObserver(resize); observer.observe(host.value)
    visibilityObserver = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting) })
    visibilityObserver.observe(host.value)
    renderer.domElement.addEventListener('pointerdown', startDrag)
    renderer.domElement.addEventListener('pointerup', pick)
    resize()
    model = await loadModel()
    if (stopped || !model) return
    brainBounds = new THREE.Box3().setFromObject(model.group)
    await loadHead()
    if (stopped) return
    scene.add(model.group); modelAdded = true; appearance(); focusRegion()
    if (focus && focusTarget) { camera.position.copy(focus); controls.target.copy(focusTarget); cancelFocus(); controls.update() }
    resize()
    let lastAxes = 0, lastFrame = performance.now()
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate)
      const delta = Math.min((now - lastFrame) / 1000, 0.1)
      lastFrame = now
      if (!renderer || !camera || !controls || !visible || document.hidden) return
      if (focus && focusTarget) {
        const blend = 1 - Math.exp(-6 * delta)
        camera.position.lerp(focus, blend); controls.target.lerp(focusTarget, blend)
        if (camera.position.distanceTo(focus) + controls.target.distanceTo(focusTarget) < 0.01) cancelFocus()
      }
      controls.autoRotate = props.rotate && !focus && !reducedMotion
      controls.update(delta)
      renderer.render(scene, camera)
      if (now - lastAxes > 100) { updateAxes(); lastAxes = now }
    }
    frame = requestAnimationFrame(animate)
  } catch (cause) {
    if (stopped) return
    console.error('[brain-atlas] Scene initialization failed', cause)
    emit('error', '大脑模型加载失败或当前设备不支持 3D。可以重试，或通过结构列表阅读内容。')
  }
})
onBeforeUnmount(() => {
  stopped = true; abort.abort(); cancelAnimationFrame(frame)
  observer?.disconnect(); visibilityObserver?.disconnect()
  controls?.removeEventListener('start', cancelFocus); controls?.dispose()
  renderer?.domElement.removeEventListener('pointerdown', startDrag)
  renderer?.domElement.removeEventListener('pointerup', pick)
  renderer?.domElement.removeEventListener('webglcontextlost', contextLost)
  if (model) disposeBrainModel(model.group)
  renderer?.dispose(); renderer?.domElement.remove()
})
</script>

<template>
  <div ref="host" class="brain-canvas" role="img" aria-label="头部外形与内部大脑解剖模型，可拖动旋转，也可通过结构列表选择脑区">
    <svg v-if="ready" class="orientation" viewBox="0 0 90 90" aria-label="随视角旋转的解剖方向：前、后、左、右">
      <g v-for="axis in axes" :key="axis.label" :opacity="axis.depth < 0 ? 0.45 : 1">
        <line x1="45" y1="45" :x2="axis.x" :y2="axis.y" />
        <text :x="axis.x" :y="axis.y">{{ axis.label }}</text>
      </g>
      <circle cx="45" cy="45" r="2" />
    </svg>
  </div>
</template>
<style scoped>
.brain-canvas { position: absolute; inset: 38px 0 90px; z-index: 1; touch-action: none; }
.brain-canvas :deep(canvas) { display: block; width: 100%; height: 100%; cursor: grab; }
.brain-canvas :deep(canvas:active) { cursor: grabbing; }
.orientation { position: absolute; top: 0; right: 8px; width: 82px; height: 82px; pointer-events: none; color: var(--brain-muted); overflow: visible; }
.orientation line { stroke: currentColor; stroke-width: 0.6; }
.orientation text { font-size: 10px; text-anchor: middle; dominant-baseline: central; fill: currentColor; stroke: var(--brain-bg); stroke-width: 4px; paint-order: stroke; }
.orientation circle { fill: currentColor; }
</style>
