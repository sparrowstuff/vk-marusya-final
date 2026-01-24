import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/pages/HomeView.vue'
import GenresView from '@/pages/GenresView.vue'
import ProfileView from '@/pages/ProfileView.vue'

describe('App', () => {
  it('mounts renders properly', () => {
    const pinia = createPinia()

    // setActivePinia использует pinia на этапе setup функции в App.vue, перед тестом pinia должна быть активирована из-за использования authStore
    setActivePinia(pinia)

    const testRoutes = [
      {
        path: '/',
        redirect: '/home',
      },
      {
        path: '/home',
        name: 'home',
        component: HomeView,
      },
      {
        path: '/genres',
        name: 'genres',
        component: GenresView,
      },
      {
        name: 'profile',
        path: '/profile',
        component: ProfileView,
      },
    ]

    const router = createRouter({
      history: createWebHistory(),
      routes: testRoutes, // testRoutes тестируют здесь routerView
    })

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.container').exists()).toBe(true)
    expect(wrapper.find('.header').exists()).toBe(true)
    expect(wrapper.find('.footer').exists()).toBe(true)
    expect(wrapper.find('.main-menu').exists()).toBe(true)
    expect(wrapper.find('.hero').exists()).toBe(true)
    expect(wrapper.find('.socials').exists()).toBe(true)
  })
})
