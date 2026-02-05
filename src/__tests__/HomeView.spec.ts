import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '@/pages/HomeView.vue'

const mockLoadAllMovies = vi.hoisted(() => vi.fn())
const mockLoadTop10 = vi.hoisted(() => vi.fn())
const mockMoviesData = vi.hoisted(() => [
  { id: 1, title: 'Film 1', posterUrl: 'Test1.jpg' },
  { id: 2, title: 'Film 2', posterUrl: 'Test2.jpg' },
])

vi.mock('@/stores/moviesStore', () => ({
  useMoviesStore: () => ({
    loadAllMovies: mockLoadAllMovies,
    loadTop10: mockLoadTop10,
    // top10Movies должен быть computed свойством или геттером
    get top10Movies() {
      return mockMoviesData
    },
  }),
}))

// где есть eventListener - мокаем его
const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener
const originalInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth')

beforeEach(() => {
  window.addEventListener = vi.fn()
  window.removeEventListener = vi.fn()
})

afterEach(() => {
  window.addEventListener = originalAddEventListener
  window.removeEventListener = originalRemoveEventListener
  vi.clearAllMocks()
})

describe('HomeView', () => {
  let pinia: ReturnType<typeof createPinia>
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ name: 'home', path: '/home', component: HomeView }],
    })

    vi.clearAllMocks()
    mockLoadAllMovies.mockResolvedValue(undefined)
    mockLoadTop10.mockResolvedValue(undefined)

    // мок window методы
    window.addEventListener = vi.fn()
    window.removeEventListener = vi.fn()

    // устанавливаем дефолтную ширину (десктоп)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    // Восстанавливаем оригинальные методы
    window.addEventListener = originalAddEventListener
    window.removeEventListener = originalRemoveEventListener

    if (originalInnerWidth) {
      Object.defineProperty(window, 'innerWidth', originalInnerWidth)
    }
  })

  it('Mounts HomeView page properly', async () => {
    mockLoadTop10.mockReturnValue(mockMoviesData)

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.exists()).toBe(true)

    // ожидание onMounted
    await new Promise((resolve) => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // вызываем сторы
    expect(mockLoadAllMovies).toHaveBeenCalledTimes(1)
    expect(mockLoadTop10).toHaveBeenCalledTimes(1)

    expect(wrapper.find('.top-catalog').exists()).toBe(true)
  })

  it('Mounts slider film menu if window.innerWidth > 580', async () => {
    // переопределение innerWidth окна  в тестах
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 580,
    })

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, pinia],
      },
    })

    await wrapper.vm.$nextTick

    expect(wrapper.find('.top-catalog__catalog').exists()).toBe(false)
    expect(wrapper.find('.swiper-slide').exists()).toBe(true)
  })

  it('Sets up window resize event listener when mounted', async () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, pinia],
      },
    })

    await wrapper.vm.$nextTick

    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('Removes window resize event listener when onMounted', async () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, pinia],
      },
    })

    await wrapper.vm.$nextTick
    // onUnmount компонента
    wrapper.unmount()

    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
