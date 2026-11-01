import http from 'node:http';

http.createServer((req, res) => {
  res.writeHead(500, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    ok: true,
    product: 'dope_24/7',
    status: 'live-v2'
  }));
}).listen(3000, '0.0.0.0');
