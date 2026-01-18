<template>
  <div class="user-menu" v-if="menuForMobile">
    <div v-if="userAuth.user" class="user-menu__logged">
      <RouterLink to="/profile" class="user-menu__link">
        {{ userName }}
      </RouterLink>
    </div>
    <div v-else class="user-menu__guest">
      <button @click="$emit('open-auth-form')" class="btn btn--auth">Войти</button>
    </div>
  </div>
  <div class="user-menu--mobile" v-else>
    <button
      class="user-menu__auth-btn btn btn--transparent"
      type="button"
      aria-label="Вход в аккаунт"
      @click="$emit('open-auth-form')"
      v-if="!menuForMobile && !user"
    >
      <svg
        class="user-menu__auth-btn-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"
          fill="white"
        />
      </svg>
    </button>
    <button
      v-else-if="!menuForMobile && userAuth.user"
      class="user-menu__auth-btn btn btn--transparent"
      type="button"
      @click="goToSettings"
    >
      <svg
        class="user-menu__auth-btn-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"
          fill="white"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

const router = useRouter()
const userAuth = useAuthStore()
const menuForMobile = ref(true)
const { user } = storeToRefs(useAuthStore())

const userName = computed(() => {
  return userAuth.user?.name || 'Профиль'
})

const checkWindowWidth = () => {
  menuForMobile.value = window.innerWidth > 1024
}

onMounted(async () => {
  checkWindowWidth()
  window.addEventListener('resize', checkWindowWidth)

  if (!userAuth.user) {
    await userAuth.init()
  }
})

onUnmounted(async () => {
  window.removeEventListener('resize', checkWindowWidth)
})

const emit = defineEmits(['open-auth-form'])

const handleLogout = async () => {
  await userAuth.logout()
}

const goToSettings = () => {
  if (user) {
    router.push('/profile')
  }
}
</script>

<style scoped lang="scss">
@use '../../assets/scss/global/variables' as *;
</style>
