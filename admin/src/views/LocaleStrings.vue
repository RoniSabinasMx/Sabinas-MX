<template>
  <div>
    <div class="page-header">
      <div>
        <h1>✏️ Textos del Sitio</h1>
        <p style="margin-top:.2rem;font-size:.85rem;color:var(--text-muted)">
          {{ allKeys.length }} textos en total · Haz clic en una sección para editar
        </p>
      </div>
      <input v-model="search" class="input" style="width:240px" placeholder="🔍 Buscar texto…" />
    </div>

    <!-- Accordion Groups -->
    <div class="accordion-list">
      <div v-for="group in visibleGroups" :key="group.id" class="accordion-card">
        <button class="accordion-header" @click="toggle(group.id)">
          <span class="accordion-icon">{{ group.icon }}</span>
          <div class="accordion-title-area">
            <span class="accordion-title">{{ group.label }}</span>
            <span class="accordion-count">{{ group.keys.length }} texto{{ group.keys.length !== 1 ? 's' : '' }}</span>
          </div>
          <span class="accordion-chevron" :class="{ open: openGroups.has(group.id) }">›</span>
        </button>

        <div v-show="openGroups.has(group.id)" class="accordion-body">
          <LocaleRowCard
            v-for="key in group.keys"
            :key="key"
            :str-key="key"
            :es-val="byKey[key]?.es"
            :en-val="byKey[key]?.en"
            @saved="toast.add('✓ Cambios guardados')"
          />
          <div v-if="group.keys.length === 0" class="empty-state" style="padding:1.5rem">
            <p>No hay textos en esta sección.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Global empty state -->
    <div v-if="visibleGroups.length === 0" class="card empty-state">
      <div class="empty-icon">🔍</div>
      <h3>Sin resultados</h3>
      <p>No encontramos textos que coincidan con "{{ search }}".</p>
      <button class="btn btn-ghost" @click="search = ''">Limpiar búsqueda</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { supabase } from '../lib/supabase'
import { useToastStore } from '../stores/toast'
import LocaleRowCard from '../components/LocaleRow.vue'

const toast   = useToastStore()
const strings = ref([])
const search  = ref('')
const openGroups = reactive(new Set(['hero']))

const GROUPS = [
  { id: 'hero',     icon: '🏠', label: 'Página Principal (Hero)',    prefix: ['hero'] },
  { id: 'oracle',   icon: '🔮', label: 'Cuestionario del Oráculo',   prefix: ['oracle', 'quiz'] },
  { id: 'services', icon: '🌿', label: 'Servicios',                  prefix: ['service', 'services'] },
  { id: 'nav',      icon: '🧭', label: 'Menú de Navegación',         prefix: ['nav'] },
  { id: 'footer',   icon: '📄', label: 'Pie de Página',              prefix: ['footer'] },
  { id: 'general',  icon: '✏️',  label: 'General',                   prefix: [] }, // catch-all
]

const byKey = computed(() => {
  const map = {}
  for (const s of strings.value) {
    if (!map[s.key]) map[s.key] = {}
    map[s.key][s.lang] = s.value
  }
  return map
})

const allKeys = computed(() => Object.keys(byKey.value))

function keyGroup(key) {
  for (const g of GROUPS) {
    if (g.prefix.length && g.prefix.some(p => key.startsWith(p))) return g.id
  }
  return 'general'
}

const visibleGroups = computed(() => {
  const lsearch = search.value.toLowerCase()
  return GROUPS.map(g => ({
    ...g,
    keys: allKeys.value.filter(k => {
      if (keyGroup(k) !== g.id) return false
      if (!lsearch) return true
      return k.toLowerCase().includes(lsearch) ||
        byKey.value[k]?.es?.toLowerCase().includes(lsearch) ||
        byKey.value[k]?.en?.toLowerCase().includes(lsearch)
    })
  })).filter(g => g.keys.length > 0 || !search.value)
})

function toggle(id) {
  if (openGroups.has(id)) openGroups.delete(id)
  else openGroups.add(id)
}

async function load() {
  const { data } = await supabase.from('locale_strings').select('*').order('key')
  strings.value = data || []
}

onMounted(load)
</script>

<style scoped>
.accordion-list { display: flex; flex-direction: column; gap: .75rem; }

.accordion-card {
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: .85rem;
  padding: 1.1rem 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background var(--transition);
}
.accordion-header:hover { background: var(--bg-hover); }

.accordion-icon { font-size: 1.3rem; flex-shrink: 0; }
.accordion-title-area { flex: 1; }
.accordion-title {
  display: block;
  font-size: .95rem;
  font-weight: 600;
  color: var(--text);
}
.accordion-count {
  display: block;
  font-size: .75rem;
  color: var(--text-muted);
  margin-top: .1rem;
}
.accordion-chevron {
  font-size: 1.4rem;
  color: var(--text-light);
  transform: rotate(0deg);
  transition: transform .25s ease;
  flex-shrink: 0;
  line-height: 1;
}
.accordion-chevron.open { transform: rotate(90deg); }

.accordion-body {
  border-top: 1px solid var(--border-soft);
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: .85rem;
}
</style>
