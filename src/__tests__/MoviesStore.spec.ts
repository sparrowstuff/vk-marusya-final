import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMoviesStore } from '@/stores/moviesStore'
import type { Film } from '@/api/types/filmType'

const mockFilm: Film = {
  id: 1,
  title: 'Test Title',
  genres: ['Action'],
  runtime: 120,
  posterUrl: 'test.jpg',
  backdropUrl: 'test-backdrop-url.jpg',
} as Film

vi.mock('@/utils/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('moviesStore', () => {
  let store: ReturnType<typeof useMoviesStore>

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  it('Initializes store', () => {
    const store = useMoviesStore()

    expect(store.allMovies).toStrictEqual([])
    expect(store.top10Movies).toStrictEqual([])
    expect(store.genres).toStrictEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.isLoaded).toBe(false)
    expect(store.searchResults).toStrictEqual([])
    expect(store.isSearching).toBe(false)
  })

  it('Loads all movies successfully', async () => {
    const { api } = await import('@/utils/api')
    const mockMovies = [
      { id: 1, title: 'Movie 1', genres: ['Action'] },
      { id: 2, title: 'Movie 2', genres: ['Comedy'] },
    ]

    ;(api.get as any).mockResolvedValue(mockMovies)

    const store = useMoviesStore()
    const result = await store.loadAllMovies()

    expect(api.get).toHaveBeenCalledWith('/movie', { params: { limit: 50 } })
    expect(store.allMovies).toEqual(mockMovies)
    expect(store.isLoaded).toBe(true)
    expect(store.isLoading).toBe(false)
    expect(result).toEqual(mockMovies)
  })

  it('Handles error when loading all movies', async () => {
    const { api } = await import('@/utils/api')
    ;(api.get as any).mockRejectedValue(new Error('Network error'))

    const store = useMoviesStore()
    const result = await store.loadAllMovies()

    expect(api.get).toHaveBeenCalledWith('/movie', { params: { limit: 50 } })
    expect(store.allMovies).toEqual([])
    expect(store.isLoaded).toBe(false)
    expect(store.isLoading).toBe(false)
    expect(result).toEqual([])
  })

  it('Returns cached movies if movies loaded', async () => {
    const { api } = await import('@/utils/api')
    const mockMovies = [{ id: 1, title: 'Movie 1' }]

    ;(api.get as any).mockResolvedValue(mockMovies)

    const store = useMoviesStore()

    await store.loadAllMovies()
    expect(api.get).toHaveBeenCalledTimes(1)

    const result = await store.loadAllMovies()
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockMovies)
  })

  it('Forces refresh if forceRefresh is true', async () => {
    const { api } = await import('@/utils/api')

    const mockMovies1 = [{ id: 1, title: 'Movie 1' }]
    const mockMovies2 = [{ id: 2, title: 'Movie 2' }]

    ;(api.get as any).mockResolvedValueOnce(mockMovies1).mockResolvedValueOnce(mockMovies2)

    const store = useMoviesStore()
    await store.loadAllMovies()
    expect(api.get).toHaveBeenCalledTimes(1)

    const result = await store.loadAllMovies(true)
    expect(api.get).toHaveBeenCalledTimes(2)
    expect(result).toEqual(mockMovies2)
    expect(store.allMovies).toEqual(mockMovies2)
  })

  it('Loads top 10 movies', async () => {
    const { api } = await import('@/utils/api')

    const mockTop10 = [
      { id: 1, title: 'Top Movie 1', rating: 9.5 },
      { id: 2, title: 'Top Movie 2', rating: 9.4 },
    ]
    ;(api.get as any).mockResolvedValueOnce(mockTop10)

    const store = useMoviesStore()
    const result = await store.loadTop10()

    expect(api.get).toHaveBeenCalledTimes(1)
    expect(api.get).toHaveBeenCalledWith('/movie/top10')
    expect(store.top10Movies).toEqual(mockTop10)
    expect(result).toEqual(mockTop10)
  })

  it('Returns cached top 10 movies', async () => {
    const { api } = await import('@/utils/api')
    const mockTop10 = [{ id: 1, title: 'Top Movie 1' }]

    ;(api.get as any).mockResolvedValue(mockTop10)

    const store = useMoviesStore()

    await store.loadTop10()
    expect(api.get).toHaveBeenCalledTimes(1)

    // вторая загрузка вернет фильмы из кеша
    const result = await store.loadTop10()
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockTop10)
  })

  it('Loads genres', async () => {
    const { api } = await import('@/utils/api')
    const mockGenres = ['Action', 'Comedy']
    ;(api.get as any).mockResolvedValueOnce(mockGenres)

    const store = useMoviesStore()
    await store.loadGenres()
    expect(api.get).toHaveBeenCalledTimes(1)

    const result = await store.loadGenres()
    expect(store.genres).toEqual(mockGenres)
    expect(result).toEqual(mockGenres)
  })

  it('Gets movie by Id from cache', async () => {
    const { api } = await import('@/utils/api')

    const mockMovies = [
      { id: 1, title: 'Movie 1' },
      { id: 2, title: 'Movie 2' },
    ]
    ;(api.get as any).mockResolvedValueOnce(mockMovies)

    const store = useMoviesStore()
    await store.loadAllMovies()

    const result = await store.getMovieById(1)

    expect(api.get).not.toHaveBeenCalledWith('/movie/1')
    expect(result).toEqual({ id: 1, title: 'Movie 1' })
  })

  it('Gets movie by ID from API when not in cache', async () => {
    const { api } = await import('@/utils/api')
    const mockMovies = [{ id: 1, title: 'Movie 1' }]
    const mockMovie = { id: 2, title: 'Movie 2' }

    ;(api.get as any).mockResolvedValueOnce(mockMovies).mockResolvedValueOnce(mockMovie)

    const store = useMoviesStore()
    await store.loadAllMovies()

    const result = await store.getMovieById(2)

    expect(api.get).toHaveBeenCalledWith('/movie/2')
    expect(result).toEqual(mockMovie)
  })

  it('Searches movies', async () => {
    const { api } = await import('@/utils/api')
    const mockSearchResults = [
      { id: 1, title: 'Movie 1' },
      { id: 2, title: 'Movie 2' },
    ]

    ;(api.get as any).mockResolvedValue(mockSearchResults)

    const store = useMoviesStore()
    await store.loadAllMovies()

    const result = await store.searchMovies('test', 10)

    expect(api.get).toHaveBeenCalledWith('/movie', {
      params: { title: 'test', count: 10 },
    })
    expect(store.searchResults).toEqual(mockSearchResults)
    expect(store.isSearching).toBe(false)
    expect(result).toEqual(mockSearchResults)
  })

  it('Returns empty array for empty search query', async () => {
    const { api } = await import('@/utils/api')

    const store = useMoviesStore()
    const result = await store.searchMovies('')

    expect(api.get).not.toHaveBeenCalled()
    expect(store.searchResults).toEqual([])
    expect(result).toEqual([])
  })

  it('Clears search results', () => {
    const store = useMoviesStore()
    store.searchResults = [{ id: 1, title: 'Movie 1' }]

    store.clearSearchResults()

    expect(store.searchResults).toEqual([])
  })

  it('Gets movies by genre', async () => {
    const { api } = await import('@/utils/api')
    const mockMovies = [
      {
        id: 1,
        title: 'Action Movie',
        genres: [{ id: 1, name: 'Action', slug: 'action' }],
      },
      {
        id: 2,
        title: 'Comedy Movie',
        genres: [{ id: 2, name: 'Comedy', slug: 'comedy' }],
      },
      {
        id: 3,
        title: 'Another Action Movie',
        genres: [{ id: 1, name: 'Action', slug: 'action' }],
      },
    ]

    ;(api.get as any).mockResolvedValue(mockMovies)

    const store = useMoviesStore()
    await store.loadAllMovies()

    const actionMovies = store.getMoviesByGenre('action')
    const comedyMovies = store.getMoviesByGenre('comedy')
    const dramaMovies = store.getMoviesByGenre('drama')

    expect(actionMovies).toHaveLength(2)
    expect(actionMovies[0].id).toBe(1)
    expect(actionMovies[1].id).toBe(3)

    expect(comedyMovies).toHaveLength(1)
    expect(comedyMovies[0].id).toBe(2)

    expect(dramaMovies).toHaveLength(0)
  })

  it('Normalizes movie responses correctly', async () => {
    const { api } = await import('@/utils/api')
    const store = useMoviesStore()

    // Тестируем разные форматы ответов
    const testCases = [
      { response: [{ id: 1, title: 'Movie 1' }], expected: [{ id: 1, title: 'Movie 1' }] },
      {
        response: { movies: [{ id: 2, title: 'Movie 2' }] },
        expected: [{ id: 2, title: 'Movie 2' }],
      },
      {
        response: { movie: [{ id: 3, title: 'Movie 3' }] },
        expected: [{ id: 3, title: 'Movie 3' }],
      },
      { response: null, expected: [] },
      { response: undefined, expected: [] },
      { response: [], expected: [] },
    ]

    for (const testCase of testCases) {
      ;(api.get as any).mockResolvedValue(testCase.response)
      await store.loadAllMovies(true) // force refresh каждый раз

      expect(store.allMovies).toEqual(testCase.expected)
    }
  })
})
