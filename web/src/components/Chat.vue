<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'

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
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 shadow-sm relative">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h1 class="text-xl font-semibold text-gray-900">Feed</h1>
          <div class="flex items-center gap-2 mt-1">
            <div
              :class="[
                'w-2 h-2 rounded-full',
                chatStore.isConnected ? 'bg-green-500' : 'bg-red-500',
              ]"
            />
            <span class="text-xs text-gray-500">
              {{ chatStore.isConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
        </div>
        <!-- Username Input -->
        <div class="flex items-center gap-2">
          <div v-if="!showUsernameInput" class="flex items-center gap-2">
            <span class="text-sm text-gray-600">{{ chatStore.username || 'Anonymous' }}</span>
            <button
              @click="showUsernameInput = true"
              class="text-sm text-blue-500 hover:text-blue-600"
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
              class="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autofocus
            />
            <button @click="saveUsername" class="text-sm text-blue-500 hover:text-blue-600">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div ref="messagesContainer" @scroll="handleScroll" class="flex-1 overflow-y-auto bg-gray-100">
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div v-if="chatStore.sortedMessages.length === 0" class="text-center text-gray-400 mt-8">
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
