import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import GenresView from '@/pages/GenresView.vue'

const mockLoadGenres = vi.hoisted(() => vi.fn())
const mockFormateGenres = vi.hoisted(() => vi.fn())

vi.mock('@/stores/moviesStore', () => ({
  useMoviesStore: () => ({
    loadGenres: mockLoadGenres,
  }),
}))

// формат жанров внутри GenresView поддается транскрипции с помощью utils/formateGenres()
vi.mock('@/utils/formateGenres', () => ({
  formateGenres: mockFormateGenres,
}))

// мок genreCard
vi.mock('@/components/GenreCard.vue', () => ({
  default: {
    template: '<div class="genre-card-mock">Genre Card</div>',
    props: ['card'],
  },
}))

describe('GenresView', () => {
  let pinia: ReturnType<typeof createPinia>
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ name: 'home', path: '/home', component: GenresView }],
    })

    vi.clearAllMocks()
    mockLoadGenres.mockResolvedValue([])
    mockFormateGenres.mockReturnValue([])
  })

  it('Mounts GenresView page properly', async () => {
    // моки для конкретного теста:
    const mockGenresData = [
      { id: 1, name: 'Action' },
      { id: 2, name: 'Comedy' },
    ]

    const mockFormattedGenres = [
      { id: 1, name: 'Action', image: 'action.jpg' },
      { id: 2, name: 'Comedy', image: 'comedy.jpg' },
    ]

    mockLoadGenres.mockResolvedValue(mockGenresData)
    mockFormateGenres.mockReturnValue(mockFormattedGenres)

    const wrapper = mount(GenresView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.exists()).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick

    expect(wrapper.find('.genres-menu').exists()).toBe(true)
    expect(wrapper.find('.loader').exists()).toBe(false)
  })

  it('Shows Loader if genres not loaded', async () => {
    const wrapper = mount(GenresView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.exists()).toBe(true)

    await new Promise((res) => setTimeout(res, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.genres-menu').exists()).toBe(false)
    expect(wrapper.find('.loader').exists()).toBe(true)
  })
})
