<script setup lang="ts">
import MainMenu from './components/MainMenu.vue'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import Footer from './components/Footer.vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.init()
})
</script>

<template>
  <div class="container">
    <header class="header">
      <MainMenu class="main-menu" />
    </header>
    <div class="hero">
      <RouterView />
    </div>
    <slot />
    <Footer />
  </div>
</template>

<style scoped lang="scss">
.header {
  padding: 1.5rem 0;
}
</style>
