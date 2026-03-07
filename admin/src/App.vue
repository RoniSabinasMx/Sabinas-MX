<template>
  <router-view />
  <ToastNotification />
  <Analytics />
</template>

<script setup>
import ToastNotification from './components/ToastNotification.vue'
import { Analytics } from '@vercel/analytics/vue'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

const auth = useAuthStore()
onMounted(() => auth.init())
</script>
