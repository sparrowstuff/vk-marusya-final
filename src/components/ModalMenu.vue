<template>
  <div class="modal">
    <button
      class="modal__close-btn btn btn--close"
      type="button"
      aria-label="Закрыть окно регистрации/авторизации"
      @click="emit('closeModal')"
    >
      <svg
        class="modal__close-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
          fill="black"
        />
      </svg>
    </button>
    <picture class="modal__picture">
      <source src="/images/main-link/main-link-black.webp" type="images/webp" />
      <img
        class="modal__img"
        src="/images/main-link/main-link-black.png"
        srcset="/images/main-link/main-link-black@2x.png 2x"
        alt="VK Маруся"
        width="143"
        height="32"
      />
    </picture>
    <div class="modal__user-wrapper">
      <div v-if="isRegisterMode" class="modal__register-menu">
        <div class="modal__input-wrapper">
          <div class="custom-input" :class="{ 'custom-input--error': errors.email }">
            <label for="registerEmail" class="custom-input__label"
              ><svg
                class="custom-input__icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 3C21.5523 3 22 3.44772 22 4V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918C2.44405 21 2 20.5551 2 20.0066V19H20V7.3L12 14.5L2 5.5V4C2 3.44772 2.44772 3 3 3H21ZM8 15V17H0V15H8ZM5 10V12H0V10H5ZM19.5659 5H4.43414L12 11.8093L19.5659 5Z"
                  fill="currentColor"
                />
              </svg>
            </label>
            <input
              type="email"
              class="custom-input__input"
              id="registerEmail"
              placeholder="Электронная почта"
              required
              v-model="registerForm.email"
              @keyup.enter="handleRegister"
            />
          </div>
          <div class="custom-input" :class="{ 'custom-input--error': errors.name }">
            <label for="registerName" class="custom-input__label">
              <svg
                class="custom-input__icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"
                  fill="currentColor"
                />
              </svg>
            </label>
            <input
              type="text"
              class="custom-input__input"
              id="registerName"
              placeholder="Имя"
              required
              v-model="registerForm.name"
              @keyup.enter="handleRegister"
            />
          </div>
          <div class="custom-input" :class="{ 'custom-input--error': errors.password }">
            <label for="inputPassword" class="custom-input__label"
              ><svg
                class="custom-input__icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.917 13C12.441 15.8377 9.973 18 7 18C3.68629 18 1 15.3137 1 12C1 8.68629 3.68629 6 7 6C9.973 6 12.441 8.16229 12.917 11H23V13H21V17H19V13H17V17H15V13H12.917ZM7 16C9.20914 16 11 14.2091 11 12C11 9.79086 9.20914 8 7 8C4.79086 8 3 9.79086 3 12C3 14.2091 4.79086 16 7 16Z"
                  fill="currentColor"
                />
              </svg>
            </label>
            <input
              type="text"
              class="custom-input__input"
              id="inputPassword"
              placeholder="Пароль"
              required
              v-model="registerForm.password"
              @keyup.enter="handleRegister"
            />
          </div>
          <div class="custom-input" :class="{ 'custom-input--error': errors.confirmPassword }">
            <label for="repeatPassword" class="custom-input__label"
              ><svg
                class="custom-input__icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.917 13C12.441 15.8377 9.973 18 7 18C3.68629 18 1 15.3137 1 12C1 8.68629 3.68629 6 7 6C9.973 6 12.441 8.16229 12.917 11H23V13H21V17H19V13H17V17H15V13H12.917ZM7 16C9.20914 16 11 14.2091 11 12C11 9.79086 9.20914 8 7 8C4.79086 8 3 9.79086 3 12C3 14.2091 4.79086 16 7 16Z"
                  fill="currentColor"
                />
              </svg>
            </label>
            <input
              type="text"
              class="custom-input__input"
              id="repeatPassword"
              placeholder="Подтвердите пароль"
              required
              v-model="registerForm.confirmPassword"
              @keyup.enter="handleRegister"
            />
          </div>
        </div>
        <button class="modal__auth-btn btn" type="submit" @click="handleRegister">
          Создать аккаунт
        </button>
        <button
          class="modal__password-btn btn btn--auth btn--auth-black"
          type="button"
          @click="toggleMenu"
        >
          У меня есть пароль
        </button>
      </div>
      <div v-else-if="!isSuccess && currentMode === 'login'" class="modal__login-menu">
        <div class="modal__input-wrapper">
          <div class="custom-input" :class="{ 'custom-input--error': loginErrors.email }">
            <label for="loginEmail" class="custom-input__label">
              <svg
                class="custom-input__icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 3C21.5523 3 22 3.44772 22 4V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918C2.44405 21 2 20.5551 2 20.0066V19H20V7.3L12 14.5L2 5.5V4C2 3.44772 2.44772 3 3 3H21ZM8 15V17H0V15H8ZM5 10V12H0V10H5ZM19.5659 5H4.43414L12 11.8093L19.5659 5Z"
                  fill="currentColor"
                />
              </svg>
            </label>
            <input
              type="email"
              class="custom-input__input"
              id="loginEmail"
              placeholder="Электронная почта"
              required
              v-model="loginForm.email"
              @keyup.enter="handleRegister"
            />
          </div>
          <div class="custom-input" :class="{ 'custom-input--error': loginErrors.password }">
            <label for="loginPassword" class="custom-input__label"
              ><svg
                class="custom-input__icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.917 13C12.441 15.8377 9.973 18 7 18C3.68629 18 1 15.3137 1 12C1 8.68629 3.68629 6 7 6C9.973 6 12.441 8.16229 12.917 11H23V13H21V17H19V13H17V17H15V13H12.917ZM7 16C9.20914 16 11 14.2091 11 12C11 9.79086 9.20914 8 7 8C4.79086 8 3 9.79086 3 12C3 14.2091 4.79086 16 7 16Z"
                  fill="currentColor"
                />
              </svg>
            </label>
            <input
              type="text"
              class="custom-input__input"
              id="loginPassword"
              placeholder="Пароль"
              required
              v-model="loginForm.password"
              @keyup.enter="handleRegister"
            />
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>
        </div>
        <button class="modal__login-btn btn" type="button" @click="handleLogin">Войти</button>
        <button
          class="modal__register-btn btn btn--auth btn--auth-black"
          type="button"
          @click="toggleMenu"
        >
          Регистрация
        </button>
      </div>
      <div class="modal__success-registration" v-if="isSuccess">
        <span class="modal__success-text">Регистрация завершена</span>
        <span class="modal__success-description">Используйте вашу электронную почту для входа</span>
        <button class="modal__login-btn btn" type="button" @click="goToLogin">Войти</button>
      </div>
    </div>
    <div v-if="serverError" class="server-error">
      {{ serverError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/api/types/userType'
import { useAuthStore } from '@/stores/authStore'
import { ref, reactive, computed } from 'vue'

const emit = defineEmits(['closeModal', 'success'])

const authStore = useAuthStore()
const currentMode = ref<'login' | 'register'>('login')
const serverError = ref('')
const isSuccess = ref(false)

const registerForm = reactive({
  email: '',
  name: '',
  surname: '',
  password: '',
  confirmPassword: '',
})

const loginForm = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  name: '',
  password: '',
  confirmPassword: '',
})

const loginErrors = reactive({
  email: '',
  password: '',
})

const isRegisterMode = computed(() => {
  return !isSuccess.value && currentMode.value === 'register'
})

const validateRegisterForm = (): boolean => {
  let isValid = true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // сброс ошибок
  Object.keys(errors).forEach((key) => (errors[key] = ''))

  if (!registerForm.email.trim()) {
    errors.email = 'Email Обязателен!'
    isValid = false
  } else if (!emailRegex.test(registerForm.email)) {
    errors.email = 'Введите корректный Email!'
    isValid = false
  }

  if (!registerForm.name.trim()) {
    errors.name = 'Имя обязательно'
    isValid = false
  }

  // проверка пароля
  if (!registerForm.password) {
    errors.password = 'Пароль обязателен'
    isValid = false
  } else if (registerForm.password.length < 6) {
    errors.password = 'Пароль должен быть не менее 6 символов'
    isValid = false
  }

  // подтверждение пароля
  if (registerForm.password !== registerForm.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают'
    isValid = false
  }

  return isValid
}

const validateLoginForm = (): boolean => {
  let isValid = true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // сброс ошибок
  Object.keys(errors).forEach((key) => (loginErrors[key] = ''))

  if (!loginForm.email.trim()) {
    loginErrors.email = 'Email Обязателен'
    isValid = false
  } else if (!emailRegex.test(loginForm.email)) {
    loginErrors.email = 'Введите корректный email'
  }

  if (!loginForm.password) {
    loginErrors.password = 'Пароля обязателен'
  }

  return isValid
}

// регистрация
const handleRegister = async () => {
  if (!validateRegisterForm()) return

  serverError.value = ''

  const userData: User = {
    email: registerForm.email,
    name: registerForm.name,
    password: registerForm.password,
  }

  const { error } = await authStore.register(userData)

  if (error) {
    serverError.value = error
  } else {
    isSuccess.value = true

    loginForm.email = registerForm.email // email подставляется в логин форму

    // Сброс формы
    Object.keys(registerForm).forEach((key) => (registerForm[key] = ''))
  }
}

const goToLogin = () => {
  currentMode.value = 'login'
  isSuccess.value = false
}

// вход
const handleLogin = async () => {
  if (!validateLoginForm()) return

  serverError.value = ''
  authStore.isLoading = true

  try {
    await authStore.login({
      email: loginForm.email,
      password: loginForm.password,
    })

    emit('success')
    emit('closeModal')

    loginForm.email = ''
    loginForm.password = ''
    serverError.value = ''
  } catch (err) {
    serverError.value = err.message || 'Ошибка входа'
  } finally {
    authStore.isLoading = false
  }
}

const toggleMenu = () => {
  currentMode.value = currentMode.value === 'login' ? 'register' : 'login'
  serverError.value = ''

  // сброс ошибок
  Object.keys(errors).forEach((key) => (errors[key] = ''))
  Object.keys(loginErrors).forEach((key) => (loginErrors[key] = ''))
}
</script>

<style scoped lang="scss">
@use '../../assets/scss/global/variables' as *;

.modal {
  min-height: 23.81rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  position: relative;
  width: 26.25rem;
  background-color: $white;
  border-radius: 1.5rem;
  padding: 4rem 2.5rem 4rem 2.5rem;

  @media (max-width: 37.5rem) {
    width: 23.25rem;
  }

  @media (max-width: 25rem) {
    width: 20.25rem;
  }

  &__close-btn {
    position: absolute;
    top: 0;
    right: -17%;

    @media (max-width: 40.62rem) {
      top: 3%;
      right: 3%;
    }
  }

  &__register-menu,
  &__login-menu {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  &__user-wrapper {
    width: 100%;
  }

  &__input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__login-btn,
  &__register-btn {
    width: 100%;
  }

  &__success-registration {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 1.5rem;
  }

  &__success-text {
    font-size: $px-24;
    line-height: $px-32;
    font-weight: 700;
    color: $black;
  }

  &__success-description {
    font-size: $px-18;
    line-height: $px-24;
    font-weight: 400;
    color: $black;
    text-align: center;
  }
}

.custom-input {
  max-width: 21.25rem;
  position: relative;
  $root: &;

  &:hover,
  &:focus-within {
    #{$root}__input {
      border-color: $pink-input-hover;
    }

    #{$root}__icon {
      color: $pink-input-hover;
    }
  }

  &__label {
    position: absolute;
    top: 56%;
    left: 5%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  &__input {
    width: 100%;
    height: 3.5rem;
    padding: 1rem 1rem 1rem 3.25rem;
    border-radius: 0.5rem;
    border: 1px solid $black-40;
    outline: unset;
    font-size: $px-18;
    line-height: $px-24;

    transition: border-color $transition-300;

    &::placeholder {
      font-size: $px-18;
      line-height: $px-24;
      color: $black-40;
    }
  }

  &__icon {
    transition: color $transition-300;
    color: $black-40;
  }

  &--error {
    #{$root}__input {
      border-color: $red-error;
    }

    #{$root}__icon {
      color: $red-error;
    }
  }
}

.server-error {
  color: $red-rating;
}

.error-message {
  color: $red-rating;
}
</style>
