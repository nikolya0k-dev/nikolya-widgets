// Собирает папку deploy/ для публикации на GitHub Pages: копирует виджеты, демо и тестовые страницы.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';

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
// GitHub Pages: отдавать файлы как есть, без обработки Jekyll
writeFileSync(new URL('.nojekyll', out), '');
console.log('deploy/ готов:', WIDGETS.join(', '));
