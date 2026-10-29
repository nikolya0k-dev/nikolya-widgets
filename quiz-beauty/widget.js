/*!
 * Квиз «Подберём уход для ваших волос» — встраиваемый виджет.
 *
 * Подключение одной строкой:
 *   <div id="quiz-beauty"></div><script src="https://nikolya-widgets.netlify.app/quiz-beauty/widget.js"></script>
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
    mountId: 'quiz-beauty',

    // Контакты (вымышленные — замените на свои)
    contacts: {
      whatsapp: '79990001122',       // номер в международном формате, только цифры
      telegram: 'beauty_salon_demo'  // ник без @
    },

    // Цвета и форма
    colors: {
      accent: '#b0476b',
      accentHover: '#963a5a',
      accentText: '#ffffff',
      accentSoft: '#f9eaf0',
      bg: '#ffffff',
      surface: '#fbf7f8',
      text: '#2b1d22',
      muted: '#7a6a70',
      border: '#eadde2',
      whatsapp: '#1faa53',
      telegram: '#2a9fd8'
    },
    radius: 20,          // скругление карточки, px
    maxWidth: 640,       // максимальная ширина виджета, px
    currency: '₽',

    // Тексты интерфейса
    texts: {
      badge: 'Подбор за 1 минуту',
      title: 'Подберём уход для ваших волос',
      subtitle: 'Ответьте на 5 вопросов — покажем подходящую процедуру и примерную цену',
      step: 'Вопрос {n} из {total}',
      back: 'Назад',
      next: 'Далее',
      showResult: 'Показать результат',
      showResultShort: 'Результат',   // на узких экранах (до ~370px)
      multiHint: 'Можно выбрать несколько вариантов',
      resultBadge: 'Ваш результат',
      resultTitle: 'Вам подойдёт',
      priceFrom: 'от',
      duration: 'Длительность',
      altTitle: 'Также рекомендуем',
      overBudget: 'Немного выше вашего бюджета — администратор подскажет, как уложиться в сумму.',
      answersTitle: 'Ваши ответы',
      nameLabel: 'Как к вам обращаться?',
      namePlaceholder: 'Имя (необязательно)',
      sendTitle: 'Отправьте результат — администратор подтвердит цену и предложит удобное время',
      whatsapp: 'Отправить в WhatsApp',
      telegram: 'Отправить в Telegram',
      restart: 'Пройти заново',
      copied: 'Текст скопирован — если он не подставился в чат, просто вставьте его',
      disclaimer: 'Цена ориентировочная: точную стоимость мастер назовёт после диагностики.',
      // Шаблон сообщения в мессенджер
      msgIntro: 'Здравствуйте! Мои ответы в квизе «Подберём уход для волос»:',
      msgResult: 'Рекомендация',
      msgName: 'Имя',
      msgOutro: 'Хочу записаться — подскажите, пожалуйста, свободное время.'
    },

    // Вопросы. label — коротко для сообщения в мессенджер, scores — сколько баллов вариант даёт каждой процедуре.
    // У вопроса про длину mult — коэффициент цены, у бюджета max — верхняя граница.
    questions: [
      {
        id: 'type',
        label: 'Тип волос',
        title: 'Какой у вас тип волос?',
        options: [
          { label: 'Нормальные', hint: 'Без явной сухости и жирности', scores: { spa: 2, screening: 1 } },
          { label: 'Сухие', hint: 'Жёсткие, быстро теряют влагу', scores: { botox: 2, spa: 2 } },
          { label: 'Жирные у корней', hint: 'Нужно мыть каждый день', scores: { scalp: 3 } },
          { label: 'Смешанные', hint: 'Жирные корни, сухие кончики', scores: { scalp: 1, botox: 2 } }
        ]
      },
      {
        id: 'length',
        label: 'Длина',
        title: 'Какая у вас длина волос?',
        options: [
          { label: 'Короткие', hint: 'Выше плеч', mult: 1 },
          { label: 'Средние', hint: 'До лопаток', mult: 1.3 },
          { label: 'Длинные', hint: 'Ниже лопаток', mult: 1.6 },
          { label: 'Очень длинные', hint: 'До поясницы и ниже', mult: 1.9 }
        ]
      },
      {
        id: 'concern',
        label: 'Беспокоит',
        title: 'Что беспокоит больше всего?',
        multiple: true,
        options: [
          { label: 'Пушатся и электризуются', scores: { keratin: 4 } },
          { label: 'Сухость и ломкость', scores: { botox: 3, spa: 1 } },
          { label: 'Секутся кончики', scores: { botox: 2, bonding: 1 } },
          { label: 'Тусклые, нет блеска', scores: { screening: 3 } },
          { label: 'Выпадают, жирнеют', scores: { scalp: 4 } },
          { label: 'Ничего, нужен уход', scores: { spa: 3 } }
        ]
      },
      {
        id: 'color',
        label: 'Окрашивание',
        title: 'Делали окрашивание за последние 3 месяца?',
        options: [
          { label: 'Да, в последний месяц', hint: 'Окрашивание или осветление', scores: { bonding: 4 } },
          { label: 'Да, 1–3 месяца назад', scores: { bonding: 2, botox: 1 } },
          { label: 'Нет', hint: 'Не окрашиваю или это было давно', scores: { keratin: 1, screening: 1 } }
        ]
      },
      {
        id: 'budget',
        label: 'Бюджет',
        title: 'Какой бюджет на процедуру?',
        options: [
          { label: 'До 3 000 ₽', max: 3000 },
          { label: '3 000 – 5 000 ₽', max: 5000 },
          { label: '5 000 – 8 000 ₽', max: 8000 },
          { label: 'Не важно, главное — результат', max: null }
        ]
      }
    ],

    // Процедуры. price — цена для коротких волос; scaleByLength: false — цена не зависит от длины.
    procedures: {
      keratin: {
        name: 'Кератиновое выпрямление',
        desc: 'Разглаживает и убирает пушистость до 4 месяцев, волосы легко укладываются даже во влажную погоду.',
        price: 4500, duration: '2,5–3 часа'
      },
      botox: {
        name: 'Ботокс для волос',
        desc: 'Глубоко питает и уплотняет повреждённые волосы, запаивает кончики, возвращает мягкость.',
        price: 3200, duration: '1,5–2 часа'
      },
      bonding: {
        name: 'Реконструкция после окрашивания',
        desc: 'Восстанавливает связи внутри волоса, разрушенные краской и осветлением, сохраняет цвет.',
        price: 2800, duration: '1,5 часа'
      },
      screening: {
        name: 'Экранирование',
        desc: 'Покрывает волосы защитной плёнкой: зеркальный блеск, плотность и защита от солнца и укладок.',
        price: 2400, duration: '1,5 часа'
      },
      spa: {
        name: 'SPA-увлажнение',
        desc: 'Мягкий уход с маской и массажем головы — поддерживает здоровье волос и снимает стресс.',
        price: 1800, duration: '1 час'
      },
      scalp: {
        name: 'Пилинг кожи головы и уход',
        desc: 'Очищает кожу головы, нормализует жирность и укрепляет корни, уменьшая выпадение.',
        price: 1900, duration: '1 час', scaleByLength: false
      }
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
    '.qb{',
    '  --qb-accent:' + C.accent + ';--qb-accent-hover:' + C.accentHover + ';--qb-accent-text:' + C.accentText + ';',
    '  --qb-accent-soft:' + C.accentSoft + ';--qb-bg:' + C.bg + ';--qb-surface:' + C.surface + ';',
    '  --qb-text:' + C.text + ';--qb-muted:' + C.muted + ';--qb-border:' + C.border + ';',
    '  --qb-radius:' + CONFIG.radius + 'px;',
    '  position:relative;max-width:' + CONFIG.maxWidth + 'px;margin:0 auto;padding:28px;',
    '  background:var(--qb-bg);color:var(--qb-text);border:1px solid var(--qb-border);border-radius:var(--qb-radius);',
    '  box-shadow:0 1px 2px rgba(43,29,34,.04),0 12px 32px -12px rgba(43,29,34,.14);',
    '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;',
    '  font-size:16px;font-weight:400;line-height:1.45;letter-spacing:normal;text-align:left;text-transform:none;',
    '  -webkit-text-size-adjust:100%;text-size-adjust:100%;-webkit-font-smoothing:antialiased;color-scheme:light;',
    '  container-type:inline-size;overflow-wrap:break-word;',
    '}',
    'h2,h3,p{margin:0;padding:0;font:inherit;color:inherit;letter-spacing:inherit;text-transform:none}',
    'button,input{font:inherit;color:inherit;letter-spacing:inherit;margin:0}',
    'button{-webkit-appearance:none;appearance:none;background:none;border:0;padding:0;cursor:pointer;',
    '  text-align:inherit;text-transform:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation}',
    'a{-webkit-tap-highlight-color:transparent;touch-action:manipulation}',
    'svg{display:block;flex:none}',
    ':focus-visible{outline:2px solid var(--qb-accent);outline-offset:2px}',

    '.qb-badge{display:inline-block;padding:5px 10px;border-radius:999px;background:var(--qb-accent-soft);',
    '  color:var(--qb-accent);font-size:13px;font-weight:600;line-height:1.3}',
    '.qb-head{margin-bottom:22px}',
    '.qb-title{margin-top:12px;font-size:26px;font-weight:700;line-height:1.2;letter-spacing:-.01em}',
    '.qb-sub{margin-top:8px;color:var(--qb-muted);font-size:15px}',

    '.qb-progress{display:flex;align-items:center;gap:12px;margin-bottom:18px}',
    '.qb-progress-label{flex:none;font-size:13px;font-weight:600;color:var(--qb-muted);font-variant-numeric:tabular-nums}',
    '.qb-track{flex:1;height:6px;border-radius:999px;background:var(--qb-border);overflow:hidden}',
    '.qb-fill{height:100%;border-radius:inherit;background:var(--qb-accent);transition:width .35s ease}',

    '.qb-q{font-size:21px;font-weight:700;line-height:1.25;outline:none}',
    '.qb-hint{margin-top:6px;font-size:14px;color:var(--qb-muted)}',
    '.qb-options{display:grid;grid-template-columns:1fr;gap:10px;margin-top:18px}',
    '@container (min-width:520px){.qb-options{grid-template-columns:1fr 1fr}}',
    '.qb-opt{display:flex;align-items:center;gap:12px;width:100%;min-height:58px;padding:12px 14px;',
    '  border:1.5px solid var(--qb-border);border-radius:14px;background:var(--qb-bg);',
    '  transition:border-color .15s,background-color .15s,box-shadow .15s}',
    '@media (hover:hover){.qb-opt:hover{border-color:var(--qb-accent)}}',
    '.qb-opt[aria-checked="true"]{border-color:var(--qb-accent);background:var(--qb-accent-soft)}',
    '.qb-mark{display:flex;align-items:center;justify-content:center;flex:none;width:22px;height:22px;',
    '  border:1.5px solid var(--qb-border);border-radius:50%;background:var(--qb-bg);color:var(--qb-accent-text);transition:all .15s}',
    '.qb-opt[role="checkbox"] .qb-mark{border-radius:7px}',
    '.qb-mark svg{width:14px;height:14px;opacity:0;transform:scale(.6);transition:all .15s}',
    '.qb-opt[aria-checked="true"] .qb-mark{background:var(--qb-accent);border-color:var(--qb-accent)}',
    '.qb-opt[aria-checked="true"] .qb-mark svg{opacity:1;transform:none}',
    '.qb-opt-text{display:flex;flex-direction:column;min-width:0}',
    '.qb-opt-label{font-size:16px;font-weight:600;line-height:1.3}',
    '.qb-opt-hint{margin-top:2px;font-size:13px;line-height:1.3;color:var(--qb-muted)}',

    '.qb-nav{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:22px}',
    '.qb-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 20px;',
    '  border-radius:12px;font-size:16px;font-weight:600;line-height:1.2;text-decoration:none;text-align:center;',
    '  transition:background-color .15s,opacity .15s,transform .1s}',
    '.qb-btn:active{transform:scale(.98)}',
    '.qb-btn svg{width:20px;height:20px}',
    '.qb-primary{background:var(--qb-accent);color:var(--qb-accent-text)}',
    '@media (hover:hover){.qb-primary:hover{background:var(--qb-accent-hover)}}',
    '.qb-primary:disabled{opacity:.4;cursor:default;transform:none}',
    '.qb-ghost{padding-left:10px;padding-right:12px;color:var(--qb-muted)}',
    '@media (hover:hover){.qb-ghost:hover{color:var(--qb-text);background:var(--qb-surface)}}',
    '.qb-ghost svg{width:18px;height:18px}',
    '.qb-invisible{visibility:hidden}',
    '.qb-nav .qb-btn{white-space:nowrap}',
    '.qb-short{display:none}',
    '@container (max-width:340px){.qb-long{display:none}.qb-short{display:inline}}',

    '.qb-enter{animation:qb-in .28s ease both}',
    '@keyframes qb-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '@media (prefers-reduced-motion:reduce){.qb-enter{animation:none}.qb-fill,.qb-opt,.qb-mark,.qb-mark svg{transition:none}}',

    '.qb-result-card{margin-top:14px;padding:20px;border-radius:16px;background:var(--qb-accent-soft)}',
    '.qb-proc{font-size:24px;font-weight:700;line-height:1.2;letter-spacing:-.01em}',
    '.qb-meta{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 16px;margin-top:10px}',
    '.qb-price{font-size:28px;font-weight:800;color:var(--qb-accent);white-space:nowrap;font-variant-numeric:tabular-nums}',
    '.qb-price small{font-size:16px;font-weight:600}',
    '.qb-duration{font-size:14px;color:var(--qb-muted)}',
    '.qb-desc{margin-top:10px;font-size:15px}',
    '.qb-note{margin-top:10px;font-size:13px;color:var(--qb-muted)}',
    '.qb-alt{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:12px;padding:14px 16px;',
    '  border:1px solid var(--qb-border);border-radius:14px}',
    '.qb-alt-label{font-size:13px;color:var(--qb-muted)}',
    '.qb-alt-name{font-weight:600}',
    '.qb-alt-price{flex:none;font-weight:700;white-space:nowrap}',

    '.qb-answers{margin-top:12px;border:1px solid var(--qb-border);border-radius:14px}',
    '.qb-answers summary{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;',
    '  font-weight:600;cursor:pointer;list-style:none;-webkit-tap-highlight-color:transparent}',
    '.qb-answers summary::-webkit-details-marker{display:none}',
    '.qb-answers summary svg{width:18px;height:18px;color:var(--qb-muted);transition:transform .2s}',
    '.qb-answers[open] summary svg{transform:rotate(180deg)}',
    '.qb-answers dl{margin:0;padding:0 16px 14px}',
    '.qb-answers dt{margin-top:8px;font-size:13px;color:var(--qb-muted)}',
    '.qb-answers dd{margin:0;font-size:15px}',

    '.qb-send{margin-top:20px;padding-top:20px;border-top:1px solid var(--qb-border)}',
    '.qb-send-title{font-size:15px;font-weight:600}',
    '.qb-field{display:block;margin-top:14px}',
    '.qb-field-label{display:block;margin-bottom:6px;font-size:14px;color:var(--qb-muted)}',
    '.qb-input{display:block;width:100%;height:50px;padding:0 14px;font-size:16px;line-height:normal;',
    '  border:1.5px solid var(--qb-border);border-radius:12px;background:var(--qb-bg);color:var(--qb-text);',
    '  -webkit-appearance:none;appearance:none;box-shadow:none;outline:none;transition:border-color .15s}',
    '.qb-input::placeholder{color:var(--qb-muted);opacity:.8}',
    '.qb-input:focus{border-color:var(--qb-accent)}',
    '.qb-messengers{display:grid;grid-template-columns:1fr;gap:10px;margin-top:14px}',
    '@container (min-width:520px){.qb-messengers{grid-template-columns:1fr 1fr}}',
    '.qb-wa{background:' + C.whatsapp + ';color:#fff}',
    '.qb-tg{background:' + C.telegram + ';color:#fff}',
    '@media (hover:hover){.qb-wa:hover,.qb-tg:hover{opacity:.9}}',
    '.qb-foot{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px 16px;margin-top:16px}',
    '.qb-disclaimer{flex:1 1 260px;font-size:13px;color:var(--qb-muted)}',

    '.qb-toast{position:absolute;left:50%;bottom:16px;z-index:2;width:calc(100% - 32px);max-width:420px;padding:12px 16px;',
    '  border-radius:12px;background:#2b1d22;color:#fff;font-size:14px;line-height:1.35;text-align:center;',
    '  transform:translate(-50%,8px);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}',
    '.qb-toast.qb-show{opacity:1;transform:translate(-50%,0)}',

    '@media (max-width:480px){',
    '  .qb{padding:20px 16px;border-radius:' + Math.min(CONFIG.radius, 16) + 'px}',
    '  .qb-title{font-size:22px}.qb-q{font-size:19px}.qb-proc{font-size:21px}.qb-price{font-size:25px}',
    '  .qb-result-card{padding:16px}',
    '}'
  ].join('\n');

  var ICONS = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    restart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
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
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    root.removeChild(ta);
    return ok;
  }

  function createWidget(container) {
    var host = document.createElement('beauty-quiz-widget');
    host.setAttribute('style', 'all:initial !important;display:block !important;zoom:1 !important;scroll-margin-top:16px !important');
    container.appendChild(host);

    var root = host.attachShadow({ mode: 'open' });
    var style = document.createElement('style');
    style.textContent = CSS;
    var wrap = document.createElement('div');
    wrap.className = 'qb';
    root.appendChild(style);
    root.appendChild(wrap);

    var questions = CONFIG.questions;
    var state = { step: 0, answers: {}, name: '' };
    var autoTimer = null;
    var toastTimer = null;

    function answer(q) { return state.answers[q.id] || []; }

    function render(moveFocus) {
      clearTimeout(autoTimer);
      wrap.innerHTML = state.step < questions.length ? questionHtml() : resultHtml();
      if (!moveFocus) {
        // Первая отрисовка — без анимации появления
        var enter = wrap.querySelector('.qb-enter');
        if (enter) enter.classList.remove('qb-enter');
      } else {
        var heading = wrap.querySelector('[data-focus]');
        if (heading) heading.focus({ preventScroll: true });
        var top = host.getBoundingClientRect().top;
        if (top < 0) host.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function questionHtml() {
      var q = questions[state.step];
      var picked = answer(q);
      var role = q.multiple ? 'checkbox' : 'radio';
      var isLast = state.step === questions.length - 1;
      var pct = Math.round((state.step / questions.length) * 100);
      var html = '<div class="qb-head"><span class="qb-badge">' + esc(T.badge) + '</span>' +
        '<h2 class="qb-title">' + esc(T.title) + '</h2><p class="qb-sub">' + esc(T.subtitle) + '</p></div>';
      html += '<div class="qb-progress"><span class="qb-progress-label">' +
        esc(T.step.replace('{n}', state.step + 1).replace('{total}', questions.length)) + '</span>' +
        '<div class="qb-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
        '<div class="qb-fill" style="width:' + Math.max(pct, 4) + '%"></div></div></div>';
      html += '<div class="qb-enter"><h3 class="qb-q" tabindex="-1" data-focus id="qb-q">' + esc(q.title) + '</h3>';
      if (q.multiple) html += '<p class="qb-hint">' + esc(T.multiHint) + '</p>';
      html += '<div class="qb-options" role="' + (q.multiple ? 'group' : 'radiogroup') + '" aria-labelledby="qb-q">';
      q.options.forEach(function (o, i) {
        var on = picked.indexOf(i) !== -1;
        html += '<button type="button" class="qb-opt" role="' + role + '" aria-checked="' + on + '" data-opt="' + i + '">' +
          '<span class="qb-mark">' + ICONS.check + '</span><span class="qb-opt-text">' +
          '<span class="qb-opt-label">' + esc(o.label) + '</span>' +
          (o.hint ? '<span class="qb-opt-hint">' + esc(o.hint) + '</span>' : '') + '</span></button>';
      });
      html += '</div></div>';
      html += '<div class="qb-nav">' +
        '<button type="button" class="qb-btn qb-ghost' + (state.step === 0 ? ' qb-invisible' : '') + '" data-action="back"' +
        (state.step === 0 ? ' tabindex="-1" aria-hidden="true"' : '') + '>' + ICONS.back + esc(T.back) + '</button>' +
        '<button type="button" class="qb-btn qb-primary" data-action="next"' + (picked.length ? '' : ' disabled') + '>' +
        (isLast ? '<span class="qb-long">' + esc(T.showResult) + '</span><span class="qb-short">' + esc(T.showResultShort) + '</span>' : esc(T.next)) +
        ICONS.next + '</button></div>';
      return html;
    }

    function computeResult() {
      var scores = {};
      var mult = 1;
      var budget = null;
      Object.keys(CONFIG.procedures).forEach(function (k) { scores[k] = 0; });
      questions.forEach(function (q) {
        answer(q).forEach(function (i) {
          var o = q.options[i];
          if (o.scores) Object.keys(o.scores).forEach(function (k) { if (k in scores) scores[k] += o.scores[k]; });
          if (typeof o.mult === 'number') mult = o.mult;
          if ('max' in o) budget = o.max;
        });
      });
      var ranked = Object.keys(CONFIG.procedures).map(function (k, order) {
        var p = CONFIG.procedures[k];
        var m = p.scaleByLength === false ? 1 : mult;
        return { id: k, p: p, score: scores[k], order: order, price: Math.round((p.price * m) / 100) * 100 };
      }).sort(function (a, b) { return b.score - a.score || a.order - b.order; });

      var best = ranked[0];
      var alt = ranked[1] && ranked[1].score > 0 ? ranked[1] : null;
      var overBudget = false;
      if (budget && best.price > budget) {
        var fit = ranked.filter(function (r) { return r.score > 0 && r.price <= budget; })[0];
        if (fit) { alt = best; best = fit; } else { overBudget = true; }
      }
      return { best: best, alt: alt, overBudget: overBudget };
    }

    function answerLines() {
      return questions.map(function (q) {
        return { q: q.title, label: q.label || q.title, a: answer(q).map(function (i) { return q.options[i].label; }).join(', ') };
      });
    }

    function message(res) {
      var lines = [T.msgIntro, ''];
      answerLines().forEach(function (l) { lines.push('• ' + l.label + ': ' + l.a); });
      lines.push('', T.msgResult + ': ' + res.best.p.name + ' — ' + T.priceFrom + ' ' + money(res.best.price));
      if (state.name.trim()) lines.push(T.msgName + ': ' + state.name.trim());
      lines.push('', T.msgOutro);
      return lines.join('\n');
    }

    function links(res) {
      var text = encodeURIComponent(message(res));
      return {
        wa: 'https://wa.me/' + String(CONFIG.contacts.whatsapp).replace(/\D/g, '') + '?text=' + text,
        tg: 'https://t.me/' + String(CONFIG.contacts.telegram).replace(/^@/, '') + '?text=' + text
      };
    }

    function resultHtml() {
      var res = computeResult();
      var l = links(res);
      var html = '<div class="qb-enter">' +
        '<div class="qb-progress"><span class="qb-progress-label">' + esc(T.resultBadge) + '</span>' +
        '<div class="qb-track"><div class="qb-fill" style="width:100%"></div></div></div>' +
        '<h2 class="qb-q" tabindex="-1" data-focus>' + esc(T.resultTitle) + '</h2>' +
        '<div class="qb-result-card"><h3 class="qb-proc">' + esc(res.best.p.name) + '</h3>' +
        '<div class="qb-meta"><span class="qb-price"><small>' + esc(T.priceFrom) + '</small> ' + money(res.best.price) + '</span>' +
        '<span class="qb-duration">' + esc(T.duration) + ': ' + esc(res.best.p.duration) + '</span></div>' +
        '<p class="qb-desc">' + esc(res.best.p.desc) + '</p>' +
        (res.overBudget ? '<p class="qb-note">' + esc(T.overBudget) + '</p>' : '') + '</div>';
      if (res.alt) {
        html += '<div class="qb-alt"><div><div class="qb-alt-label">' + esc(T.altTitle) + '</div>' +
          '<div class="qb-alt-name">' + esc(res.alt.p.name) + '</div></div>' +
          '<div class="qb-alt-price">' + esc(T.priceFrom) + ' ' + money(res.alt.price) + '</div></div>';
      }
      html += '<details class="qb-answers"><summary>' + esc(T.answersTitle) + ICONS.chevron + '</summary><dl>';
      answerLines().forEach(function (a) { html += '<dt>' + esc(a.q) + '</dt><dd>' + esc(a.a) + '</dd>'; });
      html += '</dl></details>';
      html += '<div class="qb-send"><p class="qb-send-title">' + esc(T.sendTitle) + '</p>' +
        '<label class="qb-field"><span class="qb-field-label">' + esc(T.nameLabel) + '</span>' +
        '<input class="qb-input" type="text" name="name" autocomplete="given-name" enterkeyhint="done" maxlength="60" ' +
        'placeholder="' + esc(T.namePlaceholder) + '" value="' + esc(state.name) + '"></label>' +
        '<div class="qb-messengers">' +
        '<a class="qb-btn qb-wa" data-link="wa" href="' + esc(l.wa) + '" target="_blank" rel="noopener">' + ICONS.wa + esc(T.whatsapp) + '</a>' +
        '<a class="qb-btn qb-tg" data-link="tg" href="' + esc(l.tg) + '" target="_blank" rel="noopener">' + ICONS.tg + esc(T.telegram) + '</a>' +
        '</div></div>' +
        '<div class="qb-foot"><p class="qb-disclaimer">' + esc(T.disclaimer) + '</p>' +
        '<button type="button" class="qb-btn qb-ghost" data-action="restart">' + ICONS.restart + esc(T.restart) + '</button></div>' +
        '</div><div class="qb-toast" role="status" aria-live="polite"></div>';
      return html;
    }

    function updateLinks() {
      var l = links(computeResult());
      var wa = wrap.querySelector('[data-link="wa"]');
      var tg = wrap.querySelector('[data-link="tg"]');
      if (wa) wa.href = l.wa;
      if (tg) tg.href = l.tg;
    }

    function toast(text) {
      var el = wrap.querySelector('.qb-toast');
      if (!el) return;
      el.textContent = text;
      el.classList.add('qb-show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { el.classList.remove('qb-show'); }, 3500);
    }

    function go(step) {
      state.step = Math.max(0, Math.min(step, questions.length));
      render(true);
    }

    wrap.addEventListener('click', function (e) {
      var opt = e.target.closest('[data-opt]');
      if (opt) {
        var q = questions[state.step];
        var i = Number(opt.getAttribute('data-opt'));
        var picked = answer(q).slice();
        if (q.multiple) {
          var pos = picked.indexOf(i);
          if (pos === -1) picked.push(i); else picked.splice(pos, 1);
          picked.sort(function (a, b) { return a - b; });
          state.answers[q.id] = picked;
          opt.setAttribute('aria-checked', String(pos === -1));
          wrap.querySelector('[data-action="next"]').disabled = !picked.length;
        } else {
          state.answers[q.id] = [i];
          wrap.querySelectorAll('[data-opt]').forEach(function (b) {
            b.setAttribute('aria-checked', String(b === opt));
          });
          wrap.querySelector('[data-action="next"]').disabled = false;
          clearTimeout(autoTimer);
          autoTimer = setTimeout(function () { go(state.step + 1); }, 260);
        }
        return;
      }
      var btn = e.target.closest('[data-action]');
      if (btn) {
        var action = btn.getAttribute('data-action');
        if (action === 'next' && !btn.disabled) go(state.step + 1);
        if (action === 'back') go(state.step - 1);
        if (action === 'restart') { state.answers = {}; go(0); }
        return;
      }
      var link = e.target.closest('[data-link]');
      if (link) {
        // Дублируем текст в буфер обмена: если мессенджер не подставит его сам, его можно просто вставить
        copyText(message(computeResult()), root).then(function (ok) { if (ok) toast(T.copied); });
      }
    });

    wrap.addEventListener('input', function (e) {
      if (e.target.name === 'name') {
        state.name = e.target.value;
        updateLinks();
      }
    });

    wrap.addEventListener('keydown', function (e) {
      if (e.target.name === 'name' && e.key === 'Enter') e.target.blur();
    });

    render(false);
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
