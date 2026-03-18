import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const authDocumentRedirects = new Map([
  ['/api/auth/verify-email', '/verify-email'],
  ['/api/auth/reset-password', '/reset-password'],
  ['/api/auth/reset_password', '/reset-password'],
])

function createAuthDocumentRedirectPlugin() {
  const redirectAuthDocumentRequest = (
    req: { method?: string; url?: string; headers?: Record<string, string | string[] | undefined> },
    res: { statusCode?: number; setHeader: (name: string, value: string) => void; end: () => void },
    next: () => void,
  ) => {
    if (req.method !== 'GET' || !req.url) {
      next()
      return
    }

    const requestUrl = new URL(req.url, 'http://localhost')
    const redirectPath = authDocumentRedirects.get(requestUrl.pathname)

    if (!redirectPath) {
      next()
      return
    }

    const acceptHeader = req.headers?.accept
    const normalizedAccept =
      typeof acceptHeader === 'string' ? acceptHeader : Array.isArray(acceptHeader) ? acceptHeader.join(',') : ''
    const isDocumentNavigation = normalizedAccept.includes('text/html')

    if (!isDocumentNavigation) {
      next()
      return
    }

    const redirectUrl = new URL(redirectPath, 'http://localhost')

    requestUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.append(key, value)
    })

    res.statusCode = 302
    res.setHeader('Location', `${redirectUrl.pathname}${redirectUrl.search}`)
    res.end()
  }

  return {
    name: 'auth-document-route-redirect',
    configureServer(server: { middlewares: { use: (fn: typeof redirectAuthDocumentRequest) => void } }) {
      server.middlewares.use(redirectAuthDocumentRequest)
    },
    configurePreviewServer(server: { middlewares: { use: (fn: typeof redirectAuthDocumentRequest) => void } }) {
      server.middlewares.use(redirectAuthDocumentRequest)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [createAuthDocumentRedirectPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://extrajudicial-fleta-fallalishly.ngrok-free.dev',
        changeOrigin: true,
        secure: true,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
    },
  },
})
