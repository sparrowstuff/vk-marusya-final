const BASE_PATH = import.meta.env.BASE_URL || ''

const getImagePath = (path: string): string => {
  // На production: BASE_URL = '/vk-marusya-final/'
  // На dev: BASE_URL = ''
  const base = import.meta.env.BASE_URL || ''

  // Убираем лишние слеши
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base

  return `${cleanBase}/${cleanPath}`
}

export const formateGenres = (genreString: string[]) => {
  const russianNames: Record<string, string> = {
    action: 'Боевик',
    comedy: 'Комедия',
    drama: 'Драма',
    horror: 'Ужасы',
    fantasy: 'Фэнтези',
    scifi: 'Научная фантастика',
    romance: 'Мелодрама',
    thriller: 'Триллер',
    mystery: 'Детектив',
    animation: 'Анимация',
    adventure: 'Приключения',
    crime: 'Криминал',
    documentary: 'Документальный',
    family: 'Семейный',
    history: 'Исторический',
    music: 'Музыкальный',
    war: 'Военный',
    western: 'Вестерн',
    'tv-movie': 'Телевизионный',
    'stand-up': 'Стендап',
  }

  const genreImages: Record<string, string> = {
    action: getImagePath('images/genres/action.jpg'),
    comedy: getImagePath('images/genres/сomedy.jpg'),
    drama: getImagePath('images/genres/drama.webp'),
    horror: getImagePath('images/genres/horror.png'),
    fantasy: getImagePath('images/genres/fantasy.jpg'),
    scifi: getImagePath('images/genres/sci-fi.jpg'),
    romance: getImagePath('images/genres/romance.jpg'),
    thriller: getImagePath('images/genres/thriller.jpg'),
    mystery: getImagePath('images/genres/detective.jpg'),
    animation: getImagePath('images/genres/animation.webp'),
    adventure: getImagePath('images/genres/adventure.jpg'),
    crime: getImagePath('images/genres/crime.jpg'),
    documentary: getImagePath('images/genres/documentary.jpg'),
    family: getImagePath('images/genres/family.jpg'),
    history: getImagePath('images/genres/history.jpg'),
    music: getImagePath('images/genres/musical.jpg'),
    war: getImagePath('images/genres/war.jpg'),
    western: getImagePath('images/genres/western.jpg'),
    'tv-movie': getImagePath('images/genres/tv-show.jpg'),
    'stand-up': getImagePath('images/genres/stand-up.jpg'),
  }

  const getImage = (genre: string): string => {
    return genreImages[genre] || ''
  }

  return genreString.map((genre, index) => ({
    id: index + 1,
    name: genre,
    name_ru: russianNames[genre] || genre,
    image: getImage(genre),
    slug: genre,
  }))
}
