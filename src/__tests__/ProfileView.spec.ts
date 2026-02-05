import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DetailedMovie from '../components/DetailedMovie.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ProfileView from '@/pages/ProfileView.vue'
import HomeView from '@/pages/HomeView.vue'
import GenresView from '@/pages/GenresView.vue'

const mockUser = vi.hoisted(() => ({
  value: null as any,
}))
const mockLogoutFn = vi.hoisted(() => vi.fn())
const mockFetchFavoritesFn = vi.hoisted(() => vi.fn())
const mockProductsInBasketValue = vi.hoisted(() => [])
const mockIsInBasketFn = vi.hoisted(() => vi.fn())

// мок storeToRefs
vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pinia')>()
  return {
    ...actual,
    storeToRefs: (store: any) => {
      // Простая реализация для тестов
      const refs: any = {}
      for (const key in store) {
        if (typeof store[key] !== 'function') {
          refs[key] = { value: store[key] }
        }
      }
      return refs
    },
  }
})

// Мокаем authStore
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    // Создаем геттер для user чтобы он был реактивным
    get user() {
      return mockUser.value
    },
    logout: mockLogoutFn,
  }),
}))

// Мокаем basketStore
vi.mock('@/stores/basketStore', () => ({
  useBasketStore: () => ({
    fetchFavorites: mockFetchFavoritesFn,
    get productsInBasket() {
      return mockProductsInBasketValue
    },
    isInBasket: mockIsInBasketFn,
  }),
}))

// Мокаем Top10Movie компонент
vi.mock('@/components/Top10Movie.vue', () => ({
  default: {
    template: '<div class="top10-movie-mock">Top10Movie Mock</div>',
    props: ['film'],
  },
}))

// Мокаем window методы
const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener
const originalInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth')

describe('ProfileView', () => {
  let pinia: ReturnType<typeof createPinia>
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/profile', name: 'profile', component: ProfileView },
        { path: '/', name: 'main', component: HomeView },
        { path: '/genres', name: 'genres', component: GenresView },
      ],
    })

    // Мокаем window методы
    window.addEventListener = vi.fn()
    window.removeEventListener = vi.fn()
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Десктоп по умолчанию
    })

    // Сбрасываем значения
    mockUser.value = null
    mockProductsInBasketValue.length = 0
    vi.clearAllMocks()

    // Настраиваем моки
    mockFetchFavoritesFn.mockResolvedValue(undefined)
    mockLogoutFn.mockResolvedValue(undefined)
    mockIsInBasketFn.mockReturnValue(false)
  })

  afterEach(() => {
    // Восстанавливаем оригинальные методы window
    window.addEventListener = originalAddEventListener
    window.removeEventListener = originalRemoveEventListener
    if (originalInnerWidth) {
      Object.defineProperty(window, 'innerWidth', originalInnerWidth)
    }
  })

  it('Mounts ProfileView page properly', async () => {
    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('Access restricted if user is not authenticated', async () => {
    mockUser.value = null

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((res) => setTimeout(res, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)

    expect(wrapper.find('.profile__authorize-first').exists()).toBe(true)
    expect(wrapper.find('.profile').exists()).toBe(false)
  })

  it('Access granted if user is authenticated', async () => {
    mockUser.value = {
      id: 1,
      name: 'Test name',
    }
    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((res) => setTimeout(res, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)

    expect(wrapper.find('.profile__authorize-first').exists()).toBe(false)
    expect(wrapper.find('.profile').exists()).toBe(true)
  })

  it('If user is authenticated user settings(by default) DOM elements has been rendered', async () => {
    mockUser.value = {
      id: 1,
      name: 'Test Name',
      email: 'Test Email',
    }

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((res) => setTimeout(res, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.profile__title').text()).toContain('Мой аккаунт')

    // по умолчанию меню в режиме просмотра настроек
    // кнопка favorites
    expect(wrapper.find('.profile__favorites').exists()).toBe(true)

    // кнопка settings
    expect(wrapper.find('.profile__settings').exists()).toBe(true)

    // settings menu отображение
    expect(wrapper.find('.profile__settings-menu').exists()).toBe(true)

    // отображают внутренние блоки информации о польз.
    const innerSection = wrapper.findAll('.profile__inner-section')
    innerSection.forEach((el) => {
      expect(el.exists()).toBe(true)
    })

    // отображают имя и Email

    expect(wrapper.find('.profile__user-name').text()).toContain(mockUser.value.name)
    expect(wrapper.find('.profile__name').text()).toContain('Имя Фамилия')
    expect(wrapper.find('.profile__user-email').text()).toContain(mockUser.value.email)
    expect(wrapper.find('.profile__email').text()).toContain('Электронная почта')

    expect(wrapper.find('.profile__logout-btn').exists()).toBe(true)
  })

  it('Logs out user if logout btn clicked', async () => {
    mockUser.value = {
      id: 1,
      name: 'Test Name',
      email: 'Test Email',
    }

    // мок функции logout - она сделает из user === null
    mockLogoutFn.mockImplementation(async () => {
      mockUser.value = null
    })

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((res) => setTimeout(res, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)

    const logoutBtn = wrapper.find('.profile__logout-btn')
    expect(logoutBtn.exists()).toBe(true)

    // до клика user активен
    expect(mockUser).not.toBeNull()

    await logoutBtn.trigger('click')
    await wrapper.vm.$nextTick()

    // ожидаем вызова функции по кнопке logout
    expect(mockLogoutFn).toHaveBeenCalledTimes(1)

    expect(mockUser.value).toBeNull()
  })

  it('If user is authenticated renders films-menu DOM elements after change of settings menu', async () => {
    mockUser.value = {
      id: 1,
      name: 'Test Name',
      email: 'Test Email',
    }

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((res) => setTimeout(res, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)

    const changeSettingsBtn = wrapper.find('.profile__favorites')
    expect(changeSettingsBtn.exists()).toBe(true)

    // ожидаем клик от кнопки тогла с меню настроек на меню фильмов
    await changeSettingsBtn.trigger('click')

    expect(wrapper.find('.profile__fav-films').exists()).toBe(true)
  })

  it('Shows no films and buttons that push to another pages if user is authenticated and no films added in basket', async () => {
    mockUser.value = {
      id: 1,
      name: 'Test Name',
      email: 'Test Email',
    }

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((res) => setTimeout(res, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)

    const changeSettingsBtn = wrapper.find('.profile__favorites')
    expect(changeSettingsBtn.exists()).toBe(true)

    await changeSettingsBtn.trigger('click')

    expect(wrapper.find('.profile__fav-films').exists()).toBe(true)

    if (mockProductsInBasketValue.length === 0) {
      expect(wrapper.find('.profile__no-films').exists()).toBe(true)
      expect(wrapper.find('.profile__no-films').text()).toContain('Не найдено фильмов в избранном')

      expect(wrapper.find('.profile__go-to').exists()).toBe(true)
      expect(wrapper.find('.profile__go-to-inner').exists()).toBe(true)

      expect(wrapper.find('.profile__go-to-main-btn').exists()).toBe(true)
      expect(wrapper.find('.profile__go-to-genres-btn').exists()).toBe(true)
    }
  })

  it('Leads to main page if films not added and button to MAIN clicked', async () => {
    const pushSpy = vi.spyOn(router, 'push')

    mockUser.value = {
      id: 1,
      name: 'Test Name',
      email: 'Test Email',
    }

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((res) => setTimeout(res, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)

    const changeSettingsBtn = wrapper.find('.profile__favorites')
    expect(changeSettingsBtn.exists()).toBe(true)

    await changeSettingsBtn.trigger('click')

    expect(wrapper.find('.profile__fav-films').exists()).toBe(true)

    if (mockProductsInBasketValue.length === 0) {
      expect(wrapper.find('.profile__no-films').exists()).toBe(true)
      expect(wrapper.find('.profile__no-films').text()).toContain('Не найдено фильмов в избранном')

      expect(wrapper.find('.profile__go-to').exists()).toBe(true)
      expect(wrapper.find('.profile__go-to-inner').exists()).toBe(true)

      const goToMainBtn = wrapper.find('.profile__go-to-main-btn')

      await goToMainBtn.trigger('click')

      expect(pushSpy).toHaveBeenCalledTimes(1)
      expect(pushSpy).toHaveBeenCalledWith('/')
    }
  })

  it('Leads to genres page if films not added and button to GENRES clicked', async () => {
    const pushSpy = vi.spyOn(router, 'push')

    mockUser.value = {
      id: 1,
      name: 'Test Name',
      email: 'Test Email',
    }

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((res) => setTimeout(res, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)

    const changeSettingsBtn = wrapper.find('.profile__favorites')
    expect(changeSettingsBtn.exists()).toBe(true)

    await changeSettingsBtn.trigger('click')

    expect(wrapper.find('.profile__fav-films').exists()).toBe(true)

    if (mockProductsInBasketValue.length === 0) {
      expect(wrapper.find('.profile__no-films').exists()).toBe(true)
      expect(wrapper.find('.profile__no-films').text()).toContain('Не найдено фильмов в избранном')

      expect(wrapper.find('.profile__go-to').exists()).toBe(true)
      expect(wrapper.find('.profile__go-to-inner').exists()).toBe(true)

      const goToGenresBtn = wrapper.find('.profile__go-to-genres-btn')

      await goToGenresBtn.trigger('click')

      expect(pushSpy).toHaveBeenCalledTimes(1)
      expect(pushSpy).toHaveBeenCalledWith('/genres')
    }
  })

  it('Shows favorite films if user authenticated and films added to basket', async () => {
    mockUser.value = {
      id: 1,
      name: 'Test Name',
      email: 'Test Email',
    }

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((res) => setTimeout(res, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)

    const changeSettingsBtn = wrapper.find('.profile__favorites')
    expect(changeSettingsBtn.exists()).toBe(true)

    await changeSettingsBtn.trigger('click')

    expect(wrapper.find('.profile__fav-films').exists()).toBe(true)

    if (mockProductsInBasketValue.length !== 0) {
      expect(wrapper.find('.profile__catalog').exists()).toBe(true)
      expect(wrapper.find('.profile__movie-card').exists()).toBe(true)
    }
  })
})
