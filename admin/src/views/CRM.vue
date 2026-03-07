<template>
  <div>
    <div class="page-header">
      <h1>📋 CRM — Colaboradores</h1>
      <div style="display:flex;gap:.75rem;align-items:center">
        <span v-if="newCount > 0" class="badge badge-warn">{{ newCount }} nuevo{{ newCount > 1 ? 's' : '' }}</span>
        <button class="btn btn-primary" @click="openNew">+ Nuevo colaborador</button>
      </div>
    </div>

    <!-- Kanban board -->
    <div class="kanban">
      <div v-for="col in columns" :key="col.status" class="kanban-col">
        <div class="col-header" :class="'head-' + col.status">
          <span>{{ col.label }}</span>
          <span class="badge" :class="col.badgeClass">{{ col.items.length }}</span>
        </div>
        <draggable
          v-model="col.items"
          :group="{ name: 'crm', pull: true, put: true }"
          item-key="id"
          class="col-body"
          @change="onDrop($event, col.status)"
        >
          <template #item="{ element }">
            <div class="lead-card" @click="openLead(element)">
              <div class="lead-avatar">{{ initials(element.nombre) }}</div>
              <div class="lead-info">
                <div class="lead-name">{{ element.nombre }}</div>
                <div class="lead-contact">
                  <a v-if="element.email"    :href="`mailto:${element.email}`"     class="contact-btn email-btn" @click.stop title="Enviar email">✉️</a>
                  <a v-if="element.telefono" :href="`tel:${element.telefono}`"      class="contact-btn phone-btn" @click.stop title="Llamar">📱</a>
                  <span class="lead-email-text">{{ element.email }}</span>
                </div>
                <div v-if="element.mensaje" class="lead-msg">{{ element.mensaje }}</div>
                <div class="lead-date">{{ fmtDate(element.created_at) }}</div>
              </div>
            </div>
          </template>
        </draggable>

        <!-- Empty state per column -->
        <div v-if="col.items.length === 0" class="col-empty">
          <span class="col-empty-icon">{{ col.emptyIcon }}</span>
          <span class="col-empty-text">{{ col.emptyText }}</span>
        </div>
      </div>
    </div>

    <!-- ── NEW collaborator modal ── -->
    <div v-if="showNew" class="overlay" @click.self="showNew=false">
      <div class="modal" style="max-width:480px">
        <div class="modal-header">
          <h2>➕ Nuevo colaborador</h2>
          <button class="btn btn-ghost btn-sm" @click="showNew=false">✕</button>
        </div>
        <div class="modal-body">
          <div>
            <label class="field-label">👤 Nombre completo *</label>
            <input v-model="newForm.nombre" class="input" placeholder="Ej. Ana García" maxlength="100" />
          </div>
          <div>
            <label class="field-label">✉️ Email *</label>
            <input v-model="newForm.email" class="input" type="email" placeholder="ana@ejemplo.com" maxlength="150" />
          </div>
          <div>
            <label class="field-label">📱 Teléfono</label>
            <input v-model="newForm.telefono" class="input" placeholder="+52 984 000 0000" maxlength="30" />
          </div>
          <div>
            <label class="field-label">💬 Mensaje / Notas</label>
            <textarea v-model="newForm.mensaje" class="input" rows="3"
              maxlength="800" placeholder="Información adicional sobre este colaborador…" />
          </div>
          <div>
            <label class="field-label">📍 Estado inicial</label>
            <div style="display:flex;gap:.5rem">
              <button v-for="s in statuses" :key="s.val"
                class="status-pill" :class="[s.cls, { active: newForm.status === s.val }]"
                @click="newForm.status = s.val">
                {{ s.label }}
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showNew=false">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving || !newForm.nombre || !newForm.email" @click="saveNew">
            {{ saving ? '💾 Guardando…' : '✅ Crear colaborador' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Lead detail panel ── -->
    <div v-if="selected" class="overlay" @click.self="selected=null">
      <div class="modal" style="max-width:520px">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:.75rem">
            <div class="lead-avatar large">{{ initials(selected.nombre) }}</div>
            <div>
              <h2 style="margin:0">{{ selected.nombre }}</h2>
              <span class="lead-date">Registrado: {{ fmtDate(selected.created_at) }}</span>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" @click="selected=null">✕</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-icon">✉️</span>
            <div>
              <div class="detail-label">Email</div>
              <div>{{ selected.email }}</div>
            </div>
          </div>
          <div v-if="selected.telefono" class="detail-row">
            <span class="detail-icon">📱</span>
            <div>
              <div class="detail-label">Teléfono</div>
              <div>{{ selected.telefono }}</div>
            </div>
          </div>
          <div v-if="selected.mensaje" class="detail-row">
            <span class="detail-icon">💬</span>
            <div>
              <div class="detail-label">Mensaje</div>
              <div style="line-height:1.6">{{ selected.mensaje }}</div>
            </div>
          </div>
          <div class="detail-row">
            <span class="detail-icon">🏷️</span>
            <div style="flex:1">
              <div class="detail-label">Estado</div>
              <div style="display:flex;gap:.5rem;margin-top:.35rem">
                <button v-for="s in statuses" :key="s.val"
                  class="status-pill" :class="[s.cls, { active: selected.status === s.val }]"
                  @click="changeStatus(selected, s.val)">
                  {{ s.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger btn-sm" @click="deleteLead(selected)">🗑 Eliminar</button>
          <a :href="`mailto:${selected.email}`" class="btn btn-primary">✉️ Enviar email</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { supabase } from '../lib/supabase'
import { useToastStore } from '../stores/toast'
import { sanitizeObject } from '../utils/sanitize'
import { useSubmitLock } from '../utils/rateLimit'

const toast  = useToastStore()
const leads  = ref([])
const selected = ref(null)
const showNew  = ref(false)
const saving   = ref(false)
const lock     = useSubmitLock()

const statuses = [
  { val: 'nuevo',      label: '🟡 Nuevo',      cls: 'pill-nuevo'      },
  { val: 'revisado',   label: '🔵 Revisado',   cls: 'pill-revisado'   },
  { val: 'contactado', label: '🟢 Contactado', cls: 'pill-contactado' },
]

const newForm = reactive({ nombre: '', email: '', telefono: '', mensaje: '', status: 'nuevo' })

const columns = computed(() => [
  { status: 'nuevo',      label: 'Nuevo',      badgeClass: 'badge-warn',    emptyIcon: '🎉', emptyText: '¡Todo al día!',         items: leads.value.filter(l => l.status === 'nuevo')      },
  { status: 'revisado',   label: 'Revisado',   badgeClass: 'badge-info',    emptyIcon: '📋', emptyText: 'Nada pendiente de revisar', items: leads.value.filter(l => l.status === 'revisado')   },
  { status: 'contactado', label: 'Contactado', badgeClass: 'badge-success', emptyIcon: '✅', emptyText: 'Arrastra tarjetas aquí',   items: leads.value.filter(l => l.status === 'contactado') },
])

const newCount = computed(() => leads.value.filter(l => l.status === 'nuevo').length)

async function load() {
  const { data } = await supabase.from('colaboradores_leads').select('*').order('created_at', { ascending: false })
  leads.value = data || []
}

function openNew() {
  Object.assign(newForm, { nombre: '', email: '', telefono: '', mensaje: '', status: 'nuevo' })
  showNew.value = true
}

async function saveNew() {
  if (!lock.acquire()) return
  saving.value = true
  const payload = sanitizeObject({ ...newForm })
  const { error } = await supabase.from('colaboradores_leads').insert(payload)
  saving.value = false; lock.release()
  if (error) { toast.add(error.message, 'error'); return }
  showNew.value = false
  toast.add(`✅ Colaborador "${newForm.nombre}" creado`)
  await load()
}

function openLead(lead) { selected.value = { ...lead } }

async function changeStatus(lead, newStatus) {
  await supabase.from('colaboradores_leads').update({ status: newStatus }).eq('id', lead.id)
  const idx = leads.value.findIndex(l => l.id === lead.id)
  if (idx > -1) leads.value[idx].status = newStatus
  selected.value.status = newStatus
  toast.add(`Estado actualizado → ${newStatus}`)
}

async function updateStatus(lead) {
  await supabase.from('colaboradores_leads').update({ status: lead.status }).eq('id', lead.id)
  const idx = leads.value.findIndex(l => l.id === lead.id)
  if (idx > -1) leads.value[idx].status = lead.status
  toast.add(`Estado: ${lead.status}`)
}

async function onDrop(evt, newStatus) {
  if (!evt.added) return
  const lead = evt.added.element
  await supabase.from('colaboradores_leads').update({ status: newStatus }).eq('id', lead.id)
  lead.status = newStatus
  toast.add(`Movido a ${newStatus}`)
}

async function deleteLead(lead) {
  if (!confirm(`¿Eliminar a ${lead.nombre}?`)) return
  await supabase.from('colaboradores_leads').delete().eq('id', lead.id)
  leads.value = leads.value.filter(l => l.id !== lead.id)
  selected.value = null
  toast.add(`Eliminado: ${lead.nombre}`, 'warn')
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}
function initials(name) {
  if (!name) return '?'
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function truncate(str, n = 60) {
  return str?.length > n ? str.slice(0, n) + '…' : str
}

onMounted(load)
</script>

<style scoped>
/* Kanban */
.kanban     { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; min-height: 60vh; }
.kanban-col { background: var(--bg-page); border: 1px solid var(--border-soft); border-radius: var(--radius); display: flex; flex-direction: column; box-shadow: var(--shadow-sm); }
.col-header { padding: .9rem 1rem; font-weight: 700; font-size: .83rem; border-bottom: 1px solid var(--border-soft); display: flex; align-items: center; justify-content: space-between; text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted); }
.head-nuevo      { border-top: 3px solid #B07A10; }
.head-revisado   { border-top: 3px solid #2563EB; }
.head-contactado { border-top: 3px solid var(--accent-2); }
.col-body   { flex: 1; padding: .75rem; display: flex; flex-direction: column; gap: .65rem; min-height: 120px; }
.col-empty  { display:flex; flex-direction:column; align-items:center; text-align: center; padding: 2rem .5rem; margin: .25rem; border: 1.5px dashed var(--border); border-radius: var(--radius-sm); }
.col-empty-icon { font-size: 1.6rem; margin-bottom: .4rem; }
.col-empty-text { font-size: .78rem; color: var(--text-muted); }

/* Lead card */
.lead-card  { background: var(--bg-card); border: 1px solid var(--border-soft); border-radius: 10px; padding: .9rem; cursor: pointer; transition: all var(--transition); display: flex; gap: .75rem; align-items: flex-start; box-shadow: var(--shadow-sm); }
.lead-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-md); }
.lead-info  { flex: 1; min-width: 0; }
.lead-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), #a87c52); color: #fff; display: flex; align-items: center; justify-content: center; font-size: .85rem; font-weight: 700; flex-shrink: 0; }
.lead-avatar.large { width: 50px; height: 50px; font-size: 1rem; }
.lead-name  { font-weight: 700; font-size: .95rem; color: var(--text); margin-bottom: .3rem; }
.lead-contact { display: flex; align-items: center; gap: .4rem; margin-bottom: .35rem; }
.contact-btn { display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:6px; background:var(--bg-hover); border:1px solid var(--border); font-size:.85rem; text-decoration:none; transition:all var(--transition); }
.contact-btn:hover { background: var(--accent-light); border-color: var(--accent); transform: scale(1.1); }
.lead-email-text { font-size: .73rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lead-msg   { font-size: .78rem; color: var(--text-muted); margin-bottom: .35rem; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
.lead-date  { font-size: .7rem; color: var(--text-light); }

/* Status pills */
.status-pill { padding: .4rem .9rem; border-radius: 99px; border: 2px solid var(--border); background: var(--bg-3); cursor: pointer; font-size: .8rem; color: var(--text-muted); transition: all .2s; }
.pill-nuevo.active      { border-color: #f7c44d; color: #f7c44d; background: rgba(247,196,77,.12); }
.pill-revisado.active   { border-color: #4d9cf7; color: #4d9cf7; background: rgba(77,156,247,.12); }
.pill-contactado.active { border-color: #7fc47f; color: #7fc47f; background: rgba(127,196,127,.12); }

/* Detail rows */
.detail-row   { display: flex; gap: .85rem; padding: .6rem 0; border-bottom: 1px solid var(--border-dim, var(--border)); }
.detail-row:last-child { border-bottom: none; }
.detail-icon  { font-size: 1.2rem; width: 28px; text-align: center; flex-shrink: 0; }
.detail-label { font-size: .72rem; text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted); font-weight: 600; margin-bottom: .15rem; }
.field-label  { display: block; font-size: .8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; margin-bottom: .4rem; }
</style>
