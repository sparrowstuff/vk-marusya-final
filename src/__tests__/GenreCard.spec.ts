import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import ModalMenu from '@/components/ModalMenu.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory, createMemoryHistory, useRoute } from 'vue-router'
import GenreCard from '@/components/GenreCard.vue'
import type { Genre } from '@/api/types/filmType'
import GenreFilteredView from '@/pages/GenreFilteredView.vue'

const mockGenre: Genre = {
  id: 1,
  name: 'Genre',
  name_ru: 'Жанр',
  image: 'imgUrl',
}

let pinia: ReturnType<typeof createPinia>
let router: ReturnType<typeof createRouter>

describe('GenreCard', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/genres/filtered',
          name: 'genres-filtered',
          component: GenreFilteredView,
          props: true,
        },
      ],
    })
  })

  it('Mounts GenreCard component', async () => {
    await router.push('/genres')
    await router.isReady()

    const wrapper = mount(GenreCard, {
      props: { card: mockGenre },
      global: { plugins: [pinia, router] },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.genre-card').exists()).toBe(true)
  })

  it('Uses props as genres data', async () => {
    await router.push('/genres')
    await router.isReady()

    const wrapper = mount(GenreCard, {
      props: { card: mockGenre },
      global: { plugins: [pinia, router] },
    })

    expect(wrapper.exists()).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.find('.genre-card__name').text()).toContain(`${mockGenre.name_ru}`)

    const imgEl = wrapper.find('.genre-card__img')
    expect(imgEl.exists()).toBe(true)
    expect(imgEl.attributes('alt')).toBe(`${mockGenre.name_ru}`)

    // жанр в src имеет достаточно сложную логику конвертации url пути, вычисляется через computed, поэтому:

    // смотрим что сам src - !undefined
    expect(imgEl.attributes('src')).toBeDefined()

    // либо добавить / (его добавляет логика computed)
    expect(imgEl.attributes('src')).toContain(`/${mockGenre.image}`)
  })

  it('Pushes to filtered genres view when clicked', async () => {
    await router.push('/genres')
    await router.isReady()

    const wrapper = mount(GenreCard, {
      props: { card: mockGenre },
      global: { plugins: [pinia, router] },
    })

    expect(wrapper.exists()).toBe(true)

    const pushSpy = vi.spyOn(router, 'push')
    const genreCard = wrapper.find('.genre-card')
    expect(genreCard.trigger('click'))

    // обязательно указать query параметр переноса когда идет spy/куда на самом деле переносит роутер
    expect(pushSpy).toHaveBeenCalledWith('/genres/filtered?genre=Genre')
  })
})
