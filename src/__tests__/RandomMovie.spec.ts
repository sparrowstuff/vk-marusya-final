import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DetailedMovie from '../components/DetailedMovie.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Film } from '@/api/types/filmType'
import RandomMovie from '@/components/RandomMovie.vue'

const mockGetRandomMovie = vi.hoisted(() => vi.fn())
const mockAddToBasket = vi.hoisted(() => vi.fn())
const mockIsInBasket = vi.hoisted(() => vi.fn())
const mockRemoveFromBasket = vi.hoisted(() => vi.fn())
const mockOpenModalWindow = vi.hoisted(() => vi.fn())
const mockIsAuthenticated = vi.hoisted(() => ({
  value: true,
}))

// Мокаем сторы
vi.mock('@/stores/moviesStore', () => ({
  useMoviesStore: () => ({
    getRandomMovie: mockGetRandomMovie,
  }),
}))

vi.mock('@/stores/basketStore', () => ({
  useBasketStore: () => ({
    addToBasket: mockAddToBasket,
    isInBasket: mockIsInBasket,
    removeFromBasket: mockRemoveFromBasket,
  }),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: mockIsAuthenticated.value,
  }),
}))

vi.mock('@/stores/modalStore', () => ({
  useModalStore: () => ({
    openModalWindow: mockOpenModalWindow,
  }),
}))

const mockFilm: Film = {
  id: 1,
  title: 'Test Title',
  tmdbRating: 8.5,
  releaseYear: '2023',
  genres: ['Action'],
  runtime: 120,
  plot: 'Test plot',
  posterUrl: 'test.jpg',
  trailerUrl: 'https://youtube.com/test',
  language: 'English',
  budget: 1000000,
  revenue: '2000000',
  director: 'Test Director',
  production: 'Test Production',
  awardsSummary: 'Test Awards',
}

describe('RandomMovie', () => {
  let pinia: ReturnType<typeof createPinia>
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/film/:id', name: 'film', component: DetailedMovie, props: true }],
    })

    vi.clearAllMocks()

    mockGetRandomMovie.mockResolvedValue(mockFilm)
    mockIsInBasket.mockReturnValue(false)
    mockIsAuthenticated.value = true

    mockAddToBasket.mockImplementation(() => {})
    mockRemoveFromBasket.mockImplementation(() => {})
    mockOpenModalWindow.mockImplementation(() => {})
  })

  it('Mounts RandomMovie component properly', async () => {
    const wrapper = mount(RandomMovie, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 100))
    // vm.$nextTick() ждет обновления DOM после выполнения async операции
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.random-movie').exists()).toBe(true)
  })

  it('Receives and uses props as data', async () => {
    const wrapper = mount(RandomMovie, {
      global: {
        plugins: [pinia, router],
      },
      props: {
        film: mockFilm,
      },
    })

    expect(wrapper.exists()).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.random-movie__title').text()).toContain(mockFilm.title)
    expect(wrapper.find('.random-movie__description').text()).toContain(mockFilm.plot)
    expect(wrapper.find('.random-movie__rating-text').text()).toContain(mockFilm.tmdbRating)
    expect(wrapper.find('.random-movie__release-year').text()).toContain(mockFilm.releaseYear)
    expect(wrapper.find('.random-movie__genre').text()).toContain(mockFilm.genres)
    expect(wrapper.find('.random-movie__duration').text()).toContain('2 ч. 0 мин')
  })

  it('Navigates to the film page when film is clicked', async () => {
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(RandomMovie, {
      props: { film: mockFilm },
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.random-movie__about-btn').trigger('click'))

    expect(pushSpy).toHaveBeenCalledTimes(1)
    expect(pushSpy).toHaveBeenCalledWith(`/film/${mockFilm.id}`)

    pushSpy.mockRestore()
  })

  it('Opens modalMenu if user is Unauthorized and clicks on fav btn', async () => {
    mockIsAuthenticated.value = false

    const wrapper = mount(RandomMovie, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const favoriteBtn = wrapper.find('.random-movie__favorite-btn')
    expect(favoriteBtn.exists()).toBe(true)

    await favoriteBtn.trigger('click')

    // проверка что модалка открылась
    expect(mockOpenModalWindow).toHaveBeenCalledTimes(1)

    // проверка что НЕ добавлялось в корзину
    expect(mockAddToBasket).not.toHaveBeenCalled()
    expect(mockRemoveFromBasket).not.toHaveBeenCalled()
  })

  it('Adds film to the BasketStore if user is Authorized', async () => {
    mockIsAuthenticated.value = true

    const wrapper = mount(RandomMovie, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const favoriteBtn = wrapper.find('.random-movie__favorite-btn')
    expect(favoriteBtn.trigger('click'))

    // модалка не открывается если польз. авторизован
    expect(mockOpenModalWindow).not.toHaveBeenCalled()

    expect(mockAddToBasket).toHaveBeenCalledTimes(1)
  })

  it('Removes film from BasketStore if user is Authorized and film is in Basket', async () => {
    mockIsAuthenticated.value = true

    // обязательно показать тестам что mockReturnValue когда isInBasket = true
    mockIsInBasket.mockReturnValue(true)

    const wrapper = mount(RandomMovie, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const favoriteBtn = wrapper.find('.random-movie__favorite-btn')
    expect(favoriteBtn.classes()).toContain('random-movie__favorite-btn--clicked')
    expect(favoriteBtn.trigger('click'))

    expect(mockOpenModalWindow).not.toHaveBeenCalled()

    // сколько раз вызван и с чем вызывается
    expect(mockRemoveFromBasket).toHaveBeenCalledTimes(1)
    expect(mockRemoveFromBasket).toHaveBeenCalledWith(mockFilm.id)

    // в корзину еще раз не добавлен по клику так как удаляли фильм
    expect(mockAddToBasket).not.toHaveBeenCalled()
  })

  it('Trailer menu opens and closes by trailer btns clicked', async () => {
    const wrapper = mount(RandomMovie, {
      global: {
        plugins: [pinia, router],
      },
      props: { film: mockFilm },
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)

    const trailerBtn = wrapper.find('.random-movie__trailer-btn')
    const trailerCloseBtn = wrapper.find('.random-movie__close-trailer-btn')

    expect(trailerBtn.exists()).toBe(true)
    expect(trailerCloseBtn.exists()).toBe(true)

    expect(trailerBtn.text()).toContain('Трейлер')
    expect(trailerBtn.trigger('click'))
    expect(trailerCloseBtn.trigger('click'))
  })
})
