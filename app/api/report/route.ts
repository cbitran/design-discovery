import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const airtableToken = process.env.AIRTABLE_TOKEN
    const airtableBase = process.env.AIRTABLE_BASE_ID
    const airtableTable = process.env.AIRTABLE_TABLE_NAME || 'Respostas'

    if (!airtableToken || !airtableBase) {
      return NextResponse.json({ error: 'Variáveis de ambiente não configuradas' }, { status: 500 })
    }

    // Fetch all records from Airtable
    const res = await fetch(
      `https://api.airtable.com/v0/${airtableBase}/${encodeURIComponent(airtableTable)}?maxRecords=500`,
      { headers: { Authorization: `Bearer ${airtableToken}` }, cache: 'no-store' }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Falha ao buscar dados do Airtable' }, { status: 500 })
    }

    const data = await res.json()
    const records = (data.records || []) as { id: string; fields: Record<string, string> }[]

    // As respostas ficam serializadas como JSON na coluna "Notes".
    const responses = records
      .map((r) => {
        let parsed: Record<string, string> = {}
        try {
          if (r.fields.Notes) parsed = JSON.parse(r.fields.Notes)
        } catch {
          parsed = {}
        }
        return { id: r.id, fields: parsed }
      })
      .filter((r) => Object.keys(r.fields).length > 0)
      .sort((a, b) => String(b.fields.Timestamp || '').localeCompare(String(a.fields.Timestamp || '')))

    // Vazio NÃO é erro: o dashboard renderiza a estrutura zerada.
    return NextResponse.json({ responses, count: responses.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
