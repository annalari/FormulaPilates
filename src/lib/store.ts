import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { WorkLog, Experimental } from './timeUtils'

type State = {
  workLogs: WorkLog[]
  experimentals: Experimental[]
  isHydrated: boolean
}

type Actions = {
  addWorkLog: (log: WorkLog) => void
  addExperimental: (exp: Experimental) => void
  clearWorkLogs: () => void
  clearExperimentals: () => void
  setHydrated: () => void
}

export const useAppStore = create<State & Actions>()(
  persist(
    (set) => ({
      workLogs: [],
      experimentals: [],
      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),
      addWorkLog: (log: WorkLog) =>
        set((state) => ({
          workLogs: [...state.workLogs, log],
        })),
      addExperimental: (exp: Experimental) =>
        set((state) => ({
          experimentals: [...state.experimentals, exp],
        })),
      clearWorkLogs: () =>
        set((state) => ({
          ...state,
          workLogs: [],
        })),
      clearExperimentals: () =>
        set((state) => ({
          ...state,
          experimentals: [],
        })),
    }),
    {
      name: 'formula-pilates-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated()
        }
      },
    }
  )
)
