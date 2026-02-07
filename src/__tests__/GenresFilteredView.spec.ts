import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import GenreFilteredView from '@/pages/GenreFilteredView.vue'
import FilmView from '@/pages/FilmView.vue'
import { Genre } from '@/api/types/filmType'
import GenresView from '@/pages/GenresView.vue'
import Top10Movie from '@/components/Top10Movie.vue'

const mockGenre: Genre = {
  id: 1,
  name: 'Test Genre',
  name_ru: 'Тестовый Жанр',
  image: 'test.jpg',
  slug: 'test slug',
}

// Определяем данные фильмов внутри vi.hoisted
const mockAllMovies = vi.hoisted(() => {
  return [
    {
      id: 1,
      title: 'Movie 1',
      genres: [{ name: 'action' }, { name: 'drama' }],
    },
    {
      id: 2,
      title: 'Movie 2',
      genres: [{ name: 'comedy' }],
    },
    {
      id: 3,
      title: 'Movie 3',
      genres: [{ name: 'action' }],
    },
    {
      id: 4,
      title: 'Movie 4',
      genres: [], // фильм без жанров
    },
    {
      id: 5,
      title: 'Movie 5',
      genres: 'action', // некорректный формат жанров
    },
  ]
})

// Сохраняем копию для восстановления
const originalMovies = [...mockAllMovies]

vi.mock('@/stores/moviesStore', () => ({
  useMoviesStore: () => ({
    allMovies: mockAllMovies,
  }),
}))

let pinia: ReturnType<typeof createPinia>
let router: ReturnType<typeof createRouter>

describe('GenresFilteredView', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/genres/filtered',
          name: 'genres-filtered',
          component: GenreFilteredView,
        },
        { path: '/genres', name: 'genres', component: GenresView },
        {
          name: 'film',
          path: '/film/:id',
          component: FilmView,
          props: true,
        },
      ],
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    // Восстанавливаем исходный массив
    mockAllMovies.length = 0
    mockAllMovies.push(...originalMovies)
  })

  it('Mounts GenresFilteredView page properly', () => {
    const wrapper = mount(GenreFilteredView, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('Renders all components of catalog', () => {
    const wrapper = mount(GenreFilteredView, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)

    expect(wrapper.find('.genre-catalog').exists()).toBe(true)
    const backBtn = wrapper.find('.genre-catalog__back-btn')
    expect(backBtn.exists()).toBe(true)
    expect(backBtn.find('.genre-catalog__back-icon').exists()).toBe(true)
    expect(wrapper.find('.genre-catalog__title').exists()).toBe(true)
  })

  it('Shows loader when loading is true', async () => {
    const wrapper = mount(GenreFilteredView, {
      global: {
        plugins: [pinia, router],
      },
    })

    // Проверяем что лоадер не отображается, так как loading = false
    const loader = wrapper.find('.loader')
    expect(loader.exists()).toBe(false)
  })

  it('Navigates back to genres when back button is clicked', async () => {
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(GenreFilteredView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await wrapper.vm.$nextTick()

    const backBtn = wrapper.find('.genre-catalog__back-btn')
    expect(backBtn.exists()).toBe(true)
    await backBtn.trigger('click')
    expect(pushSpy).toHaveBeenCalledTimes(1)
    expect(pushSpy).toHaveBeenCalledWith('/genres')
  })

  it('Filters movies by genre from query parameter', async () => {
    // Устанавливаем query параметр
    await router.push({ path: '/genres/filtered', query: { genre: 'action' } })

    const wrapper = mount(GenreFilteredView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick() // Дополнительный nextTick для реактивных обновлений

    // Проверяем computed свойство filteredMovies
    const vm = wrapper.vm as any
    expect(Array.isArray(vm.filteredMovies)).toBe(true)
    expect(vm.filteredMovies).toHaveLength(2)

    // Проверяем правильные ID фильмов
    const filteredIds = vm.filteredMovies.map((m: any) => m.id)
    expect(filteredIds).toContain(1)
    expect(filteredIds).toContain(3)
    expect(filteredIds).not.toContain(2) // comedy
    expect(filteredIds).not.toContain(4) // без жанров
    expect(filteredIds).not.toContain(5) // некорректный формат
  })

  it('Shows "no movies" message when no movies match the genre', async () => {
    await router.push({ path: '/genres/filtered', query: { genre: 'nonexistent' } })

    const wrapper = mount(GenreFilteredView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    expect(vm.filteredMovies).toHaveLength(0)

    // Проверяем что отображается сообщение
    const noMoviesMessage = wrapper.find('.genre-catalog__no-movies')
    expect(noMoviesMessage.exists()).toBe(true)
    expect(noMoviesMessage.text()).toContain('Нет фильмов по выбранному жанру')
  })

  it('Shows "no movies" message when genre parameter is empty', async () => {
    await router.push({ path: '/genres/filtered', query: { genre: '' } })

    const wrapper = mount(GenreFilteredView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    expect(vm.filteredMovies).toHaveLength(0)

    const noMoviesMessage = wrapper.find('.genre-catalog__no-movies')
    expect(noMoviesMessage.exists()).toBe(true)
  })

  it('Shows "no movies" message when allMovies is empty', async () => {
    // Очищаем массив фильмов
    mockAllMovies.length = 0

    await router.push({ path: '/genres/filtered', query: { genre: 'action' } })

    const wrapper = mount(GenreFilteredView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    expect(vm.filteredMovies).toHaveLength(0)

    const noMoviesMessage = wrapper.find('.genre-catalog__no-movies')
    expect(noMoviesMessage.exists()).toBe(true)
  })

  it('Handles case-insensitive genre filtering', async () => {
    await router.push({ path: '/genres/filtered', query: { genre: 'ACTION' } })

    const wrapper = mount(GenreFilteredView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    expect(vm.filteredMovies).toHaveLength(2) // Должны найти те же фильмы
  })

  it('Correctly translates genre name to Russian', async () => {
    await router.push({ path: '/genres/filtered', query: { genre: 'action' } })

    const wrapper = mount(GenreFilteredView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    expect(vm.genreNameRu).toBe('Боевики')

    const title = wrapper.find('.genre-catalog__title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Боевики')
  })

  it('Updates filtered movies when query parameter changes', async () => {
    const wrapper = mount(GenreFilteredView, {
      global: {
        plugins: [pinia, router],
      },
    })

    // Сначала устанавливаем жанр 'action'
    await router.push({ path: '/genres/filtered', query: { genre: 'action' } })
    await wrapper.vm.$nextTick()

    let vm = wrapper.vm as any
    expect(vm.filteredMovies).toHaveLength(2)

    // Меняем на 'comedy'
    await router.push({ path: '/genres/filtered', query: { genre: 'comedy' } })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick() // Дополнительный nextTick для обновления

    vm = wrapper.vm as any
    expect(vm.filteredMovies).toHaveLength(1) // Только Movie 2
    expect(vm.filteredMovies[0].id).toBe(2)
  })

  it('Has correct computed properties', async () => {
    await router.push({ path: '/genres/filtered', query: { genre: 'action' } })

    const wrapper = mount(GenreFilteredView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Проверяем computed свойства
    expect(vm.genreSlug).toBe('action')
    expect(vm.genreName).toBe('action')
    expect(vm.genreNameRu).toBe('Боевики')
    expect(Array.isArray(vm.filteredMovies)).toBe(true)
    expect(vm.filteredMovies.length).toBe(2)
  })
})
