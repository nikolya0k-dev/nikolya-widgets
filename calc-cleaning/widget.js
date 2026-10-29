/*!
 * Калькулятор стоимости уборки квартиры — встраиваемый виджет.
 *
 * Подключение одной строкой:
 *   <div id="calc-cleaning"></div><script src="https://nikolya-widgets.netlify.app/calc-cleaning/widget.js"></script>
 *
 * Вся разметка и стили живут внутри Shadow DOM: стили сайта не влияют на виджет,
 * а виджет не добавляет на страницу ни одного глобального стиля.
 * Всё, что нужно менять под клиента, — в объекте CONFIG ниже.
 */
(function () {
  'use strict';

  /* =====================================================================
   * НАСТРОЙКИ
   * ===================================================================== */
  var CONFIG = {
    // id элемента-контейнера на странице
    mountId: 'calc-cleaning',

    // Контакты (вымышленные — замените на свои)
    contacts: {
      whatsapp: '79990003344',          // номер в международном формате, только цифры
      telegram: 'clean_home_demo'       // ник без @
    },

    // Цвета и форма
    colors: {
      accent: '#0f8a7e',
      accentHover: '#0b7268',
      accentText: '#ffffff',
      accentSoft: '#e7f5f3',
      bg: '#ffffff',
      surface: '#f5f8f8',
      text: '#14262a',
      muted: '#5f7377',
      border: '#dde7e8',
      whatsapp: '#1faa53',
      telegram: '#2a9fd8'
    },
    radius: 20,       // скругление карточки, px
    maxWidth: 920,    // максимальная ширина виджета, px
    currency: '₽',

    // Типы уборки: label — на карточке, name — в расчёте и сообщении; цена за м² и за один санузел
    types: [
      { id: 'maintenance', label: 'Поддерживающая', name: 'Поддерживающая уборка', hint: 'Пыль, полы, кухня, санузел', perM2: 80, bathroom: 700 },
      { id: 'general', label: 'Генеральная', name: 'Генеральная уборка', hint: 'Все поверхности, мебель внутри и снаружи', perM2: 160, bathroom: 1500 },
      { id: 'renovation', label: 'После ремонта', name: 'Уборка после ремонта', hint: 'Строительная пыль, следы краски и клея', perM2: 230, bathroom: 2000 }
    ],
    defaultType: 'general',

    // Площадь (ползунок) и санузлы (счётчик)
    area: { min: 20, max: 150, step: 1, value: 50 },
    bathrooms: { min: 1, max: 4, value: 1 },

    // Дополнительные услуги: фиксированная цена
    options: [
      { id: 'windows', label: 'Мытьё окон', hint: 'Все окна с двух сторон', price: 1800 },
      { id: 'fridge', label: 'Холодильник', hint: 'Внутри и снаружи', price: 900 },
      { id: 'balcony', label: 'Балкон / лоджия', hint: 'Пол, рамы, остекление', price: 1200 }
    ],

    minOrder: 3000,   // минимальная сумма заказа
    roundTo: 10,      // округление итога

    // Тексты интерфейса
    texts: {
      badge: 'Расчёт за 30 секунд',
      title: 'Сколько стоит уборка вашей квартиры',
      subtitle: 'Выберите параметры — цена пересчитается сразу',
      typeTitle: 'Тип уборки',
      areaTitle: 'Площадь квартиры',
      areaUnit: 'м²',
      bathroomsTitle: 'Количество санузлов',
      bathroomsMinus: 'Уменьшить',
      bathroomsPlus: 'Увеличить',
      optionsTitle: 'Дополнительно',
      summaryTitle: 'Ваш расчёт',
      lineBase: '{type} · {area} м² × {price}',
      lineBathrooms: 'Санузлы · {n} × {price}',
      lineMin: 'Доплата до минимального заказа',
      total: 'Итого',
      nameLabel: 'Как к вам обращаться?',
      namePlaceholder: 'Имя (необязательно)',
      sendTitle: 'Отправьте расчёт — менеджер подтвердит цену и согласует дату',
      whatsapp: 'Отправить в WhatsApp',
      telegram: 'Отправить в Telegram',
      copied: 'Текст скопирован — если он не подставился в чат, просто вставьте его',
      // Окно перед переходом в Telegram (Telegram не всегда подставляет текст сам)
      tgCopiedTitle: 'Расчёт скопирован',
      tgCopiedText: 'Сейчас откроется Telegram — вставьте текст в чат и отправьте.',
      tgManualTitle: 'Скопируйте расчёт',
      tgManualText: 'Не получилось скопировать автоматически. Выделите текст ниже и скопируйте его, затем откройте Telegram и вставьте текст в чат.',
      tgCopy: 'Скопировать текст',
      tgOpen: 'Открыть Telegram',
      close: 'Закрыть',
      disclaimer: 'Расчёт предварительный. Химия и инвентарь включены в стоимость.',
      // Шаблон сообщения в мессенджер
      msgIntro: 'Здравствуйте! Хочу заказать уборку. Расчёт с сайта:',
      msgType: 'Тип уборки',
      msgArea: 'Площадь',
      msgBathrooms: 'Санузлов',
      msgOptions: 'Дополнительно',
      msgNoOptions: 'нет',
      msgTotal: 'Итого',
      msgName: 'Имя',
      msgOutro: 'Подскажите, пожалуйста, ближайшую свободную дату.'
    }
  };

  /* =====================================================================
   * Дальше — код виджета, менять не обязательно
   * ===================================================================== */
  var currentScript = document.currentScript;
  var T = CONFIG.texts;
  var C = CONFIG.colors;

  var CSS = [
    ':host{all:initial;display:block}',
    '*,*::before,*::after{box-sizing:border-box}',
    '[hidden]{display:none!important}',
    '.cc,.cc-dialog{',
    '  --cc-accent:' + C.accent + ';--cc-accent-hover:' + C.accentHover + ';--cc-accent-text:' + C.accentText + ';',
    '  --cc-accent-soft:' + C.accentSoft + ';--cc-bg:' + C.bg + ';--cc-surface:' + C.surface + ';',
    '  --cc-text:' + C.text + ';--cc-muted:' + C.muted + ';--cc-border:' + C.border + ';',
    '  --cc-radius:' + CONFIG.radius + 'px;',
    '  background:var(--cc-bg);color:var(--cc-text);',
    '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;',
    '  font-size:16px;font-weight:400;line-height:1.45;letter-spacing:normal;text-align:left;text-transform:none;',
    '  -webkit-text-size-adjust:100%;text-size-adjust:100%;-webkit-font-smoothing:antialiased;color-scheme:light;',
    '  overflow-wrap:break-word;',
    '}',
    '.cc{',
    '  position:relative;max-width:' + CONFIG.maxWidth + 'px;margin:0 auto;padding:28px;',
    '  border:1px solid var(--cc-border);border-radius:var(--cc-radius);',
    '  box-shadow:0 1px 2px rgba(20,38,42,.04),0 12px 32px -12px rgba(20,38,42,.14);',
    '  container-type:inline-size;',
    '}',
    'h2,h3,p,fieldset,legend{margin:0;padding:0;border:0;font:inherit;color:inherit;letter-spacing:inherit;text-transform:none}',
    'legend{display:block;width:100%}',
    'button,input{font:inherit;color:inherit;letter-spacing:inherit;margin:0}',
    'button{-webkit-appearance:none;appearance:none;background:none;border:0;padding:0;cursor:pointer;',
    '  -webkit-tap-highlight-color:transparent;touch-action:manipulation}',
    'a,label{-webkit-tap-highlight-color:transparent;touch-action:manipulation}',
    'svg{display:block;flex:none}',
    ':focus-visible{outline:2px solid var(--cc-accent);outline-offset:2px}',
    '.cc-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);',
    '  white-space:nowrap;border:0;opacity:0}',

    '.cc-badge{display:inline-block;padding:5px 10px;border-radius:999px;background:var(--cc-accent-soft);',
    '  color:var(--cc-accent);font-size:13px;font-weight:600;line-height:1.3}',
    '.cc-title{margin-top:12px;font-size:26px;font-weight:700;line-height:1.2;letter-spacing:-.01em}',
    '.cc-sub{margin-top:8px;color:var(--cc-muted);font-size:15px}',

    '.cc-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:24px;margin-top:24px}',
    '@container (min-width:760px){.cc-layout{grid-template-columns:minmax(0,1fr) 340px;gap:28px;align-items:start}',
    '  .cc-summary{position:sticky;top:16px}}',
    '.cc-section+.cc-section{margin-top:24px}',
    '.cc-label{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:10px;font-size:15px;font-weight:700}',

    '.cc-form{container-type:inline-size;min-width:0}',
    '.cc-types{display:grid;grid-template-columns:1fr;gap:10px}',
    '@container (min-width:600px){.cc-types{grid-template-columns:repeat(3,minmax(0,1fr))}}',
    '.cc-choice{position:relative;display:block;cursor:pointer}',
    '.cc-card{display:flex;gap:12px;align-items:flex-start;height:100%;padding:14px;border:1.5px solid var(--cc-border);',
    '  border-radius:14px;background:var(--cc-bg);transition:border-color .15s,background-color .15s}',
    '@media (hover:hover){.cc-choice:hover .cc-card{border-color:var(--cc-accent)}}',
    'input:checked+.cc-card{border-color:var(--cc-accent);background:var(--cc-accent-soft)}',
    'input:focus-visible+.cc-card{outline:2px solid var(--cc-accent);outline-offset:2px}',
    '.cc-mark{display:flex;align-items:center;justify-content:center;flex:none;width:22px;height:22px;margin-top:1px;',
    '  border:1.5px solid var(--cc-border);border-radius:50%;background:var(--cc-bg);color:var(--cc-accent-text);transition:all .15s}',
    '.cc-check .cc-mark{border-radius:7px}',
    '.cc-mark svg{width:14px;height:14px;opacity:0;transform:scale(.6);transition:all .15s}',
    'input:checked+.cc-card .cc-mark{background:var(--cc-accent);border-color:var(--cc-accent)}',
    'input:checked+.cc-card .cc-mark svg{opacity:1;transform:none}',
    '.cc-card-text{display:flex;flex-direction:column;min-width:0;flex:1}',
    '.cc-card-label{font-weight:600;line-height:1.3}',
    '.cc-card-hint{margin-top:3px;font-size:13px;line-height:1.3;color:var(--cc-muted)}',
    '.cc-card-price{flex:none;font-size:14px;font-weight:600;color:var(--cc-muted);white-space:nowrap}',

    '.cc-area-row{display:flex;align-items:center;gap:16px}',
    '.cc-area-input{display:flex;align-items:center;flex:none;height:48px;padding:0 12px;border:1.5px solid var(--cc-border);',
    '  border-radius:12px;background:var(--cc-bg);transition:border-color .15s}',
    '.cc-area-input:focus-within{border-color:var(--cc-accent)}',
    '.cc-area-input input{width:44px;height:100%;padding:0;border:0;outline:none;background:transparent;font-size:16px;',
    '  font-weight:700;text-align:right;-webkit-appearance:none;appearance:none;border-radius:0;box-shadow:none}',
    '.cc-area-input span{margin-left:4px;color:var(--cc-muted);font-size:15px}',
    '.cc-range{flex:1;min-width:0;--p:50%;height:32px;margin:0;padding:0;background:transparent;cursor:pointer;',
    '  -webkit-appearance:none;appearance:none;touch-action:pan-y}',
    '.cc-range:focus{outline:none}',
    '.cc-range::-webkit-slider-runnable-track{height:6px;border-radius:999px;',
    '  background:linear-gradient(to right,var(--cc-accent) var(--p),var(--cc-border) var(--p))}',
    '.cc-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:28px;height:28px;margin-top:-11px;',
    '  border:3px solid var(--cc-accent);border-radius:50%;background:var(--cc-bg);box-shadow:0 2px 6px rgba(20,38,42,.2)}',
    '.cc-range::-moz-range-track{height:6px;border-radius:999px;background:var(--cc-border)}',
    '.cc-range::-moz-range-progress{height:6px;border-radius:999px;background:var(--cc-accent)}',
    '.cc-range::-moz-range-thumb{width:22px;height:22px;border:3px solid var(--cc-accent);border-radius:50%;',
    '  background:var(--cc-bg);box-shadow:0 2px 6px rgba(20,38,42,.2)}',
    '.cc-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 4px var(--cc-accent-soft),0 2px 6px rgba(20,38,42,.2)}',
    '.cc-range-wrap{flex:1;min-width:0}',
    '.cc-range{display:block;width:100%}',
    '.cc-scale{display:flex;justify-content:space-between;margin-top:2px;font-size:12px;color:var(--cc-muted)}',

    '.cc-stepper{display:inline-flex;align-items:center;border:1.5px solid var(--cc-border);border-radius:12px;overflow:hidden}',
    '.cc-stepper button{display:flex;align-items:center;justify-content:center;width:48px;height:46px;color:var(--cc-accent);',
    '  transition:background-color .15s}',
    '@media (hover:hover){.cc-stepper button:hover:not(:disabled){background:var(--cc-accent-soft)}}',
    '.cc-stepper button:disabled{color:var(--cc-border);cursor:default}',
    '.cc-stepper button svg{width:20px;height:20px}',
    '.cc-stepper output{min-width:44px;font-size:18px;font-weight:700;text-align:center;font-variant-numeric:tabular-nums}',

    '.cc-options{display:grid;grid-template-columns:1fr;gap:10px}',

    '.cc-summary{padding:20px;border-radius:16px;background:var(--cc-surface);border:1px solid var(--cc-border)}',
    '.cc-summary-title{font-size:17px;font-weight:700}',
    '.cc-lines{margin:12px 0 0;padding:0;list-style:none}',
    '.cc-lines li{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:8px 0;',
    '  border-bottom:1px dashed var(--cc-border);font-size:14px}',
    '.cc-lines li span:first-child{color:var(--cc-muted)}',
    '.cc-lines li span:last-child{flex:none;font-weight:600;white-space:nowrap;font-variant-numeric:tabular-nums}',
    '.cc-total{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-top:14px}',
    '.cc-total span:first-child{font-size:16px;font-weight:600}',
    '.cc-total-sum{font-size:30px;font-weight:800;line-height:1.1;color:var(--cc-accent);white-space:nowrap;',
    '  font-variant-numeric:tabular-nums}',
    '.cc-bump{animation:cc-bump .3s ease}',
    '@keyframes cc-bump{40%{transform:scale(1.05)}}',
    '@media (prefers-reduced-motion:reduce){.cc-bump{animation:none}}',

    '.cc-send{margin-top:18px;padding-top:18px;border-top:1px solid var(--cc-border)}',
    '.cc-send-title{font-size:14px;font-weight:600}',
    '.cc-field{display:block;margin-top:12px}',
    '.cc-field-label{display:block;margin-bottom:6px;font-size:14px;color:var(--cc-muted)}',
    '.cc-input{display:block;width:100%;height:50px;padding:0 14px;font-size:16px;line-height:normal;',
    '  border:1.5px solid var(--cc-border);border-radius:12px;background:var(--cc-bg);color:var(--cc-text);',
    '  -webkit-appearance:none;appearance:none;box-shadow:none;outline:none;transition:border-color .15s}',
    '.cc-input::placeholder{color:var(--cc-muted);opacity:.8}',
    '.cc-input:focus{border-color:var(--cc-accent)}',
    '.cc-messengers{display:grid;grid-template-columns:1fr;gap:10px;margin-top:12px}',
    '.cc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 18px;',
    '  border-radius:12px;font-size:16px;font-weight:600;line-height:1.2;text-decoration:none;text-align:center;color:#fff;',
    '  transition:opacity .15s,transform .1s}',
    '.cc-btn:active{transform:scale(.98)}',
    '.cc-btn svg{width:20px;height:20px}',
    '@media (hover:hover){.cc-btn:hover{opacity:.9}}',
    '.cc-wa{background:' + C.whatsapp + '}',
    '.cc-tg{background:' + C.telegram + '}',
    '.cc-disclaimer{margin-top:12px;font-size:13px;color:var(--cc-muted)}',

    '.cc-toast{position:absolute;left:50%;bottom:16px;z-index:2;width:calc(100% - 32px);max-width:420px;padding:12px 16px;',
    '  border-radius:12px;background:#14262a;color:#fff;font-size:14px;line-height:1.35;text-align:center;',
    '  transform:translate(-50%,8px);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}',
    '.cc-toast.cc-show{opacity:1;transform:translate(-50%,0)}',

    '.cc-dialog{position:fixed;inset:0;z-index:2147483647;width:calc(100% - 32px);max-width:400px;max-height:calc(100% - 32px);',
    '  margin:auto;padding:28px 24px 24px;overflow:auto;border:0;border-radius:20px;text-align:center;',
    '  box-shadow:0 24px 64px -16px rgba(0,0,0,.35)}',
    '.cc-dialog::backdrop{background:rgba(15,20,24,.55)}',
    '.cc-dialog.cc-fallback{display:block;box-shadow:0 0 0 100vmax rgba(15,20,24,.55),0 24px 64px -16px rgba(0,0,0,.35)}',
    '.cc-dialog[open]{animation:cc-pop .2s ease both}',
    '@keyframes cc-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}',
    '@media (prefers-reduced-motion:reduce){.cc-dialog[open]{animation:none}}',
    '.cc-dlg-close{position:absolute;top:10px;right:10px;display:flex;align-items:center;justify-content:center;',
    '  width:40px;height:40px;border-radius:50%;color:var(--cc-muted)}',
    '@media (hover:hover){.cc-dlg-close:hover{background:var(--cc-surface);color:var(--cc-text)}}',
    '.cc-dlg-close svg{width:20px;height:20px}',
    '.cc-dlg-icon{display:flex;align-items:center;justify-content:center;width:56px;height:56px;margin:0 auto 14px;',
    '  border-radius:50%;background:#e6f6ec;color:#1f9d55}',
    '.cc-dlg-icon svg{width:28px;height:28px}',
    '.cc-dialog[data-mode="manual"] .cc-dlg-icon{background:var(--cc-accent-soft);color:var(--cc-accent)}',
    '.cc-dlg-title{font-size:21px;font-weight:700;line-height:1.25}',
    '.cc-dlg-text{margin-top:8px;font-size:15px;color:var(--cc-muted)}',
    '.cc-dlg-area{display:block;width:100%;height:170px;margin:16px 0 0;padding:12px 14px;resize:none;',
    '  font:inherit;font-size:16px;line-height:1.4;text-align:left;color:var(--cc-text);background:var(--cc-surface);',
    '  border:1.5px solid var(--cc-border);border-radius:12px;outline:none;-webkit-appearance:none;appearance:none;',
    '  -webkit-user-select:text;user-select:text}',
    '.cc-dlg-area:focus{border-color:var(--cc-accent)}',
    '.cc-dlg-actions{display:grid;gap:10px;margin-top:18px}',
    '.cc-dlg-actions .cc-btn{width:100%}',
    '.cc-outline{border:1.5px solid var(--cc-border);color:var(--cc-text)}',
    '@media (hover:hover){.cc-outline:hover{border-color:var(--cc-accent)}}',

    '@media (max-width:480px){',
    '  .cc{padding:20px 16px;border-radius:' + Math.min(CONFIG.radius, 16) + 'px}',
    '  .cc-title{font-size:22px}.cc-summary{padding:16px}.cc-total-sum{font-size:27px}',
    '}'
  ].join('\n');

  var ICONS = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    copied: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.5c0 3.6 2.9 6.5 6.5 6.5l1-1.6-2-1-1 .8a4 4 0 0 1-2.2-2.2l.8-1-1-2z" fill="currentColor" stroke-width="1"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 4L3 11l6.5 2.5L18 7l-6.5 7.5L17 20z"/></svg>'
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function money(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + CONFIG.currency;
  }

  function fill(tpl, data) {
    return tpl.replace(/\{(\w+)\}/g, function (m, k) { return k in data ? data[k] : m; });
  }

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function copyText(text, root) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text, root); });
    }
    return Promise.resolve(legacyCopy(text, root));
  }

  function legacyCopy(text, root) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px';
    root.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    root.removeChild(ta);
    return ok;
  }

  // Окно «текст скопирован → открыть Telegram». <dialog> со showModal() попадает в top layer,
  // поэтому его не перекрывают шапки сайта и не обрезают overflow/transform родителей.
  function createDialog(root) {
    var el = document.createElement('dialog');
    el.className = 'cc-dialog';
    el.setAttribute('aria-labelledby', 'cc-dlg-title');
    el.innerHTML =
      '<button type="button" class="cc-dlg-close" data-dlg="close" aria-label="' + esc(T.close) + '">' + ICONS.close + '</button>' +
      '<div class="cc-dlg-icon"></div>' +
      '<h3 class="cc-dlg-title" id="cc-dlg-title"></h3>' +
      '<p class="cc-dlg-text"></p>' +
      '<textarea class="cc-dlg-area" readonly rows="6" aria-label="' + esc(T.summaryTitle) + '"></textarea>' +
      '<div class="cc-dlg-actions">' +
      '<a class="cc-btn cc-tg cc-dlg-open" target="_blank" rel="noopener">' + ICONS.tg + esc(T.tgOpen) + '</a>' +
      '<button type="button" class="cc-btn cc-outline" data-dlg="copy">' + ICONS.copy + esc(T.tgCopy) + '</button>' +
      '</div>';
    root.appendChild(el);

    var icon = el.querySelector('.cc-dlg-icon');
    var title = el.querySelector('.cc-dlg-title');
    var desc = el.querySelector('.cc-dlg-text');
    var area = el.querySelector('.cc-dlg-area');
    var openLink = el.querySelector('.cc-dlg-open');
    var copyBtn = el.querySelector('[data-dlg="copy"]');
    var returnFocus = null;

    function setMode(copied) {
      el.setAttribute('data-mode', copied ? 'copied' : 'manual');
      icon.innerHTML = copied ? ICONS.copied : ICONS.copy;
      title.textContent = copied ? T.tgCopiedTitle : T.tgManualTitle;
      desc.textContent = copied ? T.tgCopiedText : T.tgManualText;
      area.hidden = copied;
      copyBtn.hidden = copied;
    }

    function selectArea() {
      area.focus({ preventScroll: true });
      area.setSelectionRange(0, area.value.length);
    }

    function show(copied) {
      setMode(copied);
      if (typeof el.showModal === 'function') {
        if (!el.open) el.showModal();
      } else {
        el.setAttribute('open', '');
        el.classList.add('cc-fallback');
      }
      if (copied) openLink.focus({ preventScroll: true }); else selectArea();
    }

    function restore() {
      if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
      returnFocus = null;
    }

    function close() {
      if (typeof el.close === 'function' && el.open) {
        el.close();
      } else {
        el.removeAttribute('open');
        el.classList.remove('cc-fallback');
        restore();
      }
    }

    el.addEventListener('close', restore);
    el.addEventListener('click', function (e) {
      if (e.target === el) return close(); // клик по подложке
      if (e.target.closest('[data-dlg="close"]')) return close();
      if (e.target.closest('[data-dlg="copy"]')) {
        copyText(area.value, el).then(function (ok) { if (ok) setMode(true); else selectArea(); });
        return;
      }
      // Ссылка открывается своим ходом (target=_blank), окно просто закрываем
      if (e.target.closest('.cc-dlg-open')) setTimeout(close, 0);
    });

    return {
      open: function (text, url, from) {
        returnFocus = from || null;
        area.value = text;
        openLink.href = url;
        copyText(text, root).then(show);
      }
    };
  }

  function createWidget(container) {
    var host = document.createElement('cleaning-calc-widget');
    host.setAttribute('style', 'all:initial !important;display:block !important;zoom:1 !important');
    container.appendChild(host);

    var root = host.attachShadow({ mode: 'open' });
    var style = document.createElement('style');
    style.textContent = CSS;
    var wrap = document.createElement('div');
    wrap.className = 'cc';
    root.appendChild(style);
    root.appendChild(wrap);
    var dialog = createDialog(root);

    var uid = 'cc' + Math.random().toString(36).slice(2, 7);
    var state = {
      type: CONFIG.defaultType,
      area: clamp(CONFIG.area.value, CONFIG.area.min, CONFIG.area.max),
      bathrooms: clamp(CONFIG.bathrooms.value, CONFIG.bathrooms.min, CONFIG.bathrooms.max),
      options: {},
      name: ''
    };
    var toastTimer = null;
    var lastTotal = null;
    var tgUrl = '';

    function typeById(id) {
      return CONFIG.types.filter(function (t) { return t.id === id; })[0] || CONFIG.types[0];
    }

    function calc() {
      var t = typeById(state.type);
      var lines = [
        { label: fill(T.lineBase, { type: t.name, area: state.area, price: money(t.perM2) }), sum: state.area * t.perM2 },
        { label: fill(T.lineBathrooms, { n: state.bathrooms, price: money(t.bathroom) }), sum: state.bathrooms * t.bathroom }
      ];
      CONFIG.options.forEach(function (o) {
        if (state.options[o.id]) lines.push({ label: o.label, sum: o.price });
      });
      var total = lines.reduce(function (s, l) { return s + l.sum; }, 0);
      if (total < CONFIG.minOrder) {
        lines.push({ label: T.lineMin, sum: CONFIG.minOrder - total });
        total = CONFIG.minOrder;
      }
      total = Math.ceil(total / CONFIG.roundTo) * CONFIG.roundTo;
      return { type: t, lines: lines, total: total };
    }

    function message(res) {
      var opts = CONFIG.options.filter(function (o) { return state.options[o.id]; })
        .map(function (o) { return o.label.toLowerCase(); });
      var lines = [
        T.msgIntro, '',
        '• ' + T.msgType + ': ' + res.type.name,
        '• ' + T.msgArea + ': ' + state.area + ' ' + T.areaUnit,
        '• ' + T.msgBathrooms + ': ' + state.bathrooms,
        '• ' + T.msgOptions + ': ' + (opts.length ? opts.join(', ') : T.msgNoOptions),
        '', T.msgTotal + ': ' + money(res.total)
      ];
      if (state.name.trim()) lines.push(T.msgName + ': ' + state.name.trim());
      lines.push('', T.msgOutro);
      return lines.join('\n');
    }

    function choiceHtml(kind, name, value, checked, label, hint, price) {
      return '<label class="cc-choice' + (kind === 'checkbox' ? ' cc-check' : '') + '">' +
        '<input class="cc-sr" type="' + kind + '" name="' + name + '" value="' + esc(value) + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="cc-card"><span class="cc-mark">' + ICONS.check + '</span><span class="cc-card-text">' +
        '<span class="cc-card-label">' + esc(label) + '</span>' +
        (hint ? '<span class="cc-card-hint">' + esc(hint) + '</span>' : '') + '</span>' +
        (price ? '<span class="cc-card-price">' + esc(price) + '</span>' : '') + '</span></label>';
    }

    function renderShell() {
      var a = CONFIG.area;
      var html = '<span class="cc-badge">' + esc(T.badge) + '</span>' +
        '<h2 class="cc-title">' + esc(T.title) + '</h2><p class="cc-sub">' + esc(T.subtitle) + '</p>' +
        '<div class="cc-layout"><div class="cc-form">';

      html += '<fieldset class="cc-section"><legend class="cc-label">' + esc(T.typeTitle) + '</legend><div class="cc-types">';
      CONFIG.types.forEach(function (t) {
        html += choiceHtml('radio', uid + '-type', t.id, t.id === state.type, t.label, t.hint, '');
      });
      html += '</div></fieldset>';

      html += '<div class="cc-section"><label class="cc-label" for="' + uid + '-area">' + esc(T.areaTitle) + '</label>' +
        '<div class="cc-area-row"><div class="cc-range-wrap">' +
        '<input class="cc-range" id="' + uid + '-area" type="range" name="area" min="' + a.min + '" max="' + a.max +
        '" step="' + a.step + '" value="' + state.area + '" aria-label="' + esc(T.areaTitle) + '">' +
        '<div class="cc-scale" aria-hidden="true"><span>' + a.min + ' ' + esc(T.areaUnit) + '</span><span>' + a.max + ' ' + esc(T.areaUnit) + '</span></div></div>' +
        '<span class="cc-area-input"><input type="text" name="areaText" inputmode="numeric" pattern="[0-9]*" maxlength="3" ' +
        'autocomplete="off" enterkeyhint="done" value="' + state.area + '" aria-label="' + esc(T.areaTitle) + '">' +
        '<span>' + esc(T.areaUnit) + '</span></span></div></div>';

      html += '<div class="cc-section"><div class="cc-label" id="' + uid + '-bath">' + esc(T.bathroomsTitle) + '</div>' +
        '<div class="cc-stepper" role="group" aria-labelledby="' + uid + '-bath">' +
        '<button type="button" data-step="-1" aria-label="' + esc(T.bathroomsMinus) + '">' + ICONS.minus + '</button>' +
        '<output aria-live="polite" data-bind="bathrooms">' + state.bathrooms + '</output>' +
        '<button type="button" data-step="1" aria-label="' + esc(T.bathroomsPlus) + '">' + ICONS.plus + '</button></div></div>';

      html += '<fieldset class="cc-section"><legend class="cc-label">' + esc(T.optionsTitle) + '</legend><div class="cc-options">';
      CONFIG.options.forEach(function (o) {
        html += choiceHtml('checkbox', 'opt', o.id, !!state.options[o.id], o.label, o.hint, '+' + money(o.price));
      });
      html += '</div></fieldset></div>';

      html += '<aside class="cc-summary" aria-label="' + esc(T.summaryTitle) + '">' +
        '<h3 class="cc-summary-title">' + esc(T.summaryTitle) + '</h3>' +
        '<ul class="cc-lines" data-bind="lines"></ul>' +
        '<div class="cc-total"><span>' + esc(T.total) + '</span><span class="cc-total-sum" data-bind="total" aria-live="polite"></span></div>' +
        '<div class="cc-send"><p class="cc-send-title">' + esc(T.sendTitle) + '</p>' +
        '<label class="cc-field"><span class="cc-field-label">' + esc(T.nameLabel) + '</span>' +
        '<input class="cc-input" type="text" name="name" autocomplete="given-name" enterkeyhint="done" maxlength="60" ' +
        'placeholder="' + esc(T.namePlaceholder) + '"></label>' +
        '<div class="cc-messengers">' +
        '<a class="cc-btn cc-wa" data-link="wa" href="#" target="_blank" rel="noopener">' + ICONS.wa + esc(T.whatsapp) + '</a>' +
        '<button type="button" class="cc-btn cc-tg" data-action="telegram">' + ICONS.tg + esc(T.telegram) + '</button>' +
        '</div><p class="cc-disclaimer">' + esc(T.disclaimer) + '</p></div></aside></div>' +
        '<div class="cc-toast" role="status" aria-live="polite"></div>';

      wrap.innerHTML = html;
    }

    var els = {};
    function cacheEls() {
      els.range = wrap.querySelector('input[name="area"]');
      els.areaText = wrap.querySelector('input[name="areaText"]');
      els.bathrooms = wrap.querySelector('[data-bind="bathrooms"]');
      els.minus = wrap.querySelector('[data-step="-1"]');
      els.plus = wrap.querySelector('[data-step="1"]');
      els.lines = wrap.querySelector('[data-bind="lines"]');
      els.total = wrap.querySelector('[data-bind="total"]');
      els.wa = wrap.querySelector('[data-link="wa"]');
      els.tg = wrap.querySelector('[data-action="telegram"]');
      els.toast = wrap.querySelector('.cc-toast');
    }

    function update() {
      var a = CONFIG.area;
      var res = calc();
      els.range.value = state.area;
      els.range.style.setProperty('--p', ((state.area - a.min) / (a.max - a.min)) * 100 + '%');
      if (root.activeElement !== els.areaText) {
        els.areaText.value = state.area;
      }
      els.bathrooms.textContent = state.bathrooms;
      els.minus.disabled = state.bathrooms <= CONFIG.bathrooms.min;
      els.plus.disabled = state.bathrooms >= CONFIG.bathrooms.max;

      els.lines.innerHTML = res.lines.map(function (l) {
        return '<li><span>' + esc(l.label) + '</span><span>' + money(l.sum) + '</span></li>';
      }).join('');
      els.total.textContent = money(res.total);
      if (lastTotal !== null && lastTotal !== res.total) {
        els.total.classList.remove('cc-bump');
        void els.total.offsetWidth;
        els.total.classList.add('cc-bump');
      }
      lastTotal = res.total;

      var text = encodeURIComponent(message(res));
      els.wa.href = 'https://wa.me/' + String(CONFIG.contacts.whatsapp).replace(/\D/g, '') + '?text=' + text;
      tgUrl = 'https://t.me/' + String(CONFIG.contacts.telegram).replace(/^@/, '') + '?text=' + text;
    }

    function toast(text) {
      els.toast.textContent = text;
      els.toast.classList.add('cc-show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { els.toast.classList.remove('cc-show'); }, 3500);
    }

    wrap.addEventListener('input', function (e) {
      var t = e.target;
      if (t.name === 'area') {
        state.area = Number(t.value);
      } else if (t.name === 'areaText') {
        t.value = t.value.replace(/\D/g, '');
        var n = parseInt(t.value, 10);
        if (!isNaN(n) && n >= CONFIG.area.min && n <= CONFIG.area.max) state.area = n;
        else return;
      } else if (t.name === 'name') {
        state.name = t.value;
      } else {
        return;
      }
      update();
    });

    wrap.addEventListener('change', function (e) {
      var t = e.target;
      if (t.type === 'radio') state.type = t.value;
      else if (t.type === 'checkbox') state.options[t.value] = t.checked;
      else if (t.name === 'areaText') {
        var n = parseInt(t.value, 10);
        state.area = isNaN(n) ? state.area : clamp(n, CONFIG.area.min, CONFIG.area.max);
        t.value = state.area;
      } else return;
      update();
    });

    wrap.addEventListener('keydown', function (e) {
      if ((e.target.name === 'areaText' || e.target.name === 'name') && e.key === 'Enter') e.target.blur();
    });

    // Сафари на iOS не всегда шлёт change при скрытии клавиатуры — нормализуем площадь и на blur
    wrap.addEventListener('focusout', function (e) {
      if (e.target.name === 'areaText') {
        var n = parseInt(e.target.value, 10);
        state.area = isNaN(n) ? state.area : clamp(n, CONFIG.area.min, CONFIG.area.max);
        e.target.value = state.area;
        update();
      }
    });

    wrap.addEventListener('click', function (e) {
      var step = e.target.closest('[data-step]');
      if (step && !step.disabled) {
        state.bathrooms = clamp(state.bathrooms + Number(step.getAttribute('data-step')), CONFIG.bathrooms.min, CONFIG.bathrooms.max);
        update();
        return;
      }
      if (e.target.closest('[data-action="telegram"]')) {
        // Сначала копируем текст и показываем подсказку; в Telegram — только по кнопке в окне
        dialog.open(message(calc()), tgUrl, els.tg);
        return;
      }
      var link = e.target.closest('[data-link]');
      if (link) {
        // WhatsApp подставляет текст сам; дублируем его в буфер обмена на всякий случай
        copyText(message(calc()), root).then(function (ok) { if (ok) toast(T.copied); });
      }
    });

    renderShell();
    cacheEls();
    update();
    lastTotal = null;
  }

  function init() {
    var container = document.getElementById(CONFIG.mountId);
    if (!container && currentScript && currentScript.parentNode) {
      container = document.createElement('div');
      currentScript.parentNode.insertBefore(container, currentScript);
    }
    if (!container || container.getAttribute('data-widget-mounted')) return;
    container.setAttribute('data-widget-mounted', '1');
    createWidget(container);
  }

  if (document.getElementById(CONFIG.mountId) || document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
