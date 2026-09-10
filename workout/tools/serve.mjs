// Minimal static file server for local dev. No dependencies.
//
//   node workout/tools/serve.mjs [port]
//
// Serves the repository root, not workout/, so the app sits at /workout/ exactly
// as it does in production — the manifest's scope and start_url depend on that,
// and the footer link back to the site resolves.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../../..');
const port = Number(process.argv[2]) || 4173;

const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(req.url.split('?')[0]);
    if (path.endsWith('/')) path += 'index.html';

    const file = join(root, normalize(path).replace(/^(\.\.[/\\])+/, ''));
    const body = await readFile(file);

    res.writeHead(200, {
      'content-type': types[extname(file)] || 'application/octet-stream',
      // Dev only: never serve a stale module while iterating.
      'cache-control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('404');
  }
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
