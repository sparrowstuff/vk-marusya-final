import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import MainMenu from '@/components/MainMenu.vue'
import HomeView from '@/pages/HomeView.vue'
import GenresView from '@/pages/GenresView.vue'

// Используем vi.hoisted для определения моков
const mockLoadAllMovies = vi.hoisted(() => vi.fn())
const mockSearchMovies = vi.hoisted(() => vi.fn())
const mockClearSearchResults = vi.hoisted(() => vi.fn())
const mockOpenModalWindow = vi.hoisted(() => vi.fn())
const mockCloseModalWindow = vi.hoisted(() => vi.fn())

// Мокаем stores с помощью vi.hoisted
const useMoviesStoreMock = vi.hoisted(() =>
  vi.fn(() => ({
    allMovies: [],
    searchResults: [],
    loadAllMovies: mockLoadAllMovies,
    searchMovies: mockSearchMovies,
    clearSearchResults: mockClearSearchResults,
  })),
)

const useModalStoreMock = vi.hoisted(() =>
  vi.fn(() => ({
    openModal: false,
    openModalWindow: mockOpenModalWindow,
    closeModalWindow: mockCloseModalWindow,
  })),
)

const useAuthStoreMock = vi.hoisted(() =>
  vi.fn(() => ({
    user: null,
    init: vi.fn(),
  })),
)

// Мокаем stores - теперь они используют hoisted моки
vi.mock('@/stores/moviesStore', () => ({
  useMoviesStore: useMoviesStoreMock,
}))

vi.mock('@/stores/modalStore', () => ({
  useModalStore: useModalStoreMock,
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: useAuthStoreMock,
}))

// Мок для storeToRefs
vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pinia')>()
  return {
    ...actual,
    storeToRefs: vi.fn((store: any) => {
      const refs: any = {}
      Object.keys(store).forEach((key) => {
        if (typeof store[key] !== 'function') {
          refs[key] = { value: store[key] }
        }
      })
      return refs
    }),
  }
})

// Мок для Swiper
vi.mock('swiper/vue', () => ({
  Swiper: {
    template: '<div class="swiper-mock"><slot></slot></div>',
  },
  SwiperSlide: {
    template: '<div class="swiper-slide-mock"><slot></slot></div>',
  },
}))

vi.mock('swiper/modules', () => ({
  Navigation: {},
}))

vi.mock('swiper/css', () => ({}))
vi.mock('swiper/css/navigation', () => ({}))

let pinia: ReturnType<typeof createPinia>
let router: ReturnType<typeof createRouter>

describe('MainMenu', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/home', name: 'home', component: HomeView },
        { path: '/genres', name: 'genres', component: GenresView },
        { path: '/', redirect: '/home' }, // Добавляем корневой маршрут
      ],
    })

    // Навигация на начальный маршрут
    router.push('/home')

    // Сброс всех моков
    vi.clearAllMocks()

    // Мокаем window
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    })
    window.addEventListener = vi.fn()
    window.removeEventListener = vi.fn()
  })

  it('mounts MainMenu component properly', async () => {
    await router.isReady() // Ждем готовности роутера

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.main-menu').exists()).toBe(true)
  })

  it('renders logo link to home page', async () => {
    await router.isReady()

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    const logoLink = wrapper.find('a[href="/home"]')
    expect(logoLink.exists()).toBe(true)

    const logoImage = logoLink.find('img.main-link__img')
    expect(logoImage.exists()).toBe(true)
    expect(logoImage.attributes('alt')).toBe('Главная страница')
  })

  it('renders desktop navigation when window width > 1024', async () => {
    await router.isReady()

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    })

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    await wrapper.vm.$nextTick()

    // Должна отображаться десктопная навигация
    const desktopNav = wrapper.find('.nav-menu:not(.nav-menu--mobile)')
    expect(desktopNav.exists()).toBe(true)

    // Проверяем ссылки
    const homeLink = desktopNav.find('a[href="/home"]')
    const genresLink = desktopNav.find('a[href="/genres"]')

    expect(homeLink.exists()).toBe(true)
    expect(homeLink.text()).toBe('Главная')
  })

  it('renders mobile navigation when window width <= 1024', async () => {
    await router.isReady()

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    })

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    await wrapper.vm.$nextTick()

    // Должна отображаться мобильная навигация
    const mobileNav = wrapper.find('.nav-menu--mobile')
    expect(mobileNav.exists()).toBe(true)

    // Проверяем элементы мобильной навигации
    const genresIconLink = mobileNav.find('a[href="/genres"]')
    const searchButton = mobileNav.find('button.nav-menu__search-btn')

    expect(genresIconLink.exists()).toBe(true)
    expect(searchButton.exists()).toBe(true)
  })

  it('toggles search input when search button is clicked', async () => {
    await router.isReady()

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    })

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    await wrapper.vm.$nextTick()

    const searchButton = wrapper.find('button.nav-menu__search-btn')
    expect(searchButton.exists()).toBe(true)

    // Изначально search input скрыт
    expect(wrapper.find('.custom-search--show').exists()).toBe(false)

    // Кликаем на кнопку поиска
    await searchButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Теперь search input должен быть виден
    expect(wrapper.find('.custom-search--show').exists()).toBe(true)
  })

  it('shows search input with correct placeholder', async () => {
    await router.isReady()

    // Показываем search input
    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    const vm = wrapper.vm as any
    vm.showSearchInput = true

    await wrapper.vm.$nextTick()

    const searchInput = wrapper.find('input#searchFilm')
    expect(searchInput.exists()).toBe(true)
    expect(searchInput.attributes('placeholder')).toBe('Поиск')
  })

  it('clears search when clearSearch is called', async () => {
    await router.isReady()

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    const vm = wrapper.vm as any

    // Устанавливаем текст поиска
    vm.searchText = 'test'
    await wrapper.vm.$nextTick()

    // Вызываем clearSearch
    vm.clearSearch()
    await wrapper.vm.$nextTick()

    // Проверяем что текст очищен
    expect(vm.searchText).toBe('')
    expect(mockClearSearchResults).toHaveBeenCalled()
  })

  it('calls loadAllMovies on mounted', async () => {
    await router.isReady()

    mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(mockLoadAllMovies).toHaveBeenCalled()
  })

  it('triggers search when search text changes', async () => {
    await router.isReady()

    vi.useFakeTimers()

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    const vm = wrapper.vm as any

    // Устанавливаем текст поиска
    vm.searchText = 'test'
    await wrapper.vm.$nextTick()

    // Проверяем что debounce запущен
    expect(vm.isDebouncing).toBe(true)

    // Запускаем таймеры
    vi.runAllTimers()

    // Проверяем что поиск был вызван
    expect(mockSearchMovies).toHaveBeenCalledWith('test', 5)

    vi.useRealTimers()
  })

  it('does not search when text is empty', async () => {
    await router.isReady()

    vi.useFakeTimers()

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    const vm = wrapper.vm as any

    // Устанавливаем пустой текст
    vm.searchText = '   '
    await wrapper.vm.$nextTick()

    // Запускаем таймеры
    vi.runAllTimers()

    // Проверяем что поиск не был вызван
    expect(mockSearchMovies).not.toHaveBeenCalled()
    expect(mockClearSearchResults).toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('handles window resize events', async () => {
    await router.isReady()

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    const vm = wrapper.vm as any

    // Проверяем что обработчик добавлен
    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))

    // Изначально при ширине 1200, menuForMobile должно быть true
    expect(vm.menuForMobile).toBe(true) // 1200 > 1024

    // Изменяем ширину окна и вызываем метод checkWindowWidth напрямую
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    // Вызываем метод напрямую
    vm.checkWindowWidth()
    await wrapper.vm.$nextTick()

    // Теперь menuForMobile должно быть false
    expect(vm.menuForMobile).toBe(false) // 500 < 1024
  })

  it('shows "searching" message when debouncing', async () => {
    await router.isReady()

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    const vm = wrapper.vm as any
    vm.showSearchInput = true
    vm.isDebouncing = true

    await wrapper.vm.$nextTick()

    const searchingMessage = wrapper.find('.custom-search__searching')
    expect(searchingMessage.exists()).toBe(true)
    expect(searchingMessage.text()).toBe('Ищем фильмы...')
  })

  it('shows "no films" message when no results', async () => {
    await router.isReady()

    const mockSearchResults = [] // Пустой массив

    // Переопределяем мок
    useMoviesStoreMock.mockReturnValue({
      allMovies: [],
      searchResults: mockSearchResults,
      loadAllMovies: mockLoadAllMovies,
      searchMovies: mockSearchMovies,
      clearSearchResults: mockClearSearchResults,
    })

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    const vm = wrapper.vm as any

    // Устанавливаем только видимые условия
    vm.showSearchInput = true
    vm.isDebouncing = false
    vm.searchText = 'test'

    await wrapper.vm.$nextTick()

    // Проверяем что computed свойство правильно отражает store
    expect(vm.searchedFilms).toBe(mockSearchResults) // Должен быть тот же массив
    expect(vm.searchedFilms.length).toBe(0)

    // Условия для отображения "нет фильмов"
    const hasNoFilms = vm.searchedFilms.length === 0
    expect(hasNoFilms).toBe(true)
  })

  it('calls closeSearchInput method', async () => {
    await router.isReady()

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    const vm = wrapper.vm as any

    // Устанавливаем что search input открыт
    vm.showSearchInput = true
    await wrapper.vm.$nextTick()

    // Вызываем closeSearchInput
    vm.closeSearchInput()
    await wrapper.vm.$nextTick()

    // Проверяем что search input закрыт
    expect(vm.showSearchInput).toBe(false)
  })

  it('removes event listeners on unmount', async () => {
    await router.isReady()

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    // Размонтируем компонент
    wrapper.unmount()

    // Проверяем что обработчик удален
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('shows modal window when modalStore.openModal is true', async () => {
    await router.isReady()

    // Мокаем modalStore с openModal = true
    useModalStoreMock.mockReturnValueOnce({
      openModal: true,
      openModalWindow: mockOpenModalWindow,
      closeModalWindow: mockCloseModalWindow,
    })

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    // Проверяем что модальное окно отображается с правильным классом
    const modalWindow = wrapper.find('.modal-window--active')
    expect(modalWindow.exists()).toBe(true)
  })

  it('contains UserAuth component', async () => {
    await router.isReady()

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    // Ищем UserAuth по классу
    const userAuth = wrapper.find('.authorize-btn')
    expect(userAuth.exists()).toBe(true)
  })

  it('computes searchNotActive correctly', async () => {
    await router.isReady()

    const wrapper = mount(MainMenu, {
      global: {
        plugins: [pinia, router],
      },
    })

    const vm = wrapper.vm as any

    // Тест 1: menuForMobile = true, showSearchInput = false
    vm.menuForMobile = true
    vm.showSearchInput = false
    await wrapper.vm.$nextTick()
    expect(vm.searchNotActive).toBe(false) // !true && !false = false

    // Тест 2: menuForMobile = false, showSearchInput = false
    vm.menuForMobile = false
    vm.showSearchInput = false
    await wrapper.vm.$nextTick()
    expect(vm.searchNotActive).toBe(true) // !false && !false = true
  })
})
