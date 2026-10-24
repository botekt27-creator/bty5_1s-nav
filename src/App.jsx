import { useEffect, useState } from 'react'
import StudentForm from './pages/StudentForm.jsx'
import Exam from './pages/Exam.jsx'
import Result from './pages/Result.jsx'
import Teacher from './pages/Teacher.jsx'

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  const [student, setStudent] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (hash === '#/ogretmen') return <Teacher />

  return (
    <main className="wrap">
      <header className="top">
        <div className="logo">💻</div>
        <div>
          <h1>Bilişim Teknolojileri ve Yazılım</h1>
          <p className="sub">5. Sınıf · 1. Dönem 1. Yazılı</p>
        </div>
      </header>

      {result ? (
        <Result student={student} result={result} />
      ) : student ? (
        <Exam student={student} onDone={setResult} />
      ) : (
        <StudentForm onStart={setStudent} />
      )}
    </main>
  )
}
