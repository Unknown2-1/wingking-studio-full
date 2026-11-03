import { createServer } from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import { extname, resolve, relative, sep, join } from 'node:path';

const root = resolve(process.cwd(), process.argv[2] || 'apps/live-public/dist');
const port = Number(process.argv[3] || 3000);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('Port must be a valid non-privileged integer');
}
const mime = {
 '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
 '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
 '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml',
 '.webp':'image/webp', '.png':'image/png','.jpg':'image/jpeg',
 '.ico':'image/x-icon', '.woff2':'font/woff2'
};

createServer(async (req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end('Method not allowed');return}
  const url = new URL(req.url,'http://localhost');
  const decoded=decodeURIComponent(url.pathname);
  if(decoded.includes('\\')||decoded.includes('\0'))throw new Error('Invalid path');
  let file=resolve(root,'.'+decoded);
  const rel=relative(root,file);
  if(rel==='..'||rel.startsWith('..'+sep))throw new Error('Outside root');
  let s=await stat(file).catch(()=>null);
  if(s?.isDirectory()){file=join(file,'index.html');s=await stat(file).catch(()=>null)}
  if(!s?.isFile()){res.writeHead(404);res.end('Not found');return}
  const real=await realpath(file);const realRoot=await realpath(root);
  const local=relative(realRoot,real);
  if(local==='..'||local.startsWith('..'+sep))throw new Error('Symlink outside root');
  const body=await readFile(file);
  res.writeHead(200,{'Content-Type':mime[extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:body);
 }catch(e){res.writeHead(400);res.end('Invalid request')}
}).listen(port,()=>console.log('Wingking static server: http://localhost:'+port+' (root: '+root+')'));
