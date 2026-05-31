import { create } from "zustand"

export interface OutlineChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: string[]
}

export interface OutlineChatConversation {
  id: string
  title: string
  createdAt: number
  messages: OutlineChatMessage[]
}

interface OutlineChatState {
  conversations: OutlineChatConversation[]
  activeConversationId: string | null
  streamingContent: string
  isStreaming: boolean

  createConversation: () => string
  setActiveConversation: (id: string | null) => void
  addMessage: (convId: string, msg: OutlineChatMessage) => void
  replaceLastAssistant: (convId: string, content: string, sources?: string[]) => void
  removeLastMessage: (convId: string) => void
  deleteConversation: (id: string) => void
  setStreamingContent: (content: string) => void
  setIsStreaming: (value: boolean) => void
}

export const useOutlineChatStore = create<OutlineChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  streamingContent: "",
  isStreaming: false,

  createConversation: () => {
    const id = crypto.randomUUID()
    const conv: OutlineChatConversation = {
      id,
      title: `大纲对话 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`,
      createdAt: Date.now(),
      messages: [],
    }
    set((s) => ({
      conversations: [conv, ...s.conversations],
      activeConversationId: id,
    }))
    return id
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (convId, msg) => set((s) => ({
    conversations: s.conversations.map((c) =>
      c.id === convId ? { ...c, messages: [...c.messages, msg] } : c
    ),
  })),

  replaceLastAssistant: (convId, content, sources) => set((s) => ({
    conversations: s.conversations.map((c) => {
      if (c.id !== convId) return c
      const msgs = [...c.messages]
      const lastIdx = msgs.length - 1
      if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
        msgs[lastIdx] = { ...msgs[lastIdx], content, sources }
      } else {
        msgs.push({ id: crypto.randomUUID(), role: "assistant", content, sources })
      }
      // Update title from first user message
      const firstUser = msgs.find((m) => m.role === "user")
      const title = firstUser ? firstUser.content.slice(0, 20) + (firstUser.content.length > 20 ? "..." : "") : c.title
      return { ...c, messages: msgs, title }
    }),
  })),

  removeLastMessage: (convId) => set((s) => ({
    conversations: s.conversations.map((c) =>
      c.id === convId ? { ...c, messages: c.messages.slice(0, -1) } : c
    ),
  })),

  deleteConversation: (id) => set((s) => ({
    conversations: s.conversations.filter((c) => c.id !== id),
    activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
  })),

  setStreamingContent: (content) => set({ streamingContent: content }),
  setIsStreaming: (value) => set({ isStreaming: value }),
}))
