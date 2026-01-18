import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://cinemaguide.skillbox.cc',
  withCredentials: true, // аналог credentials: include в nuxt
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Api error', error)
    throw error
  },
)
