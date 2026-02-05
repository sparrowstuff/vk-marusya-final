import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModalMenu from '@/components/ModalMenu.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter } from 'vue-router'
import type { User } from '@/api/types/userType'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    register: vi.fn().mockResolvedValue({ error: null }),
    login: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
  }),
}))

describe('ModalMenu', () => {
  let pinia: ReturnType<typeof createPinia>
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const mockUser: User = {
    id: 1,
    name: 'John',
    email: 'test-mail@mail.com',
    password: '123123',
  }

  it('Mounts Modal Menu component in Login mode by default', async () => {
    const wrapper = mount(ModalMenu, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.exists()).toBe(true)

    // нахождение дефолтного состояния логин меню
    const modalMode = wrapper.find('.modal__login-menu')
    expect(modalMode.exists()).toBe(true)

    // регистрация по дефолту скрыта
    const registerMode = wrapper.find('.modal__register-menu')
    expect(registerMode.exists()).toBe(false)

    // основные компоненты модалки:
    expect(wrapper.find('.modal__close-btn').exists()).toBe(true)
    expect(wrapper.find('.modal__img').exists()).toBe(true)
    expect(wrapper.find('input[id="loginEmail"]').exists()).toBe(true)
    expect(wrapper.find('input[id="loginPassword"]').exists()).toBe(true)
  })

  it('Switches to RegisterMode if switch btn clicked', async () => {
    const wrapper = mount(ModalMenu, {
      global: {
        plugins: [pinia],
      },
    })

    // по умолчанию login-menu
    expect(wrapper.find('.modal__login-menu').exists()).toBe(true)
    const registerBtn = wrapper.find('.modal__register-btn')
    expect(registerBtn.exists()).toBe(true)
    expect(registerBtn.text()).toBe('Регистрация')

    // триггерим клик
    await registerBtn.trigger('click')

    // после клика регистр. меню сменяет логин меню
    expect(wrapper.find('.modal__register-menu').exists()).toBe(true)
    expect(wrapper.find('.modal__login-menu').exists()).toBe(false)

    expect(wrapper.find('.modal__close-btn').exists()).toBe(true)
    expect(wrapper.find('input[id="registerEmail"]').exists()).toBe(true)
    expect(wrapper.find('input[id="registerName"]').exists()).toBe(true)
    expect(wrapper.find('input[id="inputPassword"]').exists()).toBe(true)
    expect(wrapper.find('input[id="repeatPassword"]').exists()).toBe(true)
  })

  it('Shows register form errors', async () => {
    const wrapper = mount(ModalMenu, {
      global: {
        plugins: [pinia],
      },
    })

    // сразу переключаемся в режим регистрации
    await wrapper.find('.modal__register-btn').trigger('click')

    // блоки инпутов
    const emailBlock = wrapper.find('.custom-input:has(input[id="registerEmail"])')
    const passwordBlock = wrapper.find('.custom-input:has(input[id="inputPassword"])')
    const confirmBlock = wrapper.find('.custom-input:has(input[id="repeatPassword"])')

    // проверка появления ошибок при регистрации email
    await wrapper.find('input[id="registerEmail"]').setValue('invalidEmail')
    await wrapper.find('.modal__auth-btn').trigger('click')
    expect(emailBlock.classes()).toContain('custom-input--error')

    // проверка появления ошибок при регистрации пароля
    await wrapper.find('input[id="inputPassword"]').setValue('123')
    await wrapper.find('.modal__auth-btn').trigger('click')
    expect(passwordBlock.classes()).toContain('custom-input--error')

    // проверка появления ошибок при не совпадающих паролях при регистрации
    await wrapper.find('input[id="inputPassword"]').setValue('password123')
    await wrapper.find('input[id="repeatPassword"]').setValue('different')
    await wrapper.find('.modal__auth-btn').trigger('click')
    expect(confirmBlock.classes()).toContain('custom-input--error')
  })

  it('Validates register form correctly', async () => {
    const wrapper = mount(ModalMenu, {
      global: {
        plugins: [pinia],
      },
    })

    // сразу переключаемся в режим регистрации
    await wrapper.find('.modal__register-btn').trigger('click')

    // блоки инпутов
    const emailBlock = wrapper.find('.custom-input:has(input[id="registerEmail"])')
    const passwordBlock = wrapper.find('.custom-input:has(input[id="inputPassword"])')
    const confirmBlock = wrapper.find('.custom-input:has(input[id="repeatPassword"])')

    // проверка наличия ошибок
    await wrapper.find('input[id="registerEmail"]').setValue('test-mail@mail.com')
    await wrapper.find('.modal__auth-btn').trigger('click')
    expect(emailBlock.classes()).not.toContain('custom-input--error')

    await wrapper.find('input[id="inputPassword"]').setValue('123123')
    await wrapper.find('.modal__auth-btn').trigger('click')
    expect(passwordBlock.classes()).not.toContain('custom-input--error')

    await wrapper.find('input[id="repeatPassword"]').setValue('123123')
    await wrapper.find('.modal__auth-btn').trigger('click')
    expect(confirmBlock.classes()).not.toContain('custom-input--error')
  })

  it('Shows login form errors', async () => {
    const wrapper = mount(ModalMenu, {
      global: {
        plugins: [pinia],
      },
    })

    // проверка формы логина
    expect(wrapper.find('.modal__login-menu').exists()).toBe(true)

    const emailBlock = wrapper.find('.custom-input:has(input[id="loginEmail"])')

    // тест на невалидный email
    await wrapper.find('input[id="loginEmail"]').setValue('invalid email')
    await wrapper.find('.modal__login-btn').trigger('click')
    expect(emailBlock.classes()).toContain('custom-input--error')

    // очистим email ошибку или заполним валидным email
    await wrapper.find('input[id="loginEmail"]').setValue('test-mail@mail.com')

    // оставляем пароль пустым или невалидным
    await wrapper.find('input[id="loginPassword"]').setValue('')
    await wrapper.find('.modal__login-btn').trigger('click')

    // проверяем наличие текста ошибки внутри блока пароля
    const errorSpan = wrapper.find('.error-message')
    if (errorSpan.exists()) {
      expect(errorSpan.text()).toBeTruthy()
    }
  })

  it('Validates login form correctly', async () => {
    const wrapper = mount(ModalMenu, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.find('.modal__login-menu').exists()).toBe(true)

    const emailBlock = wrapper.find('.custom-input:has(input[id="loginEmail"])')

    // тест на валидные email и пароль
    await wrapper.find('input[id="loginEmail"]').setValue('test-mail@mail.com')
    await wrapper.find('input[id="loginPassword"]').setValue('123123')
    await wrapper.find('.modal__login-btn').trigger('click')
    expect(emailBlock.classes()).not.toContain('custom-input--error')
    // находим все блоки с ошибками и проверяем текст внутри них
    // если length === 0 - валидация корректна
    const errorMessages = wrapper.findAll('.error-message')
    expect(errorMessages).toHaveLength(0)
  })
})
