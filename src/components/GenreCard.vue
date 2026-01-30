<template>
  <article class="genre-card" @click="handleClick">
    <img class="genre-card__img" :src="imgUrl" :alt="displayName" width="290" height="220" />
    <h4 class="genre-card__name">{{ displayName }}</h4>
  </article>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import type { Genre } from '@/api/types/filmType'

const router = useRouter()

const props = defineProps<{ card: Genre }>()

const displayName = computed(() => {
  return props.card.name_ru || props.card.name
})

const getFullPath = (path: string): string => {
  const base = import.meta.env.BASE_URL || ''

  // Если путь уже абсолютный
  if (path.startsWith('http') || path.startsWith('//')) {
    return path
  }

  // Убираем лишние слеши
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base

  if (cleanBase) {
    return `${cleanBase}/${cleanPath}`
  }
  return `/${cleanPath}`
}

const imgUrl = computed(() => {
  if (!props.card.image) {
    console.warn(`Нет изображения для жанра: ${props.card.name}`)
    return getFullPath('/images/genres/default.jpg') // ИЗМЕНИТЕ
  }

  if (Array.isArray(props.card.image)) {
    const firstImage = props.card.image[0]
    if (typeof firstImage === 'string' && firstImage.trim()) {
      return getFullPath(firstImage) // ИЗМЕНИТЕ
    }
    console.warn(`Массив изображений пуст для жанра: ${props.card.name}`)
    return getFullPath('/images/genres/default.jpg') // ИЗМЕНИТЕ
  }

  if (typeof props.card.image === 'string' && props.card.image.trim()) {
    return getFullPath(props.card.image) // ИЗМЕНИТЕ
  }

  console.warn(`Некорректный формат изображения для жанра: ${props.card.name}`, props.card.image)
  return ''
})

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.error(`Ошибка загрузки: ${img.src}`)

  img.src = getFullPath('/images/genres/default.jpg') // ИЗМЕНИТЕ
  img.onerror = null
}

const handleClick = () => {
  const slug = props.card.slug || props.card.name
  router.push(`/genres/filtered?genre=${encodeURIComponent(slug)}`)
}
</script>

<style lang="scss" scoped>
@use '../../assets/scss/global/variables' as *;

.genre-card {
  min-height: 19rem;
  max-width: 18.12rem;
  border: 1px solid #ffffff40;
  border-radius: 1.5rem;
  box-shadow: 0px 0px 80px 0px #ffffff54;
  overflow: hidden;
  cursor: pointer;
  transition: scale $transition-300;

  &:hover,
  &:focus-visible {
    scale: 1.1;
  }

  &__img {
    height: 73%;
  }

  &__name {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    background-color: $black-deep;
    padding: 1.37rem 1rem 1.87rem 1rem;
    height: 5.25rem;

    font-size: $px-24;
    line-height: $px-32;
    font-weight: 700;
  }
}
</style>
