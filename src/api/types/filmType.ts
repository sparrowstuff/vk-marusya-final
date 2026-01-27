export type Film = {
  id: number
  title: string
  originalTitle?: string
  language?: string
  releaseYear: string
  genres?: string[]
  budget?: number
  languages?: string[]
  posterUrl?: string
  backdropUrl?: string
  production?: string
  plot?: string
  tmdbRating: number
  trailerUrl?: string
  awardsSummary?: string
  director?: string
  revenue?: string
  runtime: number
}

export type Genre = {
  id: number
  name: string
  name_ru?: string
  slug?: string
  image?: string
}
