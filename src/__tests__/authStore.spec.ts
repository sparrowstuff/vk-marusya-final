import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import DetailedMovie from '../components/DetailedMovie.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory, createMemoryHistory, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/api/types/userType'

// мок глобального fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// также нужен мок localStorage функций
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('authStore', () => {
  let store: ReturnType<typeof useAuthStore>

  const mockUser: User = {
    id: 1,
    name: 'Test name',
    email: 'Test email',
    password: 'Test Password',
  }

  const loginData = {
    name: 'name',
    password: 'password',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    const pinia = createPinia()
    setActivePinia(pinia)
    store = useAuthStore()

    // сброс состояний
    store.user = null
    store.isLoading = false

    // мок успешного ответа в случае получения
    mockFetch.mockReset()
  })

  describe('login', () => {
    it('successful login saves user on page and his token on backend', async () => {
      // мок успешного ответ от сервера
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ user: mockUser }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      // мок fetchUser (внутренний вызов)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockUser),
      })

      const result = await store.login(loginData)

      // проверяем вызов fetch
      expect(mockFetch).toHaveBeenCalledWith('https://cinemaguide.skillbox.cc/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(loginData),
        credentials: 'include',
      })

      // проверяем состояние store
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
      expect(store.isLoading).toBe(false)

      // проверяем сохранение в localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockUser))

      // проверяем возвращаемое значение
      expect(result).toEqual(mockUser)
    })
  })

  describe('register', () => {
    const registerData = {
      id: 1,
      name: 'Test name',
      email: 'Test email',
      password: 'Test Password',
    }

    it('registers user and brings back user info', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 1, ...mockUser }),
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockUser),
      })

      const result = await store.register(registerData)

      expect(mockFetch).toHaveBeenCalledWith('https://cinemaguide.skillbox.cc/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(mockUser),
        credentials: 'include',
      })

      expect(result).toEqual({
        data: { ...registerData },
        error: null,
      })
      expect(store.isLoading).toBe(false)
    })

    it('Handles registration errors', async () => {
      const errorMessage = 'Email already exists'

      // мок респонс приходит здесь с ошибкой
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValueOnce({ message: errorMessage }),
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await store.register(registerData)

      expect(result).toEqual({
        data: null,
        error: errorMessage,
      })

      expect(store.isLoading).toBe(false)
    })

    it('handles network error during the registration', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await store.register(registerData)

      expect(result).toEqual({
        data: null,
        error: 'Network error',
      })

      expect(store.isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    // сначала логиним user
    beforeEach(() => {
      store.user = mockUser
      localStorage.setItem('user_data', JSON.stringify(mockUser))
    })

    it('successful logout and clears data after logout', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      const result = await store.logout()

      expect(mockFetch).toHaveBeenCalledWith('https://cinemaguide.skillbox.cc/auth/logout', {
        method: 'GET',
        credentials: 'include',
      })

      expect(store.user).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data')
      expect(result).toEqual({ success: true })
    })

    it('clears data even when server not responding', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await store.logout()

      expect(store.user).toBe(null)
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data')
      expect(result).toEqual({
        success: false,
        error: 'Network error',
      })
    })
  })

  describe('fetchUser', () => {
    it('fetches user successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockUser),
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await store.fetchUser()

      expect(mockFetch).toHaveBeenCalledWith('https://cinemaguide.skillbox.cc/profile', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })

      expect(store.user).toEqual(mockUser)
      expect(localStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockUser))
    })

    it('handles 401 error (unauthorized)', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({}),
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await store.fetchUser()

      expect(store.user).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data')
      expect(result).toEqual({
        data: null,
        error: 'Не авторизован',
      })
    })

    it('handles 403 error (forbidden)', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        json: vi.fn().mockResolvedValue({}),
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await store.fetchUser()

      expect(store.user).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data')
      expect(result).toEqual({
        data: null,
        error: 'Не авторизован', // Тоже "Не авторизован" для 403
      })
    })

    it('handles other HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValueOnce({}),
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await store.fetchUser()

      expect(store.user).toBe(null)
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data')
      expect(result?.error).toBeDefined()
    })

    it('handles network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await store.fetchUser()

      expect(store.user).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data')
      expect(result).toEqual({
        data: null,
        error: 'Network error',
      })
    })
  })
})
