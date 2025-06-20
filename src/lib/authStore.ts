import { create } from 'zustand'

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  isFirstLogin: boolean
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
}

// Simulated users database (replace with real backend later)
const USERS: User[] = [
  {
    id: '1',
    email: 'admin@formula.com',
    role: 'admin',
    isFirstLogin: false
  }
]

// Simulated password storage (replace with real backend later)
const PASSWORDS: { [key: string]: string } = {
  'admin@formula.com': 'admin123'
}

export const useAuth = create<AuthState>((set, get) => ({
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
      
      // Save auth state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify({ user }))
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
    
    // Clear auth state from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth')
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
      
      // Update first login status
      const userIndex = USERS.findIndex(u => u.id === user.id)
      if (userIndex >= 0) {
        USERS[userIndex] = { ...user, isFirstLogin: false }
        set({ user: USERS[userIndex] })
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if user already exists
      if (USERS.some(u => u.email === email)) {
        throw new Error('User already exists')
      }
      
      // Create new user with temporary password
      const newUser: User = {
        id: Date.now().toString(),
        email,
        role: 'user',
        isFirstLogin: true
      }
      
      USERS.push(newUser)
      
      // Set temporary password
      const tempPassword = 'changeme123'
      PASSWORDS[email] = tempPassword
      
      // Here you would typically send an email with the temporary password
      console.log(`New user created: ${email} with temporary password: ${tempPassword}`)
    } catch (error) {
      throw error
    }
  }
}))

// Initialize auth state from localStorage
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
