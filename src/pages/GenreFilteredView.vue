<template>
  <div class="genre-catalog">
    <div class="genre-catalog__heading">
      <button
        class="genre-catalog__back-btn btn btn--transparent"
        type="button"
        @click="goToGenres"
      >
        <svg
          class="genre-catalog__back-icon"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.047 20.0012L26.2967 28.2507L23.9397 30.6077L13.333 20.0012L23.9397 9.39453L26.2967 11.7515L18.047 20.0012Z"
            fill="white"
          />
        </svg>
      </button>
      <h2 class="genre-catalog__title">{{ genreNameRu }}</h2>
    </div>

    <span class="loader" v-if="loading"></span>
    <div v-else-if="filteredMovies.length > 0" class="genre-catalog__catalog">
      <div v-for="movie in filteredMovies" :key="movie.id" class="genre-catalog__movie">
        <Top10Movie :film="movie" class="genre-catalog__movie-card" />
      </div>
    </div>

    <p v-else class="genre-catalog__no-movies">Нет фильмов по выбранному жанру</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Top10Movie from '@/components/Top10Movie.vue'
import { useMoviesStore } from '@/stores/moviesStore'

const route = useRoute()
const router = useRouter()
const moviesStore = useMoviesStore()

const loading = ref(false)

const genreSlug = computed(() => route.query.genre as string)

const filteredMovies = computed(() => {
  if (!genreSlug.value || !moviesStore.allMovies.length) {
    return []
  }

  const result = moviesStore.allMovies.filter((movie) => {
    if (!movie.genres || !Array.isArray(movie.genres)) {
      return false
    }

    return movie.genres.some((genre) => {
      const genreName = typeof genre === 'string' ? genre : genre.name || ''

      return genreName.toLowerCase() === genreSlug.value.toLowerCase()
    })
  })

  return result
})

const goToGenres = () => {
  router.push('/genres')
}

const genreName = computed(() => route.query.genre as string)

const genreNameRu = computed(() => {
  const genreMap: Record<string, string> = {
    action: 'Боевики',
    comedy: 'Комедии',
    drama: 'Драмы',
    horror: 'Ужасы',
    fantasy: 'Фэнтези',
    scifi: 'Научная фантастика',
    romance: 'Мелодрамы',
    thriller: 'Триллеры',
    mystery: 'Детективы',
    animation: 'Анимация',
    adventure: 'Приключения',
    crime: 'Криминал',
    documentary: 'Документальные',
    family: 'Семейные',
    history: 'Исторические',
    music: 'Музыкальные',
    war: 'Военные',
    western: 'Вестерны',
    'tv-movie': 'Телевизионные',
    'stand-up': 'Стендап',
  }

  return genreMap[genreName.value] || genreName.value
})
</script>

<style lang="scss" scoped>
@use '../../assets/scss/global/variables' as *;

.genre-catalog {
  $root: &;
  display: flex;
  flex-direction: column;
  gap: 4rem;

  @media (max-width: 31.25rem) {
    gap: 2.5rem;
  }

  &__heading {
    display: flex;
    align-items: center;
    gap: 0.62rem;
  }

  &__title,
  &__loading {
    font-size: $px-48;
    line-height: $px-56;
    color: $white;

    @media (max-width: 31.25rem) {
      font-size: $px-24;
      line-height: $px-32;
    }
  }

  &__catalog {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;

    @media (max-width: 31.25rem) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__no-movies {
    font-size: $px-48;
    line-height: $px-56;
    color: $white;
  }

  &__movie-card {
    :deep(.top-film__img) {
      width: unset;
      height: unset;
    }
  }
}
</style>
