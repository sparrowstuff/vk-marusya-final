import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import Top10Movie from '@/components/Top10Movie.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory, createMemoryHistory, useRoute } from 'vue-router'
import type { TopFilm } from '@/api/types/filmType'
import DetailedMovie from '@/components/DetailedMovie.vue'

const mockFilm: TopFilm = {
  id: 1,
  posterUrl: 'Test Url',
  title: 'Test title',
  backdropUrl: 'Test backdrop Url',
}

const mockMovies = {
  movies: [],
}

describe('Top10Movie', () => {
  let pinia: ReturnType<typeof createPinia>
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/film/:id', name: 'film', component: DetailedMovie, props: true }],
    })
  })

  it('Mounts Top10Movie component properly', async () => {
    const wrapper = mount(Top10Movie, {
      props: { film: mockFilm },
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.top-film').exists()).toBe(true)
  })

  it('Receives and uses props as data', async () => {
    const wrapper = mount(Top10Movie, {
      props: { film: mockFilm, number: 0 },
      global: {
        plugins: [pinia, router],
      },
    }) // number в именно данном компоненте - передается как пропс

    expect(wrapper.find('.top-film__title').text()).toEqual(mockFilm.title)
    expect(wrapper.find('.top-film__img').attributes('src')).toEqual(mockFilm.posterUrl)

    // если posterUrl не отображается - отображается backdrop в v-else блоке
    if (!mockFilm.posterUrl) {
      expect(wrapper.find('.top-film__img').attributes('srcset')).toEqual(mockFilm.backdropUrl)
    }

    const filmCounter = await wrapper.find('.top-film__counter')
    expect(filmCounter.exists()).toBe(true)
    // в ожидании - конвертация строки в Number
    expect(Number(filmCounter.text())).toEqual(1)
  })

  it('Renders counter +1 based on "number" prop', async () => {
    const wrapperWithCounter = mount(Top10Movie, {
      props: { film: mockFilm, number: 5 },
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapperWithCounter.find('.top-film__counter').exists()).toBe(true)
    expect(wrapperWithCounter.find('.top-film__counter').text()).toBe('6') // number + 1
  })

  it('Navigates to the film page when film is clicked', async () => {
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(Top10Movie, {
      props: { film: mockFilm },
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)
    await wrapper.trigger('click')

    expect(pushSpy).toHaveBeenCalledTimes(1)
    expect(pushSpy).toHaveBeenCalledWith(`/film/${mockFilm.id}`)

    // после теста очистка spy
    pushSpy.mockRestore()
  })
})
