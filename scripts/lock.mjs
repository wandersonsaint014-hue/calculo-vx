import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
const data = ["scripts/lock-0.txt", "scripts/lock-1.txt", "scripts/lock-2.txt", "scripts/lock-3.txt", "scripts/lock-4.txt", "scripts/lock-5.txt", "scripts/lock-6.txt", "scripts/lock-7.txt", "scripts/lock-8.txt"].map(path => readFileSync(path,'utf8')).join('');
writeFileSync('pnpm-lock.yaml',gunzipSync(Buffer.from(data,'base64')));
