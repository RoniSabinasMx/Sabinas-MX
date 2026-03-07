<template>
  <div>
    <div class="page-header">
      <h1>⭐ Patrocinadores</h1>
      <button class="btn btn-primary" @click="openNew">
        <span>+</span> Agregar patrocinador
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="sponsors.length === 0" class="empty-state">
      <span>⭐</span>
      <h3>Sin patrocinadores aún</h3>
      <p>Agrega el primero con el botón de arriba.</p>
    </div>

    <!-- Grid of sponsor cards -->
    <div v-else class="grid-sponsors">
      <div v-for="s in sponsors" :key="s.id" class="sponsor-card card">
        <!-- Logo picker inline -->
        <div class="sponsor-logo-area">
          <StorageImagePicker v-model="s.logo_url" bucket="sponsor-logos"
            @update:model-value="val => updateLogo(s, val)" />
        </div>

        <!-- Info -->
        <div class="sponsor-body">
          <h3 class="sponsor-name">{{ s.name }}</h3>
          <p class="sponsor-desc">{{ s.description || '—' }}</p>
          <a :href="s.url" target="_blank" class="url-link">🔗 {{ s.url }}</a>
          <div class="clicks-badge">
            👆 <strong>{{ s.clicks || 0 }}</strong> clics totales
          </div>
        </div>

        <!-- Actions -->
        <div class="sponsor-actions">
          <button class="btn btn-ghost btn-sm" @click="editSponsor(s)">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" @click="deleteSponsor(s.id)">🗑 Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Analytics chart (collapsible) -->
    <div v-if="sponsors.length">
      <button class="btn btn-ghost stats-toggle" @click="showChart = !showChart">
        <span>{{ showChart ? '▼' : '▶' }}</span>
        📊 {{ showChart ? 'Ocultar estadísticas' : 'Ver estadísticas de clics' }}
      </button>
      <div v-show="showChart" class="card mt-4 chart-card">
        <h2 style="margin-bottom:1rem">📊 Clics por patrocinador</h2>
        <Bar :data="chartData" :options="chartOptions" style="max-height:200px" />
      </div>
    </div>

    <!-- Add/Edit modal -->
    <div v-if="showModal" class="overlay" @click.self="showModal=false">
      <div class="modal" style="max-width:540px">
        <div class="modal-header">
          <h2>{{ editingId ? '✏️ Editar' : '➕ Nuevo' }} Patrocinador</h2>
          <button class="btn btn-ghost btn-sm" @click="showModal=false">✕</button>
        </div>
        <div class="modal-body">
          <div>
            <label class="field-label">🏷️ Nombre</label>
            <input v-model="form.name" class="input" maxlength="80" placeholder="Nombre del patrocinador" />
          </div>
          <div>
            <label class="field-label">📝 Descripción</label>
            <textarea v-model="form.description" class="input" rows="2"
              maxlength="300" placeholder="Breve descripción del patrocinador…" />
          </div>
          <div>
            <label class="field-label">🔗 Sitio web</label>
            <input v-model="form.url" class="input" type="url" placeholder="https://…" />
          </div>
          <div>
            <label class="field-label">🖼️ Logo</label>
            <StorageImagePicker v-model="form.logo_url" bucket="sponsor-logos" />
          </div>
          <div>
            <label class="field-label">🔢 Orden</label>
            <input v-model.number="form.sort_order" type="number" class="input" style="width:90px" min="1" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showModal=false">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="saveSponsor">
            {{ saving ? '💾 Guardando…' : '✅ Guardar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { supabase } from '../lib/supabase'
import { useToastStore } from '../stores/toast'
import { sanitizeObject } from '../utils/sanitize'
import { useSubmitLock } from '../utils/rateLimit'
import StorageImagePicker from '../components/StorageImagePicker.vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const toast    = useToastStore()
const sponsors = ref([])
const showModal= ref(false)
const showChart= ref(false)
const editingId= ref(null)
const saving   = ref(false)
const lock     = useSubmitLock()
const form     = reactive({ name:'', description:'', url:'#', logo_url:'', sort_order:1 })

const chartData = computed(() => ({
  labels: sponsors.value.map(s => s.name),
  datasets: [{ label:'Clics', data: sponsors.value.map(s => s.clicks || 0),
    backgroundColor:'rgba(201,169,122,.55)', borderColor:'#c9a97a', borderWidth:1, borderRadius:6 }]
}))
const chartOptions = {
  responsive:true, plugins:{ legend:{ display:false } },
  scales:{
    x:{ ticks:{ color:'#7A7268' }, grid:{ color:'#f0ede8' } },
    y:{ ticks:{ color:'#7A7268' }, grid:{ color:'#f0ede8' } }
  }
}

async function load() {
  const { data } = await supabase.from('sponsors').select('*').order('sort_order')
  sponsors.value = data || []
}

async function updateLogo(sponsor, url) {
  await supabase.from('sponsors').update({ logo_url: url }).eq('id', sponsor.id)
  sponsor.logo_url = url
  toast.add('Logo actualizado ✓')
}

function openNew() {
  editingId.value = null
  Object.assign(form, { name:'', description:'', url:'#', logo_url:'', sort_order: sponsors.value.length + 1 })
  showModal.value = true
}
function editSponsor(s) {
  editingId.value = s.id
  Object.assign(form, { name:s.name, description:s.description||'', url:s.url, logo_url:s.logo_url||'', sort_order:s.sort_order })
  showModal.value = true
}

async function saveSponsor() {
  if (!lock.acquire()) return
  saving.value = true
  const payload = sanitizeObject({ ...form })
  let err
  if (editingId.value) {
    ;({ error:err } = await supabase.from('sponsors').update(payload).eq('id', editingId.value))
  } else {
    ;({ error:err } = await supabase.from('sponsors').insert(payload))
  }
  saving.value = false; lock.release()
  if (err) { toast.add(err.message, 'error'); return }
  showModal.value = false; editingId.value = null
  toast.add('Patrocinador guardado ✓'); load()
}

async function deleteSponsor(id) {
  if (!confirm('¿Eliminar este patrocinador?')) return
  await supabase.from('sponsors').delete().eq('id', id)
  toast.add('Eliminado', 'warn'); load()
}

onMounted(load)
</script>

<style scoped>
.grid-sponsors { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.25rem; }
.sponsor-card  { display:flex; flex-direction:column; gap:.85rem; }
.sponsor-logo-area { min-height: 80px; }
.sponsor-body  { display:flex; flex-direction:column; gap:.35rem; }
.sponsor-name  { font-size:1.05rem; font-weight:700; margin:0; color:var(--text); }
.sponsor-desc  { font-size:.82rem; color:var(--text-muted); margin:0; line-height:1.4; }
.url-link      { font-size:.78rem; color:var(--accent); text-decoration:none; }
.url-link:hover { text-decoration:underline; }
.clicks-badge  { display:inline-flex; align-items:center; gap:.4rem; font-size:.82rem; color:var(--text-muted); background:var(--bg-page); border:1px solid var(--border); border-radius:6px; padding:.2rem .6rem; width:fit-content; margin-top:.2rem; }
.clicks-badge strong { color:var(--text); font-weight:700; }
.sponsor-actions { display:flex; gap:.5rem; }
.stats-toggle { margin-bottom: .25rem; font-size:.85rem; gap:.5rem; }
.chart-card { animation: slideUp .2s ease; }
.field-label   { display:block; font-size:.8rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:.04em; margin-bottom:.4rem; }
.empty-state   { text-align:center; padding:3rem 1rem; color:var(--text-muted); }
.empty-state span { font-size:3rem; display:block; margin-bottom:1rem; }
</style>
