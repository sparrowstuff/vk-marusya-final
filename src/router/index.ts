import FilmView from '@/pages/FilmView.vue'
import GenreFilteredView from '@/pages/GenreFilteredView.vue'
import GenresView from '@/pages/GenresView.vue'
import HomeView from '@/pages/HomeView.vue'
import ProfileView from '@/pages/ProfileView.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  base: '/vk-marusya-final/',
  routes: [
    { path: '/', redirect: '/home' },
    { name: 'home', path: '/home', component: HomeView },
    { name: 'genres', path: '/genres', component: GenresView },
    { name: 'profile', path: '/profile', component: ProfileView },
    {
      name: 'film',
      path: '/film/:id',
      component: FilmView,
      props: true, // передает параметр id как props
    },
    {
      name: 'genre-filtered',
      path: '/genres/filtered',
      component: GenreFilteredView,
    },
  ],
})

export default router
