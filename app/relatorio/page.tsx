'use client'
import { useState } from 'react'

export default function ReportPage() {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState('')
  const [count, setCount] = useState(0)
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)

  async function generateReport() {
    setLoading(true)
    setError('')
    setReport('')
    try {
      const res = await fetch('/api/report')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar relatório')
      setReport(data.report)
      setCount(data.count)
      setGenerated(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  function copyReport() {
    navigator.clipboard.writeText(report)
  }

  // Simple markdown-like render
  function renderReport(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text)', margin: '24px 0 12px' }}>{line.slice(2)}</h1>
      if (line.startsWith('## ') || line.match(/^\*\*\d+\./)) {
        const clean = line.replace(/^#{1,3} /, '').replace(/\*\*/g, '')
        return <h2 key={i} style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent)', margin: '20px 0 8px' }}>{clean}</h2>
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} style={{ fontWeight: 600, color: 'var(--text)', margin: '12px 0 4px' }}>{line.replace(/\*\*/g, '')}</p>
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <p key={i} style={{ paddingLeft: '16px', color: 'var(--text-2)', margin: '4px 0', fontSize: '14px', borderLeft: '2px solid var(--border)' }}>{line.slice(2)}</p>
      }
      if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />
      // Replace inline **bold**
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      return (
        <p key={i} style={{ color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.7, margin: '4px 0' }}>
          {parts.map((p, j) =>
            p.startsWith('**') ? <strong key={j} style={{ color: 'var(--text)', fontWeight: 600 }}>{p.replace(/\*\*/g, '')}</strong> : p
          )}
        </p>
      )
    })
  }

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
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-2)' }}>Relatório Consolidado</span>
        </div>
        <a href="/" style={{ fontSize: '13px', color: 'var(--text-3)', textDecoration: 'none' }}>← Voltar ao formulário</a>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '8px' }}>Insights de Design</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>
            Relatório gerado por IA com base em todas as respostas coletadas.
          </p>
        </div>

        {!generated && (
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px',
            textAlign: 'center',
            background: 'var(--bg-2)',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
            <h2 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Gerar relatório consolidado</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '24px' }}>
              A IA vai ler todas as respostas do Airtable e gerar um relatório executivo com prioridades e recomendações.
            </p>
            <button
              onClick={generateReport}
              disabled={loading}
              style={{
                padding: '12px 32px',
                background: loading ? 'var(--bg-3)' : 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius)',
                color: loading ? 'var(--text-3)' : '#0a0a0a',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              {loading ? '⟳ Analisando respostas...' : '✦ Gerar com IA'}
            </button>
          </div>
        )}

        {error && (
          <div style={{
            padding: '16px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius)', color: '#f87171', fontSize: '14px', marginTop: '16px',
          }}>
            {error}
          </div>
        )}

        {generated && report && (
          <div>
            {/* Meta */}
            <div style={{
              display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap',
            }}>
              <div style={{
                padding: '10px 16px', background: 'var(--bg-2)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                fontSize: '13px', color: 'var(--text-2)',
              }}>
                <strong style={{ color: 'var(--accent)' }}>{count}</strong> respondente{count !== 1 ? 's' : ''} analisado{count !== 1 ? 's' : ''}
              </div>
              <div style={{
                padding: '10px 16px', background: 'var(--bg-2)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                fontSize: '13px', color: 'var(--text-2)',
              }}>
                Gerado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <button
                onClick={copyReport}
                style={{
                  padding: '10px 16px', background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  fontSize: '13px', color: 'var(--text-2)', cursor: 'pointer',
                }}
              >
                Copiar texto
              </button>
              <button
                onClick={generateReport}
                style={{
                  padding: '10px 16px', background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  fontSize: '13px', color: 'var(--text-2)', cursor: 'pointer',
                }}
              >
                ↻ Regenerar
              </button>
            </div>

            {/* Report content */}
            <div style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
            }}>
              {renderReport(report)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
