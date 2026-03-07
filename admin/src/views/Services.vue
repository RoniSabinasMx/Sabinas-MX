<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>🌿 Servicios</h1>
        <p style="margin-top:.2rem;font-size:.85rem;color:var(--text-muted)">{{ services.length }} servicios en el catálogo</p>
      </div>
      <button class="btn btn-primary" @click="openNew">
        <span style="font-size:1.1rem">✚</span> Nuevo Servicio
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-row">
      <div class="pill-filters">
        <button class="pill" :class="{ active: filterCat === '' }" @click="filterCat = ''">Todos</button>
        <button class="pill pill-sage" :class="{ active: filterCat === 'cuerpo' }"   @click="filterCat = 'cuerpo'">💆 Cuerpo</button>
        <button class="pill pill-sage" :class="{ active: filterCat === 'espiritu' }" @click="filterCat = 'espiritu'">✨ Espíritu</button>
        <button class="pill pill-sage" :class="{ active: filterCat === 'mente' }"    @click="filterCat = 'mente'">🧠 Mente</button>
      </div>
      <input v-model="search" class="input search-input" placeholder="🔍 Buscar servicio…" />
    </div>

    <!-- Gallery Grid -->
    <div v-if="filtered.length > 0" class="services-gallery">
      <div v-for="s in filtered" :key="s.id" class="service-card">
        <!-- Image area -->
        <div class="service-img-wrap" :style="imgStyle(s)">
          <div class="service-overlay">
            <span class="service-cat-badge" :class="'cat-' + s.category">{{ s.category }}</span>
            <button class="edit-overlay-btn" @click="openEdit(s)">✏️ Editar</button>
          </div>
        </div>

        <!-- Info area -->
        <div class="service-info">
          <h3 class="service-name">{{ s.name_es }}</h3>
          <p class="service-name-en">{{ s.name_en }}</p>
          <div class="service-meta">
            <span class="meta-chip">
              <span>⏱</span> {{ s.duration || '—' }}
            </span>
            <span class="meta-chip">
              <span>🌊</span> {{ s.element || '—' }}
            </span>
          </div>
          <div class="service-actions">
            <button class="btn btn-ghost btn-sm" style="flex:1" @click="openEdit(s)">Editar</button>
            <button class="btn btn-danger btn-sm" @click="openDelete(s)">🗑</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="card empty-state">
      <div class="empty-icon">🌿</div>
      <h3>Sin resultados</h3>
      <p>No hay servicios que coincidan con tu búsqueda o filtro.<br>Prueba cambiando la categoría o el texto.</p>
      <button class="btn btn-ghost" @click="filterCat = ''; search = ''">Limpiar filtros</button>
    </div>

    <!-- Modals -->
    <ServiceModal v-if="showModal" :service="editing" :is-new="isNew"
      @close="showModal = false" @saved="onSaved" />
    <DeleteModal v-if="showDelete" :service="deleting" :all-services="services"
      @close="showDelete = false" @deleted="onDeleted" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useToastStore } from '../stores/toast'
import ServiceModal from '../components/ServiceModal.vue'
import DeleteModal from '../components/DeleteModal.vue'

const route   = useRoute()
const toast   = useToastStore()
const services = ref([])
const search   = ref('')
const filterCat = ref('')
const showModal  = ref(false)
const showDelete = ref(false)
const editing  = ref(null)
const deleting = ref(null)
const isNew    = ref(false)

const filtered = computed(() => {
  let s = services.value
  if (search.value) s = s.filter(x =>
    x.name_es?.toLowerCase().includes(search.value.toLowerCase()) ||
    x.name_en?.toLowerCase().includes(search.value.toLowerCase()))
  if (filterCat.value) s = s.filter(x => x.category === filterCat.value)
  return s
})

function imgStyle(s) {
  if (s.image_url) {
    return { backgroundImage: `url(${s.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return { background: 'linear-gradient(135deg, #e8e4dc 0%, #d4c9b8 100%)' }
}

async function load() {
  const { data } = await supabase.from('services').select('*').order('sort_order')
  services.value = data || []
}

function openNew() {
  isNew.value = true
  editing.value = { id: '', name_es: '', name_en: '', category: 'cuerpo', modality: ['indiv'], intensity: 'suave', element: 'agua', duration: '', wa_es: '', wa_en: '', sort_order: services.value.length + 1 }
  showModal.value = true
}
function openEdit(s)   { isNew.value = false; editing.value = { ...s }; showModal.value = true }
function openDelete(s) { deleting.value = s; showDelete.value = true }
function onSaved()   { showModal.value  = false; load(); toast.add('Servicio guardado ✓') }
function onDeleted() { showDelete.value = false; load(); toast.add('Servicio eliminado', 'warn') }

// Auto-open new modal if ?new=1
watch(() => route.query.new, v => { if (v === '1') openNew() }, { immediate: true })

onMounted(load)
</script>

<style scoped>
.filters-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.search-input {
  width: 220px;
  flex-shrink: 0;
}

/* ── Gallery ── */
.services-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.service-card {
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition);
}
.service-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--border);
}

/* Image */
.service-img-wrap {
  position: relative;
  aspect-ratio: 4/3;
  background: var(--bg-hover);
}
.service-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: .75rem;
  background: linear-gradient(to bottom, rgba(0,0,0,.05) 0%, rgba(0,0,0,.45) 100%);
  opacity: 0;
  transition: opacity var(--transition);
}
.service-card:hover .service-overlay { opacity: 1; }

.service-cat-badge {
  align-self: flex-start;
  padding: .2rem .55rem;
  border-radius: 99px;
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
}
.cat-cuerpo   { background: #a87c52; color: #fff; }
.cat-espiritu { background: #5f7a55; color: #fff; }
.cat-mente    { background: #4d79b0; color: #fff; }

.edit-overlay-btn {
  background: rgba(255,255,255,.9);
  border: none;
  border-radius: 8px;
  padding: .4rem .8rem;
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-end;
  transition: background var(--transition);
}
.edit-overlay-btn:hover { background: #fff; }

/* Info */
.service-info { padding: 1rem; }
.service-name {
  font-size: .95rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: .15rem;
  line-height: 1.3;
}
.service-name-en {
  font-size: .78rem;
  color: var(--text-muted);
  margin-bottom: .6rem;
  font-style: italic;
}
.service-meta {
  display: flex;
  gap: .4rem;
  flex-wrap: wrap;
  margin-bottom: .75rem;
}
.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: .25rem;
  background: var(--bg-page);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: .2rem .55rem;
  font-size: .74rem;
  color: var(--text-muted);
}
.service-actions {
  display: flex;
  gap: .5rem;
}
</style>
