import { create } from "zustand"
import {
  createCustomPrompt,
  DEFAULT_PROMPT_CONFIG,
  mergePromptConfig,
  type CustomPrompt,
  type ProjectPromptConfig,
  type PromptConfig,
  type PromptConfigKey,
  type PromptConfigSelection,
} from "@/lib/novel/prompt-config-defaults"
import { getPromptTemplate, saveProjectPromptConfig } from "@/lib/novel/prompt-config-storage"

interface PromptConfigState {
  config: PromptConfig
  customPrompts: CustomPrompt[]
  projectPath: string | null
  dirty: boolean
  selected: PromptConfigSelection
  setConfig: (config: PromptConfig) => void
  loadForProject: (projectPath: string, data: ProjectPromptConfig) => void
  setSelected: (selected: PromptConfigSelection) => void
  updateTemplate: (key: PromptConfigKey, template: string) => void
  resetTemplate: (key: PromptConfigKey) => void
  resetAll: () => void
  addCustomPrompt: () => void
  updateCustomPrompt: (id: string, patch: Partial<Pick<CustomPrompt, "name" | "variableName" | "content">>) => void
  removeCustomPrompt: (id: string) => void
  save: () => Promise<void>
  getTemplate: (key: PromptConfigKey) => string
}

export const usePromptConfigStore = create<PromptConfigState>((set, get) => ({
  config: { ...DEFAULT_PROMPT_CONFIG },
  customPrompts: [],
  projectPath: null,
  dirty: false,
  selected: { kind: "builtin", key: "outlineGeneration" },

  setConfig: (config) => set({ config: mergePromptConfig(config), dirty: false }),

  loadForProject: (projectPath, data) =>
    set({
      projectPath,
      config: mergePromptConfig(data.templates),
      customPrompts: data.customPrompts,
      dirty: false,
      selected: { kind: "builtin", key: "outlineGeneration" },
    }),

  setSelected: (selected) => set({ selected }),

  updateTemplate: (key, template) =>
    set((state) => ({
      config: { ...state.config, [key]: template },
      dirty: true,
    })),

  resetTemplate: (key) =>
    set((state) => ({
      config: { ...state.config, [key]: DEFAULT_PROMPT_CONFIG[key] },
      dirty: true,
    })),

  resetAll: () =>
    set((state) => ({
      config: { ...DEFAULT_PROMPT_CONFIG },
      dirty: true,
      customPrompts: state.customPrompts,
    })),

  addCustomPrompt: () => {
    const item = createCustomPrompt()
    set((state) => ({
      customPrompts: [...state.customPrompts, item],
      selected: { kind: "custom", id: item.id },
      dirty: true,
    }))
  },

  updateCustomPrompt: (id, patch) =>
    set((state) => ({
      customPrompts: state.customPrompts.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
      dirty: true,
    })),

  removeCustomPrompt: (id) =>
    set((state) => {
      const nextCustomPrompts = state.customPrompts.filter((item) => item.id !== id)
      const selected =
        state.selected.kind === "custom" && state.selected.id === id
          ? { kind: "builtin" as const, key: "outlineGeneration" as PromptConfigKey }
          : state.selected
      return {
        customPrompts: nextCustomPrompts,
        selected,
        dirty: true,
      }
    }),

  save: async () => {
    const { projectPath, config, customPrompts } = get()
    if (!projectPath) return
    await saveProjectPromptConfig(projectPath, { templates: config, customPrompts })
    set({ dirty: false })
  },

  getTemplate: (key) => getPromptTemplate(get().config, key),
}))
