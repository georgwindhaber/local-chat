import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Message {
  id: number
  content: string | null
  image: string | null
  timestamp: number
}

export interface MessageWithSent extends Message {
  isSent?: boolean
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<MessageWithSent[]>([])
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)
  const pendingMessages = ref<
    Array<{ content: string | null; image: string | null; timestamp: number }>
  >([])

  const connect = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = import.meta.env.VITE_WS_URL || 'localhost:3000'
      const wsUrl = `${protocol}//${host}/chat`

      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        console.log('WebSocket connected')
        isConnected.value = true
        connectionError.value = null
      }

      ws.value.onmessage = (event) => {
        try {
          const message: MessageWithSent = JSON.parse(event.data)
          // Check if message already exists (avoid duplicates)
          if (!messages.value.find((m) => m.id === message.id)) {
            // Check if this message matches a pending one (sent by us)
            const pendingIndex = pendingMessages.value.findIndex(
              (pending) =>
                pending.content === message.content &&
                pending.image === message.image &&
                Math.abs(pending.timestamp - message.timestamp) < 5000, // Within 5 seconds
            )

            if (pendingIndex !== -1) {
              message.isSent = true
              pendingMessages.value.splice(pendingIndex, 1)
            }

            messages.value.push(message)
          }
        } catch (error) {
          console.error('Error parsing message:', error)
        }
      }

      ws.value.onclose = () => {
        console.log('WebSocket disconnected')
        isConnected.value = false
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (!isConnected.value) {
            connect()
          }
        }, 3000)
      }

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error)
        connectionError.value = 'Failed to connect to chat server'
        isConnected.value = false
      }
    } catch (error) {
      console.error('Error creating WebSocket:', error)
      connectionError.value = 'Failed to create WebSocket connection'
    }
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
      isConnected.value = false
    }
  }

  const sendMessage = (content: string | null, image: string | null) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected')
      return
    }

    if (!content && !image) {
      console.error('Message must have either content or image')
      return
    }

    // Track this as a pending message (sent by us)
    pendingMessages.value.push({
      content,
      image,
      timestamp: Date.now(),
    })

    const messageData: { content?: string; image?: string } = {}
    if (content) messageData.content = content
    if (image) messageData.image = image

    ws.value.send(JSON.stringify(messageData))
  }

  const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) => a.timestamp - b.timestamp)
  })

  return {
    messages,
    ws,
    isConnected,
    connectionError,
    connect,
    disconnect,
    sendMessage,
    sortedMessages,
  }
})
