import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { answers } = body

    const airtableToken = process.env.AIRTABLE_TOKEN
    const airtableBase = process.env.AIRTABLE_BASE_ID
    const airtableTable = process.env.AIRTABLE_TABLE_NAME || 'Respostas'

    if (!airtableToken || !airtableBase) {
      return NextResponse.json({ error: 'Airtable não configurado' }, { status: 500 })
    }

    const fields: Record<string, string> = {
      Timestamp: new Date().toISOString(),
    }
    for (const [key, value] of Object.entries(answers)) {
      if (Array.isArray(value)) {
        fields[key] = (value as string[]).join(', ')
      } else {
        fields[key] = String(value ?? '')
      }
    }

    const res = await fetch(`https://api.airtable.com/v0/${airtableBase}/${encodeURIComponent(airtableTable)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Airtable error:', err)
      return NextResponse.json({ error: 'Falha ao salvar no Airtable' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, id: data.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
