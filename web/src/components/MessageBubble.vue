<script setup lang="ts">
import type { MessageWithSent } from '@/stores/chat'
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import ReactionPicker from './ReactionPicker.vue'

const props = defineProps<{
  message: MessageWithSent
}>()

const chatStore = useChatStore()

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

const reactions = computed(() => {
  if (!props.message.reactions) return []
  return Object.entries(props.message.reactions).map(([emoji, usernames]) => ({
    emoji,
    usernames,
    count: usernames.length,
  }))
})

const hasUserReacted = (emoji: string) => {
  if (!props.message.reactions?.[emoji]) return false
  return props.message.reactions[emoji].includes(chatStore.username || 'Anonymous')
}

const handleReactionClick = (emoji: string) => {
  chatStore.toggleReaction(props.message.id, emoji)
}

const handleEmojiSelect = (emoji: string) => {
  chatStore.toggleReaction(props.message.id, emoji)
}
</script>

<template>
  <article
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mb-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
  >
    <!-- Post Header -->
    <div class="px-4 pt-3 pb-2 flex items-center gap-2">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center"
        >
          <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">
            {{ message.username.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{
            message.username
          }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ formattedTime }}</span>
        </div>
      </div>
    </div>

    <!-- Post Content -->
    <div class="px-4 pb-3">
      <!-- Text content -->
      <div
        v-if="message.content"
        class="text-base leading-relaxed text-gray-900 dark:text-gray-100 mb-3"
      >
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

      <!-- Reactions -->
      <div v-if="reactions.length > 0" class="flex flex-wrap gap-2 mb-2">
        <button
          v-for="reaction in reactions"
          :key="reaction.emoji"
          @click="handleReactionClick(reaction.emoji)"
          :class="[
            'flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors',
            hasUserReacted(reaction.emoji)
              ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600',
          ]"
          type="button"
        >
          <span>{{ reaction.emoji }}</span>
          <span
            :class="[
              'text-xs font-medium',
              hasUserReacted(reaction.emoji)
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300',
            ]"
          >
            {{ reaction.count }}
          </span>
        </button>
      </div>

      <!-- Add Reaction Button -->
      <div class="flex items-center gap-2">
        <ReactionPicker :on-select="handleEmojiSelect" />
        <span class="text-xs text-gray-500 dark:text-gray-400">Add reaction</span>
      </div>
    </div>
  </article>
</template>
