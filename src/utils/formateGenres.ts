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
		action: '/images/genres/action.jpg',
		comedy: '/images/genres/сomedy.jpg',
		drama: '/images/genres/drama.webp',
		horror: '/images/genres/horror.png',
		fantasy: '/images/genres/fantasy.jpg',
		scifi: '/images/genres/sci-fi.jpg',
		romance: '/images/genres/romance.jpg',
		thriller: '/images/genres/thriller.jpg',
		mystery: '/images/genres/detective.jpg',
		animation: '/images/genres/animation.webp',
		adventure: '/images/genres/adventure.jpg',
		crime: '/images/genres/crime.jpg',
		documentary: '/images/genres/documentary.jpg',
		family: '/images/genres/family.jpg',
		history: '/images/genres/history.jpg',
		music: '/images/genres/musical.jpg',
		war: '/images/genres/war.jpg',
		western: '/images/genres/western.jpg',
		'tv-movie': '/images/genres/tv-show.jpg',
		'stand-up': '/images/genres/stand-up.jpg',
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
