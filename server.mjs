import http from 'node:http';

// Controlled PaaS failure-injection fixture. Both branches always return
// HTTP 200 at /health. Only the GOOD branch satisfies the /checkout contract.
http.createServer((req,res)=>{
  res.writeHead(200, {'Content-Type':'application/json','Cache-Control':'no-store'});
  if(req.url==='/health') return res.end(JSON.stringify({ok:true,health:'green'}));
  if(req.url==='/checkout') return res.end(JSON.stringify({ok:true,checkout:'checkout-ready'}));
  return res.end(JSON.stringify({ok:true,product:'dope_24/7',status:'semantic-good'}));
}).listen(3000,'0.0.0.0');
