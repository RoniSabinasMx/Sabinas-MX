<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <span class="logo-leaf">🌿</span>
      <span class="logo-text">SABINAS</span>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/"              class="nav-item" exact-active-class="router-link-active">
        <span class="nav-icon">🏠</span> Inicio
      </router-link>
      <router-link to="/servicios"     class="nav-item">
        <span class="nav-icon">🌿</span> Servicios
      </router-link>
      <router-link to="/textos"        class="nav-item">
        <span class="nav-icon">✏️</span> Textos del Sitio
      </router-link>
      <router-link to="/sponsors"      class="nav-item">
        <span class="nav-icon">⭐</span> Patrocinadores
      </router-link>
      <router-link to="/configuracion" class="nav-item">
        <span class="nav-icon">⚙️</span> Configuración
      </router-link>
      <router-link to="/crm"           class="nav-item">
        <span class="nav-icon">👥</span> Colaboradores
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-row">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-info">
          <span class="user-email">{{ auth.user?.email }}</span>
          <span class="user-role">Administradora</span>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm logout-btn" @click="handleLogout">Salir</button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth   = useAuthStore()
const router = useRouter()

const userInitial = computed(() => {
  const email = auth.user?.email || '?'
  return email[0].toUpperCase()
})

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
}

/* ── Logo ── */
.sidebar-logo {
  padding: 1.4rem 1.25rem;
  display: flex;
  align-items: center;
  gap: .6rem;
  border-bottom: 1px solid var(--border);
}
.logo-leaf { font-size: 1.3rem; }
.logo-text {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: .18em;
  color: var(--accent);
}

/* ── Nav ── */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: .75rem 0;
  gap: .1rem;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .65rem 1.25rem;
  color: var(--text-muted);
  text-decoration: none;
  font-size: .875rem;
  font-weight: 500;
  border-left: 3px solid transparent;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  transition: all var(--transition);
  margin: 0 .5rem 0 0;
}
.nav-item:hover {
  color: var(--text);
  background: var(--bg-hover);
  border-left-color: var(--border);
}
.nav-item.router-link-active {
  color: var(--accent);
  background: var(--accent-light);
  border-left-color: var(--accent);
  font-weight: 600;
}
.nav-icon { font-size: 1rem; width: 20px; text-align: center; }

/* ── Footer ── */
.sidebar-footer {
  padding: 1rem 1.1rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: .65rem;
}
.user-row {
  display: flex;
  align-items: center;
  gap: .65rem;
}
.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 700;
  font-size: .9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1.5px solid var(--border);
}
.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.user-email {
  font-size: .73rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-role {
  font-size: .68rem;
  color: var(--text-light);
}
.logout-btn { width: 100%; justify-content: center; }
</style>
