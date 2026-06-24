import { NextResponse } from 'next/server'
import { SECTIONS } from '@/lib/questions'

const ALL_QUESTIONS = SECTIONS.flatMap((s) => s.questions)

export async function GET() {
  try {
    const airtableToken = process.env.AIRTABLE_TOKEN
    const airtableBase = process.env.AIRTABLE_BASE_ID
    const airtableTable = process.env.AIRTABLE_TABLE_NAME || 'Respostas'
    const geminiKey = process.env.GEMINI_API_KEY

    if (!airtableToken || !airtableBase) {
      return NextResponse.json({ error: 'Airtable não configurado' }, { status: 500 })
    }
    if (!geminiKey) {
      return NextResponse.json({ error: 'IA não configurada (falta GEMINI_API_KEY)' }, { status: 500 })
    }

    // Busca respostas
    const res = await fetch(
      `https://api.airtable.com/v0/${airtableBase}/${encodeURIComponent(airtableTable)}?maxRecords=500`,
      { headers: { Authorization: `Bearer ${airtableToken}` }, cache: 'no-store' }
    )
    if (!res.ok) {
      return NextResponse.json({ error: 'Falha ao buscar dados do Airtable' }, { status: 500 })
    }
    const data = await res.json()
    const records = (data.records || []) as { id: string; fields: Record<string, string> }[]

    const answers = records
      .map((r) => {
        try {
          return r.fields.Notes ? (JSON.parse(r.fields.Notes) as Record<string, string>) : null
        } catch {
          return null
        }
      })
      .filter(Boolean) as Record<string, string>[]

    if (answers.length === 0) {
      return NextResponse.json({ error: 'Nenhuma resposta encontrada ainda.' }, { status: 404 })
    }

    // Monta o texto consolidado das respostas
    const summary = answers
      .map((a, i) => {
        const linhas = ALL_QUESTIONS.map((q) => {
          const v = a[q.id]
          if (!v) return null
          return `  ${q.label}: ${v}`
        }).filter(Boolean)
        return `Respondente ${i + 1} (${a.nome || 'Anônimo'} — ${a.funcao || 'função não informada'}):\n${linhas.join('\n')}`
      })
      .join('\n\n')

    const prompt = `Você é um consultor sênior de Design de Produto analisando uma pesquisa interna sobre a colaboração entre o time de Design e o restante do time (devs, PMs, QA). Foram ${answers.length} respondente(s).

Analise as respostas e produza um diagnóstico EXECUTIVO, direto e acionável, em português. Baseie tudo em evidências reais das respostas — cite padrões que aparecem em mais de uma resposta quando houver.

RESPOSTAS:
${summary}

Responda APENAS com um JSON válido neste formato exato:
{
  "resumo": "2-3 frases sintetizando o estado geral da colaboração com Design.",
  "melhorias": [{"titulo": "curto", "descricao": "o que melhorar e por quê, baseado nas respostas"}],
  "atencao": [{"titulo": "curto", "descricao": "risco ou fricção que merece atenção imediata"}],
  "direcionamento": [{"titulo": "curto", "descricao": "ação concreta recomendada, em ordem de prioridade"}]
}

Regras: 3 a 5 itens em "melhorias", 2 a 4 em "atencao", 3 itens em "direcionamento" (os mais impactantes). Seja específico e objetivo.`

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
        }),
      }
    )

    if (!aiRes.ok) {
      const err = await aiRes.text()
      console.error('Gemini error:', err)
      return NextResponse.json({ error: 'Falha ao gerar análise com IA' }, { status: 500 })
    }

    const aiData = await aiRes.json()
    const text = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    let analysis
    try {
      analysis = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'A IA retornou um formato inesperado.' }, { status: 500 })
    }

    return NextResponse.json({ analysis, count: answers.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
