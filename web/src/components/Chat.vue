<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'

const chatStore = useChatStore()
const messagesContainer = ref<HTMLDivElement | null>(null)
const isScrolledToBottom = ref(true)

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
    <div class="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <h1 class="text-xl font-semibold text-gray-900">Messages</h1>
      <div class="flex items-center gap-2 mt-1">
        <div
          :class="['w-2 h-2 rounded-full', chatStore.isConnected ? 'bg-green-500' : 'bg-red-500']"
        />
        <span class="text-xs text-gray-500">
          {{ chatStore.isConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
    </div>

    <!-- Messages Container -->
    <div ref="messagesContainer" @scroll="handleScroll" class="flex-1 overflow-y-auto px-4 py-4">
      <div v-if="chatStore.sortedMessages.length === 0" class="text-center text-gray-400 mt-8">
        No messages yet. Start a conversation!
      </div>

      <MessageBubble
        v-for="message in chatStore.sortedMessages"
        :key="message.id"
        :message="message"
      />
    </div>

    <!-- Input Area -->
    <ChatInput />
  </div>
</template>
