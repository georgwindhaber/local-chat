<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useThemeStore } from '@/stores/theme'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const chatStore = useChatStore()
const messagesContainer = ref<HTMLDivElement | null>(null)
const isScrolledToBottom = ref(true)
const usernameInput = ref('')
const showUsernameInput = ref(false)

const saveUsername = () => {
  if (usernameInput.value.trim()) {
    chatStore.setUsername(usernameInput.value.trim())
    showUsernameInput.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const handleScroll = () => {
  if (!messagesContainer.value) return

  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  isScrolledToBottom.value = scrollHeight - scrollTop - clientHeight < 100
}

// Auto-scroll when new messages arrive
const unwatch = chatStore.$subscribe(() => {
  if (isScrolledToBottom.value) {
    scrollToBottom()
  }
})

onMounted(() => {
  usernameInput.value = chatStore.username
  chatStore.connect()
  scrollToBottom()
})

onUnmounted(() => {
  unwatch()
  chatStore.disconnect()
})
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm relative"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1 flex items-center gap-4">
          <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Feed</h1>
          <RouterLink
            to="/settings"
            class="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Settings
          </RouterLink>
          <div class="flex items-center gap-2 mt-1">
            <div
              :class="[
                'w-2 h-2 rounded-full',
                chatStore.isConnected ? 'bg-green-500' : 'bg-red-500',
              ]"
            />
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ chatStore.isConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
        </div>
        <!-- Username Input and Theme Toggle -->
        <div class="flex items-center gap-3">
          <!-- Dark Mode Toggle -->
          <button
            @click="themeStore.toggleTheme"
            class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            type="button"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg
              v-if="!isDark"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-600 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-600 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </button>
          <div v-if="!showUsernameInput" class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-300">{{
              chatStore.username || 'Anonymous'
            }}</span>
            <button
              @click="showUsernameInput = true"
              class="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
            >
              Edit
            </button>
          </div>
          <div v-else class="flex items-center gap-2">
            <input
              v-model="usernameInput"
              @keyup.enter="saveUsername"
              @blur="saveUsername"
              placeholder="Username"
              class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              autofocus
            />
            <button
              @click="saveUsername"
              class="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div
      ref="messagesContainer"
      @scroll="handleScroll"
      class="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900"
    >
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div
          v-if="chatStore.sortedMessages.length === 0"
          class="text-center text-gray-400 dark:text-gray-500 mt-8"
        >
          No posts yet. Start a conversation!
        </div>

        <MessageBubble
          v-for="message in chatStore.sortedMessages"
          :key="message.id"
          :message="message"
        />
      </div>
    </div>

    <!-- Input Area -->
    <ChatInput />
  </div>
</template>
