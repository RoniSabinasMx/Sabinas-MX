import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const loading = ref(true)

    async function init() {
        const { data: { session } } = await supabase.auth.getSession()
        user.value = session?.user ?? null
        loading.value = false

        supabase.auth.onAuthStateChange((_event, session) => {
            user.value = session?.user ?? null
        })
    }

    async function login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        user.value = data.user
    }

    async function logout() {
        await supabase.auth.signOut()
        user.value = null
    }

    return { user, loading, init, login, logout }
})
