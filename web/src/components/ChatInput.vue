<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const messageText = ref('')
const imagePreview = ref<string | null>(null)
const imageData = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const adjustTextareaHeight = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 128)}px`
    }
  })
}

watch(messageText, () => {
  adjustTextareaHeight()
})

const canSend = computed(() => {
  return messageText.value.trim().length > 0 || imageData.value !== null
})

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    imagePreview.value = result
    imageData.value = result
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  imagePreview.value = null
  imageData.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const sendMessage = () => {
  if (!canSend.value) return

  const content = messageText.value.trim() || null
  chatStore.sendMessage(content, imageData.value)

  // Reset form
  messageText.value = ''
  removeImage()
  adjustTextareaHeight()
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="border-t border-gray-200 bg-white p-3">
    <!-- Image Preview -->
    <div v-if="imagePreview" class="mb-2 relative inline-block">
      <img :src="imagePreview" alt="Preview" class="h-20 w-20 object-cover rounded-lg" />
      <button
        @click="removeImage"
        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
      >
        ×
      </button>
    </div>

    <!-- Input Area -->
    <div class="flex items-end gap-2">
      <!-- Image Button -->
      <button
        @click="fileInputRef?.click()"
        class="shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleImageSelect"
      />

      <!-- Text Input -->
      <textarea
        ref="textareaRef"
        v-model="messageText"
        @keydown="handleKeyPress"
        @input="adjustTextareaHeight"
        placeholder="Message"
        rows="1"
        class="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 overflow-y-auto"
      />

      <!-- Send Button -->
      <button
        @click="sendMessage"
        :disabled="!canSend"
        :class="[
          'shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors',
          canSend
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed',
        ]"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
