<template>
  <p class="profile__authorize-first" v-if="!authStore.user">
    Для просмотра этой страницы требуется авторизация
  </p>
  <article class="profile" v-else>
    <h3 class="profile__title">Мой аккаунт</h3>
    <div class="profile__btn-block">
      <button class="profile__favorites btn btn--auth" type="button" @click="toggleSettings">
        <svg
          class="profile__fav-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C9.5 20 2 16 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3ZM12.9339 18.6038C13.8155 18.0485 14.61 17.4955 15.3549 16.9029C18.3337 14.533 20 11.9435 20 9C20 6.64076 18.463 5 16.5 5C15.4241 5 14.2593 5.56911 13.4142 6.41421L12 7.82843L10.5858 6.41421C9.74068 5.56911 8.5759 5 7.5 5C5.55906 5 4 6.6565 4 9C4 11.9435 5.66627 14.533 8.64514 16.9029C9.39 17.4955 10.1845 18.0485 11.0661 18.6038C11.3646 18.7919 11.6611 18.9729 12 19.1752C12.3389 18.9729 12.6354 18.7919 12.9339 18.6038Z"
            fill="white"
          />
        </svg>
        <span class="profile__fav-text">{{ mobileMenu ? 'Избранные фильмы' : 'Избранное' }}</span>
      </button>
      <button class="profile__settings btn btn--auth" type="button" @click="toggleSettings">
        <svg
          class="profile__settings-icon"
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
        <span class="profile__settings-text">{{
          mobileMenu ? 'Настройка аккаунта' : 'Настройки'
        }}</span>
      </button>
    </div>
    <div class="profile__settings-menu" v-if="!settingsIsOpen">
      <div class="profile__user-settings">
        <div class="profile__user-description">
          <span class="profile__circle">{{ userName[0] }}</span>
          <div class="profile__inner-section">
            <span class="profile__name">Имя Фамилия</span>
            <span class="profile__user-name" v-if="authStore.user">{{ userName }}</span>
          </div>
        </div>
        <div class="profile__user-description">
          <span class="profile__circle"
            ><svg
              class="profile__user-mail-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 3C21.5523 3 22 3.44772 22 4V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918C2.44405 21 2 20.5551 2 20.0066V19H20V7.3L12 14.5L2 5.5V4C2 3.44772 2.44772 3 3 3H21ZM8 15V17H0V15H8ZM5 10V12H0V10H5ZM19.5659 5H4.43414L12 11.8093L19.5659 5Z"
                fill="white"
              />
            </svg>
          </span>
          <div class="profile__inner-section">
            <span class="profile__email">Электронная почта</span>
            <span class="profile__user-email" v-if="authStore.user">{{ userEmail }}</span>
          </div>
        </div>
      </div>
      <button class="profile__logout-btn btn" @click="handleLogout">Выйти из аккаунта</button>
    </div>
    <div class="profile__fav-films" v-else>
      <span class="profile__no-films" v-if="basket.productsInBasket.length === 0"
        >Фильмы добавленные в избранное отобразятся здесь</span
      >
      <div class="profile__catalog" v-else>
        <top-10-movie
          class="profile__movie-card"
          v-for="(film, index) in basket.productsInBasket"
          :key="film.id"
          :film="film"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBasketStore } from '@/stores/basketStore'
import { useAuthStore } from '@/stores/authStore'
import Top10Movie from '@/components/Top10Movie.vue'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const basket = useBasketStore()
const router = useRouter()
const settingsIsOpen = ref<Boolean>(false)
const mobileMenu = ref<Boolean>(false)
const { user } = storeToRefs(authStore)

const userName = computed(() => {
  return authStore.user?.name || ''
})

const userEmail = computed(() => {
  return authStore.user?.email || ''
})

const toggleSettings = () => {
  settingsIsOpen.value = !settingsIsOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/')
}

onMounted(async () => {
  if (authStore.user) {
    await basket.fetchFavorites()
  } else {
    console.log('Пользователь не авторизован')
  }
})

watch(user, async (newUser) => {
  if (newUser) {
    await basket.fetchFavorites()
  } else {
    basket.productsInBasket = []
  }
})

const checkWindowWidth = () => {
  mobileMenu.value = window.innerWidth > 768
}

onMounted(() => {
  checkWindowWidth()
  window.addEventListener('resize', checkWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkWindowWidth)
})
</script>

<style scoped lang="scss">
@use '../../assets/scss/global/variables' as *;

.profile {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding: 4rem 0 4rem 0;

  @media (max-width: 37.25rem) {
    padding: 1rem 0 1rem;
    gap: 2rem;
  }

  &__title,
  &__authorize-first {
    font-size: $px-48;
    line-height: $px-56;
    font-weight: 700;

    @media (max-width: 37.5rem) {
      font-size: $px-24;
      line-height: $px-32;
    }
  }

  &__user-settings {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  &__settings-menu {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  &__btn-block {
    display: flex;
    align-items: center;
    gap: 4rem;

    @media (max-width: 31.25rem) {
      gap: 0.62rem;
      justify-content: space-between;
    }

    @media (max-width: 22.5rem) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__favorites,
  &__settings {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  &__fav-text,
  &__settings-text {
    font-size: $px-24;
    line-height: $px-32;
    font-weight: 400;
  }

  &__circle {
    width: 3.75rem;
    height: 3.75rem;
    border-radius: 1.87rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: $white-50;
  }

  &__name,
  &__email {
    font-size: $px-18;
    line-height: $px-24;
    font-weight: 400;
  }

  &__user-description {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__inner-section {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
  }

  &__user-name,
  &__user-email {
    font-size: $px-24;
    line-height: $px-32;
    font-weight: 700;
  }

  &__logout-btn {
    max-width: 16.37rem;
  }

  &__no-films {
    font-size: $px-24;
    line-height: $px-32;
    font-weight: 400;
  }

  &__catalog {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5vw;

    @media (max-width: 64rem) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 40.06rem) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 28.12rem) {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  &__movie-card {
    :deep(.top-film__img) {
      width: unset;
      height: unset;
    }
  }
}
</style>
