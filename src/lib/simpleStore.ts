import { create } from 'zustand'
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
  loadFromStorage: () => void
  setHydrated: () => void
  clearAllData: () => void
}

// Safe localStorage operations
const saveToStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }
}

const loadFromStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }
  return null
}

export const useSimpleStore = create<State & Actions>((set, get) => ({
  workLogs: [],
  experimentals: [],
  isHydrated: false,
  
  setHydrated: () => set({ isHydrated: true }),
  
  loadFromStorage: () => {
    // Try to load from new format first
    let savedWorkLogs = loadFromStorage('formula-pilates-workLogs')
    let savedExperimentals = loadFromStorage('formula-pilates-experimentals')
    
    // If not found, try to load from old persist format
    if (!savedWorkLogs || !savedExperimentals) {
      const oldData = loadFromStorage('formula-pilates-storage')
      
      if (oldData && oldData.state) {
        savedWorkLogs = savedWorkLogs || oldData.state.workLogs
        savedExperimentals = savedExperimentals || oldData.state.experimentals
      }
    }
    
    // Convert date strings back to Date objects with error handling
    const workLogs = savedWorkLogs ? savedWorkLogs.map((log: any) => {
      try {
        return {
          ...log,
          date: new Date(log.date),
          startTime: new Date(log.startTime),
          endTime: new Date(log.endTime)
        }
      } catch (error) {
        console.error('Error converting work log dates:', error)
        return null
      }
    }).filter(Boolean) : []
    
    const experimentals = savedExperimentals ? savedExperimentals.map((exp: any) => {
      try {
        return {
          ...exp,
          date: new Date(exp.date),
          time: new Date(exp.time)
        }
      } catch (error) {
        console.error('Error converting experimental dates:', error)
        return null
      }
    }).filter(Boolean) : []
    
    set({
      workLogs,
      experimentals,
      isHydrated: true
    })
  },
  
  addWorkLog: (log: WorkLog) => {
    set((state) => {
      const newWorkLogs = [...state.workLogs, log]
      saveToStorage('formula-pilates-workLogs', newWorkLogs)
      return { workLogs: newWorkLogs, isHydrated: true }
    })
  },
  
  addExperimental: (exp: Experimental) => {
    set((state) => {
      const newExperimentals = [...state.experimentals, exp]
      saveToStorage('formula-pilates-experimentals', newExperimentals)
      return { experimentals: newExperimentals, isHydrated: true }
    })
  },
  
  clearWorkLogs: () => {
    set({ workLogs: [] })
    saveToStorage('formula-pilates-workLogs', [])
  },
  
  clearExperimentals: () => {
    set({ experimentals: [] })
    saveToStorage('formula-pilates-experimentals', [])
  },
  
  clearAllData: () => {
    // Clear all localStorage data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('formula-pilates-storage')
      localStorage.removeItem('formula-pilates-workLogs')
      localStorage.removeItem('formula-pilates-experimentals')
    }
    set({
      workLogs: [],
      experimentals: [],
      isHydrated: true
    })
  }
}))
