<script setup lang="ts">
import { computed, onBeforeUnmount, onErrorCaptured, onMounted, ref, shallowRef, type Component } from 'vue'
import { regions, sources, stories, type RegionId } from '~/data/brain'

const selected = ref<RegionId | null>(null)
const region = computed(() => regions.find(item => item.id === selected.value)!)
const view = ref<'overview' | 'left' | 'right' | 'front'>('overview')
const progress = ref(0)
const interior = ref(false)
const showHead = ref(true)
const headStatus = ref<'loading' | 'ready' | 'error'>('loading')
const headVisible = computed(() => showHead.value && headStatus.value === 'ready')
const rotate = ref(false)
const resetKey = ref(0)
const mode = ref<'explore' | 'story'>('explore')
const storyIndex = ref(0)
const step = ref(0)
const story = computed(() => stories[storyIndex.value]!)
const currentStep = computed(() => story.value.steps[step.value]!)
const activeSource = computed(() => regions.find(item => item.id === currentStep.value.region)!.source)
const sceneComponent = shallowRef<Component | null>(null)
const ready = ref(false)
const error = ref('')
let timeout: ReturnType<typeof setTimeout> | undefined
let request = 0

function select(id: RegionId) {
  selected.value = id
  interior.value = id === 'hippocampus'
}
function wholeBrain() {
  selected.value = null
  interior.value = false
  setView('overview')
}
function setView(next: typeof view.value) { view.value = next; resetKey.value++ }
function syncStep() { select(currentStep.value.region) }
function startStory(index: number) {
  mode.value = 'story'
  storyIndex.value = index
  step.value = 0
  syncStep()
}
function changeStep(delta: number) {
  step.value = Math.max(0, Math.min(story.value.steps.length - 1, step.value + delta))
  syncStep()
}
function fail(message: string) {
  clearTimeout(timeout)
  error.value = message
  sceneComponent.value = null
}
function sceneReady() {
  clearTimeout(timeout)
  ready.value = true
}
async function loadScene() {
  const currentRequest = ++request
  clearTimeout(timeout)
  sceneComponent.value = null
  ready.value = false
  progress.value = 0
  headStatus.value = 'loading'
  error.value = ''
  timeout = setTimeout(() => fail('大脑模型加载超时。可以重试，结构与生活案例仍可阅读。'), 60000)
  try {
    // The renderer and Three.js are requested only after this page mounts in a browser.
    const scene = await import('./BrainScene.vue')
    if (currentRequest === request && !error.value) sceneComponent.value = scene.default
  } catch (cause) {
    if (currentRequest !== request) return
    console.error('[brain-atlas] Scene module failed to load', cause)
    fail('3D 资源未能加载。请重试，或继续阅读脑区知识。')
  }
}
onMounted(loadScene)
onErrorCaptured((cause) => {
  console.error('[brain-atlas] Scene component error', cause)
  fail('3D 视图暂时不可用。可以重试，或通过结构列表继续阅读。')
  return false
})
onBeforeUnmount(() => { request++; clearTimeout(timeout) })
</script>

<template>
  <section class="brain-explorer" aria-label="脑区知识与生活案例">
    <div class="explorer-toolbar">
      <div class="mode-switch" role="group" aria-label="探索方式">
        <button type="button" :aria-pressed="mode === 'explore'" @click="mode = 'explore'">脑区地图</button>
        <button type="button" :aria-pressed="mode === 'story'" @click="startStory(storyIndex)">生活案例</button>
      </div>
      <span class="toolbar-note">六类结构 · 三个生活案例</span>
    </div>

    <div v-if="mode === 'story'" class="story-section">
      <div class="story-options" role="group" aria-label="选择生活案例">
        <button v-for="(item, index) in stories" :key="item.title" type="button" :aria-pressed="storyIndex === index" @click="startStory(index)">
          <span>{{ item.eyebrow }}</span><strong>{{ item.title }}</strong>
        </button>
      </div>
      <div class="story-player" aria-live="polite">
        <div>
          <p class="eyebrow">步骤 {{ step + 1 }} / {{ story.steps.length }}</p>
          <h2>{{ currentStep.title }}</h2>
          <p>{{ currentStep.text }}</p>
          <a :href="activeSource.url" target="_blank" rel="noopener noreferrer">相关资料 ↗</a>
        </div>
        <div class="step-controls">
          <button type="button" :disabled="step === 0" @click="changeStep(-1)">上一步</button>
          <button v-if="step < story.steps.length - 1" type="button" class="primary" @click="changeStep(1)">下一步 →</button>
          <button v-else type="button" class="primary" @click="mode = 'explore'">自由探索</button>
        </div>
      </div>
    </div>

    <div class="explorer-workspace">
      <aside class="region-index" aria-label="脑结构索引">
        <p class="panel-label">结构索引 <span>01 — 06</span></p>
        <button type="button" class="whole-brain" :aria-pressed="selected === null" @click="wholeBrain">完整大脑 <span>概览</span></button>
        <button v-for="(item, index) in regions" :key="item.id" type="button" class="region-button" :aria-pressed="selected === item.id" @click="select(item.id)">
          <span class="region-number">0{{ index + 1 }}</span>
          <span class="region-dot" :style="{ background: item.color }" />
          <span>{{ item.name }}<small>{{ item.en }}</small></span>
        </button>
        <p class="index-note">一个区域不等于一种能力，<br />大脑以网络协作。</p>
      </aside>

      <div class="viewer">
        <div class="viewer-labels"><span>{{ interior ? '透视 · 查看内部结构' : headVisible ? '头部与大脑 · 拖动探索' : '完整脑形态 · 拖动探索' }}</span><span>HRA / 解剖模型</span></div>
        <component :is="sceneComponent" v-if="sceneComponent && !error" :selected="selected" :interior="interior" :show-head="showHead" :reset-key="resetKey" :rotate="rotate" :view="view" @select="select" @ready="sceneReady" @head-ready="headStatus = 'ready'" @head-error="headStatus = 'error'" @progress="progress = $event" @error="fail" />
        <div v-if="!ready && !error" class="scene-message" role="status">{{ progress > 0 ? `正在加载模型 · ${progress}%` : '正在加载头部与大脑…' }}<small>首次打开需要下载模型，请稍候</small></div>
        <div v-if="error" class="scene-message" role="alert"><p>{{ error }}</p><button type="button" class="retry-button" @click="loadScene">重试 3D 视图</button></div>
        <div class="model-caption"><span v-if="region" class="region-dot" :style="{ background: region.color }" />{{ region ? region.name : headVisible ? '头部轮廓 · 看见大脑在头部的位置' : '完整大脑 · 左右半球、小脑与脑干' }}</div>
        <div class="viewer-controls">
          <div class="view-presets" role="group" aria-label="观察方向"><button type="button" :disabled="!ready || !!error" @click="setView('left')">左侧</button><button type="button" :disabled="!ready || !!error" @click="setView('right')">右侧</button><button type="button" :disabled="!ready || !!error" @click="setView('front')">正面</button></div>
          <div><button type="button" :aria-pressed="rotate" :disabled="!ready || !!error" aria-label="自动旋转" @click="rotate = !rotate">自动旋转</button><button type="button" :disabled="!ready || !!error" @click="setView('overview')">重置视角</button></div>
        </div>
        <p class="viewer-hint">拖动旋转 · 滚轮缩放 · 点击高亮脑区查看介绍</p>
      </div>

      <aside class="region-detail" aria-live="polite" aria-atomic="true">
        <template v-if="region">
        <p class="eyebrow">{{ region.en }}</p>
        <h2>{{ region.name }}</h2>
        <span class="region-tag" :style="{ '--region-color': region.color }">{{ region.tag }}</span>
        <p v-if="selected === 'prefrontal'" class="mapping-note">高亮相关额叶脑回以提示位置，不代表精确的前额叶功能边界。</p>
        <div class="detail-block"><h3>它在哪里？</h3><p>{{ region.location }}</p></div>
        <div class="detail-block"><h3>它参与什么？</h3><p>{{ region.description }}</p></div>
        <div class="life-note"><h3>在生活里</h3><p>{{ region.example }}</p></div>
        <a class="source-link" :href="region.source.url" target="_blank" rel="noopener noreferrer">阅读资料来源 ↗</a>
        </template>
        <template v-else>
          <p class="eyebrow">HEAD &amp; BRAIN</p><h2>大脑，在头部的哪里？</h2>
          <p class="overview-intro">半透明的头部保留额头、鼻子、下颌与颈部轮廓。对照外形，更容易理解大脑前后方向，以及脑区的大致位置。</p>
          <div class="detail-block"><h3>从外形开始</h3><p>拖动模型观察头部与大脑的关系，也可以关闭头部轮廓，只看脑沟、脑回、小脑和脑干。方向标记表示头部自身的前、后、左、右。</p></div>
          <div class="life-note"><h3>选一个你想了解的区域</h3><p>点击左侧结构名称，对应部位会高亮。选择海马时，自动透视周围组织，查看内部位置。</p></div>
          <button type="button" class="overview-start" @click="select('prefrontal')">从前额叶开始 →</button>
        </template>
        <div class="view-settings">
          <label class="interior-toggle"><span>头部轮廓<small>{{ headStatus === 'error' ? '外形未能加载' : '显示五官与头颈参照' }}</small></span><input v-model="showHead" type="checkbox" :disabled="headStatus !== 'ready'" /><span class="switch" aria-hidden="true" /></label>
          <label class="interior-toggle"><span>透视皮层<small>查看内部结构</small></span><input v-model="interior" type="checkbox" /><span class="switch" aria-hidden="true" /></label>
        </div>
      </aside>
    </div>

    <div class="explorer-notes">
      <div><p>模型：<a href="https://purl.humanatlas.io/ref-organ/brain-male/v1.3" target="_blank" rel="noopener noreferrer">HRA 大脑</a> / <a href="https://purl.humanatlas.io/ref-organ/skin-male/v1.2" target="_blank" rel="noopener noreferrer">头部皮肤</a> · Browne / Schlehlein · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>。头部为外形参照，未展示颅骨；分组高亮用于入门科普。</p><p v-if="headStatus === 'error' && !error" class="head-warning" role="status">头部外形暂未加载，当前仍可探索大脑。<button type="button" @click="loadScene">重新加载</button></p></div>
      <details><summary>模型与知识来源</summary><ul><li><a href="/models/brain/NOTICE.txt" target="_blank" rel="noopener noreferrer">大脑模型署名与处理说明 ↗</a></li><li><a href="/models/head/NOTICE.txt" target="_blank" rel="noopener noreferrer">头部模型署名与处理说明 ↗</a></li><li v-for="source in sources" :key="source.url"><a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.label }} ↗</a></li></ul></details>
    </div>
  </section>
</template>

<style scoped>
.brain-explorer {
  --brain-bg: #faf9f5;
  --brain-soft: #efefe6;
  --brain-border: #dfdfd5;
  --brain-text: #283d35;
  --brain-muted: #727b6f;
  --brain-accent: #315b40;
  --brain-active: #e4eadb;
  --brain-viewer: radial-gradient(ellipse at center, #e4e9db, #f2f4eb 70%);
  color: var(--brain-text);
  font-size: 14px;
}
:global(.dark) .brain-explorer {
  --brain-bg: #1c211c;
  --brain-soft: #252d25;
  --brain-border: #394237;
  --brain-text: #e4e7dc;
  --brain-muted: #acb5a3;
  --brain-accent: #a1c5a8;
  --brain-active: #334833;
  --brain-viewer: radial-gradient(ellipse at center, #2c382c, #191f1a 75%);
}
.brain-explorer button { font: inherit; cursor: pointer; color: inherit; }
.brain-explorer button:disabled { opacity: 0.4; cursor: default; }
.brain-explorer button:focus-visible, .brain-explorer a:focus-visible, .brain-explorer summary:focus-visible { outline: 2px solid var(--brain-accent); outline-offset: 4px; }
.explorer-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-bottom: 16px; }
.toolbar-note { font-size: 11px; color: var(--brain-muted); }
.mode-switch { display: flex; gap: 4px; border: 1px solid var(--brain-border); padding: 4px; border-radius: 9px; }
.mode-switch button { font-size: 12px; padding: 8px 14px; border-radius: 6px; }
.mode-switch button[aria-pressed=true] { background: var(--brain-active); color: var(--brain-accent); }
.explorer-workspace { display: grid; grid-template-columns: 175px minmax(0, 1fr) 265px; overflow: hidden; border: 1px solid var(--brain-border); border-radius: 14px; background: var(--brain-bg); }
.region-index { display: flex; flex-direction: column; border-right: 1px solid var(--brain-border); padding: 22px 12px; }
.panel-label { display: flex; justify-content: space-between; font-size: 10px; color: var(--brain-muted); margin: 0 4px 18px; }
.panel-label span { font-size: 9px; }
.whole-brain { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding: 10px 8px; border: 1px solid var(--brain-border); border-radius: 7px; text-align: left; font-size: 12px !important; }
.whole-brain span { font-size: 9px; color: var(--brain-muted); }
.whole-brain[aria-pressed=true] { background: var(--brain-active); border-color: var(--brain-accent); }
.region-button { display: flex; align-items: center; gap: 7px; border-radius: 7px; text-align: left; padding: 13px 7px; margin-bottom: 6px; }
.region-button[aria-pressed=true], .region-button:hover { background: var(--brain-active); }
.region-button > span:last-child { font-size: 12px; }
.region-button small { display: block; font-size: 9px; color: var(--brain-muted); margin-top: 5px; }
.region-number { font-size: 9px; color: var(--brain-muted); }
.region-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.index-note { margin: auto 4px 0; padding-top: 24px; font-size: 10px; line-height: 1.9; color: var(--brain-muted); }
.viewer { position: relative; min-width: 0; min-height: 580px; overflow: hidden; background: var(--brain-viewer); }
.viewer-labels { position: absolute; top: 20px; left: 18px; right: 18px; display: flex; justify-content: space-between; font-size: 9px; color: var(--brain-muted); }
.model-caption { position: absolute; z-index: 2; bottom: 88px; left: 50%; display: flex; align-items: center; gap: 8px; transform: translateX(-50%); background: var(--brain-bg); border: 1px solid var(--brain-border); border-radius: 6px; padding: 8px 12px; white-space: nowrap; font-size: 11px; }
.viewer-controls { position: absolute; z-index: 2; left: 18px; right: 18px; bottom: 38px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.viewer-hint { position: absolute; left: 12px; right: 12px; bottom: 14px; text-align: center; color: var(--brain-muted); font-size: 9px; }
.viewer-controls > span { font-size: 9px; color: var(--brain-muted); }
.viewer-controls > div { display: flex; gap: 5px; }
.viewer-controls button { font-size: 10px; padding: 7px 9px; border: 1px solid var(--brain-border); border-radius: 5px; background: var(--brain-bg); }
.viewer-controls button[aria-pressed=true] { background: var(--brain-active); }
.scene-message { position: absolute; z-index: 3; top: 42%; left: 8%; right: 8%; padding: 20px; background: var(--brain-bg); border: 1px solid var(--brain-border); border-radius: 9px; text-align: center; font-size: 12px; line-height: 1.9; color: var(--brain-muted); }
.scene-message small { display: block; margin-top: 5px; font-size: 10px; }
.overview-intro { font-size: 13px; line-height: 1.95; color: var(--brain-muted); }
.overview-start { align-self: flex-start; font-size: 12px !important; color: var(--brain-accent) !important; margin: 20px 0; }
.mapping-note { margin-top: 12px; font-size: 10px; line-height: 1.8; color: var(--brain-muted); }
.retry-button { margin-top: 12px; border-bottom: 1px solid var(--brain-accent); color: var(--brain-accent); }
.region-detail { display: flex; flex-direction: column; padding: 25px 22px; border-left: 1px solid var(--brain-border); }
.eyebrow { font-size: 10px; letter-spacing: 1px; color: var(--brain-muted); margin-bottom: 8px; }
.region-detail h2 { margin-bottom: 14px; font-family: var(--font-serif); font-size: 24px; font-weight: 600; }
.region-tag { align-self: flex-start; padding: 5px 8px; border: 1px solid color-mix(in srgb, var(--region-color) 40%, transparent); border-radius: 4px; background: color-mix(in srgb, var(--region-color) 13%, transparent); font-size: 10px; }
.detail-block { margin-top: 22px; }
.detail-block h3, .life-note h3 { font-size: 12px; margin-bottom: 7px; font-weight: 600; }
.detail-block p, .life-note p { font-size: 12px; line-height: 1.95; color: var(--brain-muted); }
.life-note { margin-top: 20px; padding: 13px; background: var(--brain-soft); border-left: 2px solid var(--brain-accent); }
.source-link { align-self: flex-start; margin: 15px 0 20px; font-size: 10px; color: var(--brain-accent); }
.view-settings { margin-top: auto; }
.interior-toggle { display: flex; position: relative; align-items: center; justify-content: space-between; border-top: 1px solid var(--brain-border); padding-top: 15px; cursor: pointer; font-size: 12px; }
.interior-toggle + .interior-toggle { margin-top: 15px; }
.interior-toggle input:disabled + .switch { opacity: 0.4; }
.head-warning { margin-top: 5px; }
.head-warning button { color: var(--brain-accent); margin-left: 8px; text-decoration: underline; }
.interior-toggle small { display: block; font-size: 10px; color: var(--brain-muted); margin-top: 4px; }
.interior-toggle input { position: absolute; right: 0; width: 35px; height: 24px; opacity: 0; }
.switch { position: relative; width: 32px; height: 18px; background: var(--brain-border); border-radius: 20px; }
.switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 12px; height: 12px; background: var(--brain-bg); border-radius: 50%; transition: transform .2s; }
.interior-toggle input:checked + .switch { background: var(--brain-accent); }
.interior-toggle input:checked + .switch::after { transform: translateX(14px); }
.interior-toggle input:focus-visible + .switch { outline: 2px solid var(--brain-accent); outline-offset: 4px; }
.story-section { margin: 20px 0; }
.story-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.story-options button { text-align: left; padding: 16px; border: 1px solid var(--brain-border); border-radius: 8px; background: var(--brain-bg); }
.story-options button[aria-pressed=true] { background: var(--brain-active); border-color: var(--brain-accent); }
.story-options span { display: block; font-size: 10px; color: var(--brain-muted); margin-bottom: 9px; }
.story-options strong { font-size: 13px; font-weight: 500; }
.story-player { display: flex; justify-content: space-between; align-items: center; gap: 28px; border: 1px solid var(--brain-border); background: var(--brain-soft); border-radius: 8px; padding: 20px; margin-top: 12px; }
.story-player h2 { font-size: 17px; font-weight: 600; margin-bottom: 8px; }
.story-player p:not(.eyebrow) { max-width: 760px; font-size: 12px; line-height: 1.9; color: var(--brain-muted); }
.story-player a { display: inline-block; margin-top: 8px; font-size: 10px; color: var(--brain-accent); }
.step-controls { display: flex; flex-shrink: 0; gap: 8px; }
.step-controls button { font-size: 11px; padding: 9px 12px; border-radius: 5px; border: 1px solid var(--brain-border); }
.step-controls .primary { color: var(--brain-bg); background: var(--brain-accent); border-color: var(--brain-accent); }
.explorer-notes { display: flex; justify-content: space-between; align-items: start; gap: 20px; margin-top: 15px; color: var(--brain-muted); font-size: 10px; line-height: 1.9; }
.explorer-notes summary { cursor: pointer; white-space: nowrap; }
.explorer-notes ul { padding-top: 8px; }
.explorer-notes a { color: var(--brain-accent); }
@media (max-width: 1000px) { .explorer-workspace { grid-template-columns: 155px minmax(0, 1fr) 235px; } .region-detail { padding: 22px 17px; } .viewer-controls { flex-wrap: wrap; } }
@media (max-width: 800px) {
  .explorer-workspace { grid-template-columns: 1fr; }
  .region-index { display: grid; grid-template-columns: repeat(3, 1fr); border-right: 0; border-bottom: 1px solid var(--brain-border); padding: 16px 12px; }
  .panel-label { grid-column: 1 / -1; margin-bottom: 10px; }
  .whole-brain { grid-column: 1 / -1; margin-bottom: 8px; }
  .region-button { padding: 10px 7px; margin: 0; }
  .region-button small { font-size: 8px; }
  .region-number, .index-note { display: none; }
  .viewer { min-height: 440px; }
  .region-detail { border-left: 0; border-top: 1px solid var(--brain-border); padding: 22px; }
  .story-player { align-items: start; flex-direction: column; gap: 16px; }
  .story-options { grid-template-columns: 1fr; }
  .story-options button { padding: 12px 15px; }
  .story-options span { margin-bottom: 4px; }
  .explorer-notes { flex-direction: column; gap: 8px; }
}
@media (max-width: 420px) { .toolbar-note { display: none; } .region-button > span:last-child { font-size: 11px; } .viewer-labels { font-size: 8px; } .viewer-controls { left: 10px; right: 10px; gap: 4px; } .viewer-controls button { padding: 7px 6px; } .model-caption { font-size: 10px; } }
@media (prefers-reduced-motion: reduce) { .brain-explorer * { transition: none !important; } }
</style>
