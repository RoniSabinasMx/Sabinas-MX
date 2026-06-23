<template>
  <router-view />
  <ToastNotification />
  <SpeedInsights />
</template>

<script setup>
import ToastNotification from './components/ToastNotification.vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

const auth = useAuthStore()
onMounted(() => auth.init())
</script>
