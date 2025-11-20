<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  onSelect: (emoji: string) => void
}>()

const showPicker = ref(false)
const pickerRef = ref<HTMLDivElement | null>(null)
const commonEmojis = [
  '👍',
  '❤️',
  '😂',
  '😮',
  '😢',
  '🙏',
  '🔥',
  '🎉',
  '👏',
  '💯',
  '💩',
  '😍',
  '🤔',
  '😴',
  '🤮',
  '😡',
  '🥳',
  '🤯',
  '😱',
  '🤝',
]

const selectEmoji = (emoji: string) => {
  props.onSelect(emoji)
  showPicker.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (pickerRef.value && !pickerRef.value.contains(event.target as Node)) {
    showPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="pickerRef" class="relative">
    <button
      @click.stop="showPicker = !showPicker"
      class="w-8 h-8 flex items-center justify-center bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded-full transition-colors"
      type="button"
    >
      <span class="text-sm">😀</span>
    </button>

    <div
      v-if="showPicker"
      @click.stop
      class="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-10 w-56"
    >
      <div class="grid grid-cols-5 gap-1">
        <button
          v-for="emoji in commonEmojis"
          :key="emoji"
          @click="selectEmoji(emoji)"
          class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl transition-colors"
          type="button"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>
