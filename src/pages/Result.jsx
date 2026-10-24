export default function Result({ student, result }) {
  return (
    <section className="card result">
      <h2>Sınavın bitti, tebrikler! 🎉</h2>
      <p>{student.fullName} · {student.className} · No: {student.studentNo}</p>
      <div className="score">{result.score}</div>
      <p>{result.total} sorudan <strong>{result.correct}</strong> tanesini doğru yaptın.</p>
      <p className="hint">Bu sayfayı kapatabilirsin.</p>
    </section>
  )
}
