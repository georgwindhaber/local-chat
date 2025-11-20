<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const chatStore = useChatStore()
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const usernameInput = ref('')
const showSaveSuccess = ref(false)

onMounted(() => {
  usernameInput.value = chatStore.username
})

const saveUsername = () => {
  if (usernameInput.value.trim()) {
    chatStore.setUsername(usernameInput.value.trim())
    showSaveSuccess.value = true
    setTimeout(() => {
      showSaveSuccess.value = false
    }, 2000)
  }
}
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="router.push('/')"
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
        </div>
      </div>
    </div>

    <!-- Settings Content -->
    <div class="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
      <div class="max-w-2xl mx-auto px-4 py-6">
        <!-- Username Section -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-4"
        >
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Username</h2>
          <div class="flex items-center gap-3">
            <input
              v-model="usernameInput"
              @keyup.enter="saveUsername"
              placeholder="Enter your username"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <button
              @click="saveUsername"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              Save
            </button>
          </div>
          <p v-if="showSaveSuccess" class="mt-2 text-sm text-green-600 dark:text-green-400">
            Username saved successfully!
          </p>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your username will be displayed with your messages.
          </p>
        </div>

        <!-- Theme Section -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-4"
        >
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h2>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Toggle between light and dark theme
              </p>
            </div>
            <button
              @click="themeStore.toggleTheme"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :class="isDark ? 'bg-blue-600' : 'bg-gray-200'"
              type="button"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="isDark ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>

        <!-- Connection Status Section -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Connection Status
          </h2>
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-3 h-3 rounded-full',
                chatStore.isConnected ? 'bg-green-500' : 'bg-red-500',
              ]"
            />
            <span class="text-sm text-gray-900 dark:text-gray-100">
              {{ chatStore.isConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            WebSocket connection to the chat server.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
