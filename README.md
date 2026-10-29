# Встраиваемые виджеты: квиз и калькулятор

Демо для кворка «Квиз или калькулятор стоимости для вашего сайта».

| Виджет | Исходники | Вставка |
| --- | --- | --- |
| Квиз «Подберём уход для ваших волос» | `quiz-beauty/` | `<div id="quiz-beauty"></div><script src="https://nikolya-widgets.netlify.app/quiz-beauty/widget.js"></script>` |
| Калькулятор уборки квартиры | `calc-cleaning/` | `<div id="calc-cleaning"></div><script src="https://nikolya-widgets.netlify.app/calc-cleaning/widget.js"></script>` |

В каждой папке:

- `widget.js` — весь виджет в одном файле; настройки (цены, тексты, цвета, контакты) — объект `CONFIG` в начале;
- `demo.html` — чистая страница с примером вставки;
- `test-noisy.html` — страница с агрессивными глобальными стилями для проверки изоляции;
- `insert.md` — инструкция для Tilda, WordPress и обычного сайта.

Разметка и стили виджетов живут в Shadow DOM, хост-элемент сбрасывается `all: initial !important`
inline-стилем, поэтому стили сайта не попадают внутрь, а виджет не добавляет глобальных стилей.

## Сборка и публикация

```bash
node scripts/build.mjs          # собирает deploy/
node scripts/serve.mjs deploy   # локальная проверка на http://localhost:5178
```

`deploy/` можно перетащить в Netlify Drop или подключить репозиторий — `netlify.toml` уже настроен.
