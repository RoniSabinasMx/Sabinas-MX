<template>
  <div class="layout">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '../components/Sidebar.vue'
</script>

<style scoped>
.layout { display: flex; height: 100vh; overflow: hidden; }
.main-content { flex: 1; overflow-y: auto; padding: 2rem 2.5rem; }
</style>
