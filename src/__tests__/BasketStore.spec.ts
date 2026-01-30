import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import DetailedMovie from '../components/DetailedMovie.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory, createMemoryHistory, useRoute } from 'vue-router'
import { useBasketStore } from '@/stores/basketStore'
import type { Film } from '@/api/types/filmType'
import { api } from '@/utils/api'
import { error } from 'console'

// мок функций api(axios)
vi.mock('@/utils/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('BasketStore', () => {
  let store: ReturnType<typeof useBasketStore>

  const mockFilm: Film = {
    id: 1,
    title: 'Test Title',
    genres: ['Action'],
    runtime: 120,
    posterUrl: 'test.jpg',
    backdropUrl: 'test-backdrop-url.jpg',
  } as Film

  const mockFilm2: Film = {
    id: 2,
    title: 'Another Film',
    genres: ['Drama'],
    runtime: 90,
    posterUrl: 'test2.jpg',
    backdropUrl: 'backdrop2.jpg',
  } as Film

  const mockFavoritesResponse = [mockFilm, mockFilm2]

  beforeEach(() => {
    // сброс всех моков и создание чистого стора
    vi.clearAllMocks()
    const pinia = createPinia()
    setActivePinia(pinia)
    store = useBasketStore()
  })

  describe('Fetch Favorites', () => {
    it('Loading favorite movies from server', async () => {
      // мок получения мокнутых фильмов внутри axios
      vi.mocked(api.get).mockResolvedValueOnce(mockFavoritesResponse)

      await store.fetchFavorites()

      // ожидаем что api.get запрос будет включать строку /favorites
      expect(api.get).toHaveBeenCalledWith('/favorites')

      // ожидаем что переменные внутри productsInBasket будут эквивалентны mockFavoritesResponse
      expect(store.productsInBasket).toEqual(mockFavoritesResponse)

      expect(store.isLoading).toBe(false)
    })

    it('Works if array from API is null', async () => {
      // мок пустого массива
      vi.mocked(api.get).mockResolvedValueOnce([])

      await store.fetchFavorites()

      // ожидаем что массив favorites будет пуст
      expect(store.productsInBasket).toEqual([])
      expect(store.isLoading).toBe(false)
    })

    it('Resolves incorrect API request(not an Array)', async () => {
      // мокаем объект data как массив - заведомо ложный кейс
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockFavoritesResponse })

      await store.fetchFavorites()

      expect(store.productsInBasket).toEqual([])
    })

    it('Resolves films Array with incorrect objects', async () => {
      const invalidResponse = [{ name: 'Not a film' }, null, undefined]
      vi.mocked(api.get).mockResolvedValueOnce(invalidResponse)

      await store.fetchFavorites()

      // Первый элемент без id должен быть отфильтрован
      expect(store.productsInBasket).toEqual([])
    })

    it('Throws error in case of loading', async () => {
      // следим за консольными ошибками
      const consoleErrorSpy = vi.spyOn(console, 'error')

      // мокаем ошибку
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'))

      await store.fetchFavorites()

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch', expect.any(Error))
      expect(store.productsInBasket).toEqual([])
      expect(store.isLoading).toBe(false)
    })
  })

  describe('addToBasket', () => {
    it('Adds film to basket and rerenders the film list', async () => {
      // мок обоих вызовов API = Объект фильма и mockFilm
      vi.mocked(api.post).mockResolvedValueOnce({})
      vi.mocked(api.get).mockResolvedValueOnce([mockFilm])

      await store.addToBasket(mockFilm)

      // проверка вызова POST с правильными параметрами:
      expect(api.post).toHaveBeenCalledWith('/favorites', expect.any(URLSearchParams), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      // проверка параметров запроса
      const searchParams = (api.post as any).mock.calls[0][1] as URLSearchParams
      expect(searchParams.get('id')).toBe('1')

      // проверка что fetchFavorites был вызван
      expect(api.get).toHaveBeenCalledWith('/favorites')

      // проверка что в productsInBasket есть [] с mockFilm внутри
      expect(store.productsInBasket).toEqual([mockFilm])
    })

    it(`Doesn't push the film again in the store if API function is called `, async () => {
      vi.mocked(api.post).mockResolvedValue({})
      vi.mocked(api.get).mockResolvedValue([mockFilm])

      // добавляем один раз
      await store.addToBasket(mockFilm)
      expect(store.productsInBasket).toEqual([mockFilm])

      // добавляем второй раз (дубликат)
      await store.addToBasket(mockFilm)

      // в локальном массиве все еще один элемент
      expect(store.productsInBasket).toHaveLength(1)
      expect(store.productsInBasket[0].id).toBe(mockFilm.id)
    })

    it('Logs error if error exists', async () => {
      // шпионим за ошибками в консоли
      const consoleSpy = vi.spyOn(console, 'error')

      // мок ошибки
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Add failed'))

      await store.addToBasket(mockFilm)

      expect(consoleSpy).toHaveBeenCalledWith('Ошибка добавления в избранное', expect.any(Error))

      // fetchFavorites не вызывался при ошибке
      expect(api.get).not.toHaveBeenCalled()
    })
  })

  describe('removeFromBasket', () => {
    beforeEach(async () => {
      // предварительно добавляем фильмы в корзину
      vi.mocked(api.post).mockResolvedValue({})
      vi.mocked(api.get).mockResolvedValue([mockFilm, mockFilm2])

      await store.addToBasket(mockFilm)
      await store.addToBasket(mockFilm2)

      // Очищаем моки для чистых тестов
      vi.clearAllMocks()
    })

    it('Removes film from favorites', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({})

      await store.removeFromBasket(mockFilm.id)

      expect(api.delete).toHaveBeenCalledWith('/favorites/1')
      expect(store.productsInBasket).toEqual([mockFilm2])
      expect(store.productsInBasket).toHaveLength(1)
    })

    it('Resolves adding non existing film', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({})

      await store.removeFromBasket(999) // несуществующий ID

      expect(api.delete).toHaveBeenCalledWith('/favorites/999')
      // массив не должен измениться
      expect(store.productsInBasket).toHaveLength(2)
    })

    it('logs error when adding', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('Delete failed'))

      await store.removeFromBasket(mockFilm.id)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Ошибка удаления из избранного',
        expect.any(Error),
      )
      // При ошибке удаления локальное состояние не должно меняться
      expect(store.productsInBasket).toHaveLength(2)
    })
  })

  describe('isInBasket', () => {
    beforeEach(async () => {
      // Очищаем store перед каждым тестом
      store.productsInBasket = []

      // Добавляем тестовые фильмы
      vi.mocked(api.post).mockResolvedValue({})
      vi.mocked(api.get).mockResolvedValue([mockFilm])
      await store.addToBasket(mockFilm)
    })

    it('returns true if film is in favorites', () => {
      expect(store.isInBasket(mockFilm.id)).toBe(true)
    })

    it('returns false if film is not in favorites', () => {
      expect(store.isInBasket(999)).toBe(false)
    })

    it('works well with empty basket', () => {
      // ВАРИАНТ 1: Создаем новый pinia для изолированного store
      const newPinia = createPinia()
      setActivePinia(newPinia)
      const isolatedStore = useBasketStore()
      expect(isolatedStore.isInBasket(1)).toBe(false)
    })

    it('работает после очистки корзины', () => {
      // ВАРИАНТ 2: Очищаем текущий store
      store.productsInBasket = []
      expect(store.isInBasket(mockFilm.id)).toBe(false)
    })
  })

  describe('isLoading state', () => {
    it('sets true when starts loading', async () => {
      // запрос медленный чтобы проверить промежуточное состояние
      vi.mocked(api.get).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100)),
      )

      const fetchPromise = store.fetchFavorites()

      // проверка что isLoading стало true сразу после вызова
      expect(store.isLoading).toBe(true)

      await fetchPromise
      expect(store.isLoading).toBe(false)
    })

    it('sets in false even when catches error', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Error'))

      await store.fetchFavorites()

      expect(store.isLoading).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('resolves URLSearchParams with unique ID', async () => {
      vi.mocked(api.post).mockResolvedValue({})
      vi.mocked(api.get).mockResolvedValue([])

      const filmWithStringId = { ...mockFilm, id: '123' as any }
      await store.addToBasket(filmWithStringId)

      const searchParams = (api.post as any).mock.calls[0][1] as URLSearchParams
      expect(searchParams.get('id')).toBe('123')
    })

    it('обрабатывает фильмы без обязательных полей', async () => {
      const minimalFilm = { id: 99 } as Film
      vi.mocked(api.post).mockResolvedValue({})
      vi.mocked(api.get).mockResolvedValue([minimalFilm])

      await store.addToBasket(minimalFilm)

      expect(store.productsInBasket[0].id).toBe(99)
    })
  })
})
