<script setup lang="ts">
import type { MessageWithSent } from '@/stores/chat'
import { computed } from 'vue'

const props = defineProps<{
  message: MessageWithSent
}>()

const formattedTime = computed(() => {
  const date = new Date(props.message.timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})
</script>

<template>
  <article
    class="bg-white border border-gray-200 rounded-md mb-4 hover:border-gray-300 transition-colors"
  >
    <!-- Post Header -->
    <div class="px-4 pt-3 pb-2 flex items-center gap-2">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <span class="text-xs font-semibold text-gray-600">
            {{ message.username.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-semibold text-gray-900">{{ message.username }}</span>
          <span class="text-xs text-gray-500">{{ formattedTime }}</span>
        </div>
      </div>
    </div>

    <!-- Post Content -->
    <div class="px-4 pb-3">
      <!-- Text content -->
      <div v-if="message.content" class="text-base leading-relaxed text-gray-900 mb-3">
        {{ message.content }}
      </div>

      <!-- Image if present -->
      <div v-if="message.image" class="mb-3">
        <img
          :src="message.image"
          alt="Post image"
          class="w-full h-auto rounded-md max-h-96 object-contain"
        />
      </div>
    </div>
  </article>
</template>
