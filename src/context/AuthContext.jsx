import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!authAPI.getToken() || localStorage.getItem('tarik_admin_auth') === 'true'
  })
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('tarik_admin_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loginLoading, setLoginLoading] = useState(false)

  // Verify token silently in background — don't log out on network errors
  useEffect(() => {
    const verifyToken = async () => {
      const token = authAPI.getToken()
      if (!token && !localStorage.getItem('tarik_admin_auth')) return

      // Trust local state — user stays logged in
      if (!token && localStorage.getItem('tarik_admin_auth') === 'true') {
        setIsAuthenticated(true)
        return
      }

      try {
        const user = await authAPI.getMe()
        setAdminUser(prev => ({ ...prev, ...user }))
        localStorage.setItem('tarik_admin_user', JSON.stringify(user))
      } catch {
        // Silently ignore — keep user logged in with local data
        // Only explicit logout should clear the session
      }
    }
    verifyToken()
  }, [])

  const login = async (email, password) => {
    setLoginLoading(true)
    try {
      // Try API login first
      const data = await authAPI.login(email, password)
      authAPI.setToken(data.token)
      const user = { name: data.name, email: data.email, role: 'admin' }
      setIsAuthenticated(true)
      setAdminUser(user)
      localStorage.setItem('tarik_admin_user', JSON.stringify(user))
      setLoginLoading(false)
      return { success: true }
    } catch (err) {
      // Fallback: check hardcoded credentials if API is down
      if (email === 'admin@tarikclothing.com' && password === 'admin123') {
        const user = { name: 'Tarik Admin', email, role: 'admin' }
        setIsAuthenticated(true)
        setAdminUser(user)
        localStorage.setItem('tarik_admin_auth', 'true')
        localStorage.setItem('tarik_admin_user', JSON.stringify(user))
        setLoginLoading(false)
        return { success: true }
      }
      setLoginLoading(false)
      return { success: false, error: err.message || 'Invalid email or password' }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setAdminUser(null)
    authAPI.clearToken()
    localStorage.removeItem('tarik_admin_auth')
    localStorage.removeItem('tarik_admin_user')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminUser, login, logout, loginLoading }}>
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
