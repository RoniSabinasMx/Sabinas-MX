<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal modal-wide">
      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-icon">🌿</span>
          <div>
            <h2>{{ isNew ? 'Nuevo Servicio' : 'Editar Servicio' }}</h2>
            <p class="modal-subtitle">Completa la información en español e inglés</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- STEP indicator (visual tabs) -->
        <div class="step-tabs">
          <button v-for="(tab, i) in tabs" :key="i"
            class="step-tab" :class="{ active: step === i }"
            @click="step = i">
            <span class="step-num">{{ i + 1 }}</span>
            <span>{{ tab }}</span>
          </button>
        </div>

        <!-- ── STEP 0: Identidad ── -->
        <div v-show="step === 0" class="tab-body">
          <div class="grid-2">
            <div>
              <label class="field-label">🇲🇽 Nombre en español *</label>
              <input v-model="form.name_es" class="input" maxlength="80"
                placeholder="ej. Masaje Relajante Profundo" />
              <span class="char-hint">{{ form.name_es?.length || 0 }}/80</span>
            </div>
            <div>
              <label class="field-label">🇬🇧 Name in English *</label>
              <input v-model="form.name_en" class="input" maxlength="80"
                placeholder="e.g. Deep Relaxing Massage" />
              <span class="char-hint">{{ form.name_en?.length || 0 }}/80</span>
            </div>
          </div>

          <div class="grid-2">
            <div>
              <label class="field-label">📝 Descripción (ES)</label>
              <textarea v-model="form.description_es" class="input" rows="3"
                maxlength="500" placeholder="Breve descripción del servicio en español…" />
              <span class="char-hint">{{ form.description_es?.length || 0 }}/500</span>
            </div>
            <div>
              <label class="field-label">📝 Description (EN)</label>
              <textarea v-model="form.description_en" class="input" rows="3"
                maxlength="500" placeholder="Brief service description in English…" />
              <span class="char-hint">{{ form.description_en?.length || 0 }}/500</span>
            </div>
          </div>

          <div>
            <label class="field-label">🔗 ID único (slug)</label>
            <input v-model="form.id" class="input mono" :disabled="!isNew"
              placeholder="ej. masaje-relajante" />
            <span class="field-hint">Una sola palabra-guión, sin espacios. Se genera automáticamente del nombre.</span>
          </div>
        </div>

        <!-- ── STEP 1: Características ── -->
        <div v-show="step === 1" class="tab-body">
          <div>
            <label class="field-label">🏷️ Categoría</label>
            <div class="category-pills">
              <button v-for="c in categories" :key="c.val"
                class="cat-pill" :class="[c.cls, { 'cat-active': form.category === c.val }]"
                @click="form.category = c.val">
                {{ c.icon }} {{ c.label }}
              </button>
            </div>
          </div>

          <div class="grid-2">
            <div>
              <label class="field-label">✨ Elemento</label>
              <div class="element-grid">
                <button v-for="e in elements" :key="e.val"
                  class="element-btn" :class="{ active: form.element === e.val }"
                  @click="form.element = e.val">
                  <span>{{ e.icon }}</span>
                  <span>{{ e.label }}</span>
                </button>
              </div>
            </div>
            <div>
              <label class="field-label">🌡️ Intensidad</label>
              <div class="intensity-row">
                <button v-for="i in intensities" :key="i.val"
                  class="intensity-btn" :class="[i.cls, { active: form.intensity === i.val }]"
                  @click="form.intensity = i.val">
                  {{ i.label }}
                </button>
              </div>

              <label class="field-label" style="margin-top:1.25rem">⏱️ Duración</label>
              <input v-model="form.duration" class="input" placeholder="ej. 90 min" />
            </div>
          </div>

          <div>
            <label class="field-label">👥 Modalidad</label>
            <div class="modality-row">
              <label v-for="m in modalities" :key="m.val" class="modality-check"
                :class="{ active: form.modality?.includes(m.val) }">
                <input type="checkbox" :value="m.val" v-model="form.modality" />
                {{ m.icon }} {{ m.label }}
              </label>
            </div>
          </div>

          <div>
            <label class="field-label">🔢 Orden de aparición</label>
            <input v-model.number="form.sort_order" type="number" class="input" style="width:100px" min="1" />
          </div>
        </div>

        <!-- ── STEP 2: Imagen ── -->
        <div v-show="step === 2" class="tab-body">
          <label class="field-label">🖼️ Imagen del servicio</label>
          <StorageImagePicker v-model="form.image_url" bucket="sponsor-logos" />
          <span class="field-hint">Selecciona una imagen de la galería o sube una nueva (máx 45 MB)</span>
        </div>

        <!-- ── STEP 3: WhatsApp ── -->
        <div v-show="step === 3" class="tab-body">
          <div class="wa-hint card" style="padding:.85rem 1rem;background:rgba(37,211,102,.08);border-color:rgba(37,211,102,.25)">
            <p style="font-size:.85rem;color:#25d366;margin:0">💬 <strong>Variables disponibles:</strong></p>
            <div class="wa-chips">
              <code v-for="v in waVars" :key="v" class="wa-chip" @click="insertVar('wa_es', v)">{{ v }}</code>
            </div>
            <p style="font-size:.75rem;color:var(--text-muted);margin:.5rem 0 0">Haz clic en una variable para insertarla en el mensaje activo.</p>
          </div>
          <div>
            <label class="field-label">🇲🇽 Mensaje WhatsApp (ES)</label>
            <textarea ref="waEsRef" v-model="form.wa_es" class="input" rows="4"
              maxlength="1000" placeholder="Hola, me gustaría agendar {{nombre}} para {{fecha}}…" />
          </div>
          <div>
            <label class="field-label">🇬🇧 WhatsApp Message (EN)</label>
            <textarea ref="waEnRef" v-model="form.wa_en" class="input" rows="4"
              maxlength="1000" placeholder="Hi, I'd like to book {{nombre}} for {{date}}…" />
          </div>
        </div>
      </div>

      <!-- Footer navigation -->
      <div class="modal-footer">
        <div class="footer-left">
          <button v-if="step > 0" class="btn btn-ghost" @click="step--">← Atrás</button>
        </div>
        <div class="footer-right">
          <button class="btn btn-ghost" @click="$emit('close')">Cancelar</button>
          <button v-if="step < tabs.length - 1" class="btn btn-primary" @click="step++">
            Siguiente →
          </button>
          <button v-else class="btn btn-success" :disabled="saving || !isValid" @click="save">
            <span v-if="saving">💾 Guardando…</span>
            <span v-else>✅ Guardar servicio</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { sanitizeObject } from '../utils/sanitize'
import { useSubmitLock } from '../utils/rateLimit'
import StorageImagePicker from './StorageImagePicker.vue'

const props = defineProps({ service: Object, isNew: Boolean })
const emit  = defineEmits(['close', 'saved'])

const step   = ref(0)
const saving = ref(false)
const lock   = useSubmitLock()
const waEsRef = ref(null)
const waEnRef = ref(null)

const tabs = ['📋 Identidad', '⚙️ Características', '🖼️ Imagen', '💬 WhatsApp']

const categories  = [
  { val: 'cuerpo',   label: 'Cuerpo',   icon: '🧘', cls: 'pill-cuerpo'   },
  { val: 'espiritu', label: 'Espíritu', icon: '✨', cls: 'pill-espiritu' },
  { val: 'mente',    label: 'Mente',    icon: '🧠', cls: 'pill-mente'    },
]
const elements = [
  { val: 'agua',   label: 'Agua',   icon: '💧' },
  { val: 'fuego',  label: 'Fuego',  icon: '🔥' },
  { val: 'tierra', label: 'Tierra', icon: '🌍' },
  { val: 'aire',   label: 'Aire',   icon: '🌬️' },
  { val: 'eter',   label: 'Éter',   icon: '🌌' },
]
const intensities = [
  { val: 'suave', label: '😌 Suave', cls: 'int-suave' },
  { val: 'medio', label: '💪 Medio', cls: 'int-medio' },
  { val: 'total', label: '🔥 Total', cls: 'int-total' },
]
const modalities = [
  { val: 'indiv',  label: 'Individual', icon: '👤' },
  { val: 'pareja', label: 'Pareja',     icon: '👫' },
  { val: 'grupal', label: 'Grupal',     icon: '👥' },
]
const waVars = ['{{nombre}}', '{{fecha}}', '{{date}}', '{{servicio}}']

const form = reactive({ ...props.service, modality: props.service?.modality || ['indiv'] })
watch(() => props.service, s => { Object.assign(form, s, { modality: s?.modality || ['indiv'] }) }, { deep: true })

// Auto-slug from name
watch(() => form.name_es, v => {
  if (props.isNew && v) {
    form.id = v.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40)
  }
})

const isValid = computed(() => !!form.name_es?.trim() && !!form.name_en?.trim())

function insertVar(field, v) {
  const el = field === 'wa_es' ? waEsRef.value : waEnRef.value
  if (el) {
    const pos = el.selectionStart ?? form[field]?.length ?? 0
    form[field] = (form[field] || '').slice(0, pos) + v + (form[field] || '').slice(pos)
  } else {
    form[field] = (form[field] || '') + v
  }
}

async function save() {
  if (!lock.acquire()) return
  saving.value = true
  const payload = sanitizeObject({ ...form })
  let err
  if (props.isNew) {
    ;({ error: err } = await supabase.from('services').insert(payload))
  } else {
    ;({ error: err } = await supabase.from('services').update(payload).eq('id', payload.id))
  }
  saving.value = false
  lock.release()
  if (!err) emit('saved')
}
</script>

<style scoped>
.modal-wide  { max-width: 760px; }
.modal-title-group { display: flex; align-items: center; gap: .75rem; }
.modal-icon  { font-size: 1.75rem; }
.modal-subtitle { font-size: .8rem; color: var(--text-muted); margin: 0; }

.step-tabs   { display: flex; gap: .25rem; padding: 0 1.5rem; border-bottom: 1px solid var(--border); }
.step-tab    { display: flex; align-items: center; gap: .5rem; padding: .6rem .9rem; background: none; border: none; color: var(--text-muted); font-size: .8rem; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all .2s; }
.step-tab:hover { color: var(--text); }
.step-tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }
.step-num    { background: var(--bg-3); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .7rem; }
.step-tab.active .step-num { background: var(--accent); color: var(--bg-1); }

.tab-body   { display: flex; flex-direction: column; gap: 1.25rem; }
.field-label { display: block; font-size: .82rem; font-weight: 600; color: var(--text-muted); margin-bottom: .4rem; text-transform: uppercase; letter-spacing: .04em; }
.field-hint  { font-size: .73rem; color: var(--text-muted); margin-top: .25rem; display: block; }
.char-hint   { display: block; text-align: right; font-size: .7rem; color: var(--text-muted); margin-top: .15rem; }
.mono { font-family: monospace; }

/* Category pills */
.category-pills { display: flex; gap: .75rem; flex-wrap: wrap; }
.cat-pill { padding: .6rem 1.25rem; border-radius: 99px; border: 2px solid var(--border); background: var(--bg-3); color: var(--text-muted); cursor: pointer; font-size: .875rem; transition: all .2s; }
.cat-pill:hover { border-color: var(--border); color: var(--text); }
.pill-cuerpo.cat-active   { border-color: #4d9cf7; color: #4d9cf7; background: rgba(77,156,247,.12); }
.pill-espiritu.cat-active { border-color: #c9a97a; color: #c9a97a; background: rgba(201,169,122,.12); }
.pill-mente.cat-active    { border-color: #7fc47f; color: #7fc47f; background: rgba(127,196,127,.12); }

/* Elements */
.element-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: .35rem; }
.element-btn  { display: flex; flex-direction: column; align-items: center; gap: .25rem; padding: .5rem .25rem; background: var(--bg-3); border: 2px solid var(--border); border-radius: 8px; cursor: pointer; font-size: .75rem; color: var(--text-muted); transition: all .2s; }
.element-btn:hover, .element-btn.active { border-color: var(--accent); color: var(--accent); background: rgba(201,169,122,.1); }
.element-btn span:first-child { font-size: 1.4rem; }

/* Intensity */
.intensity-row { display: flex; gap: .5rem; }
.intensity-btn { flex: 1; padding: .5rem; border-radius: 8px; border: 2px solid var(--border); background: var(--bg-3); cursor: pointer; font-size: .8rem; color: var(--text-muted); transition: all .2s; }
.int-suave.active { border-color: #7fc47f; color: #7fc47f; background: rgba(127,196,127,.1); }
.int-medio.active { border-color: #f7c44d; color: #f7c44d; background: rgba(247,196,77,.1); }
.int-total.active { border-color: #e05c5c; color: #e05c5c; background: rgba(224,92,92,.1); }

/* Modality */
.modality-row { display: flex; gap: .5rem; }
.modality-check { display: flex; align-items: center; gap: .4rem; padding: .5rem 1rem; border: 2px solid var(--border); border-radius: 8px; cursor: pointer; font-size: .85rem; color: var(--text-muted); transition: all .2s; }
.modality-check input { display: none; }
.modality-check.active { border-color: var(--accent); color: var(--accent); background: rgba(201,169,122,.1); }

/* WA */
.wa-chips { display: flex; gap: .4rem; flex-wrap: wrap; margin-top: .4rem; }
.wa-chip  { display: inline-block; background: rgba(37,211,102,.15); color: #25d366; padding: .2rem .5rem; border-radius: 4px; font-size: .75rem; cursor: pointer; font-family: monospace; }
.wa-chip:hover { background: rgba(37,211,102,.3); }

/* Footer split */
.footer-left  { flex: 1; }
.footer-right { display: flex; gap: .5rem; }
.btn-success  { background: var(--success); color: white; border: none; }
.btn-success:hover { filter: brightness(1.15); }
.btn-success:disabled { opacity: .5; cursor: not-allowed; }
</style>
