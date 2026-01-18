<template>
  <div class="main-menu">
    <RouterLink to="/home">
      <span class="main-link">
        <picture class="main-link__picture">
          <source src="/images/main-link/main-link.webp" type="images/webp" />
          <img
            class="main-link__img"
            src="/images/main-link/main-link.png"
            srcset="/images/main-link/main-link@2x.png 2x"
            alt="Главная страница"
            width="143"
            height="32"
          />
        </picture>
      </span>
    </RouterLink>
    <div class="main-menu__navigation-block">
      <div class="nav-menu" v-if="menuForMobile">
        <RouterLink to="/home" class="nav-menu__link">Главная</RouterLink>
        <RouterLink to="/genres" class="nav-menu__link">Жанры</RouterLink>
      </div>
      <div class="nav-menu nav-menu--mobile" v-else>
        <RouterLink class="nav-menu__mobile-link" to="/genres"
          ><svg
            class="nav-menu__genres-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 11.5C4.51472 11.5 2.5 9.48528 2.5 7C2.5 4.51472 4.51472 2.5 7 2.5C9.48528 2.5 11.5 4.51472 11.5 7C11.5 9.48528 9.48528 11.5 7 11.5ZM7 21.5C4.51472 21.5 2.5 19.4853 2.5 17C2.5 14.5147 4.51472 12.5 7 12.5C9.48528 12.5 11.5 14.5147 11.5 17C11.5 19.4853 9.48528 21.5 7 21.5ZM17 11.5C14.5147 11.5 12.5 9.48528 12.5 7C12.5 4.51472 14.5147 2.5 17 2.5C19.4853 2.5 21.5 4.51472 21.5 7C21.5 9.48528 19.4853 11.5 17 11.5ZM17 21.5C14.5147 21.5 12.5 19.4853 12.5 17C12.5 14.5147 14.5147 12.5 17 12.5C19.4853 12.5 21.5 14.5147 21.5 17C21.5 19.4853 19.4853 21.5 17 21.5ZM7 9.5C8.38071 9.5 9.5 8.38071 9.5 7C9.5 5.61929 8.38071 4.5 7 4.5C5.61929 4.5 4.5 5.61929 4.5 7C4.5 8.38071 5.61929 9.5 7 9.5ZM7 19.5C8.38071 19.5 9.5 18.3807 9.5 17C9.5 15.6193 8.38071 14.5 7 14.5C5.61929 14.5 4.5 15.6193 4.5 17C4.5 18.3807 5.61929 19.5 7 19.5ZM17 9.5C18.3807 9.5 19.5 8.38071 19.5 7C19.5 5.61929 18.3807 4.5 17 4.5C15.6193 4.5 14.5 5.61929 14.5 7C14.5 8.38071 15.6193 9.5 17 9.5ZM17 19.5C18.3807 19.5 19.5 18.3807 19.5 17C19.5 15.6193 18.3807 14.5 17 14.5C15.6193 14.5 14.5 15.6193 14.5 17C14.5 18.3807 15.6193 19.5 17 19.5Z"
              fill="white"
            />
          </svg>
        </RouterLink>
        <button
          class="nav-menu__search-btn btn btn--transparent"
          type="button"
          @click="toggleSearch"
        >
          <svg
            class="nav-menu__search-btn-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"
              fill="white"
            />
          </svg>
        </button>
      </div>
      <div class="custom-search" :class="{ 'custom-search--show': showSearchInput }">
        <label for="searchFilm" class="custom-search__label"
          ><svg
            class="custom-search__search-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"
              fill="currentColor"
              fill-opacity="0.5"
            />
          </svg>
        </label>
        <input
          type="search"
          id="searchFilm"
          class="custom-search__input"
          v-model="searchText"
          placeholder="Поиск"
        />
        <div
          class="custom-search__films-menu"
          :class="{ 'custom-search__films-menu--show': showFilmsMenu }"
        >
          <span class="custom-search__no-films" v-if="searchedFilms.length === 0 && !isDebouncing"
            >Не найдено фильма с таким названием</span
          >
          <span class="custom-search__searching" v-if="isDebouncing">Ищем фильмы...</span>
          <div class="search-results-desktop" v-if="searchResultsForDesktop">
            <small-film
              v-for="film in top5SearchMovies"
              :key="film.id"
              :film="film"
              class="custom-search__film"
              @inputClear="clearSearch"
              @searchInputNotActive="closeSearchInput"
            />
          </div>

          <swiper
            v-if="!searchResultsForDesktop && searchedFilms.length > 0"
            :modules="[Navigation]"
            :slides-per-view="2"
            :space-between="20"
            class="search-swiper"
            :loop="true"
          >
            <SwiperSlide
              v-for="film in top5SearchMovies"
              :key="film.id"
              class="search-swiper-slide"
            >
              <small-film
                :film="film"
                @inputClear="clearSearch"
                @searchInputNotActive="closeSearchInput"
              />
            </SwiperSlide>
          </swiper>
        </div>
      </div>

      <div class="main-menu__logged">
        <user-auth class="authorize-btn btn btn--auth" @open-auth-form="openAuthForm" />
      </div>
    </div>

    <modal-menu
      class="modal-window"
      :class="{ 'modal-window--active': modalStore.openModal }"
      @closeModal="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import type { Film } from '@/api/types/filmType'
import { useModalStore } from '@/stores/modalStore'
import { useMoviesStore } from '@/stores/moviesStore'
import { useAuthStore } from '@/stores/authStore'
import HomeView from '@/pages/HomeView.vue'
import UserAuth from '@/components/UserAuth.vue'
import SmallFilm from '@/components/SmallFilm.vue' // ← Добавьте
import ModalMenu from '@/components/ModalMenu.vue' // ← Добавьте
import { RouterLink } from 'vue-router'
import GenresView from '@/pages/GenresView.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

// const items = [
//   { to: '/home', name: 'Главная' },
//   { to: '/genres', name: 'Жанры' },
// ]

const user = useAuthStore()
const moviesStore = useMoviesStore()
const searchText = ref('')
const allFilms = ref<Film[]>([])
const loading = ref(false)
const searching = ref(false)
const showSearchInput = ref(false)
const menuForMobile = ref(false)
const modalStore = useModalStore()
const searchResultsForDesktop = ref(true)
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const isDebouncing = ref(false)

const checkWindowWidth = () => {
  menuForMobile.value = window.innerWidth > 1024
  searchResultsForDesktop.value = window.innerWidth > 600
}

onMounted(async () => {
  checkWindowWidth()
  window.addEventListener('resize', checkWindowWidth)

  try {
    loading.value = true
    await moviesStore.loadAllMovies()
    allFilms.value = moviesStore.allMovies
  } catch (err) {
    throw new Error()
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  checkWindowWidth()
  window.removeEventListener('resize', checkWindowWidth)

  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

const searchedFilms = computed(() => moviesStore.searchResults)

watch(searchText, async (newValue) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (!newValue.trim()) {
    moviesStore.clearSearchResults()
    return
  }

  isDebouncing.value = true

  searchTimeout.value = setTimeout(async () => {
    isDebouncing.value = false
    try {
      await moviesStore.searchMovies(newValue, 5)
    } catch (error) {
      console.error('Ошибка поиска:', error)
    }
  }, 900)
})

const clearSearch = () => {
  searchText.value = ''
  moviesStore.clearSearchResults()
  isDebouncing.value = false
}

const showFilmsMenu = () => {
  searching.value = !searching.value
}

const top5SearchMovies = computed(() => {
  return [...searchedFilms.value]
    .sort((a: Film, b: Film) => {
      const ratingA = a.tmdbRating || 0
      const ratingB = b.tmdbRating || 0
      return ratingB - ratingA
    })
    .slice(0, 5)
})

const toggleSearch = () => {
  showSearchInput.value = !showSearchInput.value

  if (!showSearchInput.value) {
    clearSearch()
  }
}

const closeSearchInput = () => {
  showSearchInput.value = false
}

const openAuthForm = () => {
  modalStore.openModalWindow()
}

const closeModal = () => {
  modalStore.closeModalWindow()
}

const isSearching = computed(() => {
  return searchText.value !== ''
})
</script>

<style scoped lang="scss">
@use '../../assets/scss/global/variables' as *;

.main-menu {
  display: flex;
  align-items: center;
  gap: 0.62rem;
  justify-content: space-between;
  // padding: 0.62rem 0;

  &__navigation-block {
    display: flex;
    align-items: center;
    gap: 1.12rem;
    width: 100%;
    justify-content: flex-end;
  }
}

.nav-menu {
  display: flex;
  gap: 2.5rem;
  align-items: center;
  $root: &;
  position: relative;

  @media (max-width: 79.37rem) {
    gap: 1vw;
  }

  &__link {
    font-size: $px-24;
    line-height: $px-32;
    color: $white;
    position: relative;

    &::before {
      content: '';
      width: 100%;
      height: 1.5px;
      background-color: $pink-link-hover;
      position: absolute;
      bottom: -30%;
      left: 0;
      clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);

      transition: clip-path $transition-300;
    }

    &:hover,
    &:focus-visible,
    &:active {
      &::before {
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      }
    }

    &:active {
      &::before {
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      }
    }
  }

  &--mobile {
    gap: 1.12rem;

    #{$root}__mobile-link {
      transition: scale $transition-300;

      &:hover,
      &:focus-visible {
        scale: 1.2;
      }
    }
  }
}

.router-link-exact-active {
  &::before {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}

.main-link {
  $root: &;

  &__img {
    transition: scale $transition-300;
  }

  &:hover,
  &:focus-visible {
    #{$root}__img {
      scale: 1.2;
    }
  }
}

.custom-search {
  position: relative;
  max-width: 40.93rem;
  width: 100%;
  $root: &;
  transition: opacity $transition-300;
  z-index: -2;

  @media (max-width: 79.37rem) {
    max-width: 27rem;
  }

  @media (max-width: 64rem) {
    position: fixed;
    top: 4rem;
    left: 43%;
    // z-index: 10;
    opacity: 0;
  }

  @media (max-width: 52.5rem) {
    left: unset;
    right: 5%;
  }

  @media (max-width: 48.93rem) {
    left: unset;
    right: 2%;
  }

  @media (max-width: 31.25rem) {
    width: 90vw;
  }

  &:hover,
  &:focus-within {
    #{$root}__search-icon {
      path {
        fill: $pink-input-hover;
        fill-opacity: 1;
        opacity: 1;
      }
    }

    #{$root}__input {
      border-color: $pink-input-hover;
    }
  }

  &:active {
    #{$root}__input {
      border-color: $pink-input-hover;
    }
  }

  &__label {
    position: absolute;
    top: 50%;
    left: 2%;
    transform: translateY(-50%);
  }

  &__search-icon {
    path {
      fill: $white;
      opacity: 0.5;

      transition:
        fill $transition-300,
        fill-opacity $transition-300,
        opacity $transition-300;
    }
  }

  &__input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3.25rem;
    border: 1px solid $grey-btn-hover;
    border-radius: 0.5rem;
    background-color: $grey-btn-hover;
    transition: border-color $transition-300;
    outline: unset;

    font-size: $px-18;
    line-height: $px-24;
    color: white;

    &::placeholder {
      font-size: $px-18;
      line-height: $px-24;
    }

    &:focus-within,
    &:active,
    &:focus-visible {
      & ~ #{$root}__films-menu {
        opacity: 1;
      }
    }

    &:not(:placeholder-shown) {
      & ~ .custom-search__films-menu {
        opacity: 1;
        pointer-events: all;
      }
    }
  }

  &__films-menu {
    position: absolute;
    right: 0;
    top: 110%;

    display: flex;
    flex-direction: column;
    background-color: $grey-btn-hover;
    padding: 0.5rem;
    width: 80%;
    border-radius: 0.5rem;
    z-index: 0;
    opacity: 0;
    transition: opacity $transition-300;

    @media (max-width: 79.37rem) {
      width: 100%;
    }
  }

  &--show {
    opacity: 1;
    pointer-events: all;
    z-index: 15;
  }

  &__no-films,
  &__searching {
    color: $white;
    font-size: $px-14;
    text-align: center;
    padding: 1rem;
    opacity: 0.7;
  }

  &__film {
    width: 100%;
  }
}

.modal-window {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: opacity $transition-300;
}

.modal-window--active {
  opacity: 1;
  pointer-events: all;
}

.search-results-desktop {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-swiper {
  width: 100%;
  height: auto;

  @media (max-width: 37.5rem) {
    display: block;
  }
}

.search-swiper-slide {
  width: 100%;
  padding: 0.5rem;

  width: 13.75rem !important;
}
</style>
