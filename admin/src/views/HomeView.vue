<template>
  <div class="home-view">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <div>
        <h1>Bienvenida, Roni 👋</h1>
        <p class="welcome-subtitle">Aquí tienes un resumen de lo que está pasando en tu espacio.</p>
      </div>
      <span class="today-date">{{ todayLabel }}</span>
    </div>

    <!-- Metric Cards -->
    <div class="metrics-grid">
      <div class="metric-card metric-messages" @click="$router.push('/crm')">
        <div class="metric-icon">📬</div>
        <div class="metric-body">
          <div class="metric-number">{{ metrics.newMessages }}</div>
          <div class="metric-label">Mensajes nuevos</div>
          <div class="metric-sub">de colaboradores</div>
        </div>
        <div class="metric-arrow">→</div>
      </div>

      <div class="metric-card metric-services" @click="$router.push('/servicios')">
        <div class="metric-icon">🌿</div>
        <div class="metric-body">
          <div class="metric-number">{{ metrics.activeServices }}</div>
          <div class="metric-label">Servicios activos</div>
          <div class="metric-sub">en el catálogo</div>
        </div>
        <div class="metric-arrow">→</div>
      </div>

      <div class="metric-card metric-clicks" @click="$router.push('/sponsors')">
        <div class="metric-icon">👆</div>
        <div class="metric-body">
          <div class="metric-number">{{ metrics.sponsorClicks }}</div>
          <div class="metric-label">Clics en patrocinadores</div>
          <div class="metric-sub">total acumulado</div>
        </div>
        <div class="metric-arrow">→</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-section">
      <h2 class="quick-title">Acciones rápidas</h2>
      <div class="quick-grid">
        <button class="quick-btn" @click="goAddService">
          <span class="quick-btn-icon">✚</span>
          <span class="quick-btn-label">Añadir Servicio</span>
          <span class="quick-btn-sub">Publicar un nuevo tratamiento</span>
        </button>

        <button class="quick-btn" @click="$router.push('/configuracion')">
          <span class="quick-btn-icon">📅</span>
          <span class="quick-btn-label">Bloquear Fechas</span>
          <span class="quick-btn-sub">Marcar días no disponibles</span>
        </button>

        <button class="quick-btn" @click="$router.push('/crm')">
          <span class="quick-btn-icon">👥</span>
          <span class="quick-btn-label">Revisar Mensajes</span>
          <span class="quick-btn-sub">Ver solicitudes de colaboración</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router  = useRouter()
const metrics = ref({ newMessages: 0, activeServices: 0, sponsorClicks: 0 })

const todayLabel = computed(() =>
  new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

async function load() {
  const [leads, services, sponsors] = await Promise.all([
    supabase.from('colaboradores_leads').select('id', { count: 'exact' })
      .eq('status', 'nuevo'),
    supabase.from('services').select('id', { count: 'exact' }),
    supabase.from('sponsors').select('clicks'),
  ])
  metrics.value.newMessages    = leads.count   ?? 0
  metrics.value.activeServices = services.count ?? 0
  metrics.value.sponsorClicks  = (sponsors.data || []).reduce((a, s) => a + (s.clicks || 0), 0)
}

function goAddService() {
  router.push('/servicios?new=1')
}

onMounted(load)
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 900px;
}

/* ── Welcome Header ── */
.welcome-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.welcome-header h1 { line-height: 1.2; }
.welcome-subtitle  { color: var(--text-muted); font-size: .95rem; margin-top: .3rem; }
.today-date {
  font-size: .8rem;
  color: var(--text-muted);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: .35rem .9rem;
  white-space: nowrap;
  flex-shrink: 0;
  text-transform: capitalize;
}

/* ── Metric Cards ── */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}
.metric-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: var(--radius) var(--radius) 0 0;
}
.metric-messages::before { background: #a87c52; }
.metric-services::before { background: var(--accent-2); }
.metric-clicks::before   { background: #4d89c4; }

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--border);
}
.metric-icon {
  font-size: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.metric-body { flex: 1; }
.metric-number {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--text);
  letter-spacing: -.03em;
}
.metric-label {
  font-size: .875rem;
  font-weight: 600;
  color: var(--text);
  margin-top: .25rem;
}
.metric-sub {
  font-size: .75rem;
  color: var(--text-muted);
  margin-top: .1rem;
}
.metric-arrow {
  font-size: 1.2rem;
  color: var(--text-light);
  transition: transform var(--transition);
}
.metric-card:hover .metric-arrow { transform: translateX(4px); color: var(--accent); }

/* ── Quick Actions ── */
.quick-title {
  font-size: .8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--text-muted);
  margin-bottom: .75rem;
}
.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.quick-btn {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  cursor: pointer;
  transition: all var(--transition);
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.quick-btn:hover {
  border-color: var(--accent);
  background: var(--accent-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.quick-btn-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: var(--bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition);
}
.quick-btn:hover .quick-btn-icon { transform: scale(1.1); }
.quick-btn-label {
  font-size: .95rem;
  font-weight: 700;
  color: var(--text);
}
.quick-btn-sub {
  font-size: .78rem;
  color: var(--text-muted);
  line-height: 1.3;
}

/* ── Responsive ── */
@media (max-width: 720px) {
  .metrics-grid, .quick-grid { grid-template-columns: 1fr; }
  .welcome-header { flex-direction: column; }
}
</style>
