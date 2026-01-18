import type { Film } from '@/api/types/filmType'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const openModal = ref(false)
  const pendingFilm = ref<Film | null>(null)

  const openModalWindow = (film?: Film) => {
    if (film) {
      pendingFilm.value = film
    }

    openModal.value = true
  }

  const closeModalWindow = () => {
    openModal.value = false
    pendingFilm.value = null
  }

  const getPendingFilm = () => {
    const film = pendingFilm.value
    pendingFilm.value = null
    return film
  }

  return {
    openModal,
    pendingFilm,
    openModalWindow,
    closeModalWindow,
    getPendingFilm,
  }
})
