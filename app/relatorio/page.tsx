'use client'
import { useEffect, useState } from 'react'
import { SECTIONS, Question } from '@/lib/questions'

type Fields = Record<string, string>
interface ResponseRecord {
  id: string
  fields: Fields
}

// Mapa id -> pergunta, para exibir labels e tipos
const ALL_QUESTIONS: Question[] = SECTIONS.flatMap((s) => s.questions)
const QUESTION_BY_ID = new Map(ALL_QUESTIONS.map((q) => [q.id, q]))

export default function ReportPage() {
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<ResponseRecord[]>([])
  const [count, setCount] = useState(0)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/report')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar respostas')
      setResponses(data.responses)
      setCount(data.count)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Agrega as opções mais marcadas das perguntas de chips
  const chipQuestions = ALL_QUESTIONS.filter(
    (q) => q.type === 'chips-single' || q.type === 'chips-multi'
  )
  const aggregations = chipQuestions
    .map((q) => {
      const counts = new Map<string, number>()
      for (const r of responses) {
        const raw = r.fields[q.id]
        if (!raw) continue
        for (const opt of String(raw).split(',').map((s) => s.trim()).filter(Boolean)) {
          counts.set(opt, (counts.get(opt) || 0) + 1)
        }
      }
      const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])
      return { q, ranked }
    })
    .filter((a) => a.ranked.length > 0)

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="#0a0a0a" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="#0a0a0a" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="#0a0a0a" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="#0a0a0a" />
            </svg>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-2)' }}>Respostas coletadas</span>
        </div>
        <a href="/" style={{ fontSize: '13px', color: 'var(--text-3)', textDecoration: 'none' }}>← Voltar ao formulário</a>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '8px' }}>Feedbacks de Design</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>
              Todas as respostas coletadas, direto do Airtable.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            style={{
              padding: '10px 16px', background: 'transparent',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              fontSize: '13px', color: 'var(--text-2)', cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? '⟳ Carregando...' : '↻ Atualizar'}
          </button>
        </div>

        {error && (
          <div style={{
            padding: '16px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius)', color: '#f87171', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {loading && !error && (
          <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>Carregando respostas...</p>
        )}

        {!loading && !error && (
          <>
            {/* Meta */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <div style={{
                padding: '10px 16px', background: 'var(--bg-2)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                fontSize: '13px', color: 'var(--text-2)',
              }}>
                <strong style={{ color: 'var(--accent)' }}>{count}</strong> resposta{count !== 1 ? 's' : ''} coletada{count !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Agregações das opções mais marcadas */}
            {aggregations.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent)', marginBottom: '16px' }}>
                  Opções mais marcadas
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {aggregations.map(({ q, ranked }) => {
                    const max = ranked[0][1]
                    return (
                      <div key={q.id} style={{
                        background: 'var(--bg-2)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '20px',
                      }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.4 }}>{q.label}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {ranked.map(([opt, n]) => (
                            <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ flex: 1, height: '24px', background: 'var(--bg-3)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: 0, width: `${(n / max) * 100}%`, background: 'var(--accent-dim2)', borderRight: '2px solid var(--accent)' }} />
                                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--text)' }}>{opt}</span>
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', minWidth: '20px', textAlign: 'right' }}>{n}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Lista de respondentes */}
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent)', marginBottom: '16px' }}>
              Respondentes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {responses.map((r, i) => {
                const open = openId === r.id
                const nome = r.fields.nome || 'Anônimo'
                const funcao = r.fields.funcao || 'função não informada'
                return (
                  <div key={r.id} style={{
                    background: 'var(--bg-2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => setOpenId(open ? null : r.id)}
                      style={{
                        width: '100%', padding: '16px 20px', background: 'transparent',
                        border: 'none', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', textAlign: 'left',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{nome}</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-3)', marginLeft: '10px' }}>{funcao}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                        #{responses.length - i} {open ? '▲' : '▼'}
                      </span>
                    </button>
                    {open && (
                      <div style={{ padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {ALL_QUESTIONS.map((q) => {
                          const val = r.fields[q.id]
                          if (!val) return null
                          return (
                            <div key={q.id}>
                              <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '4px', lineHeight: 1.4 }}>{q.label}</p>
                              <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {q.type === 'scale' ? `${val} / 5` : val}
                              </p>
                            </div>
                          )
                        })}
                        {QUESTION_BY_ID && r.fields.Timestamp && (
                          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>
                            Enviado em {new Date(r.fields.Timestamp).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
