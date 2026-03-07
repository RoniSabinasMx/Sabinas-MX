<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal" style="max-width:480px">
      <div class="modal-header">
        <h2>⚠️ Eliminar Servicio</h2>
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <p>Estás eliminando <strong>{{ service?.name_es }}</strong>.</p>
        <p style="color:var(--text-muted);font-size:.875rem">
          Para evitar flujos rotos en el cuestionario, selecciona un servicio de redirección que lo reemplace:
        </p>
        <div>
          <label>Servicio de redirección *</label>
          <select v-model="redirect" class="select">
            <option value="">Selecciona un servicio…</option>
            <option v-for="s in others" :key="s.id" :value="s.id">{{ s.name_es }}</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('close')">Cancelar</button>
        <button class="btn btn-danger" :disabled="!redirect || deleting" @click="confirmDelete">
          {{ deleting ? 'Eliminando…' : 'Confirmar eliminación' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

const props = defineProps({ service: Object, allServices: Array })
const emit = defineEmits(['close', 'deleted'])

const redirect = ref('')
const deleting = ref(false)

const others = computed(() => (props.allServices || []).filter(s => s.id !== props.service?.id))

async function confirmDelete() {
  if (!redirect.value) return
  deleting.value = true
  // Save the redirect mapping in settings
  await supabase.from('settings').upsert({
    key: `redirect_${props.service.id}`,
    value: redirect.value
  })
  // Delete the service
  await supabase.from('services').delete().eq('id', props.service.id)
  deleting.value = false
  emit('deleted')
}
</script>
