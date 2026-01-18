<template>
  <div class="genres-menu">
    <genre-card v-for="(genre, index) in genres" :key="index" :card="genre" />
  </div>
</template>

<script setup lang="ts">
import GenreCard from '@/components/GenreCard.vue'
import { useMoviesStore } from '@/stores/moviesStore'
import { formateGenres } from '@/utils/formateGenres'
import { onMounted, ref } from 'vue'

const moviesStore = useMoviesStore()
const genres = ref([])

onMounted(async () => {
  try {
    const data = await moviesStore.loadGenres()
    genres.value = formateGenres(data)
  } catch (err) {
    console.error('Failed to fetch genres', err)
  }
})
</script>

<style scoped lang="scss">
@use '../../assets/scss/global/variables' as *;

.genres-menu {
  margin-top: 2.5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: 2.5rem;
  row-gap: 4rem;

  @media (max-width: 75rem) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 48rem) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 31.25rem) {
    grid-template-columns: 1fr;
    justify-items: center;
    column-gap: unset;
    row-gap: 1.5rem;
  }
}
</style>
