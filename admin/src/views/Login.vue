<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-logo">
        <span class="logo-icon">✦</span>
        <h1>SABINAS</h1>
        <p>Panel de Administración</p>
      </div>

      <form @submit.prevent="handleLogin" class="section-gap">
        <div>
          <label>Email</label>
          <input v-model="email" type="email" class="input" placeholder="admin@sabinas.mx" required />
        </div>
        <div>
          <label>Contraseña</label>
          <input v-model="password" type="password" class="input" placeholder="••••••••" required />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn btn-primary" :disabled="loading" style="width:100%;justify-content:center">
          {{ loading ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.message || 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 60% 40%, #1e1a28, #0f1117 70%);
}
.login-card {
  width: 100%; max-width: 400px; background: var(--bg-2);
  border: 1px solid var(--border); border-radius: var(--radius);
  padding: 2.5rem; box-shadow: var(--shadow);
}
.login-logo { text-align: center; margin-bottom: 2rem; }
.logo-icon { font-size: 2rem; color: var(--accent); display: block; margin-bottom: .5rem; }
.login-logo h1 { font-size: 1.75rem; letter-spacing: .15em; }
.login-logo p  { color: var(--text-muted); font-size: .875rem; margin-top: .25rem; }
.error-msg { color: var(--danger); font-size: .8rem; text-align: center; }
</style>
