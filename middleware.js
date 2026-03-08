// middleware.js
const AUTH_COOKIE_NAME = 'initiativen_auth'
const PASSWORD = '3E%89B!yKL6n@CQd' 

export default async function middleware(request) {
  const url = new URL(request.url)
  const cookieHeader = request.headers.get('cookie') || ''
  
  // Einfacher Check, ob der Cookie existiert
  const hasAuth = cookieHeader.includes(`${AUTH_COOKIE_NAME}=${PASSWORD}`)

  // 1. Wenn authentifiziert -> Weiterleitung zur angeforderten Ressource
  if (hasAuth) {
    return // undefined bedeutet: Anfrage einfach durchlaufen lassen
  }

  // 2. Login-Logik (POST-Request an /auth)
  if (url.pathname === '/auth' && request.method === 'POST') {
    try {
      const formData = await request.formData()
      const enteredPassword = formData.get('password')

      if (enteredPassword === PASSWORD) {
        // Erfolg: Umleiten auf Home + Cookie setzen
        const response = new Response(null, {
          status: 307,
          headers: { 'Location': '/' }
        })
        response.headers.append('Set-Cookie', `${AUTH_COOKIE_NAME}=${PASSWORD}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`)
        return response
      }
    } catch (e) {
      // Fehler beim Parsen von Form-Data
    }
    
    // Falsches Passwort
    return new Response(getLoginHtml(true), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }

  // 3. Login-Seite anzeigen (GET auf /auth)
  if (url.pathname === '/auth') {
    return new Response(getLoginHtml(false), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }

  // 4. Alle anderen Seiten -> Umleiten zu /auth (außer statische Assets)
  const excludedPaths = ['/favicon.ico', '/logo-sands.svg']
  if (!excludedPaths.includes(url.pathname)) {
    return new Response(null, {
      status: 307,
      headers: { 'Location': '/auth' }
    })
  }
}

// Hilfsfunktion für das HTML (sauberer getrennt)
function getLoginHtml(isError) {
  return `
    <html>
      <head>
        <title>Initiativenplaner Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }
          .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; width: 100%; max-width: 350px; }
          input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
          button { width: 100%; padding: 12px; background: #72974c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
          .error { color: #dc2626; font-size: 14px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Zugriff geschützt</h2>
          <p>Bitte Passwort eingeben</p>
          <form method="POST" action="/auth">
            <input type="password" name="password" placeholder="Passwort" required autofocus>
            <button type="submit">Login</button>
          </form>
          ${isError ? '<p class="error">Falsches Passwort – bitte erneut versuchen.</p>' : ''}
        </div>
      </body>
    </html>
  `
}

// WICHTIG für Vercel (Matcher)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
