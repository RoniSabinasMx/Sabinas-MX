<template>
  <div class="locale-field-card">
    <div class="locale-field-key">{{ friendlyLabel }}</div>
    <div class="locale-inputs">
      <div class="lang-input-wrap">
        <span class="lang-flag">🇲🇽</span>
        <input
          v-model="esVal"
          @input="debouncedSave('es')"
          class="input lang-input"
          :class="{ 'saved-ok': saveState.es === 'ok', 'saved-err': saveState.es === 'err' }"
          placeholder="Español…"
        />
        <span v-if="saveState.es === 'ok'" class="save-indicator ok">✓</span>
        <span v-if="saveState.es === 'err'" class="save-indicator err">!</span>
      </div>
      <div class="lang-input-wrap">
        <span class="lang-flag">🇬🇧</span>
        <input
          v-model="enVal"
          @input="debouncedSave('en')"
          class="input lang-input"
          :class="{ 'saved-ok': saveState.en === 'ok', 'saved-err': saveState.en === 'err' }"
          placeholder="English…"
        />
        <span v-if="saveState.en === 'ok'" class="save-indicator ok">✓</span>
        <span v-if="saveState.en === 'err'" class="save-indicator err">!</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { sanitize } from '../utils/sanitize'
import { debounce } from '../utils/rateLimit'

const props = defineProps({ strKey: String, esVal: String, enVal: String })
const emit  = defineEmits(['saved'])

const esVal     = ref(props.esVal)
const enVal     = ref(props.enVal)
const saveState = reactive({ es: '', en: '' })

watch(() => props.esVal, v => { esVal.value = v })
watch(() => props.enVal, v => { enVal.value = v })

// Convert key like "hero.main_title" → "Título principal"
const friendlyLabel = computed(() => {
  const key  = props.strKey || ''
  const part = key.includes('.') ? key.split('.').slice(1).join('.') : key
  return part
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    || key
})

async function save(lang) {
  const rawVal   = lang === 'es' ? esVal.value : enVal.value
  const cleanVal = sanitize(rawVal)
  if (lang === 'es') esVal.value = cleanVal
  else enVal.value = cleanVal

  const { error } = await supabase.from('locale_strings')
    .upsert({ key: props.strKey, lang, value: cleanVal }, { onConflict: 'key,lang' })
  saveState[lang] = error ? 'err' : 'ok'
  setTimeout(() => { saveState[lang] = '' }, 2500)
  if (!error) emit('saved')
}

const debouncedSave = debounce(save, 700)
</script>

<style scoped>
.locale-field-card {
  background: var(--bg-page);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-sm);
  padding: .9rem 1rem;
  transition: border-color var(--transition);
}
.locale-field-card:hover { border-color: var(--border); }

.locale-field-key {
  font-size: .78rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: .6rem;
  text-transform: capitalize;
}

.locale-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .6rem;
}

.lang-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: .5rem;
}

.lang-flag {
  font-size: 1rem;
  flex-shrink: 0;
}

.lang-input {
  flex: 1;
  padding: .5rem .75rem;
  font-size: .83rem;
  transition: border-color .3s, box-shadow .3s;
}
.lang-input.saved-ok {
  border-color: var(--success);
  box-shadow: 0 0 0 2px rgba(46,125,50,.1);
}
.lang-input.saved-err {
  border-color: var(--danger);
}

.save-indicator {
  position: absolute;
  right: .6rem;
  font-size: .75rem;
  font-weight: 700;
  pointer-events: none;
}
.save-indicator.ok  { color: var(--success); }
.save-indicator.err { color: var(--danger); }

@media (max-width: 600px) {
  .locale-inputs { grid-template-columns: 1fr; }
}
</style>
