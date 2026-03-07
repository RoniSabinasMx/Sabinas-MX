import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([])

    function add(message, type = 'success') {
        const id = Date.now()
        toasts.value.push({ id, message, type })
        setTimeout(() => remove(id), 3500)
    }

    function remove(id) {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    return { toasts, add, remove }
})
