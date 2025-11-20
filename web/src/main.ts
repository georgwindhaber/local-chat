import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './styles/global.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize theme store after Pinia is set up
import { useThemeStore } from './stores/theme'
useThemeStore()

app.mount('#app')
