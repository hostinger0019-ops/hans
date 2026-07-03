import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import './AdminLogin.css'

const AdminLogin = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      const result = login(email, password)
      if (!result.success) {
        setError(result.error)
      }
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="admin-login" id="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__header">
          <div className="admin-login__logo">
            <span className="admin-login__logo-text">TARIK</span>
            <span className="admin-login__logo-divider"></span>
            <span className="admin-login__logo-sub">ADMIN</span>
          </div>
          <h1 className="admin-login__title">Welcome Back</h1>
          <p className="admin-login__subtitle">Sign in to manage your store</p>
        </div>

        <form className="admin-login__form" onSubmit={handleSubmit} id="admin-login-form">
          {error && (
            <div className="admin-login__error">
              <span>⚠️ {error}</span>
            </div>
          )}

          <div className="admin-login__field">
            <label className="admin-login__label">Email</label>
            <div className="admin-login__input-wrap">
              <Mail size={18} className="admin-login__input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tarikclothing.com"
                className="admin-login__input"
                required
                id="admin-email"
              />
            </div>
          </div>

          <div className="admin-login__field">
            <label className="admin-login__label">Password</label>
            <div className="admin-login__input-wrap">
              <Lock size={18} className="admin-login__input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="admin-login__input"
                required
                id="admin-password"
              />
              <button
                type="button"
                className="admin-login__toggle-pass"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`admin-login__submit ${isLoading ? 'admin-login__submit--loading' : ''}`}
            disabled={isLoading}
            id="admin-submit"
          >
            {isLoading ? (
              <span className="admin-login__spinner"></span>
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="admin-login__hint">
          <p>Demo credentials:</p>
          <code>admin@tarikclothing.com / admin123</code>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
