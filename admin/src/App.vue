<template>
  <router-view />
  <ToastNotification />
</template>

<script setup>
import ToastNotification from './components/ToastNotification.vue'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

const auth = useAuthStore()
onMounted(() => auth.init())
</script>
