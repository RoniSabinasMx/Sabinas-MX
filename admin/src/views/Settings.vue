<template>
  <div>
    <div class="page-header">
      <h1>⚙️ Configuración Global</h1>
    </div>

    <div class="section-gap">
      <!-- WhatsApp number -->
      <div class="card">
        <h2 style="margin-bottom:.4rem">📱 Número de WhatsApp</h2>
        <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:1rem">Número al que llegan las reservas. Incluye código de país (ej. 529841234567).</p>
        <div class="flex gap-3">
          <input v-model="waNumber" class="input" placeholder="529841802741" style="max-width:280px" />
          <button class="btn btn-primary" @click="saveWa">Guardar</button>
        </div>
      </div>

      <!-- Calendar + Events -->
      <div class="card">
        <h2 style="margin-bottom:.4rem">📅 Calendario de Fechas y Eventos</h2>
        <p style="color:var(--text-muted);font-size:.875rem;margin-bottom:1.5rem">
          Haz clic en un día para <strong style="color:var(--danger)">bloquearlo</strong> o <strong style="color:var(--accent-2)">crear un evento</strong>.
        </p>
        <div class="cal-nav flex gap-3" style="margin-bottom:1.25rem;justify-content:center">
          <button class="btn btn-ghost btn-sm" @click="prevMonth">‹</button>
          <span style="font-weight:700;min-width:180px;text-align:center;font-size:1rem">{{ monthLabel }}</span>
          <button class="btn btn-ghost btn-sm" @click="nextMonth">›</button>
        </div>

        <div class="cal-grid">
          <div v-for="d in dayLabels" :key="d" class="cal-day-label">{{ d }}</div>
          <div v-for="_ in firstDayOffset" :key="'e'+_" class="cal-empty"></div>
          <div v-for="day in daysInMonth" :key="day"
            class="cal-day"
            :class="{
              blocked: isBlocked(day),
              today:   isToday(day),
              available: !isBlocked(day) && !isToday(day),
              'has-event': dayEvents(day).length > 0
            }"
            @click="onDayClick(day)">
            <span class="cal-day-num">{{ day }}</span>
            <span v-if="isBlocked(day)" class="cal-block-icon">🔴</span>
            <div v-if="dayEvents(day).length" class="event-dots">
              <span v-for="ev in dayEvents(day).slice(0,3)" :key="ev.id"
                class="event-dot" :class="'dot-' + (ev.element || 'default')"
                :title="ev.title_es">
              </span>
            </div>
          </div>
        </div>

        <div class="cal-legend">
          <span class="legend-item"><span class="legend-dot blocked-dot"></span> Bloqueado</span>
          <span class="legend-item"><span class="legend-dot today-dot"></span> Hoy</span>
          <span class="legend-item"><span class="legend-dot avail-dot"></span> Disponible</span>
          <span class="legend-item"><span class="event-dot dot-agua" style="width:10px;height:10px"></span> Evento</span>
        </div>
      </div>

      <!-- Upcoming Events List -->
      <div class="card">
        <div class="flex" style="margin-bottom:1rem">
          <h2 style="flex:1">🗓 Eventos del Mes</h2>
          <button class="btn btn-primary btn-sm" @click="openNewEvent(null)">✚ Nuevo Evento</button>
        </div>

        <div v-if="monthEvents.length === 0" class="empty-state" style="padding:2rem">
          <div class="empty-icon">📅</div>
          <h3>Sin eventos este mes</h3>
          <p>Haz clic en un día del calendario o usa el botón de arriba.</p>
        </div>

        <div v-else class="events-list">
          <div v-for="ev in monthEvents" :key="ev.id" class="event-row">
            <div class="event-row-dot" :class="'dot-' + (ev.element || 'default')"></div>
            <div class="event-row-body">
              <div class="event-row-title">{{ ev.title_es }}</div>
              <div class="event-row-meta">
                {{ fmtDate(ev.date) }}
                <span v-if="ev.time">· {{ ev.time.slice(0,5) }}</span>
                <span class="capacity-chip" :class="{ full: ev.capacity_booked >= ev.capacity_total && ev.capacity_total > 0 }">
                  👥 {{ ev.capacity_booked }}/{{ ev.capacity_total || '∞' }}
                </span>
              </div>
            </div>
            <div class="event-row-actions">
              <!-- Quick capacity update -->
              <input type="number" :value="ev.capacity_booked" min="0" :max="ev.capacity_total || 9999"
                class="input capacity-input" @change="updateCapacity(ev, $event.target.value)"
                title="Actualizar reservados" />
              <button class="btn btn-ghost btn-sm" @click="openEditEvent(ev)">✏️</button>
              <button class="btn btn-danger btn-sm" @click="deleteEvent(ev)">🗑</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Day Picker Modal ── -->
    <div v-if="showDayPicker" class="overlay" @click.self="showDayPicker = false">
      <div class="modal" style="max-width:380px">
        <div class="modal-header">
          <h2>{{ pickerDateLabel }}</h2>
          <button class="btn btn-ghost btn-sm" @click="showDayPicker = false">✕</button>
        </div>
        <div class="modal-body" style="gap:.75rem">
          <button class="picker-option" @click="blockDay">
            <span class="picker-icon">🔒</span>
            <div>
              <div class="picker-title">Bloquear esta fecha</div>
              <div class="picker-sub">{{ isBlocked(pickerDay) ? 'Haz clic para desbloquear' : 'La fecha quedará no disponible en el sitio web' }}</div>
            </div>
          </button>
          <button class="picker-option picker-event" @click="createEventFromDay">
            <span class="picker-icon">🗓</span>
            <div>
              <div class="picker-title">Crear Evento</div>
              <div class="picker-sub">Taller, ceremonia, retiro u otro evento especial</div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Event Modal ── -->
    <EventModal
      v-if="showEventModal"
      :event="editingEvent"
      :prefill-date="eventPrefillDate"
      :is-new="eventIsNew"
      @close="showEventModal = false"
      @saved="onEventSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useToastStore } from '../stores/toast'
import { sanitize } from '../utils/sanitize'
import { useSubmitLock } from '../utils/rateLimit'
import EventModal from '../components/EventModal.vue'

const toast = useToastStore()
const lock  = useSubmitLock()
const waNumber = ref('')
const blockedDates = ref([])
const events = ref([])
const currentDate = ref(new Date())

// Day picker state
const showDayPicker   = ref(false)
const pickerDay       = ref(null)

// Event modal state
const showEventModal  = ref(false)
const editingEvent    = ref(null)
const eventIsNew      = ref(true)
const eventPrefillDate = ref('')

// ── Calendar computed ──
const monthLabel    = computed(() => currentDate.value.toLocaleString('es-MX', { month: 'long', year: 'numeric' }))
const year          = computed(() => currentDate.value.getFullYear())
const month         = computed(() => currentDate.value.getMonth())
const daysInMonth   = computed(() => new Date(year.value, month.value + 1, 0).getDate())
const firstDayOffset = computed(() => new Date(year.value, month.value, 1).getDay())
const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const pickerDateLabel = computed(() => {
  if (!pickerDay.value) return ''
  const d = dateStr(pickerDay.value)
  return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
})

const monthEvents = computed(() => {
  const y = String(year.value)
  const m = String(month.value + 1).padStart(2, '0')
  return events.value.filter(e => e.date.startsWith(`${y}-${m}`))
    .sort((a, b) => a.date.localeCompare(b.date))
})

function prevMonth() { currentDate.value = new Date(year.value, month.value - 1, 1); loadEvents() }
function nextMonth() { currentDate.value = new Date(year.value, month.value + 1, 1); loadEvents() }

function dateStr(day) {
  return `${year.value}-${String(month.value + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}
function isBlocked(day) { return blockedDates.value.includes(dateStr(day)) }
function isToday(day) {
  const t = new Date()
  return t.getFullYear() === year.value && t.getMonth() === month.value && t.getDate() === day
}
function dayEvents(day) {
  const d = dateStr(day)
  return events.value.filter(e => e.date === d)
}
function fmtDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

// ── Day click ──
function onDayClick(day) {
  pickerDay.value = day
  showDayPicker.value = true
}

function blockDay() {
  showDayPicker.value = false
  toggleDay(pickerDay.value)
}

async function toggleDay(day) {
  const d = dateStr(day)
  if (isBlocked(day)) {
    blockedDates.value = blockedDates.value.filter(x => x !== d)
  } else {
    blockedDates.value.push(d)
  }
  await saveDates()
}

function createEventFromDay() {
  eventPrefillDate.value = dateStr(pickerDay.value)
  showDayPicker.value = false
  openNewEvent(eventPrefillDate.value)
}

// ── Event CRUD ──
function openNewEvent(prefillDate) {
  editingEvent.value   = null
  eventIsNew.value     = true
  eventPrefillDate.value = prefillDate || ''
  showEventModal.value = true
}
function openEditEvent(ev) {
  editingEvent.value   = { ...ev }
  eventIsNew.value     = false
  eventPrefillDate.value = ev.date
  showEventModal.value = true
}
function onEventSaved() {
  showEventModal.value = false
  loadEvents()
  toast.add('Evento guardado ✓')
}

async function updateCapacity(ev, val) {
  const booked = Math.max(0, parseInt(val) || 0)
  await supabase.from('events').update({ capacity_booked: booked }).eq('id', ev.id)
  ev.capacity_booked = booked
  toast.add('Cupo actualizado ✓')
}

async function deleteEvent(ev) {
  if (!confirm(`¿Eliminar evento "${ev.title_es}"?`)) return
  await supabase.from('events').delete().eq('id', ev.id)
  events.value = events.value.filter(e => e.id !== ev.id)
  toast.add('Evento eliminado', 'warn')
}

// ── Data ──
async function saveDates() {
  await supabase.from('settings').upsert({ key: 'disabled_dates', value: JSON.stringify(blockedDates.value) })
  toast.add('Fechas actualizadas')
}
async function saveWa() {
  if (!lock.acquire()) return
  const clean = sanitize(waNumber.value).replace(/\D/g, '')
  waNumber.value = clean
  await supabase.from('settings').upsert({ key: 'whatsapp_number', value: clean })
  lock.release()
  toast.add('Número guardado ✓')
}
async function loadEvents() {
  const y = year.value; const m = month.value + 1
  const from = `${y}-${String(m).padStart(2,'0')}-01`
  const to   = `${y}-${String(m).padStart(2,'0')}-${new Date(y, m, 0).getDate()}`
  const { data } = await supabase.from('events').select('*').gte('date', from).lte('date', to).order('date')
  events.value = data || []
}
async function load() {
  const { data } = await supabase.from('settings').select('*')
  for (const s of data || []) {
    if (s.key === 'whatsapp_number') waNumber.value = s.value
    if (s.key === 'disabled_dates') {
      try { blockedDates.value = JSON.parse(s.value) } catch { blockedDates.value = [] }
    }
  }
  await loadEvents()
}

onMounted(load)
</script>

<style scoped>
/* Calendar */
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; max-width: 560px; }
.cal-day-label { text-align: center; font-size: .72rem; color: var(--text-muted); padding: .35rem 0; font-weight: 700; text-transform: uppercase; }
.cal-day {
  position: relative;
  aspect-ratio: 1; min-height: 54px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border-radius: 10px; font-size: .9rem; font-weight: 500; cursor: pointer;
  transition: all var(--transition); border: 1.5px solid transparent;
  background: var(--bg-page); color: var(--text);
}
.cal-day:hover { background: var(--bg-hover); border-color: var(--border); transform: scale(1.05); }
.cal-day.available { background: #F2FAF2; }
.cal-day.blocked   { background: #FEF0EE; color: var(--danger); font-weight: 700; border-color: #f5c6c0; }
.cal-day.today     { border-color: var(--accent); background: var(--accent-light); color: var(--accent); font-weight: 700; }
.cal-day.has-event { box-shadow: inset 0 -3px 0 var(--accent-2); }
.cal-block-icon { font-size: .6rem; margin-top: .1rem; }
.cal-day-num { line-height: 1; }
.cal-empty { aspect-ratio: 1; min-height: 54px; }

.event-dots { display: flex; gap: 2px; margin-top: 2px; }
.event-dot {
  width: 6px; height: 6px; border-radius: 50%;
  flex-shrink: 0;
}
.dot-agua    { background: #3B82F6; }
.dot-fuego   { background: #EF4444; }
.dot-tierra  { background: #92400E; }
.dot-aire    { background: #6EE7B7; }
.dot-eter    { background: #A78BFA; }
.dot-default { background: var(--accent); }

.cal-legend { display:flex; gap:1.25rem; margin-top:1rem; font-size:.8rem; color:var(--text-muted); flex-wrap:wrap; }
.legend-item { display:flex; align-items:center; gap:.4rem; }
.legend-dot { width: 12px; height: 12px; border-radius: 4px; display: inline-block; flex-shrink:0; }
.blocked-dot { background: #FEF0EE; border: 1.5px solid #f5c6c0; }
.today-dot   { background: var(--accent-light); border: 1.5px solid var(--accent); }
.avail-dot   { background: #F2FAF2; border: 1.5px solid #b7dfb8; }

/* Events list */
.events-list { display: flex; flex-direction: column; gap: .6rem; }
.event-row {
  display: flex; align-items: center; gap: .85rem;
  background: var(--bg-page); border: 1px solid var(--border-soft);
  border-radius: var(--radius-sm); padding: .75rem 1rem;
}
.event-row-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.event-row-body { flex: 1; min-width: 0; }
.event-row-title { font-size: .9rem; font-weight: 600; color: var(--text); }
.event-row-meta { font-size: .78rem; color: var(--text-muted); margin-top: .15rem; display: flex; align-items: center; gap: .5rem; }
.event-row-actions { display: flex; align-items: center; gap: .4rem; flex-shrink: 0; }
.capacity-input { width: 68px; text-align: center; padding: .35rem .5rem; font-size: .82rem; }
.capacity-chip {
  background: var(--success-bg); color: var(--success);
  padding: .1rem .5rem; border-radius: 99px; font-size: .72rem; font-weight: 600;
}
.capacity-chip.full { background: var(--danger-bg); color: var(--danger); }

/* Day picker modal */
.picker-option {
  display: flex; align-items: flex-start; gap: 1rem;
  width: 100%; background: var(--bg-page); border: 1.5px solid var(--border);
  border-radius: var(--radius); padding: 1.1rem 1.25rem; cursor: pointer;
  transition: all var(--transition); text-align: left;
}
.picker-option:hover { border-color: var(--accent); background: var(--accent-light); }
.picker-event:hover  { border-color: var(--accent-2); background: #f0faf0; }
.picker-icon { font-size: 1.8rem; flex-shrink: 0; }
.picker-title { font-size: .95rem; font-weight: 700; color: var(--text); }
.picker-sub   { font-size: .78rem; color: var(--text-muted); margin-top: .2rem; }
</style>
