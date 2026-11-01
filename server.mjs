import http from 'node:http';

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    ok: true,
    product: 'dope_24/7',
    status: 'live'
  }));
}).listen(3000, '0.0.0.0');
