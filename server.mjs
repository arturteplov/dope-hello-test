import http from 'node:http';
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Parts Quote — team utility</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f5f7f9;color:#1a2636;font:15px system-ui,-apple-system,sans-serif}main{max-width:880px;margin:auto;padding:45px 20px}header{display:flex;justify-content:space-between;gap:15px;align-items:center}h1{font-size:38px;letter-spacing:-1.5px;margin:8px 0 4px}.sub{color:#68788d}.tag{background:#e7eef7;color:#395879;border-radius:8px;padding:10px;font-size:12px}.card{background:white;border:1px solid #dfe6ee;padding:25px;border-radius:14px;margin:25px 0}h2{margin:0 0 22px;font-size:18px}label{font-size:13px;color:#526276;font-weight:600}input{font:inherit;display:block;width:100%;padding:12px;border:1px solid #cbd6e2;border-radius:8px;margin:7px 0}input:focus{outline:2px solid #8eb6e3}.fields{display:grid;grid-template-columns:2fr 1fr;gap:18px}.scroll{overflow-x:auto}table{width:100%;min-width:485px;border-collapse:collapse}th{text-align:left;font-size:12px;color:#77869a;padding:12px 5px;border-bottom:1px solid #e7edf4}td{padding:6px 5px}td:first-child{width:50%}button{padding:12px 16px;border-radius:8px;border:1px solid #bacbdc;background:white;color:#304763;font-weight:650;cursor:pointer}button.primary{background:#183653;color:white;border-color:#183653}.buttons{display:flex;gap:10px;flex-wrap:wrap;justify-content:space-between;margin-top:20px}button.remove{border:0;font-size:21px;padding:4px}.results{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.metric{background:#f0f4f9;padding:15px;border-radius:9px}.metric span{font-size:12px;color:#718094;display:block}.metric strong{display:block;font-size:24px;margin-top:10px}.error{color:#b3233b;font-weight:600}small{color:#758398}footer{color:#8290a0;font-size:12px}@media(max-width:600px){header{display:block}.fields,.results{grid-template-columns:1fr}.card{padding:15px}}
</style></head><body><main><header><div><small>TEAM UTILITY / DEMO</small><h1>Parts quote</h1><p class="sub">Create a quick estimate from a bill of materials.</p></div><span class="tag">Deployed with dope_24/7</span></header>
<section class="card"><h2>Estimate details</h2><div class="fields"><label>Project reference<input id="project" maxlength="70" value="Pump retrofit — sample"></label><label>Markup (%)<input id="markup" type="number" min="0" max="100" step="0.1" value="12"></label></div>
<div class="scroll"><table><thead><tr><th>Description</th><th>Quantity</th><th>Unit USD</th><th></th></tr></thead><tbody id="rows"></tbody></table></div>
<div class="buttons"><button id="add">+ Add line</button><button class="primary" id="calc">Calculate quote</button></div><p class="error" id="error" hidden></p></section>
<section class="card" id="result" hidden><h2>Quote result: <span id="ref"></span></h2><div class="results"><div class="metric"><span>Subtotal</span><strong id="subtotal"></strong></div><div class="metric"><span>Markup</span><strong id="markupValue"></strong></div><div class="metric"><span>Estimate total</span><strong id="total"></strong></div></div><div class="buttons"><button id="copy">Copy summary</button><button id="csv">Export CSV</button></div><p><small>Calculations are performed by the server. Nothing is stored or synchronized between users.</small></p></section><footer>Demo data only. Access protection is provided by the deployment gateway.</footer></main>
<script>
const el=id=>document.getElementById(id), rows=el('rows'); let latest=null;
function add(item='',qty=1,price=0){const tr=document.createElement('tr');for(const [value,type] of [[item,'text'],[qty,'number'],[price,'number']]){const td=document.createElement('td'),i=document.createElement('input');i.type=type;i.value=value;if(type==='text'){i.maxLength=80;i.placeholder='Part description';}else{i.min='0';i.step=type==='number'&&value===qty?'1':'0.01';}td.append(i);tr.append(td);}const td=document.createElement('td'),b=document.createElement('button');b.textContent='×';b.className='remove';b.setAttribute('aria-label','Remove row');b.onclick=()=>tr.remove();td.append(b);tr.append(td);rows.append(tr);}
add('Pump seals',2,125);add('Wiring (m)',8,6.5);add('Enclosure',1,89);
el('add').onclick=()=>add();
const fmt=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
el('calc').onclick=async()=>{el('result').hidden=true;el('error').hidden=true;const items=[...rows.querySelectorAll('tr')].map(tr=>{const i=[...tr.querySelectorAll('input')];return{item:i[0].value,quantity:Number(i[1].value),unitPrice:Number(i[2].value)}});try{const res=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,markupPercent:Number(el('markup').value)})});const data=await res.json();if(!res.ok)throw Error(data.error||'Calculation failed');latest={...data,project:el('project').value||'Untitled'};el('ref').textContent=latest.project;el('subtotal').textContent=fmt(latest.subtotal);el('markupValue').textContent=fmt(latest.markupAmount);el('total').textContent=fmt(latest.total);el('result').hidden=false;}catch(e){el('error').textContent=e.message;el('error').hidden=false;}};
el('copy').onclick=async()=>{if(!latest)return;const text=latest.project+'\\n'+latest.items.map(i=>i.item+': '+i.quantity+' × '+fmt(i.unitPrice)+' = '+fmt(i.lineTotal)).join('\\n')+'\\nTOTAL '+fmt(latest.total);try{await navigator.clipboard.writeText(text);el('copy').textContent='Copied';}catch{window.prompt('Copy estimate',text);}};
el('csv').onclick=()=>{if(!latest)return;const quote=v=>'"'+String(v).replaceAll('"','""')+'"';const rows=[['Description','Quantity','Unit price USD','Line total USD'],...latest.items.map(i=>[i.item,i.quantity,i.unitPrice.toFixed(2),i.lineTotal.toFixed(2)]),['Total','','',latest.total.toFixed(2)]];const csv=rows.map(row=>row.map(quote).join(',')).join('\\r\\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='parts-quote.csv';a.click();URL.revokeObjectURL(url);};
</script></body></html>`;
const baseHeaders={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
function send(res,status,obj){res.writeHead(status,{...baseHeaders,'Content-Type':'application/json'});res.end(JSON.stringify(obj));}
function calculate(body){
 if(!body||!Array.isArray(body.items)||body.items.length===0||body.items.length>30)throw Error('Provide 1–30 items');
 if(typeof body.markupPercent!=='number'||!Number.isFinite(body.markupPercent)||body.markupPercent<0||body.markupPercent>100)throw Error('Markup must be 0–100%');
 let cents=0;
 const items=body.items.map((i,n)=>{
  if(!i||typeof i.item!=='string'||!i.item.trim()||i.item.length>80||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>10000||typeof i.unitPrice!=='number'||!Number.isFinite(i.unitPrice)||i.unitPrice<0||i.unitPrice>1000000)throw Error('Invalid item '+(n+1));
  const price=Math.round(i.unitPrice*100);
  if(Math.abs(price-i.unitPrice*100)>1e-5)throw Error('Unit price must have at most 2 decimals');
  const amount=price*i.quantity;cents+=amount;
  if(!Number.isSafeInteger(cents))throw Error('Total too large');
  return{item:i.item.trim(),quantity:i.quantity,unitPrice:price/100,lineTotal:amount/100};
 });
 const markup=Math.round(cents*body.markupPercent/100);
 return{items,subtotal:cents/100,markupAmount:markup/100,total:(cents+markup)/100};
}
http.createServer(async(req,res)=>{
 try{
  const path=new URL(req.url||'/','http://localhost').pathname;
  if(req.method==='GET'&&path==='/health')return send(res,200,{ok:true,health:'green'});
  if(req.method==='GET'&&path==='/checkout')return send(res,200,{ok:true,checkout:'checkout-ready'});
  if(req.method==='GET'&&path==='/'){res.writeHead(200,{...baseHeaders,'Content-Type':'text/html; charset=utf-8'});return res.end(html);}
  if(req.method==='POST'&&path==='/api/quote'){
   if(!String(req.headers['content-type']||'').startsWith('application/json'))return send(res,415,{error:'JSON required'});
   let raw='';for await(const c of req){raw+=c.toString('utf8');if(raw.length>12000)return send(res,413,{error:'Request too large'});}
   let obj;try{obj=JSON.parse(raw)}catch{return send(res,400,{error:'Invalid JSON'});}
   try{return send(res,200,calculate(obj))}catch(e){return send(res,400,{error:e.message});}
  }
  send(res,404,{error:'Not found'});
 }catch(e){send(res,500,{error:'Internal error'});}
}).listen(Number(process.env.PORT||3000),'0.0.0.0');