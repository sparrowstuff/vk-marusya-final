<template>
  <article class="detailed-movie" v-if="film">
    <div class="detailed-movie__wrapper">
      <div class="detailed-movie__info-block">
        <div class="detailed-movie__details">
          <span class="detailed-movie__rating" :class="filmRatingColor">
            <svg
              class="detailed-movie__star"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.00105 12.1734L3.29875 14.8055L4.34897 9.51997L0.392578 5.86124L5.74394 5.22675L8.00105 0.333374L10.2581 5.22675L15.6095 5.86124L11.6531 9.51997L12.7033 14.8055L8.00105 12.1734Z"
                fill="white"
              />
            </svg>
            <span class="detailed-movie__rating-text">{{ film.tmdbRating }}</span>
          </span>
          <span class="detailed-movie__release-year">{{ film.releaseYear }}</span>
          <span class="detailed-movie__genre">{{ film.genres?.[0] }}</span>
          <span class="detailed-movie__duration">{{ filmDurationToHrs(film.runtime) }}</span>
        </div>
        <h2 class="detailed-movie__title">{{ film.title }}</h2>
        <p class="detailed-movie__description">{{ film.plot }}</p>
        <div class="detailed-movie__actions">
          <button class="detailed-movie__trailer-btn btn" type="button" @click="showTrailerWindow">
            Трейлер</button
          ><button
            class="detailed-movie__favorite-btn btn btn--circle"
            :class="{ 'detailed-movie__favorite-btn--clicked': isInBasket }"
            type="button"
            @click="toggleFavorite"
          >
            <svg
              class="detailed-movie__like-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              v-if="!isInBasket"
            >
              <path
                d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C9.5 20 2 16 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3ZM12.9339 18.6038C13.8155 18.0485 14.61 17.4955 15.3549 16.9029C18.3337 14.533 20 11.9435 20 9C20 6.64076 18.463 5 16.5 5C15.4241 5 14.2593 5.56911 13.4142 6.41421L12 7.82843L10.5858 6.41421C9.74068 5.56911 8.5759 5 7.5 5C5.55906 5 4 6.6565 4 9C4 11.9435 5.66627 14.533 8.64514 16.9029C9.39 17.4955 10.1845 18.0485 11.0661 18.6038C11.3646 18.7919 11.6611 18.9729 12 19.1752C12.3389 18.9729 12.6354 18.7919 12.9339 18.6038Z"
                fill="currentColor"
              />
            </svg>
            <svg
              class="detailed-movie__like-icon-filled"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              v-else
            >
              <path
                d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C9.5 20 2 16 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3Z"
                fill="#B4A9FF"
              />
            </svg>
          </button>
        </div>
      </div>
      <img
        class="detailed-movie__img"
        :alt="film.title"
        :src="film.posterUrl"
        width="680"
        height="300"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        title="Трейлер фильма"
      />
    </div>
    <div
      class="detailed-movie__watch-trailer-window"
      :class="{ 'detailed-movie__watch-trailer-window--show': showTrailer }"
    >
      <button
        class="detailed-movie__close-trailer-btn btn btn--close"
        type="button"
        @click="closeTrailerWindow"
      >
        <svg
          class="detailed-movie__close-btn-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
            fill="black"
          />
        </svg>
      </button>
      <iframe
        :src="youtubeEmbedUrl"
        :alt="film.title"
        class="detailed-movie__iframe"
        controls
        width="960"
        height="540"
      ></iframe>
    </div>
  </article>
  <span class="loader" v-else></span>

  <article class="movie-description">
    <h3 class="movie-description__title">О фильме</h3>
    <div class="movie-description__description-block">
      <div class="movie-description__info-block">
        <span class="movie-description__info-name">Язык оригинала</span>
        <span class="movie-description__info">{{ film?.language || 'Неизвестно' }}</span>
      </div>
      <div class="movie-description__info-block">
        <span class="movie-description__info-name">Бюджет</span>
        <span class="movie-description__info">{{ formattedBudget || 'Неизвестно' }}</span>
      </div>
      <div class="movie-description__info-block">
        <span class="movie-description__info-name">Выручка</span>
        <span class="movie-description__info">{{ formattedRevenue || 'Неизвестно' }}</span>
      </div>
      <div class="movie-description__info-block">
        <span class="movie-description__info-name">Режиссёр</span>
        <span class="movie-description__info">{{ film?.director || 'Неизвестно' }}</span>
      </div>
      <div class="movie-description__info-block">
        <span class="movie-description__info-name">Продакшен</span>
        <span class="movie-description__info">{{ film?.production || 'Неизвестно' }}</span>
      </div>
      <div class="movie-description__info-block">
        <span class="movie-description__info-name">Награды</span>
        <span class="movie-description__info">{{ film?.awardsSummary || 'Неизвестно' }}</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { onMounted, watchEffect, computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Film } from '@/api/types/filmType'
import { useBasketStore } from '@/stores/basketStore'
import { useModalStore } from '@/stores/modalStore'
import { useMoviesStore } from '@/stores/moviesStore'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const movies = useMoviesStore()
const authStore = useAuthStore()
const basket = useBasketStore()
const emit = defineEmits(['open-auth-modal'])
const modalStore = useModalStore()

const loading = ref<Boolean>(true)
const showTrailer = ref<Boolean>(false)
const film = ref<Film | null>(null)

defineOptions({
  inheritAttrs: false,
})

const loadFilm = async () => {
  const filmId = route.params.id as string

  if (!filmId) {
    console.error('Film ID is missing')
    loading.value = false
    return
  }

  loading.value = true
  film.value = null // Сбросить перед загрузкой

  try {
    const idNumber = parseInt(filmId)
    if (isNaN(idNumber)) {
      throw new Error(`Invalid film ID: ${filmId}`)
    }

    const data = await movies.getMovieById(idNumber)
    film.value = data
  } catch (err: any) {
    console.error('Ошибка загрузки фильма:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadFilm()
})

watch(
  () => route.params.id,
  async () => {
    await loadFilm()
  },
)

const filmDurationToHrs = (minutes: number) => {
  let hours = Math.trunc(minutes / 60)
  let mins = minutes % 60
  return `${hours} ч. ${mins} мин`
}

const filmRatingColor = computed(() => {
  if (!film.value.tmdbRating) return ''

  const rating = film.value.tmdbRating

  if (rating >= 8.6) return 'detailed-movie__rating--gold'
  if (rating >= 7.5) return 'detailed-movie__rating--green'
  if (rating >= 6.3) return 'detailed-movie__rating--grey'
  if (rating >= 4.2) return 'detailed-movie__rating--red'
})

const isInBasket = computed(() => {
  if (!film.value.id || !film.value) return false

  return basket.isInBasket(film.value.id)
})

const showTrailerWindow = () => {
  showTrailer.value = !showTrailer.value
}

const toggleFavorite = () => {
  if (!film.value) return

  if (!authStore.isAuthenticated) {
    modalStore.openModalWindow()
  } else {
    if (isInBasket.value) {
      basket.removeFromBasket(film.value.id)
    } else {
      basket.addToBasket(film.value)
    }
  }
}

const youtubeEmbedUrl = computed(() => {
  if (!film.value?.trailerUrl) return ''

  const url = film.value.trailerUrl
  let videoId = ''

  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0]
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0]
  } else if (film.value.trailerYouTubeId) {
    videoId = film.value.trailerYouTubeId
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`
  }

  return ''
})

const closeTrailerWindow = () => {
  showTrailer.value = !showTrailer.value
}

const formatNumber = (num: number | undefined): string => {
  if (!num) return 'Неизвестно'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' руб'
}

const formattedBudget = computed(() => formatNumber(film.value?.budget))
const formattedRevenue = computed(() => formatNumber(film.value?.revenue))
</script>

<style scoped lang="scss">
@use '../../assets/scss/global/variables' as *;

@keyframes MovieSlideIn {
  0% {
    transform: translateX(-3rem);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes MovieDescriptionShowUp {
  0% {
    opacity: 0;
    transform: translateY(-0.62rem);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.detailed-movie {
  margin-top: 1.5rem;
  $root: &;
  position: relative;
  margin-bottom: 2.5rem;

  opacity: 0;

  animation: MovieSlideIn 0.5s ease-in forwards 0.1s;

  &__wrapper {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    gap: 1rem;

    @media (max-width: 64rem) {
      display: flex;
      flex-direction: column-reverse;
      gap: 1.5rem;
      align-items: flex-start;
    }
  }

  &__info-block {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;

    @media (max-width: 40.62rem) {
      gap: 0.75rem;
    }
  }

  &__details {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0.75rem 0.25rem 0.75rem;
    border: unset;
    border-radius: 1rem;

    &--gold {
      background-color: $gold-rating;
    }

    &--green {
      background-color: $green-rating;
    }

    &--grey {
      background-color: $grey-rating;
    }

    &--red {
      background-color: $red-rating;
    }
  }

  &__rating-text {
    font-size: $px-18;
    line-height: $px-24;
    font-weight: 700;
    color: $white;
  }

  &__release-year,
  &__genre,
  &__duration {
    font-size: $px-18;
    line-height: $px-24;
    color: $white-secondary;

    @media (max-width: 40.62rem) {
      font-size: $px-14;
      line-height: $px-20;
    }
  }

  &__title {
    font-size: $px-48;
    line-height: $px-56;
    color: $white;

    @media (max-width: 40.62rem) {
      font-size: $px-24;
      line-height: $px-32;
    }
  }

  &__description {
    font-size: $px-24;
    line-height: $px-32;
    color: $white-secondary;
    max-width: 37.5rem;

    @media (max-width: 40.62rem) {
      font-size: $px-18;
      line-height: $px-24;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 2.75rem;

    @media (max-width: 40.62rem) {
      margin-top: 1.25rem;
    }

    @media (max-width: 37.5rem) {
      width: 100%;
      margin-bottom: 1.5rem;
    }
  }

  &__trailer-btn {
    @media (max-width: 37.5rem) {
      width: 100%;
    }
  }

  &__trailer-btn,
  &__about-btn,
  &__favorite-btn,
  &__random-btn {
    border: 1px solid #00000066;
    color: $white;
  }

  &__iframe {
    @media (max-width: 51.87rem) {
      width: 500px;
      height: 300px;
    }
  }

  &__watch-trailer-window {
    position: fixed;
    display: flex;
    flex-direction: row-reverse;
    align-items: flex-start;
    gap: 1.5rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    max-width: 69rem;
    max-height: 33.75rem;
    height: 100%;
    pointer-events: none;
    z-index: 200;

    transition: opacity $transition-300;

    @media (max-width: 64rem) {
      height: unset;
      max-height: unset;
      max-width: 50rem;
    }

    @media (max-width: 39.37rem) {
      max-width: 23.43rem;
      gap: 0.4rem;
    }

    @media (max-width: 26.87rem) {
      max-width: 90vw;
    }
  }

  &__watch-trailer-window--show {
    opacity: 1;
    pointer-events: all;
  }

  &:has(.detailed-movie__watch-trailer-window--show) {
    &::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 100;
      pointer-events: none;
    }

    > *:not(.detailed-movie__watch-trailer-window) {
      pointer-events: none;
    }
  }
}

.movie-description {
  display: flex;
  flex-direction: column;
  gap: 4rem;

  @media (max-width: 40.62rem) {
    gap: 2.5rem;
  }

  &__title {
    font-size: $px-40;
    line-height: $px-48;
    font-weight: 700;

    @media (max-width: 40.62rem) {
      font-size: $px-24;
      line-height: $px-32;
    }
  }

  &__description-block {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }

  &__info-block {
    display: table-row;
    opacity: 0;

    width: 100%;
    position: relative;

    &:nth-child(1) {
      animation: MovieDescriptionShowUp 1s ease-in forwards 0.3s;
    }
    &:nth-child(2) {
      animation: MovieDescriptionShowUp 1s ease-in forwards 0.5s;
    }
    &:nth-child(3) {
      animation: MovieDescriptionShowUp 1s ease-in forwards 0.7s;
    }
    &:nth-child(4) {
      animation: MovieDescriptionShowUp 1s ease-in forwards 0.9s;
    }
    &:nth-child(5) {
      animation: MovieDescriptionShowUp 1s ease-in forwards 1.1s;
    }
    &:nth-child(6) {
      animation: MovieDescriptionShowUp 1s ease-in forwards 1.3s;
    }

    @media (max-width: 40.62rem) {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
  }

  &__info-name,
  &__info {
    font-size: $px-18;
    line-height: $px-24;
    font-weight: 400;
    display: table-cell;
  }

  &__info-name {
    white-space: nowrap;
    overflow: hidden;
    max-width: 20rem;

    &::after {
      content: '.............................................................';
      opacity: 0.2;
      padding-left: 0.5rem;

      @media (max-width: 40.62rem) {
        display: none;
      }
    }

    @media (max-width: 40.62rem) {
      font-size: $px-14;
      line-height: $px-20;
      opacity: 0.7;
    }
  }
}
</style>
