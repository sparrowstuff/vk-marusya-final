import type { Film } from '@/api/types/filmType'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/utils/api'

export const useMoviesStore = defineStore('movies', () => {
  const allMovies = ref<Film[]>([])
  const top10Movies = ref<Film[]>([])
  const genres = ref<any[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const searchResults = ref<Film[]>([])
  const isSearching = ref(false)

  // нормализация ответов сервера для axios
  // TS не знает ответов от сервера, поэтому data: any
  const normalizeMoviesResponse = (data: any): Film[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.movies && Array.isArray(data.movies)) return data.movies
    if (data.movie && Array.isArray(data.movie)) return data.movie
    return []
  }

  const loadAllMovies = async (forceRefresh: boolean = false) => {
    // Если уже загружено и не требуется принудительное обновление
    if (isLoaded.value && !forceRefresh && allMovies.value.length > 0) {
      return allMovies.value
    }

    isLoading.value = true
    try {
      const data = await api.get('/movie', { params: { limit: 50 } })

      // Используем normalizeMoviesResponse
      allMovies.value = normalizeMoviesResponse(data)
      isLoaded.value = true

      return allMovies.value
    } catch (err) {
      console.error('Failed to fetch movies', err)
      allMovies.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }

  const loadTop10 = async () => {
    if (top10Movies.value.length > 0) {
      return top10Movies.value
    }

    try {
      const data = await api.get('/movie/top10')
      top10Movies.value = normalizeMoviesResponse(data)
      return top10Movies.value
    } catch (err) {
      console.error('Failed to fetch top 10', err)
      top10Movies.value = []
      return []
    }
  }

  const loadGenres = async () => {
    if (genres.value.length > 0) {
      return genres.value
    }

    try {
      const data = await api.get('/movie/genres')
      genres.value = Array.isArray(data) ? data : []
      return genres.value
    } catch (err) {
      console.error('Failed to fetch genres', err)
      genres.value = []
      return []
    }
  }

  const getMovieById = async (movieId: number): Promise<Film | null> => {
    // Ищем в кэше
    const cachedMovie = allMovies.value.find((movie) => movie.id === movieId)
    if (cachedMovie) {
      return cachedMovie
    }

    // Если нет в кэше
    try {
      const movie = (await api.get(`/movie/${movieId}`)) as Film
      return movie
    } catch (err) {
      console.error(`Ошибка загрузки фильма ${movieId}:`, err)
      return null
    }
  }

  const getRandomMovie = async (): Promise<Film | null> => {
    if (allMovies.value.length === 0) {
      await loadAllMovies()
    }

    if (allMovies.value.length > 0) {
      const randomIndex = Math.floor(Math.random() * allMovies.value.length)
      const movie = allMovies.value[randomIndex]
      return movie ? movie : null
    }

    try {
      const movie = (await api.get('/movie/random')) as Film
      return movie
    } catch (err) {
      console.error('Ошибка загрузки случайного фильма:', err)
      return null
    }
  }

  const searchMovies = async (query: string, limit: number = 5): Promise<Film[]> => {
    if (!query.trim()) {
      searchResults.value = []
      return []
    }

    isSearching.value = true
    try {
      const data = await api.get('/movie', {
        params: { title: query, count: limit },
      })

      // Используем normalizeMoviesResponse
      const movies = normalizeMoviesResponse(data)
      searchResults.value = movies
      return movies
    } catch (err) {
      console.error('Ошибка поиска фильмов:', err)
      searchResults.value = []
      return []
    } finally {
      isSearching.value = false
    }
  }

  const getMoviesByGenre = (genreSlug: string | number): Film[] => {
    return allMovies.value.filter((movie) => {
      return movie.genres?.some((genre) => {
        // Проверяем разные способы сопоставления жанра
        if (typeof genreSlug === 'number') {
          return genre.id === genreSlug
        }

        return (
          genre.id?.toString() === genreSlug ||
          genre.slug === genreSlug ||
          genre.name?.toLowerCase().replace(/\s+/g, '-') === genreSlug.toLowerCase() ||
          genre.name_ru?.toLowerCase().replace(/\s+/g, '-') === genreSlug.toLowerCase()
        )
      })
    })
  }

  const clearSearchResults = () => {
    searchResults.value = []
  }

  return {
    allMovies,
    top10Movies,
    genres,
    isLoading,
    isLoaded,
    searchResults,
    isSearching,
    loadAllMovies,
    loadTop10,
    loadGenres,
    getMovieById,
    getRandomMovie,
    searchMovies,
    getMoviesByGenre,
    clearSearchResults,
  }
})
