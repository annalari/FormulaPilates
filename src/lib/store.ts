import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WorkLog, Experimental } from './timeUtils'

type State = {
  workLogs: WorkLog[]
  experimentals: Experimental[]
  isHydrated: boolean
  error: string | null
}

type Actions = {
  addWorkLog: (log: WorkLog) => void
  addExperimental: (exp: Experimental) => void
  clearWorkLogs: () => void
  clearExperimentals: () => void
  setHydrated: () => void
  setError: (error: string | null) => void
}

export const useAppStore = create<State & Actions>()(
  persist(
    (set) => ({
      workLogs: [],
      experimentals: [],
      isHydrated: false,
      error: null,
      setHydrated: () => set({ isHydrated: true }),
      setError: (error) => set({ error }),
      addWorkLog: (log: WorkLog) => {
        set((state) => ({
          workLogs: [...state.workLogs, log],
          error: null
        }))
      },
      addExperimental: (exp: Experimental) => {
        set((state) => ({
          experimentals: [...state.experimentals, exp],
          error: null
        }))
      },
      clearWorkLogs: () => {
        set((state) => ({
          ...state,
          workLogs: [],
          error: null
        }))
      },
      clearExperimentals: () => {
        set((state) => ({
          ...state,
          experimentals: [],
          error: null
        }))
      }
    }),
    {
      name: 'formula-pilates-storage',
    }
  )
)
