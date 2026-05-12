// Copies dist/cli.js to bin/{{PROJECT_NAME}}.js and adds a shebang + execute bit (POSIX).
import { readFileSync, writeFileSync, chmodSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const name = pkg.name;
const src = resolve('dist', 'cli.js');
const dst = resolve('bin', `${name}.js`);

mkdirSync('bin', { recursive: true });

const content = readFileSync(src, 'utf8');
const out = content.startsWith('#!')
  ? content
  : `#!/usr/bin/env node\n${content}`;
writeFileSync(dst, out);
try { chmodSync(dst, 0o755); } catch { /* Windows */ }

process.stdout.write(`Wrote ${dst}\n`);
