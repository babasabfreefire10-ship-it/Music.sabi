const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;
http.createServer(async (req,res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/search') {
    const term = (url.searchParams.get('term') || '').trim().slice(0,100);
    if (!term) { res.writeHead(400, {'Content-Type':'application/json'}); return res.end(JSON.stringify({error:'Mungon kërkimi'})); }
    try {
      const u = new URL('https://itunes.apple.com/search');
      u.search = new URLSearchParams({term, media:'music', entity:'song', limit:'30'});
      const r = await fetch(u, {signal: AbortSignal.timeout(12000)});
      if (!r.ok) throw new Error('upstream');
      const data = await r.json();
      res.writeHead(200, {'Content-Type':'application/json','Cache-Control':'public, max-age=300'});
      return res.end(JSON.stringify({results:(data.results || []).filter(x => x.previewUrl).map(x => ({id:x.trackId,title:x.trackName,artist:x.artistName,art:x.artworkUrl100,preview:x.previewUrl,album:x.collectionName}))}));
    } catch { res.writeHead(502, {'Content-Type':'application/json'}); return res.end(JSON.stringify({error:'Muzika nuk mund të ngarkohet tani. Provo përsëri.'})); }
  }
  if (url.pathname !== '/') {res.writeHead(404); return res.end('Not found');}
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'}); fs.createReadStream(path.join(__dirname,'index.html')).pipe(res);
}).listen(port, '0.0.0.0', () => console.log('Server ready'));
