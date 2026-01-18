import type { User } from '@/api/types/userType'
import { api } from '@/utils/api'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref<boolean>(false)
  const BASE_URL = 'https://cinemaguide.skillbox.cc'

  const isAuthenticated = computed(() => !!user.value)

  const login = async (userData: Pick<User, 'email' | 'password'>) => {
    isLoading.value = true

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка авторизации')
      }

      const data = await response.json()

      user.value = data.user || data

      if (user.value) {
        localStorage.setItem('user_data', JSON.stringify(user.value))
      }

      await fetchUser()

      return user.value
    } catch (err) {
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: User) => {
    isLoading.value = true

    try {
      const response = await fetch(`${BASE_URL}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка регистрации')
      }

      const data = await response.json()

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message || 'Ошибка регистрации' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      })

      user.value = null

      localStorage.removeItem('user_data')
      return { success: true }
    } catch (err) {
      console.error('Logout error:', err)
      user.value = null
      localStorage.removeItem('user_data')
      return { success: false, error: err.message }
    }
  }

  const fetchUser = async () => {
    try {
      const response = await fetch(`${BASE_URL}/profile`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          user.value = null
          localStorage.removeItem('user_data')
          return { data: null, error: 'Не авторизован' }
        }

        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      user.value = data

      if (data && data.id) {
        localStorage.setItem('user_data', JSON.stringify(data))
      }
    } catch (err) {
      console.error('Fetch user error:', err)
      user.value = null
      localStorage.removeItem('user_data')
      return { data: null, error: err.message }
    }
  }

  const init = async () => {
    // Сначала пробуем загрузить из localStorage
    try {
      const savedUser = localStorage.getItem('user_data')
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        if (parsedUser && parsedUser.id) {
          user.value = parsedUser
        }
      }
    } catch (err) {
      console.error('Error loading user from localStorage:', err)
    }

    // Затем пробуем запросить с сервера
    await fetchUser()
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    init,
  }
})
