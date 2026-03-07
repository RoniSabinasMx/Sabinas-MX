<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal event-modal">
      <div class="modal-header">
        <h2>{{ isNew ? '📅 Nuevo Evento' : '✏️ Editar Evento' }}</h2>
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Títulos -->
        <div class="grid-2">
          <div>
            <label class="field-label">🇲🇽 Título (Español) *</label>
            <input v-model="form.title_es" class="input" placeholder="Nombre del evento…" maxlength="120" />
          </div>
          <div>
            <label class="field-label">🇬🇧 Title (English)</label>
            <input v-model="form.title_en" class="input" placeholder="Event name…" maxlength="120" />
          </div>
        </div>

        <!-- Descripciones -->
        <div class="grid-2">
          <div>
            <label class="field-label">📝 Descripción ES</label>
            <textarea v-model="form.description_es" class="input" rows="3" maxlength="500" placeholder="Descripción del evento…" />
          </div>
          <div>
            <label class="field-label">📝 Description EN</label>
            <textarea v-model="form.description_en" class="input" rows="3" maxlength="500" placeholder="Event description…" />
          </div>
        </div>

        <!-- Fecha + Hora + Elemento -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem">
          <div>
            <label class="field-label">📅 Fecha *</label>
            <input type="date" v-model="form.date" class="input" />
          </div>
          <div>
            <label class="field-label">⏰ Hora</label>
            <input type="time" v-model="form.time" class="input" />
          </div>
          <div>
            <label class="field-label">🌊 Elemento</label>
            <select v-model="form.element" class="input select">
              <option value="">Sin elemento</option>
              <option value="agua">💧 Agua</option>
              <option value="fuego">🔥 Fuego</option>
              <option value="tierra">🌱 Tierra</option>
              <option value="aire">🌬 Aire</option>
              <option value="eter">✨ Éter</option>
            </select>
          </div>
        </div>

        <!-- Cupo -->
        <div class="grid-2">
          <div>
            <label class="field-label">👥 Cupo máximo</label>
            <input type="number" v-model.number="form.capacity_total" class="input" min="1" max="500" placeholder="0 = sin límite" />
          </div>
          <div>
            <label class="field-label">✅ Lugares reservados</label>
            <input type="number" v-model.number="form.capacity_booked" class="input" min="0" :max="form.capacity_total || 9999" />
          </div>
        </div>

        <!-- Imagen -->
        <div>
          <label class="field-label">🖼️ Imagen del evento</label>
          <StorageImagePicker v-model="form.image_url" bucket="event-images" />
        </div>

        <!-- Recurrencia -->
        <div class="recurrence-box" v-if="isNew">
          <label class="recurrence-toggle">
            <input type="checkbox" v-model="isRecurring" />
            <span class="recurrence-label">🔁 Repetir este mes</span>
          </label>
          <div v-if="isRecurring" class="weekday-grid">
            <label v-for="(d, i) in weekdayLabels" :key="i" class="weekday-pill" :class="{ active: recurDays.includes(i) }">
              <input type="checkbox" :value="i" v-model="recurDays" style="display:none" />
              {{ d }}
            </label>
          </div>
          <p v-if="isRecurring && recurDays.length" class="recur-preview">
            → Se crearán {{ previewDates.length }} evento(s): {{ previewDates.join(', ') }}
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('close')">Cancelar</button>
        <button class="btn btn-primary" :disabled="saving || !form.title_es || !form.date" @click="save">
          {{ saving ? '💾 Guardando…' : '✅ Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { useToastStore } from '../stores/toast'
import { sanitizeObject } from '../utils/sanitize'
import StorageImagePicker from './StorageImagePicker.vue'

const props = defineProps({
  event: Object,
  prefillDate: String,
  isNew: { type: Boolean, default: true }
})
const emit = defineEmits(['close', 'saved'])
const toast = useToastStore()

const saving     = ref(false)
const isRecurring = ref(false)
const recurDays  = ref([])

const weekdayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const form = reactive({
  title_es: '',   title_en: '',
  description_es: '', description_en: '',
  date: props.prefillDate || '',
  time: '',
  element: '',
  image_url: '',
  capacity_total: 10,
  capacity_booked: 0
})

watch(() => props.event, (v) => {
  if (v) Object.assign(form, v)
}, { immediate: true })

watch(() => props.prefillDate, (v) => { if (v && !form.date) form.date = v })

// Preview of recurring dates for this month
const previewDates = computed(() => {
  if (!form.date || !recurDays.value.length) return []
  const d = new Date(form.date + 'T12:00:00')
  const year  = d.getFullYear()
  const month = d.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dates = []
  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(year, month, day)
    if (recurDays.value.includes(dt.getDay())) {
      dates.push(`${String(day).padStart(2,'0')}/${String(month+1).padStart(2,'0')}`)
    }
  }
  return dates
})

// Recurring template dates (full ISO strings)
const recurFullDates = computed(() => {
  if (!form.date || !recurDays.value.length) return []
  const d = new Date(form.date + 'T12:00:00')
  const year  = d.getFullYear()
  const month = d.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dates = []
  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(year, month, day)
    if (recurDays.value.includes(dt.getDay())) {
      dates.push(`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`)
    }
  }
  return dates
})

async function save() {
  saving.value = true
  const payload = sanitizeObject({ ...form })

  if (isRecurring.value && recurFullDates.value.length && props.isNew) {
    // Insert one row per recurrence date
    const rows = recurFullDates.value.map(date => ({ ...payload, date, is_recurring: true }))
    const { error } = await supabase.from('events').insert(rows)
    saving.value = false
    if (error) { toast.add(error.message, 'error'); return }
    toast.add(`✅ ${rows.length} eventos creados`)
  } else if (props.isNew) {
    const { error } = await supabase.from('events').insert(payload)
    saving.value = false
    if (error) { toast.add(error.message, 'error'); return }
    toast.add('✅ Evento creado')
  } else {
    const { error } = await supabase.from('events').update(payload).eq('id', props.event.id)
    saving.value = false
    if (error) { toast.add(error.message, 'error'); return }
    toast.add('✅ Evento actualizado')
  }
  emit('saved')
}
</script>

<style scoped>
.event-modal { max-width: 680px; }

.recurrence-box {
  background: var(--bg-page);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 1rem 1.1rem;
}
.recurrence-toggle {
  display: flex;
  align-items: center;
  gap: .6rem;
  cursor: pointer;
  font-size: .9rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}
.recurrence-toggle input { cursor: pointer; }
.recurrence-label { user-select: none; }

.weekday-grid {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
  margin-top: .75rem;
}
.weekday-pill {
  padding: .35rem .8rem;
  border-radius: 99px;
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  font-size: .8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  color: var(--text-muted);
  user-select: none;
}
.weekday-pill.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.recur-preview {
  font-size: .78rem;
  color: var(--accent-2);
  margin-top: .65rem;
  font-weight: 500;
}
</style>
