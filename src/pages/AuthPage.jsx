import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './AuthPage.css'

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  // Dummy credentials
  const ADMIN = { email: 'admin@epsolve.com', password: 'admin123', role: 'admin' }
  const USER  = { email: 'user@epsolve.com',  password: 'user123',  role: 'user'  }

  const handleSubmit = () => {
    if (mode === 'login') {
      if (form.email === ADMIN.email && form.password === ADMIN.password) {
        onLogin({ name: 'Admin', email: ADMIN.email, role: 'admin' })
      } else if (form.email === USER.email && form.password === USER.password) {
        onLogin({ name: 'Shadcn', email: USER.email, role: 'user' })
      } else {
        alert('Email atau password salah.\n\nDummy credentials:\nAdmin → admin@epsolve.com / admin123\nUser  → user@epsolve.com / user123')
      }
    } else {
      // Register → langsung masuk sebagai user
      if (!form.name || !form.email || !form.password) {
        alert('Mohon isi semua field.')
        return
      }
      onLogin({ name: form.name, email: form.email, role: 'user' })
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="auth-bg">
      <div className="auth-center">
        <h1 className="auth-title">{mode === 'login' ? 'Masuk' : 'Daftar'}</h1>
        <p className="auth-sub">Selamat datang! Silakan masuk untuk mendapat pengalaman lebih personal!</p>

        <div className="auth-card">
          {mode === 'register' && (
            <div className="auth-field">
              <label>Nama</label>
              <input
                type="text"
                placeholder="Masukkan nama Anda..."
                value={form.name}
                onChange={set('name')}
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="Masukkan email Anda..."
              value={form.email}
              onChange={set('email')}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="pass-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Masukkan password Anda..."
                value={form.password}
                onChange={set('password')}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button className="eye-btn" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div className="forgot-row">
              <button className="link-btn" onClick={() => alert('Fitur lupa password belum tersedia.')}>
                Lupa password?
              </button>
            </div>
          )}

          <button className="auth-submit" onClick={handleSubmit}>
            {mode === 'login' ? 'Masuk Sekarang' : 'Daftar Sekarang'}
          </button>

          <div className="auth-switch">
            {mode === 'login' ? (
              <>Belum punya akun? <button className="link-btn" onClick={() => setMode('register')}>Daftar</button></>
            ) : (
              <>Sudah punya akun? <button className="link-btn" onClick={() => setMode('login')}>Masuk</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
