'use client'
import { useEffect, useState } from 'react'
import { SECTIONS, Question } from '@/lib/questions'

type Fields = Record<string, string>
interface ResponseRecord { id: string; fields: Fields }
interface AnalysisItem { titulo: string; descricao: string }
interface Analysis {
  resumo?: string
  melhorias?: AnalysisItem[]
  atencao?: AnalysisItem[]
  direcionamento?: AnalysisItem[]
}

const ALL_QUESTIONS: Question[] = SECTIONS.flatMap((s) => s.questions)

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<ResponseRecord[]>([])
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/report')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar respostas')
      setResponses(data.responses)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  async function runAnalysis() {
    setAnalyzing(true)
    setAnalyzeError('')
    try {
      const res = await fetch('/api/analyze')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar análise')
      setAnalysis(data.analysis)
    } catch (e: unknown) {
      setAnalyzeError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setAnalyzing(false)
    }
  }

  useEffect(() => { load() }, [])

  const count = responses.length

  // ---- Métricas rápidas ----
  const funcCounts = new Map<string, number>()
  for (const r of responses) {
    const f = r.fields.funcao
    if (f) funcCounts.set(f, (funcCounts.get(f) || 0) + 1)
  }
  const topFunc = [...funcCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  const impactos = responses.map((r) => Number(r.fields.impacto_atraso)).filter((n) => !isNaN(n))
  const impactoMedio = impactos.length ? (impactos.reduce((a, b) => a + b, 0) / impactos.length) : null

  // ---- Gráficos: perguntas de chips ----
  const chipQuestions = ALL_QUESTIONS.filter((q) => q.type === 'chips-single' || q.type === 'chips-multi')
  const chipCharts = chipQuestions.map((q) => {
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
  }).filter((c) => c.ranked.length > 0)

  // ---- Escalas ----
  const scaleQuestions = ALL_QUESTIONS.filter((q) => q.type === 'scale')
  const scaleCharts = scaleQuestions.map((q) => {
    const dist = [0, 0, 0, 0, 0]
    let total = 0, soma = 0
    for (const r of responses) {
      const v = Number(r.fields[q.id])
      if (v >= 1 && v <= 5) { dist[v - 1]++; total++; soma += v }
    }
    return { q, dist, media: total ? soma / total : 0, total }
  }).filter((c) => c.total > 0)

  // ---- Respostas abertas (textarea/text) ----
  const openQuestions = ALL_QUESTIONS.filter((q) => q.type === 'textarea' || q.type === 'text')
    .filter((q) => q.id !== 'nome')

  return (
    <div style={{ minHeight: '100vh' }}>
      <TopBar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '6px' }}>Dashboard de Design</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>Tabulação, gráficos e análise das respostas coletadas.</p>
          </div>
          <button onClick={load} disabled={loading} style={btnGhost}>
            {loading ? '⟳ Carregando...' : '↻ Atualizar'}
          </button>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}
        {loading && !error && <DashboardSkeleton />}

        {!loading && !error && count === 0 && (
          <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <h2 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '6px' }}>Nenhuma resposta ainda</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
              Compartilhe o formulário. Assim que alguém responder, os dados aparecem aqui.
            </p>
          </div>
        )}

        {!loading && !error && count > 0 && (
          <>
            {/* MÉTRICAS */}
            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '40px' }}>
              <Metric label="Respostas" value={String(count)} />
              <Metric label="Função mais comum" value={topFunc ? topFunc[0] : '—'} sub={topFunc ? `${topFunc[1]} pessoa(s)` : ''} />
              <Metric label="Impacto médio do handoff" value={impactoMedio !== null ? `${impactoMedio.toFixed(1)} / 5` : '—'} sub="quanto trava prazos" />
            </div>

            {/* ANÁLISE IA */}
            <Section title="Análise inteligente" accent delay={80}>
              {!analysis && (
                <div style={{ ...card, textAlign: 'center', padding: '32px' }}>
                  <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '20px' }}>
                    Gere um diagnóstico com melhorias, pontos de atenção e direcionamento — feito por IA a partir das respostas.
                  </p>
                  <button onClick={runAnalysis} disabled={analyzing} style={btnPrimary}>
                    {analyzing ? '✦ Analisando respostas...' : '✦ Gerar análise'}
                  </button>
                  {analyzeError && <div style={{ marginTop: '16px' }}><ErrorBox>{analyzeError}</ErrorBox></div>}
                </div>
              )}

              {analysis && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {analysis.resumo && (
                    <div style={{ ...card, padding: '20px', borderLeft: '3px solid var(--accent)' }}>
                      <p style={{ fontSize: '15px', color: 'var(--text)', lineHeight: 1.6 }}>{analysis.resumo}</p>
                    </div>
                  )}
                  <AnalysisGroup title="🚀 Melhorias" items={analysis.melhorias} />
                  <AnalysisGroup title="⚠️ Pontos de atenção" items={analysis.atencao} />
                  <AnalysisGroup title="🎯 Direcionamento" items={analysis.direcionamento} numbered />
                  <button onClick={runAnalysis} disabled={analyzing} style={{ ...btnGhost, alignSelf: 'flex-start' }}>
                    {analyzing ? 'Atualizando...' : '↻ Regenerar análise'}
                  </button>
                </div>
              )}
            </Section>

            {/* GRÁFICOS — CHIPS */}
            {chipCharts.length > 0 && (
              <Section title="Opções mais marcadas" delay={160}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }}>
                  {chipCharts.map(({ q, ranked }) => {
                    const max = ranked[0][1]
                    return (
                      <div key={q.id} style={card}>
                        <p style={chartLabel}>{q.label}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {ranked.map(([opt, n]) => (
                            <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={barTrack}>
                                <div style={{ position: 'absolute', inset: 0, width: `${(n / max) * 100}%`, background: 'var(--accent-dim2)', borderRight: '2px solid var(--accent)', transformOrigin: 'left', animation: 'growBar 0.6s cubic-bezier(0.22,1,0.36,1) both' }} />
                                <span style={barText}>{opt}</span>
                              </div>
                              <span style={barCount}>{n}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* GRÁFICOS — ESCALAS */}
            {scaleCharts.length > 0 && (
              <Section title="Escalas" delay={240}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }}>
                  {scaleCharts.map(({ q, dist, media, total }) => {
                    const max = Math.max(...dist, 1)
                    return (
                      <div key={q.id} style={card}>
                        <p style={chartLabel}>{q.label}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                          <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent)' }}>{media.toFixed(1)}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>média · {total} resposta(s)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '90px' }}>
                          {dist.map((n, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-2)' }}>{n}</span>
                              <div style={{ width: '100%', height: `${(n / max) * 100}%`, minHeight: n ? '4px' : '0', background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: n ? 1 : 0.15, transformOrigin: 'bottom', animation: 'growBarY 0.6s cubic-bezier(0.22,1,0.36,1) both' }} />
                              <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{i + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* RESPOSTAS ABERTAS */}
            <Section title="Respostas abertas" delay={320}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {openQuestions.map((q) => {
                  const vals = responses.map((r) => ({ nome: r.fields.nome || 'Anônimo', v: r.fields[q.id] })).filter((x) => x.v)
                  if (vals.length === 0) return null
                  return (
                    <div key={q.id} style={card}>
                      <p style={chartLabel}>{q.label}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {vals.map((x, i) => (
                          <div key={i} style={{ paddingLeft: '12px', borderLeft: '2px solid var(--border)' }}>
                            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{x.v}</p>
                            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>— {x.nome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>

            {/* TABULAÇÃO POR RESPONDENTE */}
            <Section title="Respondentes (detalhe)" delay={400}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {responses.map((r, i) => {
                  const open = openId === r.id
                  return (
                    <div key={r.id} style={{ ...card, padding: 0, overflow: 'hidden' }}>
                      <button onClick={() => setOpenId(open ? null : r.id)} style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
                        <div>
                          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{r.fields.nome || 'Anônimo'}</span>
                          <span style={{ fontSize: '13px', color: 'var(--text-3)', marginLeft: '10px' }}>{r.fields.funcao || 'função não informada'}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>#{responses.length - i} {open ? '▲' : '▼'}</span>
                      </button>
                      {open && (
                        <div style={{ padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {ALL_QUESTIONS.map((q) => {
                            const val = r.fields[q.id]
                            if (!val) return null
                            return (
                              <div key={q.id}>
                                <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '4px', lineHeight: 1.4 }}>{q.label}</p>
                                <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{q.type === 'scale' ? `${val} / 5` : val}</p>
                              </div>
                            )
                          })}
                          {r.fields.Timestamp && (
                            <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>Enviado em {new Date(r.fields.Timestamp).toLocaleString('pt-BR')}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  )
}

/* ---------- Componentes auxiliares ---------- */

function TopBar() {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="#0a0a0a" /><rect x="8" y="1" width="5" height="5" rx="1" fill="#0a0a0a" />
            <rect x="1" y="8" width="5" height="5" rx="1" fill="#0a0a0a" /><rect x="8" y="8" width="5" height="5" rx="1" fill="#0a0a0a" />
          </svg>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-2)' }}>Dashboard de Design</span>
      </div>
      <a href="/" style={{ fontSize: '13px', color: 'var(--text-3)', textDecoration: 'none' }}>← Formulário</a>
    </div>
  )
}

function Section({ title, children, accent, delay = 0 }: { title: string; children: React.ReactNode; accent?: boolean; delay?: number }) {
  return (
    <div className="reveal" style={{ marginBottom: '44px', animationDelay: `${delay}ms` }}>
      <h2 style={{ fontSize: '13px', fontWeight: 600, color: accent ? 'var(--accent)' : 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>{title}</h2>
      {children}
    </div>
  )
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={card}>
      <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{value}</p>
      {sub && <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>{sub}</p>}
    </div>
  )
}

function AnalysisGroup({ title, items, numbered }: { title: string; items?: AnalysisItem[]; numbered?: boolean }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((it, i) => (
          <div key={i} style={{ ...card, padding: '16px 18px', display: 'flex', gap: '12px' }}>
            {numbered && <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', minWidth: '18px' }}>{i + 1}</span>}
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{it.titulo}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6 }}>{it.descricao}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', color: '#f87171', fontSize: '14px' }}>{children}</div>
  )
}

function DashboardSkeleton() {
  return (
    <div>
      {/* métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '40px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={card}>
            <div className="skeleton" style={{ height: '12px', width: '60%', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '24px', width: '45%' }} />
          </div>
        ))}
      </div>
      {/* blocos */}
      {[0, 1].map((b) => (
        <div key={b} style={{ marginBottom: '44px' }}>
          <div className="skeleton" style={{ height: '12px', width: '140px', marginBottom: '16px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }}>
            {[0, 1].map((i) => (
              <div key={i} style={card}>
                <div className="skeleton" style={{ height: '12px', width: '70%', marginBottom: '16px' }} />
                {[0, 1, 2, 3].map((j) => (
                  <div key={j} className="skeleton" style={{ height: '26px', width: `${90 - j * 15}%`, marginBottom: '8px' }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- Estilos ---------- */
const card: React.CSSProperties = { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }
const chartLabel: React.CSSProperties = { fontSize: '13px', color: 'var(--text-2)', marginBottom: '14px', lineHeight: 1.4 }
const barTrack: React.CSSProperties = { flex: 1, height: '26px', background: 'var(--bg-3)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }
const barText: React.CSSProperties = { position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--text)', whiteSpace: 'nowrap' }
const barCount: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: 'var(--accent)', minWidth: '20px', textAlign: 'right' }
const btnPrimary: React.CSSProperties = { padding: '12px 28px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#0a0a0a', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }
const btnGhost: React.CSSProperties = { padding: '10px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--text-2)', cursor: 'pointer' }
