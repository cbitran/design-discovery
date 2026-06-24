import { NextRequest, NextResponse } from 'next/server'

/**
 * Protege o dashboard e suas APIs com senha (HTTP Basic Auth).
 * O formulário público ("/" e /api/submit) fica livre.
 *
 * Configurar na Vercel:
 *   DASHBOARD_PASSWORD = <a senha>
 *   DASHBOARD_USER     = <opcional, padrão "admin">
 *
 * Se DASHBOARD_PASSWORD não estiver definida, não bloqueia (evita lockout).
 */
export function middleware(req: NextRequest) {
  const expectedPass = process.env.DASHBOARD_PASSWORD
  const expectedUser = process.env.DASHBOARD_USER || 'admin'

  // Sem senha configurada → não protege (fail-open para não travar o acesso)
  if (!expectedPass) return NextResponse.next()

  const auth = req.headers.get('authorization')
  if (auth) {
    const [scheme, encoded] = auth.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)
      const sep = decoded.indexOf(':')
      const user = decoded.slice(0, sep)
      const pass = decoded.slice(sep + 1)
      if (user === expectedUser && pass === expectedPass) {
        return NextResponse.next()
      }
    }
  }

  return new NextResponse('Acesso restrito ao time de Design.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Dashboard de Design", charset="UTF-8"' },
  })
}

export const config = {
  matcher: ['/relatorio', '/api/report', '/api/analyze'],
}
