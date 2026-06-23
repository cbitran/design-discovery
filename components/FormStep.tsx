'use client'
import { Section, Question } from '@/lib/questions'

interface Props {
  section: Section
  answers: Record<string, string | string[] | number>
  onChange: (id: string, value: string | string[] | number) => void
}

export default function FormStep({ section, answers, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {section.questions.map((q) => (
        <QuestionField key={q.id} question={q} value={answers[q.id]} onChange={(v) => onChange(q.id, v)} />
      ))}
    </div>
  )
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question
  value: string | string[] | number | undefined
  onChange: (v: string | string[] | number) => void
}) {
  const q = question

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>
        {q.label}
        {q.required && <span style={{ color: 'var(--accent)', marginLeft: '4px' }}>*</span>}
      </label>

      {q.type === 'text' && (
        <input
          type="text"
          placeholder={q.placeholder}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {q.type === 'textarea' && (
        <textarea
          rows={4}
          placeholder={q.placeholder}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight: '100px' }}
        />
      )}

      {(q.type === 'chips-single' || q.type === 'chips-multi') && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {q.options?.map((opt) => {
            const isMulti = q.type === 'chips-multi'
            const selected = isMulti
              ? ((value as string[]) || []).includes(opt)
              : value === opt

            return (
              <button
                key={opt}
                onClick={() => {
                  if (isMulti) {
                    const cur = (value as string[]) || []
                    if (cur.includes(opt)) onChange(cur.filter((x) => x !== opt))
                    else onChange([...cur, opt])
                  } else {
                    onChange(opt)
                  }
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '100px',
                  border: selected ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  background: selected ? 'var(--accent-dim2)' : 'var(--bg-3)',
                  color: selected ? 'var(--accent)' : 'var(--text-2)',
                  fontSize: '13px',
                  fontWeight: selected ? 500 : 400,
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {q.type === 'scale' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{q.scaleMin}</span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={(value as number) || 3}
              onChange={(e) => onChange(Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: 'var(--accent)',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                padding: 0,
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{q.scaleMax}</span>
            <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)', minWidth: '24px', textAlign: 'right' }}>
              {value || 3}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0', fontSize: '11px', color: 'var(--text-3)' }}>
            {[1, 2, 3, 4, 5].map((n) => <span key={n}>{n}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}
