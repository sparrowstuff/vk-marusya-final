<template>
  <div class="top-film" @click="goToFilm">
    <span v-if="number || number >= 0" class="top-film__counter">{{ number + 1 }}</span>
    <img
      v-if="film.posterUrl"
      class="top-film__img"
      :src="film.posterUrl"
      width="224"
      height="336"
      :alt="film.title"
    />
    <img
      v-else
      :srcset="film.backdropUrl"
      :alt="film.title"
      class="top-film__img"
      width="224"
      height="336"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

type TopFilm = {
  id: number
  posterUrl: string
}

const props = defineProps<{
  film: TopFilm
  movies?: TopFilm[]
  number?: number
}>()

const router = useRouter()

const goToFilm = () => {
  router.push(`/film/${props.film.id}`)
}
</script>

<style scoped lang="scss">
@use '../../assets/scss/global/variables' as *;

.top-film {
  position: relative;
  cursor: pointer;
  transition: scale $transition-300;

  &:hover,
  &:focus-visible {
    scale: 1.05;

    @media (max-width: 31.25rem) {
      scale: 1.03;
    }
  }

  @media (max-width: 48rem) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__img {
    border-radius: 1rem;
    height: 100%;
    width: 100%;

    @media (max-width: 31.25rem) {
      width: 22.18rem;
      height: 31.25rem;
    }
  }

  &__counter {
    padding: 0.5rem 1.5rem;
    background-color: $white;
    border-radius: 3.12rem;

    font-size: $px-24;
    line-height: $px-32;
    font-weight: 700;
    color: $pink-film-count;

    position: absolute;
    z-index: 5;
    top: -4%;
    left: -8%;

    @media (max-width: 48rem) {
      left: 12%;
    }

    @media (max-width: 40.62rem) {
      left: 7%;
    }

    @media (max-width: 36.25rem) {
      left: -4%;
    }
  }
}

.swiper-movie {
  .top-film__img {
    @media (max-width: 31.25rem) {
      width: 14rem;
      height: 100%;
    }
  }
}
</style>
