import { create } from 'zustand'

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  isFirstLogin: boolean
  monthlyEarnings?: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  updatePassword: (newPassword: string) => Promise<void>
  createUser: (email: string) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
  getAllUsers: () => Promise<User[]>
  getUserWorkLogs: (userId: string) => Promise<any[]>
  calculateUserMonthlyEarnings: (userId: string) => Promise<number>
  initializeAuth: () => void
}

// Simulated users database (replace with real backend later)
const USERS: User[] = [
  {
    id: '1',
    email: 'admin@formula.com',
    role: 'admin',
    isFirstLogin: false,
    monthlyEarnings: 0
  }
]

// Simulated password storage (replace with real backend later)
const PASSWORDS: { [key: string]: string } = {
  'admin@formula.com': 'admin123'
}

// Simulated work logs storage (replace with real backend later)
const WORK_LOGS: { [key: string]: any[] } = {}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,

  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth')
      if (stored) {
        try {
          const { user } = JSON.parse(stored)
          set({ user, isAuthenticated: !!user, isHydrated: true })
        } catch (error) {
          console.error('Failed to restore auth state:', error)
          set({ isHydrated: true })
        }
      } else {
        set({ isHydrated: true })
      }
    } else {
      set({ isHydrated: true })
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user = USERS.find(u => u.email === email)
      const storedPassword = PASSWORDS[email]
      
      if (!user || !storedPassword || storedPassword !== password) {
        throw new Error('Email ou senha inválidos')
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
    if (!user) throw new Error('Não autenticado')
    
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
      throw new Error('Falha ao atualizar senha')
    }
  },

  createUser: async (email: string) => {
    const { user: currentUser } = get()
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Não autorizado')
    }
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if user already exists
      if (USERS.some(u => u.email === email)) {
        throw new Error('Usuário já existe')
      }
      
      // Create new user with temporary password
      const newUser: User = {
        id: Date.now().toString(),
        email,
        role: 'user',
        isFirstLogin: true,
        monthlyEarnings: 0
      }
      
      USERS.push(newUser)
      
      // Set temporary password
      const tempPassword = 'temp' + Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6)
      PASSWORDS[email] = tempPassword
      
      // Initialize empty work logs array for the new user
      WORK_LOGS[newUser.id] = []
      
      // Here you would typically send an email with the temporary password
      console.log('Email sending failed logging content for manual sending:')
      console.log('To:', email)
      console.log('Subject: Bem-vindo ao Sistema Fórmula Pilates - Acesso Criado')
      console.log('Temporary Password:', tempPassword)
    } catch (error) {
      throw error
    }
  },

  deleteUser: async (userId: string) => {
    const { user: currentUser } = get()
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Não autorizado')
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const userIndex = USERS.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        throw new Error('Usuário não encontrado')
      }

      // Remove user's password
      delete PASSWORDS[USERS[userIndex].email]
      
      // Remove user's work logs
      delete WORK_LOGS[userId]
      
      // Remove user
      USERS.splice(userIndex, 1)
    } catch (error) {
      throw error
    }
  },

  getAllUsers: async () => {
    const { user: currentUser } = get()
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Não autorizado')
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Return all users except the admin
      return USERS.filter(u => u.role !== 'admin')
    } catch (error) {
      throw error
    }
  },

  getUserWorkLogs: async (userId: string) => {
    const { user: currentUser } = get()
    if (!currentUser) throw new Error('Não autenticado')
    if (currentUser.role !== 'admin' && currentUser.id !== userId) {
      throw new Error('Não autorizado')
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return WORK_LOGS[userId] || []
    } catch (error) {
      throw error
    }
  },

  calculateUserMonthlyEarnings: async (userId: string) => {
    const { user: currentUser } = get()
    if (!currentUser) throw new Error('Não autenticado')
    if (currentUser.role !== 'admin' && currentUser.id !== userId) {
      throw new Error('Não autorizado')
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const workLogs = WORK_LOGS[userId] || []
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

      const monthLogs = workLogs.filter((log: any) => {
        const logDate = new Date(log.date)
        return logDate >= monthStart && logDate <= monthEnd
      })

      let total = 0
      for (const log of monthLogs) {
        if (log.startTime instanceof Date && log.endTime instanceof Date && typeof log.earnings === 'number') {
          total += log.earnings
        }
      }

      // Update user's monthly earnings
      const userIndex = USERS.findIndex(u => u.id === userId)
      if (userIndex >= 0) {
        USERS[userIndex].monthlyEarnings = total
      }

      return total
    } catch (error) {
      throw error
    }
  }
}))
