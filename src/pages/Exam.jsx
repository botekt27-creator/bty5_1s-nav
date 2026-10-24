import { useMemo, useState } from 'react'
import { questions, TF_OPTIONS } from '../questions.js'
import { submitExam } from '../api.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Eşleştirme soruları (aynı grup) yan yana kalır; birimler ve şıklar karıştırılır.
function buildUnits() {
  const units = []
  const seen = {}
  for (const q of questions) {
    if (q.type === 'match') {
      if (!seen[q.group]) {
        seen[q.group] = { kind: 'match', title: q.groupTitle, options: shuffle(q.groupOptions), items: [] }
        units.push(seen[q.group])
      }
      seen[q.group].items.push(q)
    } else {
      units.push({
        kind: 'single',
        q: q.type === 'mcq' ? { ...q, options: shuffle(q.options) } : q,
      })
    }
  }
  return shuffle(units)
}

export default function Exam({ student, onDone }) {
  const units = useMemo(buildUnits, [])
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const answered = questions.filter((q) => (answers[q.id] ?? '').toString().trim() !== '').length
  const set = (id, value) => setAnswers((a) => ({ ...a, [id]: value }))

  async function finish() {
    const left = questions.length - answered
    if (left > 0 && !window.confirm(`${left} soruyu boş bıraktın. Yine de bitirmek istiyor musun?`)) return
    if (left === 0 && !window.confirm('Sınavı bitirmek istediğine emin misin? Sonra değiştiremezsin.')) return
    setBusy(true)
    setError('')
    try {
      const result = await submitExam(student, answers)
      onDone(result)
    } catch (e) {
      setError(e.message || 'Bir sorun oldu, tekrar dene.')
      setBusy(false)
    }
  }

  let n = 0
  const num = () => ++n

  return (
    <>
      <div className="progress" role="status">
        <span><strong>{student.fullName}</strong> · {student.className} · No: {student.studentNo}</span>
        <span>{answered} / {questions.length} cevaplandı</span>
      </div>

      {units.map((u, i) =>
        u.kind === 'single' ? (
          <section className="card q" key={u.q.id}>
            <p className="qtext"><span className="qnum">{num()}</span>{u.q.text}</p>
            {u.q.type === 'mcq' && (
              <Choices name={`q${u.q.id}`} options={u.q.options} value={answers[u.q.id]} onChange={(v) => set(u.q.id, v)} letters />
            )}
            {u.q.type === 'tf' && (
              <Choices name={`q${u.q.id}`} options={TF_OPTIONS} value={answers[u.q.id]} onChange={(v) => set(u.q.id, v)} row />
            )}
            {u.q.type === 'short' && (
              <input className="short" value={answers[u.q.id] ?? ''} onChange={(e) => set(u.q.id, e.target.value)} placeholder="Cevabını yaz" autoComplete="off" />
            )}
          </section>
        ) : (
          <section className="card q" key={`m${i}`}>
            <p className="qtext match-title">{u.title}</p>
            {u.items.map((q) => (
              <div className="match-row" key={q.id}>
                <span className="qnum">{num()}</span>
                <span className="match-left">{q.text}</span>
                <select value={answers[q.id] ?? ''} onChange={(e) => set(q.id, e.target.value)}>
                  <option value="">Seç…</option>
                  {u.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            ))}
          </section>
        )
      )}

      {error && <p className="error">{error}</p>}
      <button className="btn finish" onClick={finish} disabled={busy}>Sınavı bitir</button>
    </>
  )
}

function Choices({ name, options, value, onChange, letters, row }) {
  return (
    <div className={row ? 'choices row' : 'choices'}>
      {options.map((o, i) => (
        <label key={o} className={'choice' + (value === o ? ' on' : '')}>
          <input type="radio" name={name} checked={value === o} onChange={() => onChange(o)} />
          <span>{letters ? `${'ABCD'[i]}) ` : ''}{o}</span>
        </label>
      ))}
    </div>
  )
}
