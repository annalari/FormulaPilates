import { create } from 'zustand'
import { generateNewUserEmailTemplate } from '@/app/api/send-email/route'

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  isFirstLogin: boolean
  isActive: boolean // New field to track activation status
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  updatePassword: (newPassword: string) => Promise<void>
  createUser: (email: string) => Promise<void> // Admin only
  getAllUsers: () => User[] // Admin only
  deleteUser: (userId: string) => Promise<void> // Admin only
  getUserById: (userId: string) => User | null // Admin only
  getUserWorkLogs: (userId: string) => any[] // Admin only - Get user's work logs
  calculateUserMonthlyEarnings: (userId: string) => number // Admin only - Calculate user's monthly earnings
}

// Simulated users database (replace with real backend later)
const USERS: User[] = [
  {
    id: '1',
    email: 'admin@formula.com',
    role: 'admin',
    isFirstLogin: false,
    isActive: true
  },
  {
    id: '2',
    email: 'funcionario1@formula.com',
    role: 'user',
    isFirstLogin: false,
    isActive: true
  },
  {
    id: '3',
    email: 'funcionario2@formula.com',
    role: 'user',
    isFirstLogin: true,
    isActive: false // Inactive until first login and password change
  },
  {
    id: '4',
    email: 'annalarissa.mmm@gmail.com',
    role: 'user',
    isFirstLogin: false,
    isActive: true
  }
]

// Simulated password storage (replace with real backend later)
const PASSWORDS: { [key: string]: string } = {
  'admin@formula.com': 'admin123',
  'funcionario1@formula.com': 'func123',
  'funcionario2@formula.com': 'changeme123',
  'annalarissa.mmm@gmail.com': 'test123'
}

export const useAuth = create<AuthState>((set, get) => ({
  getAllUsers: () => {
    const { user: currentUser } = get()
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized')
    }
    return USERS.filter(u => u.role === 'user')
  },

  deleteUser: async (userId: string) => {
    const { user: currentUser } = get()
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const userIndex = USERS.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        throw new Error('User not found')
      }

      // Don't allow deleting admin users
      if (USERS[userIndex].role === 'admin') {
        throw new Error('Cannot delete admin users')
      }

      // Store email before removing user
      const userEmail = USERS[userIndex].email

      // Remove user from arrays
      USERS.splice(userIndex, 1)
      delete PASSWORDS[userEmail]
    } catch (error) {
      throw error
    }
  },

  getUserById: (userId: string) => {
    const { user: currentUser } = get()
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    return USERS.find(u => u.id === userId) || null
  },

  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user = USERS.find(u => u.email === email)
      const storedPassword = PASSWORDS[email]
      
      if (!user || !storedPassword || storedPassword !== password) {
        throw new Error('Invalid email or password')
      }
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false
      })
      
      // Save auth state to localStorage and cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify({ user }))
        // Set cookie for middleware access
        document.cookie = `auth=${JSON.stringify({ user })}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
      }
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false
    })
    
    // Clear auth state from localStorage and cookies
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth')
      // Clear cookie
      document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  },

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user
    })
  },

  updatePassword: async (newPassword: string) => {
    const { user } = get()
    if (!user) throw new Error('Not authenticated')
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update password in our simulated storage
      PASSWORDS[user.email] = newPassword
      
      // Update first login status AND activate the user
      const userIndex = USERS.findIndex(u => u.id === user.id)
      if (userIndex >= 0) {
        USERS[userIndex] = { 
          ...user, 
          isFirstLogin: false,
          isActive: true // User becomes active after setting new password
        }
        set({ user: USERS[userIndex] })
        
        // Update localStorage and cookies with new user state
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify({ user: USERS[userIndex] }))
          // Update cookie for middleware access
          document.cookie = `auth=${JSON.stringify({ user: USERS[userIndex] })}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
        }
      }
    } catch (error) {
      throw new Error('Failed to update password')
    }
  },

  createUser: async (email: string) => {
    const { user: currentUser } = get()
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized')
    }
    
    try {
      // Check if user already exists
      if (USERS.some(u => u.email === email)) {
        throw new Error('User already exists')
      }
      
      // Create new user with temporary password - INACTIVE until first login
      const newUser: User = {
        id: Date.now().toString(),
        email,
        role: 'user',
        isFirstLogin: true,
        isActive: false // New users start as inactive
      }
      
      // Generate a more secure temporary password
      const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)
      
      // Add user to our simulated database
      USERS.push(newUser)
      PASSWORDS[email] = tempPassword
      
      // Send welcome email with credentials
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Bem-vindo ao Formula Pilates - Suas Credenciais de Acesso',
          ...generateNewUserEmailTemplate(email, tempPassword)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send welcome email')
      }
    } catch (error) {
      throw error
    }
  },

  getUserWorkLogs: (userId: string) => {
    const { user: currentUser } = get()
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    if (typeof window === 'undefined') return []
    
    try {
      const STORAGE_VERSION = '2.0.0'
      const STORAGE_PREFIX = 'formula-pilates'
      const storageKey = `${STORAGE_PREFIX}-workLogs-v${STORAGE_VERSION}`
      
      // Try to load from new versioned format first
      let allWorkLogs = localStorage.getItem(storageKey)
      
      // If not found, try to load from old formats
      if (!allWorkLogs) {
        const oldKeys = [
          'formula-pilates-workLogs',
          'formula-pilates-storage'
        ]
        
        for (const key of oldKeys) {
          const oldData = localStorage.getItem(key)
          if (oldData) {
            try {
              let parsedData = JSON.parse(oldData)
              
              // Handle old persist format
              if (key === 'formula-pilates-storage' && parsedData.state) {
                parsedData = parsedData.state.workLogs
              }
              
              if (Array.isArray(parsedData)) {
                // Migrate data to new format
                const migratedData = parsedData.map((log: any) => ({
                  ...log,
                  userId: log.userId || '2' // Default to funcionario1's ID
                }))
                
                // Save in new format and clean up old data
                localStorage.setItem(storageKey, JSON.stringify(migratedData))
                localStorage.removeItem(key)
                
                allWorkLogs = JSON.stringify(migratedData)
                break
              }
            } catch (error) {
              console.error(`Failed to migrate data from ${key}:`, error)
            }
          }
        }
      }
      
      if (!allWorkLogs) return []
      
      const workLogs = JSON.parse(allWorkLogs)
      
      // Filter work logs by userId and convert date strings back to Date objects
      return Array.isArray(workLogs) ? workLogs
        .filter((log: any) => log.userId === userId)
        .map((log: any) => {
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
        })
        .filter(Boolean) : []
    } catch (error) {
      console.error('Error loading user work logs:', error)
      return []
    }
  },

  calculateUserMonthlyEarnings: (userId: string) => {
    const { getUserWorkLogs } = get()
    const workLogs = getUserWorkLogs(userId)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const monthLogs = workLogs.filter((log: any) => {
      const logDate = new Date(log.date)
      return logDate >= monthStart && logDate <= monthEnd
    })

    let total = 0
    for (const log of monthLogs) {
      if (typeof log.earnings === 'number') {
        total += log.earnings
      }
    }

    return total
  }
}))

// Initialize auth state from localStorage on client side only
const initializeAuth = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth')
    if (stored) {
      try {
        const { user } = JSON.parse(stored)
        useAuth.getState().setUser(user)
      } catch (error) {
        console.error('Failed to restore auth state:', error)
      }
    }
  }
}

// Call initialization after a delay to prevent hydration issues
if (typeof window !== 'undefined') {
  setTimeout(initializeAuth, 0)
}
