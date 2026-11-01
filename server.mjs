import http from 'node:http';

http.createServer((req, res) => {
  res.writeHead(503, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    ok: true,
    product: 'dope_24/7',
    status: 'diagnostic-test'
  }));
}).listen(3000, '0.0.0.0');
