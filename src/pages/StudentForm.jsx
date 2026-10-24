import { useState } from 'react'
import { hasAlreadyTaken } from '../api.js'

// Sınıf listesi. Okulunuzdaki şubelere göre değiştirebilirsiniz.
const CLASSES = ['5-A', '5-B', '5-C', '5-D', '5-E', '5-F', '5-G', '5-H']

export default function StudentForm({ onStart }) {
  const [fullName, setFullName] = useState('')
  const [studentNo, setStudentNo] = useState('')
  const [className, setClassName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const name = fullName.trim().replace(/\s+/g, ' ')
    const no = studentNo.trim()
    if (name.length < 3 || !name.includes(' ')) return setError('Lütfen adını ve soyadını yaz.')
    if (!/^\d{1,6}$/.test(no)) return setError('Okul numarası sadece rakamlardan oluşmalı.')
    if (!className) return setError('Lütfen sınıfını seç.')

    setBusy(true)
    setError('')
    try {
      if (await hasAlreadyTaken(no)) {
        setError('Bu okul numarasıyla sınava daha önce girilmiş.')
        return
      }
      onStart({ fullName: name, studentNo: no, className })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Sınava giriş</h2>
      <p className="hint">Bilgilerini doğru yaz. Sınava yalnızca bir kez girebilirsin.</p>

      <label>
        Adın ve soyadın
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Örn: Ayşe Yılmaz" autoComplete="off" />
      </label>

      <label>
        Okul numaran
        <input value={studentNo} onChange={(e) => setStudentNo(e.target.value)} inputMode="numeric" placeholder="Örn: 125" autoComplete="off" />
      </label>

      <label>
        Sınıfın
        <select value={className} onChange={(e) => setClassName(e.target.value)}>
          <option value="">Seç…</option>
          {CLASSES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      {error && <p className="error">{error}</p>}

      <button className="btn" disabled={busy}>Sınava başla</button>
    </form>
  )
}
