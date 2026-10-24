// Veri katmanı: tüm Supabase işlemleri burada.
// Puanlama sunucuda (submit_exam fonksiyonu) yapılır; doğru cevaplar sitede bulunmaz.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_KEY

export const supabase = url && key ? createClient(url, key) : null

function need() {
  if (!supabase) throw new Error('Site ayarları eksik (Supabase bağlantısı yok).')
  return supabase
}

const ERRORS = {
  already_taken: 'Bu okul numarasıyla sınava daha önce girilmiş.',
  invalid_name: 'Ad soyad geçersiz.',
  invalid_number: 'Okul numarası geçersiz.',
  invalid_class: 'Sınıf geçersiz.',
  invalid_answers: 'Cevaplar kaydedilemedi, tekrar dene.',
}

function friendly(error) {
  const msg = error?.message || ''
  for (const k of Object.keys(ERRORS)) if (msg.includes(k)) return new Error(ERRORS[k])
  return new Error('Bir sorun oldu. İnternetini kontrol edip tekrar dene.')
}

// ---------- Öğrenci ----------
export async function hasAlreadyTaken(studentNo) {
  const { data, error } = await need().rpc('check_student_no', { p_student_no: studentNo })
  if (error) throw friendly(error)
  return data === true
}

export async function submitExam(student, answers) {
  const { data, error } = await need().rpc('submit_exam', {
    p_full_name: student.fullName,
    p_student_no: student.studentNo,
    p_class_name: student.className,
    p_answers: answers,
  })
  if (error) throw friendly(error)
  return data // { correct, total, score }
}

// ---------- Öğretmen ----------
export async function getSession() {
  const { data } = await need().auth.getSession()
  return data.session
}

export function onAuthChange(cb) {
  const { data } = need().auth.onAuthStateChange((_event, session) => cb(session))
  return () => data.subscription.unsubscribe()
}

export async function signIn(email, password) {
  const { error } = await need().auth.signInWithPassword({ email, password })
  if (error) throw new Error('E-posta ya da şifre hatalı (ya da e-postanı henüz onaylamadın).')
}

export async function signUp(email, password) {
  const { error } = await need().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin + '/#/ogretmen' },
  })
  if (error) throw new Error(error.message)
}

export async function signOut() {
  await need().auth.signOut()
}

export async function isTeacher() {
  const { data, error } = await need().rpc('is_teacher')
  return !error && data === true
}

export async function listResults() {
  const { data, error } = await need()
    .from('submissions')
    .select('id, full_name, student_no, class_name, correct, total, score, submitted_at')
    .order('class_name')
    .order('full_name')
  if (error) throw new Error('Sonuçlar alınamadı.')
  return data.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    studentNo: r.student_no,
    className: r.class_name,
    correct: r.correct,
    total: r.total,
    score: r.score,
    submittedAt: r.submitted_at,
  }))
}

// Bir öğrencinin soru soru dökümü: [{ question_id, given, expected, correct }]
export async function getSubmissionDetail(id) {
  const { data, error } = await need().rpc('teacher_submission_detail', { p_id: id })
  if (error) throw new Error('Döküm alınamadı.')
  return data
}

export async function deleteAllResults() {
  const { error } = await need().from('submissions').delete().not('id', 'is', null)
  if (error) throw new Error('Silinemedi.')
}
