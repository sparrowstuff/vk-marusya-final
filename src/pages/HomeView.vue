<template>
  <RandomMovie />

  <article class="top-catalog" v-if="topMovies.length !== 0">
    <h2 class="top-catalog__title">Топ 10 фильмов</h2>
    <div class="top-catalog__catalog" v-if="menuForMobile">
      <top-10-movie
        v-for="(movie, index) in topMovies"
        :key="movie.id"
        :film="movie"
        :number="index"
      />
    </div>
    <swiper
      v-else
      :modules="[Autoplay, Navigation]"
      :slides-per-view="1"
      :space-between="40"
      @swiper="onSwiper"
      :navigation="true"
      :loop="true"
      :autoplay="{
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }"
    >
      <SwiperSlide class="swiper-slide" v-for="(movie, index) in topMovies" :key="movie.id">
        <top-10-movie class="swiper-movie" :film="movie" :movies="topMovies" :number="index" />
      </SwiperSlide>
    </swiper>
  </article>
  <span class="loader" v-else></span>
</template>

<script setup lang="ts">
import RandomMovie from '@/components/RandomMovie.vue'
import Top10Movie from '@/components/Top10Movie.vue'
import { useMoviesStore } from '@/stores/moviesStore'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const moviesStore = useMoviesStore()
const swiperInstance = ref(null)
const menuForMobile = ref(true)

const topMovies = computed(() => moviesStore.top10Movies)

const onSwiper = (swiper: any) => {
  swiperInstance.value = swiper
}

const checkWindowWidth = () => {
  menuForMobile.value = window.innerWidth > 580
}

onMounted(async () => {
  checkWindowWidth()
  window.addEventListener('resize', checkWindowWidth)

  await moviesStore.loadAllMovies()
  await moviesStore.loadTop10()
})

onUnmounted(() => {
  checkWindowWidth()
  window.removeEventListener('resize', checkWindowWidth)
})
</script>

<style scoped lang="scss">
@use '../../assets/scss/global/variables' as *;

.top-catalog {
  display: flex;
  flex-direction: column;
  gap: 4rem;

  &__title {
    font-size: $px-40;
    line-height: $px-48;
    font-weight: 700;
    color: $white;
  }

  &__catalog {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2.5rem;
    padding-bottom: 7.5rem;

    @media (max-width: 81.25rem) {
      grid-template-columns: repeat(4, 1fr);
      align-items: center;
    }

    @media (max-width: 72.37rem) {
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    @media (max-width: 48rem) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.swiper {
  width: 19.75rem;
  height: 25rem;
}

.swiper-slide {
  width: 14rem;
  padding: 1.5rem;
}

.swiper-horizontal {
  :deep(.swiper-button-next) {
    right: var(--swiper-navigation-sides-offset, 1px);
    left: auto;
    display: block;
    width: 2.5rem;
    height: 2.5rem;
    background-color: $white;
    border-radius: 50%;

    svg {
      scale: 0.5;
    }
  }

  :deep(.swiper-button-prev) {
    left: var(--swiper-navigation-sides-offset, 0px);
    right: auto;
    display: block;
    width: 2.5rem;
    height: 2.5rem;
    background-color: $white;
    border-radius: 50%;

    svg {
      scale: 0.5;
    }
  }
}
</style>
