import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const ADMIN_CREDENTIALS = {
  email: 'admin@tarikclothing.com',
  password: 'admin123',
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('tarik_admin_auth') === 'true'
  })
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('tarik_admin_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (email, password) => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const user = { name: 'Tarik Admin', email, role: 'admin' }
      setIsAuthenticated(true)
      setAdminUser(user)
      localStorage.setItem('tarik_admin_auth', 'true')
      localStorage.setItem('tarik_admin_user', JSON.stringify(user))
      return { success: true }
    }
    return { success: false, error: 'Invalid email or password' }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setAdminUser(null)
    localStorage.removeItem('tarik_admin_auth')
    localStorage.removeItem('tarik_admin_user')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export default AuthContext
