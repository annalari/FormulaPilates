import { WorkLog, Experimental } from './timeUtils'

// Storage keys
export const STORAGE_KEY = 'formula-pilates-storage'

// Type for stored data structure
export type SerializedWorkLog = Omit<WorkLog, 'date' | 'startTime' | 'endTime'> & {
  date: string
  startTime: string
  endTime: string
}

export type SerializedExperimental = Omit<Experimental, 'date' | 'time'> & {
  date: string
  time: string
}

export type StoredData = {
  state: {
    workLogs: SerializedWorkLog[]
    experimentals: SerializedExperimental[]
    isHydrated: boolean
    error: string | null
  }
  version: number
}

// Utility functions for safe localStorage operations
export const safeSetItem = (key: string, value: any): boolean => {
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
    return true
  } catch (error) {
    console.error('Error saving to localStorage:', error)
    return false
  }
}

export const safeGetItem = (key: string): any | null => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return null
  }
}

// Data transformation utilities
export const serializeDate = (date: Date): string => {
  return date.toISOString()
}

export const deserializeDate = (dateString: string): Date => {
  return new Date(dateString)
}

// Storage validation
export const isValidStorageData = (data: any): data is StoredData => {
  return (
    data &&
    typeof data === 'object' &&
    'state' in data &&
    'version' in data &&
    Array.isArray(data.state.workLogs) &&
    Array.isArray(data.state.experimentals)
  )
}

// Create a backup of the current storage
export const createBackup = (): boolean => {
  try {
    const currentData = safeGetItem(STORAGE_KEY)
    if (currentData) {
      const backupKey = `${STORAGE_KEY}-backup-${new Date().toISOString()}`
      return safeSetItem(backupKey, currentData)
    }
    return false
  } catch (error) {
    console.error('Error creating backup:', error)
    return false
  }
}

// Restore from the most recent backup
export const restoreFromBackup = (): boolean => {
  try {
    const backupKeys = Object.keys(localStorage).filter(key => 
      key.startsWith(`${STORAGE_KEY}-backup-`)
    )
    
    if (backupKeys.length === 0) return false
    
    // Get the most recent backup
    const mostRecentKey = backupKeys.sort().reverse()[0]
    const backupData = safeGetItem(mostRecentKey)
    
    if (backupData && isValidStorageData(backupData)) {
      return safeSetItem(STORAGE_KEY, backupData)
    }
    
    return false
  } catch (error) {
    console.error('Error restoring from backup:', error)
    return false
  }
}

// Initialize storage with default values if needed
export const initializeStorage = (): void => {
  const currentData = safeGetItem(STORAGE_KEY)
  
  if (!currentData || !isValidStorageData(currentData)) {
    const defaultData: StoredData = {
      state: {
        workLogs: [],
        experimentals: [],
        isHydrated: false,
        error: null
      },
      version: 1
    }
    safeSetItem(STORAGE_KEY, defaultData)
  }
}
