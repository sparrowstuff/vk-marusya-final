import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  base: '/vk-marusya-final/',
  routes: [
    { path: '/', redirect: '/home' },
    { name: 'home', path: '/home', component: () => import('@/pages/HomeView.vue') },
    { name: 'genres', path: '/genres', component: () => import('@/pages/GenresView.vue') },
    { name: 'profile', path: '/profile', component: () => import('@/pages/ProfileView.vue') },
    {
      name: 'film',
      path: '/film/:id',
      component: () => import('@/pages/FilmView.vue'),
      props: true, // передает параметр id как props
    },
    {
      name: 'genre-filtered',
      path: '/genres/filtered',
      component: () => import('@/pages/GenreFilteredView.vue'),
    },
  ],
})

export default router
