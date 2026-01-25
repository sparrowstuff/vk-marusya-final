import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import SmallFilm from '@/components/SmallFilm.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory, createMemoryHistory, useRoute } from 'vue-router'
import { useMoviesStore } from '@/stores/moviesStore'
import type { Film } from '@/api/types/filmType'

describe('SmallFilm', () => {
  let pinia: ReturnType<typeof createPinia>
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/film/:id', name: 'film', component: SmallFilm, props: true }],
    })
  })

  const mockFilm: Film = {
    id: 1,
    title: 'Test Movie',
    tmdbRating: 8.5,
    releaseYear: '2023',
    genres: ['Action'],
    runtime: 120,
    posterUrl: 'test.jpg',
    backdropUrl: 'test-backdrop.jpg',
  }

  it('Mounts SmallFim component properly', async () => {
    await router.push('/film/1')
    await router.isReady()

    const wrapper = mount(SmallFilm, {
      props: { film: mockFilm },
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.small-movie').exists()).toBe(true)
  })

  it('Receives and uses props as data', async () => {
    await router.push('/film/1')
    await router.isReady()

    const wrapper = mount(SmallFilm, {
      props: { film: mockFilm },
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.find('.small-movie__title').text()).toContain('Test Movie')

    // проверка пикчи на соответствия пропсам
    const filmImg = wrapper.find('.small-movie__img')
    expect(filmImg.exists()).toBe(true)
    expect(filmImg.attributes('alt')).toBe('Test Movie')
    expect(filmImg.attributes('src')).toBe('test.jpg')
    expect(filmImg.attributes('srcset')).toBe('test-backdrop.jpg')

    expect(wrapper.find('.small-movie__rating-text').text()).toContain(8.5)
    expect(wrapper.find('.small-movie__release-year').text()).toContain('2023')
    expect(wrapper.find('.small-movie__genre').text()).toBe('Action')
    expect(wrapper.find('.small-movie__duration').text()).toBe('2 ч. 0 мин')

    const ratingElement = wrapper.find('.small-movie__rating')
    expect(ratingElement.classes()).toContain('small-movie__rating--green')
  })

  it('Navigates to film page if clicked + checking the click itself', async () => {
    const wrapper = mount(SmallFilm, {
      props: { film: mockFilm },
      global: {
        plugins: [pinia, router],
      },
    })

    // spyOn следит за событием переход в роутере
    const pushSpy = vi.spyOn(router, 'push')
    const smallMovie = wrapper.find('.small-movie')
    expect(smallMovie.trigger('click'))

    // проверка навигации
    expect(pushSpy).toHaveBeenCalledWith('/film/1')

    // проверка привязки эмитов:
    expect(wrapper.emitted('inputClear')).toBeTruthy()
    expect(wrapper.emitted('searchInputNotActive')).toBeTruthy()
  })
})
