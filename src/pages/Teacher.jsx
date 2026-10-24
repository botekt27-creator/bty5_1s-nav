import { useEffect, useState } from 'react'
import { getSession, onAuthChange, signIn, signUp, signOut, isTeacher, listResults, deleteAllResults, getSubmissionDetail } from '../api.js'
import { questions } from '../questions.js'

const TYPE_LABELS = { mcq: 'Çoktan seçmeli', tf: 'Doğru / Yanlış', match: 'Eşleştirme', short: 'Kısa cevap' }

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

function Detail({ student, onBack }) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getSubmissionDetail(student.id).then(setItems).catch((e) => setError(e.message))
  }, [student.id])

  const byId = Object.fromEntries((items || []).map((i) => [i.question_id, i]))

  return (
    <div className="card">
      <div className="actions no-print">
        <button className="btn small" onClick={onBack}>← Listeye dön</button>
        <button className="btn small" onClick={() => window.print()}>Yazdır</button>
      </div>
      <h2>{student.fullName}</h2>
      <p>
        {student.className} · No: {student.studentNo} · <strong>{student.correct}/{student.total} doğru, {student.score} puan</strong>
      </p>
      <p className="hint">{new Date(student.submittedAt).toLocaleString('tr-TR')}</p>
      {error && <p className="error">{error}</p>}
      {!items && !error && <p>Yükleniyor…</p>}

      {items && questions.map((q) => {
        const it = byId[q.id]
        if (!it) return null
        const empty = it.given == null || String(it.given).trim() === ''
        return (
          <div key={q.id} className={'dq ' + (it.correct ? 'ok' : 'bad')}>
            <div className="dq-head">
              <span className="qnum">{q.id}</span>
              <span className="dq-type">{TYPE_LABELS[q.type]}</span>
              <span className="dq-mark">{it.correct ? '✓ Doğru' : '✗ Yanlış'}</span>
            </div>
            <p className="dq-text">
              {q.type === 'match' ? <><em>{q.groupTitle}</em> {q.text}</> : q.text}
            </p>
            <p><span className="dq-label">Öğrencinin yanıtı:</span>{' '}
              {empty ? <em>Boş bırakmış</em> : <strong>{it.given}</strong>}
            </p>
            {!it.correct && <p><span className="dq-label">Doğru yanıt:</span> {it.expected}</p>}
          </div>
        )
      })}
    </div>
  )
}

function Results({ email }) {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [open, setOpen] = useState(null)

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

  if (open) return <Detail student={open} onBack={() => setOpen(null)} />

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
                <td>
                  <button className="folder" title="Cevapları göster" aria-label={`${r.fullName} cevaplarını göster`} onClick={() => setOpen(r)}>📁</button>
                  {r.fullName}
                </td><td>{r.studentNo}</td><td>{r.className}</td>
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
