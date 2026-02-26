const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const DOCS_DIR = __dirname;
const API_HOST = 'dev.labgate.net';

const MIME_TYPES = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // Enable CORS for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Proxy API requests to dev.labgate.net
  if (req.url.startsWith('/api/')) {
    proxyRequest(req, res);
    return;
  }

  // Serve static files
  let filePath = req.url.split('?')[0];
  filePath = filePath === '/' ? '/index.html' : filePath;
  filePath = path.join(DOCS_DIR, filePath);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

function proxyRequest(clientReq, clientRes) {
  let body = [];

  clientReq.on('data', chunk => {
    body.push(chunk);
  });

  clientReq.on('end', () => {
    body = Buffer.concat(body);

    const options = {
      hostname: API_HOST,
      port: 443,
      path: clientReq.url,
      method: clientReq.method,
      headers: {
        'Content-Type': clientReq.headers['content-type'] || 'application/json',
        'Content-Length': body.length
      }
    };

    // Forward Authorization header if present
    if (clientReq.headers['authorization']) {
      options.headers['Authorization'] = clientReq.headers['authorization'];
    }

    console.log(`[PROXY] ${clientReq.method} ${clientReq.url} -> https://${API_HOST}${clientReq.url}`);

    const proxyReq = https.request(options, (proxyRes) => {
      // Add CORS headers to response
      const headers = { ...proxyRes.headers };
      headers['Access-Control-Allow-Origin'] = '*';
      headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';

      console.log(`[PROXY] Response: ${proxyRes.statusCode}`);
      clientRes.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(clientRes);
    });

    proxyReq.on('error', (err) => {
      console.error('[PROXY] Error:', err.message);
      clientRes.writeHead(502, { 'Content-Type': 'application/json' });
      clientRes.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
    });

    if (body.length > 0) {
      proxyReq.write(body);
    }

    proxyReq.end();
  });
}

server.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║           labGate API Documentation Server             ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║                                                        ║');
  console.log(`║   Server running at: http://localhost:${PORT}             ║`);
  console.log('║                                                        ║');
  console.log('║   API Proxy: localhost:3333/api/* -> dev.labgate.net  ║');
  console.log('║                                                        ║');
  console.log('║   Press Ctrl+C to stop the server                      ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
});
