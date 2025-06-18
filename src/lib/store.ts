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

// Create the store without persist for now to avoid hydration issues
export const useAppStore = create<State & Actions>()((set) => ({
  workLogs: [],
  experimentals: [],
  isHydrated: true, // Set to true to avoid loading screen
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
}))
