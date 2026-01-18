<template>
  <article class="small-movie" @click="goToFilm">
    <div class="small-movie__wrapper">
      <img
        class="small-movie__img"
        :alt="film.title"
        :src="film.posterUrl"
        :srcset="film.backdropUrl"
        width="100"
        height="100"
      />
      <div class="small-movie__info">
        <div class="small-movie__description">
          <span class="small-movie__rating" :class="filmRatingColor">
            <svg
              class="small-movie__star"
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
            <span class="small-movie__rating-text">{{ film.tmdbRating }}</span>
          </span>
          <span class="small-movie__release-year">{{ film.releaseYear }}</span>
          <span class="small-movie__genre">{{ film.genres?.[0] }}</span>
          <span class="small-movie__duration">{{ filmDurationToHrs(film.runtime) }}</span>
        </div>
        <h4 class="small-movie__title">{{ film.title }}</h4>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Film } from '@/api/types/filmType'

// const movies = useMovies()
const router = useRouter()
const props = defineProps<{ film: Film }>()
const emit = defineEmits(['inputClear', 'searchInputNotActive'])

const filmDurationToHrs = (minutes: number) => {
  let hours = Math.trunc(minutes / 60)
  let mins = minutes % 60
  return `${hours} ч. ${mins} мин`
}

const filmRatingColor = computed(() => {
  if (!props.film.tmdbRating) return ''

  const rating = props.film.tmdbRating

  if (rating >= 8.6) return 'small-movie__rating--gold'
  if (rating >= 7.5) return 'small-movie__rating--green'
  if (rating >= 6.3) return 'small-movie__rating--grey'
  if (rating >= 4.2) return 'small-movie__rating--red'
})

const goToFilm = () => {
  emit('inputClear')
  emit('searchInputNotActive')
  router.push(`/film/${props.film.id}`)
}
</script>

<style scoped lang="scss">
@use '../../assets/scss/global/variables' as *;

.small-movie {
  padding: 1.12rem 0.5rem 1.12rem 0.5rem;

  &__wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 37.5rem) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__img {
    @media (max-width: 37.5rem) {
      width: 158px;
      height: 202px;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  &__description {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 37.5rem) {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: 0.18rem;
    padding: 0.12rem 0.5rem 0.12rem 0.5rem;
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

    @media (max-width: 37.5rem) {
      font-size: $px-12;
      line-height: $px-16;
    }
  }

  &__title {
    font-size: $px-18;
    line-height: $px-24;
    font-weight: 700;
  }

  &__release-year,
  &__genre,
  &__duration {
    font-size: $px-18;
    line-height: $px-24;
    color: $white-secondary;
  }

  &__duration {
    @media (max-width: 37.5rem) {
      grid-column: span 2;
    }
  }
}
</style>
