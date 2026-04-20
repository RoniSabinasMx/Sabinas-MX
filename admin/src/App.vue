<template>
  <Analytics />
  <router-view />
  <ToastNotification />
</template>

<script setup>
import { Analytics } from '@vercel/analytics/vue'
import ToastNotification from './components/ToastNotification.vue'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

const auth = useAuthStore()
onMounted(() => auth.init())
</script>
