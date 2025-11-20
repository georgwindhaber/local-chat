<script setup lang="ts">
import type { MessageWithSent } from '@/stores/chat'
import { computed } from 'vue'

const props = defineProps<{
  message: MessageWithSent
}>()

const isSent = computed(() => {
  return props.message.isSent ?? false
})

const formattedTime = computed(() => {
  const date = new Date(props.message.timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
})
</script>

<template>
  <div :class="['flex flex-col mb-3', isSent ? 'items-end' : 'items-start']">
    <!-- Username -->
    <div v-if="!isSent" class="text-xs text-gray-500 mb-1 px-1">
      {{ message.username }}
    </div>

    <div
      :class="[
        'max-w-[75%] rounded-2xl px-4 py-2 shadow-sm',
        isSent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900',
      ]"
    >
      <!-- Image if present -->
      <div v-if="message.image" class="mb-2">
        <img :src="message.image" alt="Message image" class="max-w-full h-auto rounded-lg" />
      </div>

      <!-- Text content -->
      <div v-if="message.content" class="text-sm leading-relaxed">
        {{ message.content }}
      </div>

      <!-- Timestamp -->
      <div :class="['text-xs mt-1', isSent ? 'text-blue-100' : 'text-gray-500']">
        {{ formattedTime }}
      </div>
    </div>
  </div>
</template>
