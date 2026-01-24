import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import DetailedMovie from '../components/DetailedMovie.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory, createMemoryHistory, useRoute } from 'vue-router'
import { useMoviesStore } from '@/stores/moviesStore'
import { useBasketStore } from '@/stores/basketStore'
import type { Film } from '@/api/types/filmType'
import { wrap } from 'module'

// мок данных type Film внутри DetailedMovie
vi.mock('@/stores/moviesStore', () => ({
  useMoviesStore: () => ({
    // Здесь getMovieById мокает результат выполнения getMovieById
    // мокается чтобы в тестах мок данные подставлялись в компонент
    getMovieById: vi.fn().mockResolvedValue({
      id: 1,
      title: 'Test Movie',
      tmdbRating: 8.5,
      releaseYear: 2023,
      genres: ['Action'],
      runtime: 120,
      plot: 'Test plot',
      posterUrl: 'test.jpg',
      trailerUrl: 'https://youtube.com/test',
      language: 'English',
      budget: 1000000,
      revenue: 2000000,
      director: 'Test Director',
      production: 'Test Production',
      awardsSummary: 'Test Awards',
    }),
  }),
}))

// также мок функций сторов:
vi.mock('@/stores/basketStore', () => ({
  useBasketStore: () => ({
    addToBasket: vi.fn(),
    isInBasket: vi.fn().mockReturnValue(false),
    removeFromBasket: vi.fn(),
  }),
}))

vi.mock('@/stores/modalStore', () => ({
  useModalStore: () => ({
    openModalWindow: vi.fn(),
    closeModalWindow: vi.fn(),
  }),
}))

describe('DetailedMovie', () => {
  // возвращаем тип который отдает createPinia и router
  let pinia: ReturnType<typeof createPinia>
  let router: ReturnType<typeof createRouter>

  // сразу компоненту задается active pinia
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/film/:id', name: 'film', component: DetailedMovie, props: true }],
    })
  })

  it('Mounts DetailedMovie Component properly', async () => {
    // переход на маршрут с id:1
    await router.push('/film/1')
    // проверка что роутер готов к работе
    await router.isReady()

    const wrapper = mount(DetailedMovie, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)

    // даем время для async операций внутри компонента
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.find('.detailed-movie').exists()).toBe(true) // mounted if found
  })

  it('Receives and uses props as data', async () => {
    await router.push('/film/1')
    await router.isReady()

    const wrapper = mount(DetailedMovie, {
      global: { plugins: [pinia, router] },
    })

    // ожидаем загрузку данных
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.find('.detailed-movie__title').text()).toContain('Test Movie')
    expect(wrapper.find('.detailed-movie__description').text()).toContain('Test plot')
    expect(wrapper.find('.detailed-movie__rating-text').text()).toContain(8.5)
    expect(wrapper.find('.detailed-movie__release-year').text()).toContain(2023)
    expect(wrapper.find('.detailed-movie__genre').text()).toBe('Action') // mock
    expect(wrapper.find('.detailed-movie__duration').text()).toContain('2 ч. 0 мин') // mock

    // также в movie-description идут данные с пропсов фильма
    const allInfoName = wrapper.findAll('.movie-description__info-name') // нахождение всех элементов по классу
    const allInfoText = wrapper.findAll('.movie-description__info')
    // кол-во элементов из шаблона
    expect(allInfoName).toHaveLength(6)
    expect(allInfoText).toHaveLength(6)

    // мок дата для проверки значений
    const expectedData = [
      { label: 'Язык оригинала', value: 'English' },
      { label: 'Бюджет', value: '1 000 000 руб' },
      { label: 'Выручка', value: '2 000 000 руб' },
      { label: 'Режиссёр', value: 'Test Director' },
      { label: 'Продакшен', value: 'Test Production' },
      { label: 'Награды', value: 'Test Awards' },
    ]

    expectedData.forEach((expected, index) => {
      // внутри массива проверяется массив элементов из шаблона
      expect(allInfoName[index]?.text()).toContain(expected.label)
      expect(allInfoText[index]?.text()).toContain(expected.value)
    })
  })

  it('Trailer menu opens and closes by btns clicks', async () => {
    await router.push('/film/1')
    await router.isReady()

    const wrapper = mount(DetailedMovie, {
      global: { plugins: [pinia, router] },
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    const trailerBtn = wrapper.find('.detailed-movie__trailer-btn')
    const trailerCloseBtn = wrapper.find('.detailed-movie__close-trailer-btn')
    expect(trailerBtn.exists()).toBe(true)
    expect(trailerCloseBtn.exists()).toBe(true)

    expect(trailerBtn.text()).toContain('Трейлер')
    expect(trailerBtn.trigger('click'))
    expect(trailerCloseBtn.trigger('click'))
  })

  it('Fav btn is clickable', async () => {
    await router.push('/film/1')
    await router.isReady()

    const wrapper = mount(DetailedMovie, {
      global: { plugins: [pinia, router] },
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    const favBtn = wrapper.find('.detailed-movie__favorite-btn')
    expect(favBtn.exists()).toBe(true)
    expect(favBtn.trigger('click'))
  })
})
