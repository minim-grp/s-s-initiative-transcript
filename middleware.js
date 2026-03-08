// middleware.js
const AUTH_COOKIE_NAME = 'initiativen_auth'
const PASSWORD = 'y1$Qi!bDVRc1*NBp' // Dein Passwort

export default async function middleware(request) {
  const url = new URL(request.url)
  const cookieHeader = request.headers.get('cookie') || ''
  const hasAuth = cookieHeader.includes(`${AUTH_COOKIE_NAME}=${PASSWORD}`)

  // 1. Erlaube Zugriff auf statische Assets (Logo, Favicon)
  if (url.pathname.includes('.') && !url.pathname.endsWith('.html')) {
    return
  }

  // 2. Login-Logik: Wenn das Passwort gesendet wird
  if (request.method === 'POST') {
    try {
      const formData = await request.formData()
      const enteredPassword = formData.get('password')

      if (enteredPassword === PASSWORD) {
        const response = new Response(null, { status: 307, headers: { 'Location': '/' } })
        response.headers.append('Set-Cookie', `${AUTH_COOKIE_NAME}=${PASSWORD}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`)
        return response
      } else {
        return new Response(getLoginHtml(true), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      }
    } catch (e) {}
  }

  // 3. Wenn nicht eingeloggt -> Zeige Login-Formular (statt 404)
  if (!hasAuth) {
    return new Response(getLoginHtml(false), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }

  // 4. Wenn eingeloggt -> Vercel zeigt automatisch die index.html
  return
}

function getLoginHtml(isError) {
  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login | Initiativenplaner</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
      <style>body { font-family: 'Poppins', sans-serif; }</style>
    </head>
    <body class="bg-slate-50 flex items-center justify-center min-h-screen p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-800">Zugriff geschützt</h2>
          <p class="text-gray-500 mt-2">Bitte gib das Passwort ein, um den Initiativenplaner zu nutzen.</p>
        </div>
        <form method="POST">
          <input type="password" name="password" placeholder="Passwort eingeben" required autofocus
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#72974c] focus:ring-2 focus:ring-[#72974c]/20 outline-none transition-all mb-4">
          <button type="submit" 
            class="w-full bg-[#72974c] hover:bg-[#5f7e3f] text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-[#72974c]/20">
            Anmelden
          </button>
        </form>
        ${isError ? '<p class="text-red-500 text-center mt-4 text-sm font-medium">❌ Falsches Passwort</p>' : ''}
      </div>
    </body>
    </html>
  `
}

export const config = {
  matcher: ['/', '/index.html']
}
