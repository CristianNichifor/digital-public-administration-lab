import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pin = readFileSync(resolve(root, 'bureaucracy-as-code.sha'), 'utf8').trim();
if (!/^[0-9a-f]{40}$/.test(pin)) throw new Error('Expected a full sibling commit SHA');
const destination = resolve(root, '.cache/bureaucracy-as-code');
// Never reset an existing checkout: even this disposable directory could contain work.
if (!existsSync(destination)) {
  mkdirSync(destination, { recursive: true });
  execFileSync('git', ['init', destination], { stdio: 'inherit' });
  execFileSync('git', ['-C', destination, 'fetch', '--depth=1',
    'https://github.com/CristianNichifor/bureaucracy-as-code.git', pin], { stdio: 'inherit' });
  execFileSync('git', ['-C', destination, 'checkout', '--detach', 'FETCH_HEAD'], { stdio: 'inherit' });
}
const actual = execFileSync('git', ['-C', destination, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (actual !== pin) throw new Error(`Cached sibling is ${actual}, expected ${pin}; move it aside and rerun setup`);
console.log(`Sibling ready at ${destination} (${pin})`);
