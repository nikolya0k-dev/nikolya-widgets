// Публикует папку deploy/ на GitHub Pages: кладёт её содержимое в ветку gh-pages репозитория origin.
// Перед запуском: node scripts/build.mjs и коммит изменений (публикуется закоммиченная версия deploy/).
import { execSync } from 'node:child_process';

const run = (cmd) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();

if (run('git status --porcelain -- deploy')) {
  console.error('В deploy/ есть незакоммиченные изменения — сначала сделайте коммит.');
  process.exit(1);
}
const tree = run('git subtree split --prefix deploy HEAD');
run(`git push --force origin ${tree}:refs/heads/gh-pages`);
console.log('Опубликовано в gh-pages:', tree.slice(0, 7));
