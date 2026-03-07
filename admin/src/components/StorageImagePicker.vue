<template>
  <!-- Trigger slot (shows current image or placeholder) -->
  <div class="img-picker-trigger" @click="open">
    <div v-if="modelValue" class="current-preview">
      <img :src="modelValue" :alt="alt" class="preview-img" />
      <div class="preview-overlay">
        <span>🖼️ Cambiar imagen</span>
      </div>
    </div>
    <div v-else class="no-image-placeholder">
      <span class="placeholder-icon">📷</span>
      <span class="placeholder-text">Seleccionar imagen</span>
    </div>
  </div>

  <!-- Picker Modal -->
  <Teleport to="body">
    <div v-if="isOpen" class="overlay" @click.self="close">
      <div class="img-modal">
        <div class="modal-header">
          <h2>🖼️ Galería de Imágenes</h2>
          <button class="btn btn-ghost btn-sm" @click="close">✕</button>
        </div>

        <!-- Upload zone -->
        <div class="upload-zone" :class="{ 'drag-over': dragging }"
          @dragover.prevent="dragging=true"
          @dragleave="dragging=false"
          @drop.prevent="onDrop">
          <label class="upload-label">
            <input type="file" accept="image/*" style="display:none"
              @change="onFileSelect" />
            <span class="upload-icon">⬆️</span>
            <span><strong>Haz clic o arrastra</strong> una imagen aquí</span>
            <span class="upload-hint">PNG, JPG, WebP, SVG — máximo <strong>45 MB</strong></span>
          </label>
          <!-- Upload progress -->
          <div v-if="uploading" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <span>{{ progress }}% — Subiendo…</span>
          </div>
          <div v-if="uploadError" class="upload-error">⚠️ {{ uploadError }}</div>
        </div>

        <!-- Search -->
        <div class="img-search">
          <input v-model="search" class="input" placeholder="🔍 Buscar imagen…" />
          <button class="btn btn-ghost btn-sm" @click="loadImages" :disabled="loading">
            {{ loading ? '…' : '↻ Recargar' }}
          </button>
        </div>

        <!-- Image grid -->
        <div v-if="loading" class="img-loading">Cargando imágenes…</div>
        <div v-else-if="filtered.length === 0" class="img-empty">
          <span>📭</span>
          <p>No hay imágenes. Sube la primera arriba.</p>
        </div>
        <div v-else class="img-grid">
          <div v-for="img in filtered" :key="img.name"
            class="img-item" :class="{ selected: selected === img.publicUrl }"
            @click="select(img.publicUrl)">
            <img :src="img.publicUrl" :alt="img.name" loading="lazy" />
            <div class="img-name">{{ shortName(img.name) }}</div>
            <div v-if="selected === img.publicUrl" class="img-check">✓</div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="close">Cancelar</button>
          <button class="btn btn-primary" :disabled="!selected" @click="confirm">
            Usar esta imagen
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '../lib/supabase'

const MAX_MB = 45
const MAX_BYTES = MAX_MB * 1024 * 1024

const props = defineProps({
  modelValue: String,          // current URL
  bucket:     { type: String, default: 'sponsor-logos' },
  alt:        { type: String, default: 'imagen' }
})
const emit = defineEmits(['update:modelValue'])

const isOpen   = ref(false)
const images   = ref([])
const selected = ref(props.modelValue || '')
const search   = ref('')
const loading  = ref(false)
const uploading= ref(false)
const progress = ref(0)
const uploadError = ref('')
const dragging = ref(false)

// Sync selection when v-model changes externally
watch(() => props.modelValue, v => { selected.value = v || '' })

const filtered = computed(() =>
  images.value.filter(i => i.name.toLowerCase().includes(search.value.toLowerCase()))
)

async function open() {
  isOpen.value = true
  selected.value = props.modelValue || ''
  await loadImages()
}
function close() { isOpen.value = false; uploadError.value = '' }

async function loadImages() {
  loading.value = true
  const { data, error } = await supabase.storage.from(props.bucket).list('', {
    limit: 200, sortBy: { column: 'created_at', order: 'desc' }
  })
  loading.value = false
  if (error || !data) { images.value = []; return }
  images.value = data
    .filter(f => f.name !== '.emptyFolderPlaceholder' && f.name)
    .map(f => ({
      name: f.name,
      publicUrl: supabase.storage.from(props.bucket).getPublicUrl(f.name).data.publicUrl
    }))
}

function select(url) { selected.value = url }
function confirm() { emit('update:modelValue', selected.value); close() }

function shortName(name) {
  return name.length > 22 ? '…' + name.slice(-19) : name
}

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) uploadFile(file)
}
function onFileSelect(e) {
  const file = e.target.files?.[0]
  if (file) uploadFile(file)
  e.target.value = ''
}

async function uploadFile(file) {
  uploadError.value = ''
  if (file.size > MAX_BYTES) {
    uploadError.value = `El archivo pesa ${(file.size/1024/1024).toFixed(1)} MB. El máximo permitido es ${MAX_MB} MB.`
    return
  }
  uploading.value = true
  progress.value = 0

  const ext  = file.name.split('.').pop()
  const name = `${Date.now()}.${ext}`

  // Simulate progress (Supabase storage doesn't give real progress)
  const timer = setInterval(() => { if (progress.value < 85) progress.value += 15 }, 200)

  const { error } = await supabase.storage.from(props.bucket).upload(name, file, { upsert: true })
  clearInterval(timer)
  progress.value = 100

  setTimeout(() => { uploading.value = false; progress.value = 0 }, 500)

  if (error) { uploadError.value = error.message; return }
  await loadImages()
  // Auto-select the just-uploaded image
  const newUrl = supabase.storage.from(props.bucket).getPublicUrl(name).data.publicUrl
  selected.value = newUrl
}
</script>

<style scoped>
.img-picker-trigger { cursor: pointer; border-radius: var(--radius); overflow: hidden; }
.current-preview { position: relative; }
.current-preview img { width: 100%; height: 140px; object-fit: cover; border-radius: var(--radius); }
.preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .2s; border-radius: var(--radius); color: #fff; font-size: .875rem; font-weight: 600; }
.current-preview:hover .preview-overlay { opacity: 1; }
.no-image-placeholder { border: 2px dashed var(--border); border-radius: var(--radius); height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .5rem; color: var(--text-muted); transition: border-color .2s; }
.no-image-placeholder:hover { border-color: var(--accent); color: var(--accent); }
.placeholder-icon { font-size: 2rem; }
.placeholder-text { font-size: .875rem; }

/* Modal */
.img-modal { background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius); width: min(900px, 95vw); max-height: 90vh; display: flex; flex-direction: column; box-shadow: var(--shadow); }
.upload-zone { margin: 1rem; border: 2px dashed var(--border); border-radius: var(--radius); padding: 1.25rem; text-align: center; transition: all .2s; }
.upload-zone.drag-over { border-color: var(--accent); background: rgba(201,169,122,.08); }
.upload-label { display: flex; flex-direction: column; align-items: center; gap: .4rem; cursor: pointer; color: var(--text-muted); font-size: .875rem; }
.upload-icon { font-size: 1.75rem; }
.upload-hint { font-size: .75rem; color: var(--text-muted); }
.upload-progress { margin-top: .75rem; }
.progress-bar { background: var(--bg-3); border-radius: 99px; height: 6px; overflow: hidden; margin-bottom: .35rem; }
.progress-fill { background: var(--accent); height: 100%; border-radius: 99px; transition: width .3s; }
.upload-error { margin-top: .5rem; color: var(--danger); font-size: .8rem; }
.img-search { display: flex; gap: .75rem; padding: 0 1rem .75rem; }
.img-search .input { flex: 1; }
.img-loading, .img-empty { text-align: center; padding: 2rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: .5rem; font-size: 1.5rem; }
.img-empty span { font-size: 3rem; }
.img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: .5rem; padding: 0 1rem; overflow-y: auto; max-height: 380px; }
.img-item { position: relative; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: all .2s; background: var(--bg-3); }
.img-item:hover { border-color: var(--accent-dim); transform: scale(1.03); }
.img-item.selected { border-color: var(--accent); }
.img-item img { width: 100%; height: 90px; object-fit: cover; display: block; }
.img-name { font-size: .65rem; color: var(--text-muted); padding: .25rem .35rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.img-check { position: absolute; top: 4px; right: 4px; background: var(--accent); color: var(--bg-1); width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 700; }
</style>
