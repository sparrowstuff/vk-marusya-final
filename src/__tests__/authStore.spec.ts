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
    it('успешный логин сохраняет пользователя и токен', async () => {
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
})
