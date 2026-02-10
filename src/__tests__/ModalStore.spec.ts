import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import type { Film } from '@/api/types/filmType'

const mockFilm: Film = {
  id: 1,
  title: 'Test Title',
  genres: ['Action'],
  runtime: 120,
  posterUrl: 'test.jpg',
  backdropUrl: 'test-backdrop-url.jpg',
} as Film

describe('modalStore', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('Initializes with default values', () => {
    const store = useModalStore()

    expect(store.openModal).toBe(false)
    expect(store.pendingFilm).toBe(null)
  })

  it('Opens modal window with pending Film', () => {
    const store = useModalStore()

    store.openModalWindow(mockFilm)
    expect(store.openModal).toBe(true)
    expect(store.pendingFilm).toEqual(mockFilm)
  })

  it('Opens modal window without pending Film', () => {
    const store = useModalStore()

    store.openModalWindow()
    expect(store.openModal).toBe(true)
    expect(store.pendingFilm).toBe(null)
  })

  it('Closes modal Window', () => {
    const store = useModalStore()

    store.openModalWindow()
    expect(store.openModal).toBe(true)

    store.closeModalWindow()
    expect(store.openModal).toBe(false)
  })

  it('Gets and clears pending Film', () => {
    const store = useModalStore()

    store.openModalWindow(mockFilm)
    const film = store.getPendingFilm()

    expect(film).toEqual(mockFilm)
    // после получения фильма - pendingFilm очищается
    expect(store.pendingFilm).toBe(null)
  })

  it('Returns null when no pending film', () => {
    const store = useModalStore()

    const film = store.getPendingFilm()

    expect(film).toBe(null)
    expect(store.pendingFilm).toBe(null)
  })

  it('Closes modal and clears pending Film', () => {
    const store = useModalStore()

    store.openModalWindow(mockFilm)
    expect(store.openModal).toBe(true)
    expect(store.pendingFilm).toEqual(mockFilm)

    store.closeModalWindow()
    expect(store.openModal).toBe(false)
    expect(store.pendingFilm).toBe(null)
  })
})
