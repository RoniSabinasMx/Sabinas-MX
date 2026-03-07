<template>
  <Teleport to="body">
    <div class="toast-wrap">
      <TransitionGroup name="toast">
        <div v-for="t in toast.toasts" :key="t.id"
          class="toast" :class="`toast-${t.type}`">
          <span class="toast-icon">
            {{ t.type === 'success' || !t.type ? '✓' : t.type === 'warn' ? '⚠' : '✕' }}
          </span>
          <span class="toast-msg">{{ t.message }}</span>
          <button class="toast-close" @click="toast.remove(t.id)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from '../stores/toast'
const toast = useToastStore()
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  bottom: 1.75rem;
  right: 1.75rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: .6rem;
  pointer-events: none;
}

.toast {
  pointer-events: all;
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .85rem 1.1rem;
  border-radius: var(--radius);
  font-size: .875rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  box-shadow: 0 8px 24px rgba(0,0,0,.12);
  min-width: 240px;
  max-width: 340px;
  border-left: 4px solid var(--border);
}

/* default = success */
.toast-success, .toast:not([class*='toast-warn']):not([class*='toast-error']) {
  border-left-color: var(--success);
}
.toast-success .toast-icon { color: var(--success); }

.toast-warn   { border-left-color: var(--warn); }
.toast-warn   .toast-icon { color: var(--warn); }

.toast-error  { border-left-color: var(--danger); }
.toast-error  .toast-icon { color: var(--danger); }

.toast-icon {
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}
.toast-msg {
  flex: 1;
  color: var(--text);
  line-height: 1.4;
}
.toast-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: .8rem;
  padding: .1rem;
  flex-shrink: 0;
  opacity: .6;
  transition: opacity var(--transition);
}
.toast-close:hover { opacity: 1; }

/* Transition */
.toast-enter-active { transition: all .3s cubic-bezier(.34,1.56,.64,1); }
.toast-leave-active { transition: all .2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(60px) scale(.9); }
.toast-leave-to     { opacity: 0; transform: translateX(40px); }
</style>
