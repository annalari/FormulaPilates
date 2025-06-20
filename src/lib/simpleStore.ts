import { create } from 'zustand'
import { WorkLog, Experimental } from './timeUtils'

type State = {
  workLogs: WorkLog[]
  experimentals: Experimental[]
  isHydrated: boolean
}

type Actions = {
  addWorkLog: (log: WorkLog) => void
  updateWorkLog: (log: WorkLog) => void
  deleteWorkLog: (id: string) => void
  addExperimental: (exp: Experimental) => void
  clearWorkLogs: () => void
  clearExperimentals: () => void
  loadFromStorage: () => void
  setHydrated: () => void
  clearAllData: () => void
}

// Safe localStorage operations
const STORAGE_VERSION = '2.0.0'
const STORAGE_PREFIX = 'formula-pilates'

const getStorageKey = (key: string) => `${STORAGE_PREFIX}-${key}-v${STORAGE_VERSION}`

const saveToStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    try {
      const storageKey = getStorageKey(key)
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }
}

const loadFromStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    try {
      // Try to load from new versioned format first
      const storageKey = getStorageKey(key)
      const item = localStorage.getItem(storageKey)
      
      if (item) {
        console.log(`Loaded from localStorage key: ${storageKey}`, item)
        return JSON.parse(item)
      }
      
      // If not found, try to load from old format and migrate
      const oldKeys = [
        `${STORAGE_PREFIX}-${key}`,
        key,
        `${STORAGE_PREFIX}-storage`
      ]
      
      for (const oldKey of oldKeys) {
        const oldData = localStorage.getItem(oldKey)
        if (oldData) {
          console.log(`Found data in old format: ${oldKey}`, oldData)
          try {
            let parsedData = JSON.parse(oldData)
            
            // Handle old persist format
            if (oldKey === `${STORAGE_PREFIX}-storage` && parsedData.state) {
              parsedData = parsedData.state
            }
            
            // Migrate data to new format
            if (key === 'workLogs' && Array.isArray(parsedData)) {
              parsedData = parsedData.map((log: any) => ({
                ...log,
                userId: log.userId || '2', // Default to funcionario1's ID
                date: new Date(log.date),
                startTime: new Date(log.startTime),
                endTime: new Date(log.endTime)
              }))
            } else if (key === 'experimentals' && Array.isArray(parsedData)) {
              parsedData = parsedData.map((exp: any) => ({
                ...exp,
                date: new Date(exp.date),
                time: new Date(exp.time)
              }))
            }
            
            // Save migrated data in new format
            saveToStorage(key, parsedData)
            
            // Clean up old data
            localStorage.removeItem(oldKey)
            
            return parsedData
          } catch (error) {
            console.error(`Failed to migrate data from ${oldKey}:`, error)
          }
        }
      }
      
      return null
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
    if (typeof window === 'undefined') return
    
    console.log('loadFromStorage called')
    
    try {
      // Load data using the new versioned storage system
      let savedWorkLogs = loadFromStorage('workLogs')
      let savedExperimentals = loadFromStorage('experimentals')
      
      // Convert date strings back to Date objects with error handling
      const workLogs = Array.isArray(savedWorkLogs) ? savedWorkLogs.map((log: any) => {
        try {
          return {
            ...log,
            userId: log.userId || '2', // Default to funcionario1's ID if missing
            date: new Date(log.date),
            startTime: new Date(log.startTime),
            endTime: new Date(log.endTime)
          }
        } catch (error) {
          console.error('Error converting work log dates:', error)
          return null
        }
      }).filter(Boolean) : []
      
      const experimentals = Array.isArray(savedExperimentals) ? savedExperimentals.map((exp: any) => {
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
      
      console.log('Setting store state with loaded data:', { workLogs: workLogs.length, experimentals: experimentals.length })
      
      set({
        workLogs,
        experimentals,
        isHydrated: true
      })
    } catch (error) {
      console.error('Error loading from storage:', error)
      set({ isHydrated: true })
    }
  },
  
  addWorkLog: (log: WorkLog) => {
    set((state) => {
      const newWorkLogs = [...state.workLogs, log]
      saveToStorage('workLogs', newWorkLogs)
      return { workLogs: newWorkLogs, isHydrated: true }
    })
  },

  updateWorkLog: (updatedLog: WorkLog) => {
    set((state) => {
      const updatedWorkLogs = state.workLogs.map(log =>
        log.id === updatedLog.id ? updatedLog : log
      )
      saveToStorage('workLogs', updatedWorkLogs)
      return { workLogs: updatedWorkLogs }
    })
  },

  deleteWorkLog: (id: string) => {
    set((state) => {
      const filteredWorkLogs = state.workLogs.filter(log => log.id !== id)
      saveToStorage('workLogs', filteredWorkLogs)
      return { workLogs: filteredWorkLogs }
    })
  },
  
  addExperimental: (exp: Experimental) => {
    set((state) => {
      const newExperimentals = [...state.experimentals, exp]
      saveToStorage('experimentals', newExperimentals)
      return { experimentals: newExperimentals, isHydrated: true }
    })
  },
  
  clearWorkLogs: () => {
    set({ workLogs: [] })
    saveToStorage('workLogs', [])
  },
  
  clearExperimentals: () => {
    set({ experimentals: [] })
    saveToStorage('experimentals', [])
  },
  
  clearAllData: () => {
    // Clear all localStorage data
    if (typeof window !== 'undefined') {
      const oldKeys = [
        'formula-pilates-storage',
        'formula-pilates-workLogs',
        'formula-pilates-experimentals',
        getStorageKey('workLogs'),
        getStorageKey('experimentals')
      ]
      oldKeys.forEach(key => localStorage.removeItem(key))
    }
    set({
      workLogs: [],
      experimentals: [],
      isHydrated: true
    })
  }
}))
