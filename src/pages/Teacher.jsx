import { useEffect, useState } from 'react'
import { getSession, onAuthChange, signIn, signUp, signOut, isTeacher, listResults, deleteAllResults } from '../api.js'

function toCsv(rows) {
  const head = ['Ad Soyad', 'Okul No', 'Sınıf', 'Doğru', 'Toplam', 'Puan', 'Tarih']
  const lines = rows.map((r) =>
    [r.fullName, r.studentNo, r.className, r.correct, r.total, r.score, new Date(r.submittedAt).toLocaleString('tr-TR')]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(';')
  )
  return '﻿' + [head.join(';'), ...lines].join('\r\n')
}

export default function Teacher() {
  const [session, setSession] = useState(undefined) // undefined = yükleniyor
  const [allowed, setAllowed] = useState(null)

  useEffect(() => {
    getSession().then(setSession).catch(() => setSession(null))
    return onAuthChange(setSession)
  }, [])

  useEffect(() => {
    setAllowed(null)
    if (session) isTeacher().then(setAllowed)
  }, [session])

  return (
    <main className="wrap wide">
      <header className="top">
        <div className="logo">📋</div>
        <div>
          <h1>Öğretmen paneli</h1>
          <p className="sub"><a href="#/">Sınav sayfasına dön</a></p>
        </div>
      </header>

      {session === undefined ? (
        <p>Yükleniyor…</p>
      ) : !session ? (
        <AuthForm />
      ) : allowed === null ? (
        <p>Yükleniyor…</p>
      ) : allowed ? (
        <Results email={session.user.email} />
      ) : (
        <div className="card">
          <p><strong>{session.user.email}</strong> hesabı öğretmen listesinde değil.</p>
          <p className="hint">Sınav yöneticisinden bu e-postayı listeye eklemesini isteyin.</p>
          <button className="btn small" onClick={signOut}>Çıkış yap</button>
        </div>
      )}
    </main>
  )
}

function AuthForm() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Geçerli bir e-posta yaz.')
    if (password.length < 8) return setError('Şifre en az 8 karakter olmalı.')
    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password)
      } else {
        await signUp(email.trim(), password)
        setMsg('Kayıt alındı. E-postana gelen onay bağlantısına tıkla, sonra buradan giriş yap.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Öğretmen girişi' : 'Öğretmen kaydı'}</h2>
      <label>
        E-posta
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </label>
      <label>
        Şifre (en az 8 karakter)
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
      </label>
      {error && <p className="error">{error}</p>}
      {msg && <p className="hint">{msg}</p>}
      <button className="btn" disabled={busy}>{mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}</button>
      <p className="hint">
        <a href="#/ogretmen" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMsg('') }}>
          {mode === 'login' ? 'Hesabım yok, kayıt olacağım' : 'Hesabım var, giriş yapacağım'}
        </a>
      </p>
    </form>
  )
}

function Results({ email }) {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  async function load() {
    try {
      setRows(await listResults())
    } catch (e) {
      setError(e.message)
    }
  }
  useEffect(() => { load() }, [])

  function download() {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'sinav-sonuclari.csv'
    a.click()
  }

  async function reset() {
    const answer = window.prompt('TÜM sınav kayıtları kalıcı olarak silinecek. Onaylamak için SİL yazın.')
    if (answer && answer.trim().toLocaleUpperCase('tr') === 'SİL') {
      await deleteAllResults()
      load()
    }
  }

  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0

  return (
    <div className="card">
      <p className="hint">Giriş yapan: {email}</p>
      <p><strong>{rows.length}</strong> öğrenci · Ortalama: <strong>{avg}</strong></p>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button className="btn small" onClick={load}>Yenile</button>
        <button className="btn small" onClick={download} disabled={!rows.length}>Excel için indir (CSV)</button>
        <button className="btn small ghost" onClick={reset} disabled={!rows.length}>Tüm kayıtları sil</button>
        <button className="btn small ghost" onClick={signOut}>Çıkış yap</button>
      </div>
      <div className="tablewrap">
        <table>
          <thead>
            <tr><th>Ad Soyad</th><th>No</th><th>Sınıf</th><th>Doğru</th><th>Puan</th><th>Tarih</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.fullName}</td><td>{r.studentNo}</td><td>{r.className}</td>
                <td>{r.correct}/{r.total}</td><td><strong>{r.score}</strong></td>
                <td>{new Date(r.submittedAt).toLocaleString('tr-TR')}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="6" className="empty">Henüz sınava giren öğrenci yok.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
