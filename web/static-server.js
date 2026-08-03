import { createServer } from 'node:http'
import { createReadStream, statSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { request as httpRequest } from 'node:http'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, 'dist')
const backendUrl = new URL('http://localhost:3000')
const port = parseInt(process.env.PORT || '4173', 10)

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
}

function sendFile(res, filePath) {
  try {
    const stat = statSync(filePath)
    res.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-store'
    })
    createReadStream(filePath).pipe(res)
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
  }
}

function proxyRequest(req, res) {
  const targetUrl = new URL(req.url, backendUrl)
  const proxy = httpRequest(targetUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: backendUrl.host
    }
  }, (backendRes) => {
    res.writeHead(backendRes.statusCode || 500, backendRes.headers)
    backendRes.pipe(res)
  })
  req.pipe(proxy)
  proxy.on('error', (error) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' })
    res.end('Bad gateway: ' + error.message)
  })
}

function serveSpa(req, res) {
  const urlPath = new URL(req.url, 'http://localhost').pathname
  const filePath = resolve(distDir, '.' + urlPath)

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    sendFile(res, filePath)
    return
  }
  sendFile(res, resolve(distDir, 'index.html'))
}

const server = createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400)
    return res.end('Bad request')
  }

  if (req.url.startsWith('/api') || req.url.startsWith('/videos')) {
    proxyRequest(req, res)
    return
  }

  serveSpa(req, res)
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Static web server running on http://localhost:${port}`)
  console.log(`Proxying /api and /videos to ${backendUrl.href}`)
})
