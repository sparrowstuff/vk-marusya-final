import type { Film } from '@/api/types/filmType'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/utils/api'

export const useBasketStore = defineStore('basket', () => {
  const productsInBasket = ref<Film[]>([])
  const isLoading = ref(false)

  const fetchFavorites = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/favorites')
      // axios сам парсит JSON, response сразу данные

      if (Array.isArray(response)) {
        const firstItem = response[0]

        if (firstItem && typeof firstItem === 'object' && 'id' in firstItem) {
          productsInBasket.value = response as Film[]
        }
      } else {
        productsInBasket.value = []
      }
    } catch (err) {
      console.error('Failed to fetch', err)
    } finally {
      isLoading.value = false
    }
  }

  const addToBasket = async (movie: Film) => {
    try {
      const params = new URLSearchParams()
      params.append('id', movie.id.toString())

      await api.post('/favorites', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      if (!productsInBasket.value.some((el) => el.id === movie.id)) {
        productsInBasket.value.push(movie)
      }

      await fetchFavorites()
    } catch (err) {
      console.error('Ошибка добавления в избранное', err)
    }
  }

  const removeFromBasket = async (movieId: number) => {
    try {
      await api.delete(`/favorites/${movieId}`)

      productsInBasket.value = productsInBasket.value.filter((el) => el.id !== movieId)
    } catch (err) {
      console.error('Ошибка удаления из избранного', err)
    }
  }

  const isInBasket = (movieId: number) => {
    return productsInBasket.value.some((el) => el.id === movieId)
  }

  return {
    productsInBasket,
    isLoading,
    fetchFavorites,
    addToBasket,
    removeFromBasket,
    isInBasket,
  }
})
