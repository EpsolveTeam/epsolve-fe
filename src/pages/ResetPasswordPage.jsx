import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { apiFetch } from '../api'
import './AuthPage.css'

export default function ResetPasswordPage({ token, onDone }) {
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    if (!form.password || !form.confirm) { setError('Mohon isi semua field.'); return }
    if (form.password.length < 8) { setError('Password minimal 8 karakter.'); return }
    if (form.password !== form.confirm) { setError('Konfirmasi password tidak cocok.'); return }

    setLoading(true)
    try {
      const res = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Terjadi kesalahan.')
        return
      }
      setSuccess(true)
    } catch {
      setError('Tidak dapat terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-center">
        <h1 className="auth-title">Buat Password Baru</h1>
        <p className="auth-sub">Masukkan password baru untuk akun Anda.</p>
        <div className="auth-card">
          {success ? (
            <>
              <p style={{ color: 'var(--success)', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
                Password berhasil diubah. Silakan masuk dengan password baru Anda.
              </p>
              <button className="auth-submit" onClick={onDone}>
                Masuk Sekarang
              </button>
            </>
          ) : (
            <>
              <div className="auth-field">
                <label>Password Baru</label>
                <div className="pass-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter..."
                    value={form.password}
                    onChange={set('password')}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                  <button className="eye-btn" onClick={() => setShowPass(v => !v)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label>Konfirmasi Password</label>
                <div className="pass-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Ulangi password baru..."
                    value={form.confirm}
                    onChange={set('confirm')}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
              </div>
              {error && <p className="auth-error">{error}</p>}
              <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
