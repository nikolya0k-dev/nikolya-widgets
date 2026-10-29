// Собирает папку deploy/ для публикации на Netlify: копирует виджеты, демо и тестовые страницы.
import { cpSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';

const WIDGETS = ['quiz-beauty', 'calc-cleaning'];
const FILES = ['widget.js', 'demo.html', 'test-noisy.html', 'insert.md'];
const out = new URL('../deploy/', import.meta.url);

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const w of WIDGETS) {
  mkdirSync(new URL(`${w}/`, out));
  for (const f of FILES) cpSync(new URL(`../${w}/${f}`, import.meta.url), new URL(`${w}/${f}`, out));
}
cpSync(new URL('../site/index.html', import.meta.url), new URL('index.html', out));
writeFileSync(new URL('_headers', out), readFileSync(new URL('../site/_headers', import.meta.url)));
console.log('deploy/ готов:', WIDGETS.join(', '));
