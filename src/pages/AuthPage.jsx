import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './AuthPage.css'
import { apiFetch } from '../api'

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'forgot'
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const handleSubmit = async () => {
    setError('')

    if (mode === 'login') {
      if (!form.email || !form.password) {
        setError('Mohon isi email dan password.')
        return
      }
      setLoading(true)
      try {
        const res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: form.email, password: form.password }),
        })
        if (!res.ok) {
          const err = await res.json()
          setError(typeof err.detail === 'string' ? err.detail : 'Email atau password salah.')
          return
        }
        const { access_token, refresh_token } = await res.json()
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)

        const meRes = await apiFetch('/auth/me')
        const me = await meRes.json()
        onLogin({ name: me.full_name, email: me.email, role: me.role })
      } catch {
        setError('Tidak dapat terhubung ke server.')
      } finally {
        setLoading(false)
      }
    } else {
      if (!form.name || !form.email || !form.password) {
        setError('Mohon isi semua field.')
        return
      }
      setLoading(true)
      try {
        const res = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email: form.email,
            full_name: form.name,
            password: form.password,
            role: 'karyawan',
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          setError(typeof err.detail === 'string' ? err.detail : 'Registrasi gagal.')
          return
        }
        const { access_token, refresh_token } = await res.json()
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)

        const meRes = await apiFetch('/auth/me')
        const me = await meRes.json()
        onLogin({ name: me.full_name, email: me.email, role: me.role })
      } catch {
        setError('Tidak dapat terhubung ke server.')
      } finally {
        setLoading(false)
      }
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleForgot = async () => {
    if (!form.email) { setError('Masukkan email Anda.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: form.email }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(typeof err.detail === 'string' ? err.detail : 'Terjadi kesalahan.')
        return
      }
      setForgotSent(true)
    } catch {
      setError('Tidak dapat terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setForgotSent(false)
  }

  if (mode === 'forgot') {
    return (
      <div className="auth-bg">
        <div className="auth-center">
          <div className="auth-logo-wrap">
            <img src="/logo_dark.png" alt="Epsolve" className="auth-logo auth-logo--dark" />
            <img src="/logo_light.png" alt="Epsolve" className="auth-logo auth-logo--light" />
          </div>
          <h1 className="auth-title">Lupa Password</h1>
          <p className="auth-sub">Masukkan email Anda dan kami akan mengirim link untuk reset password.</p>
          <div className="auth-card">
            {forgotSent ? (
              <>
                <p style={{ color: 'var(--success)', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
                  Jika email terdaftar, link reset password akan dikirim ke <strong>{form.email}</strong>.<br />
                  Periksa kotak masuk atau folder spam Anda.
                </p>
                <button className="auth-submit" onClick={() => switchMode('login')}>
                  Kembali ke Login
                </button>
              </>
            ) : (
              <>
                <div className="auth-field">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Masukkan email Anda..."
                    value={form.email}
                    onChange={set('email')}
                    onKeyDown={e => e.key === 'Enter' && handleForgot()}
                  />
                </div>
                {error && <p className="auth-error">{error}</p>}
                <button className="auth-submit" onClick={handleForgot} disabled={loading}>
                  {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
                <div className="auth-switch">
                  <button className="link-btn" onClick={() => switchMode('login')}>Kembali ke Login</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-bg">
      <div className="auth-center">
        <div className="auth-logo-wrap">
          <img src="/logo_dark.png" alt="Epsolve" className="auth-logo auth-logo--dark" />
          <img src="/logo_light.png" alt="Epsolve" className="auth-logo auth-logo--light" />
        </div>
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

          {error && <p className="auth-error">{error}</p>}

          {mode === 'login' && (
            <div className="forgot-row">
              <button className="link-btn" onClick={() => switchMode('forgot')}>
                Lupa password?
              </button>
            </div>
          )}

          <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk Sekarang' : 'Daftar Sekarang'}
          </button>

          <div className="auth-switch">
            {mode === 'login' ? (
              <>Belum punya akun? <button className="link-btn" onClick={() => switchMode('register')}>Daftar</button></>
            ) : (
              <>Sudah punya akun? <button className="link-btn" onClick={() => switchMode('login')}>Masuk</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
