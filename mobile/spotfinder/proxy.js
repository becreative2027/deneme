const http = require('http');
const url = require('url');

const TARGET_HOST = '159.89.13.168';
const TARGET_PORT = 5000;
const PROXY_PORT = 9000;

const server = http.createServer((req, res) => {
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${TARGET_HOST}:${TARGET_PORT}` },
  };

  console.log(`→ ${req.method} ${req.url}`);

  const proxy = http.request(options, (proxyRes) => {
    console.log(`← ${proxyRes.statusCode} ${req.url}`);
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxy.on('error', (err) => {
    console.error(`✗ ${req.url}:`, err.message);
    res.writeHead(502);
    res.end(JSON.stringify({ error: err.message }));
  });

  req.pipe(proxy);
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`Proxy running: localhost:${PROXY_PORT} → ${TARGET_HOST}:${TARGET_PORT}`);
});
