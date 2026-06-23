'use client'
import { useState } from 'react'
import { SECTIONS } from '@/lib/questions'
import FormStep from '@/components/FormStep'

type Answers = Record<string, string | string[] | number>

export default function Home() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const total = SECTIONS.length
  const current = SECTIONS[step]
  const progress = ((step) / total) * 100

  function handleChange(id: string, value: string | string[] | number) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  function canProceed() {
    const required = current.questions.filter((q) => q.required)
    return required.every((q) => {
      const v = answers[q.id]
      if (Array.isArray(v)) return v.length > 0
      return v !== undefined && v !== ''
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      if (!res.ok) throw new Error('Falha ao enviar')
      setSubmitted(true)
    } catch {
      setError('Algo deu errado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return <ThankYou />
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,10,0.9)',
        backdropFilter: 'blur(12px)',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: 'var(--accent)', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="#0a0a0a" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="#0a0a0a" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="#0a0a0a" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="#0a0a0a" />
            </svg>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-2)' }}>
            Descoberta de Design
          </span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
          {step + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 49, height: '2px', background: 'var(--bg-3)' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--accent)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        maxWidth: '680px',
        margin: '0 auto',
        padding: '96px 24px 80px',
        width: '100%',
      }}>
        {/* Section header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(232,255,0,0.2)',
            borderRadius: '100px',
            padding: '4px 12px',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Parte {step + 1} de {total}
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2, marginBottom: '8px' }}>
            {current.title}
          </h1>
          {current.description && (
            <p style={{ fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.6 }}>
              {current.description}
            </p>
          )}
        </div>

        {/* Questions */}
        <FormStep section={current} answers={answers} onChange={handleChange} />

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '24px',
            padding: '12px 16px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius)',
            color: '#f87171',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', alignItems: 'center' }}>
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: step === 0 ? 'var(--text-3)' : 'var(--text-2)',
              fontSize: '14px',
              opacity: step === 0 ? 0.4 : 1,
              cursor: step === 0 ? 'default' : 'pointer',
            }}
          >
            ← Voltar
          </button>

          {step < total - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              style={{
                padding: '12px 28px',
                background: canProceed() ? 'var(--accent)' : 'var(--bg-3)',
                border: 'none',
                borderRadius: 'var(--radius)',
                color: canProceed() ? '#0a0a0a' : 'var(--text-3)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: canProceed() ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              Continuar →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: '12px 28px',
                background: submitting ? 'var(--bg-3)' : 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius)',
                color: submitting ? 'var(--text-3)' : '#0a0a0a',
                fontSize: '14px',
                fontWeight: 600,
                cursor: submitting ? 'default' : 'pointer',
              }}
            >
              {submitting ? 'Enviando...' : 'Enviar respostas ↗'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ThankYou() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '16px',
        background: 'var(--accent)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
        fontSize: '28px',
      }}>
        ✓
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
        Obrigado pela sua contribuição.
      </h1>
      <p style={{ fontSize: '16px', color: 'var(--text-2)', maxWidth: '440px', lineHeight: 1.6 }}>
        Suas respostas foram salvas e vão ajudar o time de Design a evoluir processos, documentação e handoffs.
      </p>
      <div style={{
        marginTop: '40px',
        padding: '16px 24px',
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        fontSize: '13px',
        color: 'var(--text-3)',
        maxWidth: '360px',
      }}>
        Um relatório consolidado com todos os feedbacks será gerado automaticamente pelo time de Design.
      </div>
    </div>
  )
}
