import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import FilmView from '@/pages/FilmView.vue'
import DetailedMovie from '@/components/DetailedMovie.vue'
import type { Film } from '@/api/types/filmType'

let pinia: ReturnType<typeof createPinia>
let router: ReturnType<typeof createRouter>

const mockFilm: Film = {
  id: 1,
  title: 'Test title',
  releaseYear: '2009',
  tmdbRating: 5,
  runtime: 120,
}

describe('FilmView', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/film/:id',
          name: 'film',
          component: FilmView,
          props: true,
        },
      ],
    })
  })

  it('Mounts FilmView page properly', async () => {
    const wrapper = mount(FilmView, {
      props: mockFilm,
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
