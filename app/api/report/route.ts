import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const airtableToken = process.env.AIRTABLE_TOKEN
    const airtableBase = process.env.AIRTABLE_BASE_ID
    const airtableTable = process.env.AIRTABLE_TABLE_NAME || 'Respostas'
    const anthropicKey = process.env.ANTHROPIC_API_KEY

    if (!airtableToken || !airtableBase || !anthropicKey) {
      return NextResponse.json({ error: 'Variáveis de ambiente não configuradas' }, { status: 500 })
    }

    // Fetch all records from Airtable
    const res = await fetch(
      `https://api.airtable.com/v0/${airtableBase}/${encodeURIComponent(airtableTable)}?maxRecords=200`,
      { headers: { Authorization: `Bearer ${airtableToken}` } }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Falha ao buscar dados do Airtable' }, { status: 500 })
    }

    const data = await res.json()
    const records = data.records || []

    if (records.length === 0) {
      return NextResponse.json({ error: 'Nenhuma resposta encontrada ainda.' }, { status: 404 })
    }

    const summary = records.map((r: { fields: Record<string, string> }, i: number) => {
      const f = r.fields
      return `--- Respondente ${i + 1}: ${f.nome || 'Anônimo'} (${f.funcao || 'função não informada'}) ---
Interação com Design: ${f.interacao_design || '-'}
Expectativa do Design: ${f.expectativa_design || '-'}
Participação desejada: ${f.participacao_design || '-'}
Responsabilidade faltante: ${f.responsabilidade_faltante || '-'}
Design ideal: ${f.design_ideal || '-'}
Processo que funciona: ${f.processo_bom || '-'}
O que trava: ${f.processo_ruim || '-'}
Falta de alinhamento: ${f.alinhamento || '-'}
O que ajuda a entender layouts: ${f.layout_clareza || '-'}
Infos desejadas no arquivo: ${f.infos_arquivo || '-'}
Handoff indispensável: ${f.handoff_indispensavel || '-'}
Handoff ideal: ${f.handoff_ideal || '-'}
Dúvidas frequentes: ${f.duvidas_frequentes || '-'}
Expectativa de componente: ${f.componente_expectativa || '-'}
Falta no DS: ${f.ds_falta || '-'}
Prioridade no DS: ${f.ds_prioridade || '-'}
Assets mais usados: ${f.assets_tipos || '-'}
Dificuldade com assets: ${f.assets_dificuldade || '-'}
Inconsistência: ${f.inconsistencia || '-'}
Comunicação preferida: ${f.comunicacao_preferencia || '-'}
Rituais desejados: ${f.cerimonias || '-'}
Impacto de handoff ruim: ${f.impacto_atraso || '-'}/5
Prioridades para o futuro: ${f.prioridades || '-'}
O que significaria melhora: ${f.melhoria_significativa || '-'}
Extra: ${f.extra || '-'}`
    }).join('\n\n')

    const prompt = `Você é um especialista em design de produto e processos de colaboração entre Design e Engenharia. Analise as respostas abaixo de ${records.length} colaborador(es) e gere um relatório executivo consolidado com:

1. **Perfil dos respondentes** — quem são, quais funções
2. **Principais dores e fricções** — o que mais aparece como problema (rankear por frequência/impacto)
3. **O que já funciona** — pontos positivos mencionados
4. **Gaps críticos no handoff** — o que falta nas entregas de Design
5. **Design System** — prioridades identificadas
6. **Comunicação e rituais** — o que a equipe pede
7. **Top 3 recomendações prioritárias** — ações concretas que o time de Design deve tomar primeiro

Seja direto, use dados das respostas, e termine com as 3 ações mais impactantes. Escreva em português.

=== RESPOSTAS ===
${summary}`

    // Call Anthropic API
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!aiRes.ok) {
      return NextResponse.json({ error: 'Falha ao gerar relatório com IA' }, { status: 500 })
    }

    const aiData = await aiRes.json()
    const report = aiData.content?.[0]?.text || 'Relatório não disponível.'

    return NextResponse.json({ report, count: records.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
