import { NextResponse } from 'next/server'

const AUTH_COOKIE_NAME = 'initiativen_auth'
const PASSWORD = 'dein_geheimes_passwort_2026' // ← ÄNDERE DAS HIER! (mind. 12 Zeichen, komplex)

export function middleware(request) {
  const url = request.nextUrl
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value

  // Wenn Passwort schon im Cookie → weiter
  if (authCookie === PASSWORD) {
    return NextResponse.next()
  }

  // Auth-Seite anzeigen oder prüfen
  if (url.pathname === '/auth') {
    if (request.method === 'POST') {
      const formData = request.formData()
      const enteredPassword = formData.get('password')

      if (enteredPassword === PASSWORD) {
        const response = NextResponse.redirect(new URL('/', request.url))
        response.cookies.set({
          name: AUTH_COOKIE_NAME,
          value: PASSWORD,
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 30 // 30 Tage
        })
        return response
      } else {
        return new Response(`
          <html>
            <head><title>Login</title></head>
            <body style="font-family:sans-serif; text-align:center; margin-top:100px;">
              <h2>Falsches Passwort</h2>
              <form method="POST">
                <input type="password" name="password" placeholder="Passwort" style="padding:12px; font-size:18px; width:300px;">
                <button type="submit" style="padding:12px 24px; font-size:18px; margin-left:10px;">Login</button>
              </form>
              <p style="color:red;">Falsches Passwort – erneut versuchen</p>
            </body>
          </html>
        `, {
          status: 401,
          headers: { 'Content-Type': 'text/html' }
        })
      }
    }

    // GET auf /auth → Login-Formular anzeigen
    return new Response(`
      <html>
        <head><title>Initiativenplaner Login</title></head>
        <body style="font-family:sans-serif; text-align:center; margin-top:100px;">
          <h2>Zugriff geschützt</h2>
          <p>Bitte Passwort eingeben</p>
          <form method="POST">
            <input type="password" name="password" placeholder="Passwort" style="padding:12px; font-size:18px; width:300px;">
            <button type="submit" style="padding:12px 24px; font-size:18px; margin-left:10px;">Login</button>
          </form>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    })
  }

  // Alles andere → zu /auth umleiten
  return NextResponse.redirect(new URL('/auth', request.url))
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
