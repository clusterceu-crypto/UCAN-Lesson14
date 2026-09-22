(() => {
  'use strict';

  const TERM_NOTES = {
    no2: { term: 'NO₂', definition: 'Скорочене позначення діоксиду азоту.' }
  };

  const ROUTES = [
    'Початок',
    'Від актуальної інформації до рішення',
    'Інтерпретація та підтримка рішення',
    'Мадрид: логіка реагування',
    '🧩 Спробуйте застосувати логіку',
    '🔎 Де поглибити логіку',
    '📂 Ваша картка рішення',
    '📝 Фінальна перевірка',
    '✅ Завершення і перенесення у практику'
  ];

  const NS = 'ucan:l14:v1.0';
  const STORAGE = {
    progress: `${NS}:progress`,
    portfolio: `${NS}:portfolio`,
    formative: `${NS}:formative`,
    assessment: `${NS}:assessment`
  };

  const qaMode = new URLSearchParams(window.location.search).get('qa') === '1';
  const routeSections = Array.from(document.querySelectorAll('.route'));
  const headerSection = document.getElementById('header-section');
  const pageLabel = document.getElementById('page-label');
  const percentLabel = document.getElementById('percent-label');
  const progressTrack = document.querySelector('.progress-track');
  const progressBar = document.getElementById('progress-bar');
  const routeStrip = document.getElementById('route-strip');
  const navPrev = document.getElementById('nav-prev');
  const navNext = document.getElementById('nav-next');
  const navPage = document.getElementById('nav-page');
  const resetButton = document.getElementById('reset-button');
  const globalStatus = document.getElementById('global-status');
  const qaIndicator = document.getElementById('qa-indicator');

  const portfolioFields = [
    { key: 'decision', label: 'Рішення / питання', id: 'portfolio-decision' },
    { key: 'information', label: 'Актуальна інформація', id: 'portfolio-info' },
    { key: 'interpretation', label: 'Інтерпретація', id: 'portfolio-interpretation' },
    { key: 'support', label: 'Підтримка вибору', id: 'portfolio-support' },
    { key: 'accountability', label: 'Відповідальність і дія', id: 'portfolio-accountability' }
  ];

  const formativeItems = [
    {
      question: 'Ситуація 1. Умовна громада готується до вечірнього похолодання. Команда бачить оновлені значення температури дорожнього покриття, прогноз опадів і повідомлення про слизькі ділянки. Що в цій ситуації є саме моніторинговою інформацією?',
      options: [
        'A. Рішення негайно змінити пріоритет обробки всіх маршрутів на підставі одного оновлення.',
        'B. Оновлені значення температури, прогноз опадів і повідомлення про стан ділянок.',
        'C. Висновок керівника, що окремі маршрути потребують першочергової уваги цієї зміни.',
        'D. Розпорядження відповідальній службі про зміну плану робіт на найближчий період.'
      ],
      correct: 1,
      feedback: 'Моніторинг дає актуальну інформацію про ситуацію. Він ще не містить управлінського висновку або рішення.'
    },
    {
      question: 'Ситуація 2. Що буде управлінською інтерпретацією цієї інформації?',
      options: [
        'A. Ще раз переглянути ті самі значення на екрані та порівняти час їх оновлення.',
        'B. Зберегти нові дані разом із попередніми спостереженнями для подальшого аналізу.',
        'C. Пояснити, що поєднання похолодання, опадів і повідомлень змінює ризик для пріоритетних маршрутів.',
        'D. Опублікувати зведення поточних значень і залишити управлінський висновок невизначеним.'
      ],
      correct: 2,
      feedback: 'Інтерпретація пов’язує актуальну інформацію з конкретним управлінським питанням: що вона означає для рішення саме зараз.'
    },
    {
      question: 'Ситуація 3. Яка дія найкраще показує відповідальне використання підтримки рішення?',
      options: [
        'A. Керівник служби перевіряє інтерпретацію, змінює пріоритет робіт і залишається відповідальним за рішення.',
        'B. Команда передає остаточний вибір інформаційній системі, а сама лише контролює виконання запропонованої дії.',
        'C. Будь-яка зміна показника автоматично запускає однакову дію для всіх маршрутів без управлінської перевірки.',
        'D. Команда відкладає рішення, доки не з’явиться абсолютно повна інформація і зникне невизначеність.'
      ],
      correct: 0,
      feedback: 'Підтримка рішення зменшує невизначеність, але не переносить відповідальність із уповноваженої людини чи установи на інструмент.'
    }
  ];

  const finalItems = [
    {
      question: 'Питання 1. Умовна громада розглядає, чи скоригувати полив міських зелених зон на найближчий операційний період. Команда отримала оновлені дані про вологість ґрунту та прогноз погоди. Яку роль ці дані мають відіграти насамперед?',
      options: [
        'A. Автоматично визначити режим поливу, щойно одне значення змінилося.',
        'B. Дати актуальну основу для подальшої управлінської інтерпретації.',
        'C. Замінити локальну відповідальність єдиним технічним правилом.',
        'D. Показати довгострокову ефективність усієї кліматичної програми.'
      ],
      correct: 1,
      feedback: 'Актуальні дані є входом для рішення. Команда має ще з’ясувати, що вони означають у контексті конкретного управлінського питання.'
    },
    {
      question: 'Питання 2. Що в цій ситуації є управлінською інтерпретацією, а не просто продовженням моніторингу?',
      options: [
        'A. Порівняння нових значень вологості з попереднім заміром без висновку для дії.',
        'B. Оновлення зведення даних по зелених зонах після надходження нової інформації.',
        'C. Висновок, що сухість разом із прогнозованою спекою змінює пріоритет поливу.',
        'D. Збереження ряду спостережень для подальшого аналізу стану зелених зон.'
      ],
      correct: 2,
      feedback: 'Інтерпретація пояснює управлінське значення інформації: як поєднання актуальних умов змінює пріоритет для конкретного рішення.'
    },
    {
      question: 'Питання 3. Інструмент підтримки показує кілька можливих режимів поливу. Як команда має використати цю підтримку?',
      options: [
        'A. Порівняти варіанти за актуальною інформацією, а рішення залишити відповідальній команді.',
        'B. Прийняти перший запропонований варіант як робоче рішення без додаткової управлінської перевірки.',
        'C. Застосувати найбільш економний варіант незалежно від контексту окремих зелених зон.',
        'D. Передати остаточний вибір системі, а команді залишити лише контроль виконання.'
      ],
      correct: 0,
      feedback: 'Система або інструмент може структурувати інформацію і допомогти порівняти варіанти. Остаточне управлінське рішення залишається за відповідальною командою.'
    },
    {
      question: 'Питання 4. Після аналізу команда вирішила тимчасово змінити пріоритет поливу. Що має залишатися явним у логіці рішення?',
      options: [
        'A. Хто оновив останній набір даних і в якому форматі він був відображений.',
        'B. Який цифровий інструмент команда використовувала для перегляду поточної інформації.',
        'C. Який зовнішній ресурс містив найбільше довідкової інформації про посуху.',
        'D. Хто уповноважено прийняв рішення, на якій інтерпретації і хто відповідає за дію.'
      ],
      correct: 3,
      feedback: 'Відповідальність не зникає через наявність даних чи інструменту: має бути зрозуміло, хто прийняв рішення, на якій інтерпретації та хто виконує дію.'
    },
    {
      question: 'Питання 5. Наприкінці дня оновлення показує нижчу вологість ґрунту в частині зелених зон, прогноз вказує на спеку, але умови між зонами різняться. Інструмент рекомендує посилити полив для всіх зон. Яка реакція команди найкраще відповідає цій ситуації?',
      options: [
        'A. Прийняти рекомендацію для всіх зон як тимчасове рішення, бо інструмент уже врахував поточну вологість і прогноз, а локальні відмінності перевірити пізніше.',
        'B. Використати зниження вологості як постійний універсальний поріг програми поливу та надалі оцінювати за ним результативність усіх зелених зон.',
        'C. Зіставити дані й прогноз для конкретних зон, використати рекомендацію як підтримку, а уповноваженій команді визначити й зафіксувати обґрунтовану зміну режиму.',
        'D. Зберегти поточний режим для всіх зон до наступного циклу спостережень, бо відмінності між зонами роблять теперішню інформацію недостатньою для коригування.'
      ],
      correct: 2,
      feedback: 'Поточні дані й прогноз дають вхід для рішення, а рекомендація інструменту лише підтримує його. Команда має інтерпретувати відмінності між зонами, визначити, де зміна режиму обґрунтована, і залишити остаточне рішення та відповідальність за уповноваженою муніципальною командою.'
    }
  ];

  function safeLoad(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return structuredClone(fallback);
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : structuredClone(fallback);
    } catch (_) {
      return structuredClone(fallback);
    }
  }

  function safeSave(key, value) {
    if (qaMode) return true;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  }

  function safeRemove(key) {
    if (qaMode) return true;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (_) {
      return false;
    }
  }

  let progress = safeLoad(STORAGE.progress, { route: 0 });
  let portfolio = safeLoad(STORAGE.portfolio, { decision: '', information: '', interpretation: '', support: '', accountability: '' });
  let formative = safeLoad(STORAGE.formative, { answers: ['', '', ''], checked: [false, false, false] });
  let assessment = safeLoad(STORAGE.assessment, { answers: ['', '', '', '', ''], checked: false, passed: false, score: null, dirty: false });

  if (!Array.isArray(formative.answers) || formative.answers.length !== 3) formative.answers = ['', '', ''];
  if (!Array.isArray(formative.checked) || formative.checked.length !== 3) formative.checked = [false, false, false];
  if (!Array.isArray(assessment.answers) || assessment.answers.length !== 5) assessment.answers = ['', '', '', '', ''];
  if (typeof assessment.checked !== 'boolean') assessment.checked = false;
  if (typeof assessment.passed !== 'boolean') assessment.passed = false;
  if (typeof assessment.dirty !== 'boolean') assessment.dirty = false;
  if (!Number.isInteger(assessment.score)) assessment.score = null;

  let currentRoute = Number.isInteger(progress.route) ? Math.max(0, Math.min(8, progress.route)) : 0;
  if (currentRoute === 8 && !isCompletionUnlocked()) currentRoute = 7;

  function isCompletionUnlocked() {
    return assessment.checked === true && assessment.passed === true && assessment.score === 5 && assessment.dirty === false;
  }

  function canAccessRoute(index) {
    if (index !== 8) return true;
    return qaMode || isCompletionUnlocked();
  }

  function announce(message) {
    globalStatus.textContent = '';
    window.setTimeout(() => { globalStatus.textContent = message; }, 10);
  }

  function buildRouteStrip() {
    routeStrip.textContent = '';
    ROUTES.forEach((label, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'route-tab';
      button.textContent = label;
      button.dataset.routeTarget = String(index);
      button.addEventListener('click', () => setRoute(index));
      routeStrip.appendChild(button);
    });
  }

  function setRoute(index, { focus = true, persist = true } = {}) {
    index = Math.max(0, Math.min(8, index));
    if (!canAccessRoute(index)) {
      announce('Завершення відкриється після поточної перевірки з результатом 5/5.');
      return false;
    }
    currentRoute = index;
    routeSections.forEach((section, i) => { section.hidden = i !== currentRoute; });
    headerSection.textContent = ROUTES[currentRoute];
    const page = currentRoute + 1;
    const pct = Math.round((page / ROUTES.length) * 100);
    pageLabel.textContent = `Сторінка ${page} з ${ROUTES.length}`;
    percentLabel.textContent = `${pct}%`;
    progressTrack.setAttribute('aria-valuenow', String(pct));
    progressBar.style.width = `${pct}%`;
    navPage.textContent = `${page} / ${ROUTES.length}`;
    navPrev.disabled = currentRoute === 0;

    const tabs = Array.from(routeStrip.querySelectorAll('.route-tab'));
    tabs.forEach((tab, i) => {
      tab.removeAttribute('aria-current');
      if (i === currentRoute) tab.setAttribute('aria-current', 'page');
      tab.disabled = i === 8 && !canAccessRoute(8);
    });

    if (currentRoute === 8) {
      navNext.textContent = 'Наступне заняття →';
      navNext.disabled = false;
      navNext.removeAttribute('aria-disabled');
      navNext.removeAttribute('title');
    } else {
      navNext.textContent = 'Далі →';
      const blocked = currentRoute === 7 && !canAccessRoute(8);
      navNext.disabled = blocked;
      if (blocked) {
        navNext.setAttribute('aria-disabled', 'true');
        navNext.title = 'Спочатку перевірте фінальні відповіді та отримайте 5/5.';
      } else {
        navNext.removeAttribute('aria-disabled');
        navNext.removeAttribute('title');
      }
    }

    if (persist && !qaMode) {
      progress.route = currentRoute;
      safeSave(STORAGE.progress, progress);
    }

    if (focus) {
      const heading = routeSections[currentRoute].querySelector('h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }
    return true;
  }

  navPrev.addEventListener('click', () => setRoute(currentRoute - 1));
  navNext.addEventListener('click', () => {
    if (currentRoute < 8) setRoute(currentRoute + 1);
    else window.location.href = 'https://clusterceu-crypto.github.io/UCAN-Lesson15/';
  });

  function renderFormative() {
    const container = document.getElementById('formative-container');
    container.textContent = '';
    formativeItems.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'quiz-card';
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = item.question;
      fieldset.appendChild(legend);
      item.options.forEach((opt, oi) => {
        const label = document.createElement('label');
        label.className = 'option';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `formative-${index}`;
        input.value = String(oi);
        input.checked = String(oi) === String(formative.answers[index]);
        input.addEventListener('change', () => {
          formative.answers[index] = input.value;
          formative.checked[index] = false;
          feedback.hidden = true;
          safeSave(STORAGE.formative, formative);
        });
        const span = document.createElement('span');
        span.textContent = opt;
        label.append(input, span);
        fieldset.appendChild(label);
      });
      const check = document.createElement('button');
      check.type = 'button';
      check.className = 'btn btn-secondary';
      check.textContent = 'Перевірити';
      const feedback = document.createElement('div');
      feedback.className = 'feedback';
      feedback.hidden = true;
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      check.addEventListener('click', () => {
        const selected = fieldset.querySelector('input:checked');
        if (!selected) {
          feedback.dataset.kind = 'incorrect';
          feedback.textContent = 'Оберіть один варіант відповіді.';
          feedback.hidden = false;
          return;
        }
        const ok = Number(selected.value) === item.correct;
        formative.answers[index] = selected.value;
        formative.checked[index] = true;
        safeSave(STORAGE.formative, formative);
        feedback.dataset.kind = ok ? 'correct' : 'incorrect';
        feedback.textContent = `${ok ? 'Правильно.' : 'Спробуйте ще раз.'} ${item.feedback}`;
        feedback.hidden = false;
      });
      card.append(fieldset, check, feedback);
      container.appendChild(card);
      if (formative.checked[index] && formative.answers[index] !== '') {
        const ok = Number(formative.answers[index]) === item.correct;
        feedback.dataset.kind = ok ? 'correct' : 'incorrect';
        feedback.textContent = `${ok ? 'Правильно.' : 'Спробуйте ще раз.'} ${item.feedback}`;
        feedback.hidden = false;
      }
    });
  }

  function renderFinal() {
    const form = document.getElementById('final-form');
    form.textContent = '';
    finalItems.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'quiz-card';
      card.dataset.finalIndex = String(index);
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = item.question;
      fieldset.appendChild(legend);
      item.options.forEach((opt, oi) => {
        const label = document.createElement('label');
        label.className = 'option';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `final-${index}`;
        input.value = String(oi);
        input.checked = String(oi) === String(assessment.answers[index]);
        input.addEventListener('change', () => {
          assessment.answers[index] = input.value;
          if (assessment.checked || assessment.passed || assessment.score !== null) {
            assessment.checked = false;
            assessment.passed = false;
            assessment.score = null;
            assessment.dirty = true;
          } else {
            assessment.dirty = true;
          }
          hideFinalFeedback();
          updateAssessmentStatus();
          safeSave(STORAGE.assessment, assessment);
          updateCompletionGate();
        });
        const span = document.createElement('span');
        span.textContent = opt;
        label.append(input, span);
        fieldset.appendChild(label);
      });
      const feedback = document.createElement('div');
      feedback.className = 'feedback final-feedback';
      feedback.hidden = true;
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      card.append(fieldset, feedback);
      form.appendChild(card);
    });
    restoreFinalFeedback();
  }

  function hideFinalFeedback() {
    document.querySelectorAll('.final-feedback').forEach(el => { el.hidden = true; el.textContent = ''; });
  }

  function restoreFinalFeedback() {
    if (!assessment.checked || assessment.answers.some(v => v === '')) return;
    document.querySelectorAll('[data-final-index]').forEach(card => {
      const index = Number(card.dataset.finalIndex);
      const feedback = card.querySelector('.final-feedback');
      const ok = Number(assessment.answers[index]) === finalItems[index].correct;
      feedback.dataset.kind = ok ? 'correct' : 'incorrect';
      feedback.textContent = `${ok ? 'Правильно.' : 'Перегляньте відповідь.'} ${finalItems[index].feedback}`;
      feedback.hidden = false;
    });
  }

  function updateAssessmentStatus() {
    const status = document.getElementById('final-status');
    status.className = 'status assessment-status';
    if (assessment.checked && Number.isInteger(assessment.score)) {
      if (assessment.passed) {
        status.textContent = `Результат: ${assessment.score}/5. Фінальна перевірка пройдена.`;
        status.classList.add('success');
      } else {
        status.textContent = `Результат: ${assessment.score}/5. Виправте відповіді та перевірте ще раз.`;
        status.classList.add('error');
      }
    } else if (assessment.dirty) {
      status.textContent = 'Відповіді змінено. Потрібна нова перевірка.';
    } else {
      status.textContent = '';
    }
  }

  document.getElementById('final-check').addEventListener('click', () => {
    const answers = finalItems.map((_, index) => {
      const selected = document.querySelector(`input[name="final-${index}"]:checked`);
      return selected ? selected.value : '';
    });
    assessment.answers = answers;
    if (answers.some(v => v === '')) {
      assessment.checked = false;
      assessment.passed = false;
      assessment.score = null;
      assessment.dirty = true;
      safeSave(STORAGE.assessment, assessment);
      hideFinalFeedback();
      const status = document.getElementById('final-status');
      status.className = 'status assessment-status error';
      status.textContent = 'Оберіть відповідь у кожному з п’яти питань.';
      updateCompletionGate();
      return;
    }
    const score = answers.reduce((sum, value, index) => sum + (Number(value) === finalItems[index].correct ? 1 : 0), 0);
    assessment.score = score;
    assessment.checked = true;
    assessment.dirty = false;
    assessment.passed = score === 5;
    safeSave(STORAGE.assessment, assessment);
    restoreFinalFeedback();
    updateAssessmentStatus();
    updateCompletionGate();
    announce(assessment.passed ? 'Фінальна перевірка пройдена. Завершення відкрито.' : `Результат ${score} з 5. Можна виправити відповіді та перевірити ще раз.`);
  });

  function updateCompletionGate() {
    const note = document.getElementById('completion-lock-note');
    if (isCompletionUnlocked()) {
      note.textContent = 'Фінальна перевірка пройдена: завершення доступне.';
      note.className = 'lock-note status success';
    } else if (assessment.dirty) {
      note.textContent = 'Відповіді змінено. Завершення знову заблоковано до нової перевірки з результатом 5/5.';
      note.className = 'lock-note';
    } else {
      note.textContent = 'Завершення відкриється після поточної перевірки з результатом 5/5.';
      note.className = 'lock-note';
    }
    if (currentRoute === 8 && !canAccessRoute(8)) setRoute(7, { focus: false });
    else setRoute(currentRoute, { focus: false, persist: false });
  }

  function getPortfolioFromInputs() {
    const out = {};
    portfolioFields.forEach(field => {
      const el = document.getElementById(field.id);
      out[field.key] = el.value.trim();
    });
    return out;
  }

  function restorePortfolio() {
    portfolioFields.forEach(field => {
      const el = document.getElementById(field.id);
      el.value = typeof portfolio[field.key] === 'string' ? portfolio[field.key] : '';
      el.addEventListener('input', updateSynthesis);
    });
    updateSynthesis();
  }

  function updateSynthesis() {
    const dl = document.getElementById('synthesis-list');
    dl.textContent = '';
    const current = getPortfolioFromInputs();
    portfolioFields.forEach(field => {
      const dt = document.createElement('dt');
      dt.textContent = field.label;
      const dd = document.createElement('dd');
      dd.textContent = current[field.key] || '—';
      dl.append(dt, dd);
    });
  }

  function setPortfolioStatus(message, kind = '') {
    const status = document.getElementById('portfolio-status');
    status.textContent = message;
    status.className = `status${kind ? ` ${kind}` : ''}`;
  }

  document.getElementById('portfolio-save').addEventListener('click', () => {
    portfolio = getPortfolioFromInputs();
    const ok = safeSave(STORAGE.portfolio, portfolio);
    if (qaMode) setPortfolioStatus('QA MODE: зміни залишаються лише в поточному перегляді.', 'success');
    else if (ok) setPortfolioStatus('Картку збережено локально в цьому браузері.', 'success');
    else setPortfolioStatus('Не вдалося зберегти картку локально. Перевірте налаштування сховища браузера.', 'error');
  });

  document.getElementById('portfolio-delete').addEventListener('click', () => {
    if (!window.confirm('Видалити всі п’ять полів Вашої картки з локального сховища? Цю дію не можна скасувати.')) return;
    portfolio = { decision: '', information: '', interpretation: '', support: '', accountability: '' };
    const ok = safeRemove(STORAGE.portfolio);
    portfolioFields.forEach(field => { document.getElementById(field.id).value = ''; });
    updateSynthesis();
    if (qaMode) setPortfolioStatus('QA MODE: локальне сховище не змінено.', 'success');
    else if (ok) setPortfolioStatus('Картку видалено з локального сховища.', 'success');
    else setPortfolioStatus('Не вдалося видалити картку з локального сховища.', 'error');
  });

  const AI_FRAME = 'Допоможи критично перевірити логіку моєї картки рішення. Не приймай рішення замість мене і не вигадуй відсутні поточні або локальні дані. Перевір: (1) чи не змішані інформація та управлінська інтерпретація; (2) чи зрозуміло, як інформація підтримує конкретний вибір; (3) чи чітко збережена людська та інституційна відповідальність; (4) які твердження є неперевіреними припущеннями або прогалинами. Якщо даних бракує, познач це як те, що потрібно перевірити, а не заповнюй прогалину вигадкою.';

  function buildAiPrompt(values) {
    const lines = portfolioFields
      .filter(field => values[field.key])
      .map(field => `${field.label}: ${values[field.key]}`);
    return `${AI_FRAME}\n\nМоя картка:\n${lines.join('\n')}`;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    area.remove();
    if (!ok) throw new Error('copy failed');
    return true;
  }

  document.getElementById('copy-ai-prompt').addEventListener('click', async () => {
    const status = document.getElementById('ai-status');
    const fallback = document.getElementById('ai-copy-fallback');
    const fallbackArea = document.getElementById('ai-prompt-fallback');
    fallback.hidden = true;
    status.className = 'status';
    const current = getPortfolioFromInputs();
    const hasAny = portfolioFields.some(field => current[field.key]);
    const savedCurrent = JSON.stringify(current) === JSON.stringify(portfolio);
    if (!hasAny) {
      status.textContent = 'Заповніть принаймні одну частину картки, збережіть її і повторіть дію.';
      status.classList.add('error');
      return;
    }
    if (!savedCurrent && !qaMode) {
      status.textContent = 'Спочатку збережіть актуальну версію картки.';
      status.classList.add('error');
      return;
    }
    const prompt = buildAiPrompt(current);
    try {
      await copyText(prompt);
      status.textContent = 'Промпт скопійовано. Відкрийте обраний сервіс і вставте його вручну.';
      status.classList.add('success');
    } catch (_) {
      fallbackArea.value = prompt;
      fallback.hidden = false;
      fallbackArea.focus();
      fallbackArea.select();
      status.textContent = 'Автоматичне копіювання не спрацювало. Виділіть і скопіюйте промпт вручну.';
      status.classList.add('error');
    }
  });

  function wrapText(ctx, text, maxWidth) {
    const lines = [];
    const paragraphs = String(text || '').split(/\r?\n/);
    paragraphs.forEach((paragraph, pi) => {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        lines.push('');
      } else {
        let line = '';
        words.forEach(word => {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width <= maxWidth || !line) line = test;
          else { lines.push(line); line = word; }
        });
        if (line) lines.push(line);
      }
      if (pi < paragraphs.length - 1) lines.push('');
    });
    return lines;
  }

  function renderPortfolioPages(values) {
    const W = 1240;
    const H = 1754;
    const marginX = 90;
    const top = 90;
    const bottom = 90;
    const maxWidth = W - marginX * 2;
    const pages = [];
    let canvas;
    let ctx;
    let y;

    function newPage(isFirst = false) {
      canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      ctx = canvas.getContext('2d', { alpha: false });
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#15324b';
      ctx.font = 'bold 42px Arial, sans-serif';
      ctx.fillText('Портфель мера', marginX, top);
      ctx.font = 'bold 29px Arial, sans-serif';
      const titleLines = wrapText(ctx, 'Картка рішення', maxWidth);
      y = top + 64;
      titleLines.forEach(line => { ctx.fillText(line, marginX, y); y += 38; });
      ctx.strokeStyle = '#cbd8df';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(marginX, y + 8);
      ctx.lineTo(W - marginX, y + 8);
      ctx.stroke();
      y += 46;
      pages.push(canvas);
    }

    newPage(true);
    portfolioFields.forEach(field => {
      const value = values[field.key] || '—';
      ctx.font = 'bold 25px Arial, sans-serif';
      const labelHeight = 34;
      ctx.font = '22px Arial, sans-serif';
      const valueLines = wrapText(ctx, value, maxWidth);
      const lineHeight = 31;
      const estimated = labelHeight + 12 + valueLines.length * lineHeight + 34;
      if (y + estimated > H - bottom && estimated < H - top - bottom - 140) newPage();
      ctx.fillStyle = '#15324b';
      ctx.font = 'bold 25px Arial, sans-serif';
      ctx.fillText(field.label, marginX, y);
      y += labelHeight + 6;
      ctx.fillStyle = '#1f2a32';
      ctx.font = '22px Arial, sans-serif';
      for (let i = 0; i < valueLines.length; i++) {
        if (y + lineHeight > H - bottom) {
          newPage();
          ctx.fillStyle = '#15324b';
          ctx.font = 'bold 25px Arial, sans-serif';
          ctx.fillText(field.label, marginX, y);
          y += labelHeight + 6;
          ctx.fillStyle = '#1f2a32';
          ctx.font = '22px Arial, sans-serif';
        }
        ctx.fillText(valueLines[i], marginX, y);
        y += lineHeight;
      }
      y += 34;
    });
    return pages;
  }

  function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function asciiBytes(text) {
    return new TextEncoder().encode(text);
  }

  function buildImagePdf(canvases) {
    const images = canvases.map(canvas => {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      return { width: canvas.width, height: canvas.height, bytes: base64ToBytes(dataUrl.split(',')[1]) };
    });
    const objectCount = 2 + images.length * 3;
    const objects = new Array(objectCount + 1);
    objects[1] = [asciiBytes('<< /Type /Catalog /Pages 2 0 R >>')];
    const kids = [];
    images.forEach((image, i) => kids.push(`${3 + i * 3} 0 R`));
    objects[2] = [asciiBytes(`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${images.length} >>`)];
    images.forEach((image, i) => {
      const pageObj = 3 + i * 3;
      const imageObj = pageObj + 1;
      const contentObj = pageObj + 2;
      const content = `q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n`;
      objects[pageObj] = [asciiBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imageObj} 0 R >> >> /Contents ${contentObj} 0 R >>`)];
      objects[imageObj] = [
        asciiBytes(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`),
        image.bytes,
        asciiBytes('\nendstream')
      ];
      const contentBytes = asciiBytes(content);
      objects[contentObj] = [asciiBytes(`<< /Length ${contentBytes.length} >>\nstream\n`), contentBytes, asciiBytes('endstream')];
    });

    const chunks = [];
    let offset = 0;
    const offsets = new Array(objectCount + 1).fill(0);
    function push(chunk) { chunks.push(chunk); offset += chunk.length; }
    push(asciiBytes('%PDF-1.4\n%UCAN\n'));
    for (let id = 1; id <= objectCount; id++) {
      offsets[id] = offset;
      push(asciiBytes(`${id} 0 obj\n`));
      objects[id].forEach(push);
      push(asciiBytes('\nendobj\n'));
    }
    const xrefOffset = offset;
    push(asciiBytes(`xref\n0 ${objectCount + 1}\n`));
    push(asciiBytes('0000000000 65535 f \n'));
    for (let id = 1; id <= objectCount; id++) {
      push(asciiBytes(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`));
    }
    push(asciiBytes(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`));
    return new Blob(chunks, { type: 'application/pdf' });
  }

  async function downloadPortfolioPdf() {
    const button = document.getElementById('portfolio-pdf');
    const original = button.textContent;
    const values = getPortfolioFromInputs();
    button.disabled = true;
    button.textContent = 'Готуємо PDF…';
    setPortfolioStatus('Готуємо PDF локально…');
    try {
      await new Promise(resolve => requestAnimationFrame(resolve));
      const pages = renderPortfolioPages(values);
      const blob = buildImagePdf(pages);
      if (blob.size < 1000) throw new Error('PDF too small');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'UCAN_Karta_pidtrymky_munitsypalnoho_rishennia.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setPortfolioStatus('PDF створено локально та передано на завантаження.', 'success');
    } catch (_) {
      setPortfolioStatus('Не вдалося створити PDF. Ваші записи збережено; повторіть спробу або скористайтеся браузером пізніше.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }

  document.getElementById('portfolio-pdf').addEventListener('click', downloadPortfolioPdf);

  resetButton.addEventListener('click', () => {
    if (!window.confirm('Почати спочатку? Навігаційний прогрес, самоперевірка і фінальна перевірка будуть очищені. Ваша картка в «Портфелі мера» збережеться.')) return;
    progress = { route: 0 };
    formative = { answers: ['', '', ''], checked: [false, false, false] };
    assessment = { answers: ['', '', '', '', ''], checked: false, passed: false, score: null, dirty: false };
    if (!qaMode) {
      safeSave(STORAGE.progress, progress);
      safeRemove(STORAGE.formative);
      safeRemove(STORAGE.assessment);
    }
    renderFormative();
    renderFinal();
    updateAssessmentStatus();
    setRoute(0);
    announce(qaMode ? 'QA MODE: звичайне локальне сховище не змінено.' : 'Навігаційний прогрес, самоперевірку і фінальну перевірку очищено. Ваша картка збережена.');
    resetButton.focus();
  });

  window.addEventListener('storage', (event) => {
    if (qaMode) return;
    if (event.key === STORAGE.assessment) {
      assessment = safeLoad(STORAGE.assessment, { answers: ['', '', '', '', ''], checked: false, passed: false, score: null, dirty: false });
      if (currentRoute === 8 && !isCompletionUnlocked()) setRoute(7, { focus: false });
      updateAssessmentStatus();
      updateCompletionGate();
    }
  });

  buildRouteStrip();
  restorePortfolio();
  renderFormative();
  renderFinal();
  updateAssessmentStatus();
  if (qaMode) qaIndicator.hidden = false;
  setRoute(currentRoute, { focus: false, persist: false });
  updateCompletionGate();

  // Contextual Term Notes: transient, first-use, non-gating and never persisted.
  let termPopover = null;
  let activeTermTrigger = null;
  function ensureTermPopover() {
    if (termPopover) return termPopover;
    const pop = document.createElement('div');
    pop.id = 'term-note-popover';
    pop.className = 'term-popover';
    pop.hidden = true;
    pop.setAttribute('role', 'note');
    pop.innerHTML = '<div class="term-popover-head"><strong class="term-popover-title" id="term-note-title"></strong><button class="term-popover-close" type="button" aria-label="Закрити пояснення">×</button></div><div class="term-popover-body" id="term-note-body"></div>';
    document.body.append(pop);
    termPopover = pop;
    pop.querySelector('.term-popover-close').addEventListener('click', () => closeTermNote(true));
    pop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeTermNote(true); } });
    return pop;
  }
  function resetTermExpanded(except = null) {
    document.querySelectorAll('.term-trigger[aria-expanded="true"]').forEach((b) => { if (b !== except) b.setAttribute('aria-expanded', 'false'); });
  }
  function positionTermPopover(trigger) {
    const pop = ensureTermPopover();
    if (pop.hidden || !trigger || !trigger.isConnected) return;
    if (matchMedia('(max-width: 760px)').matches) { pop.style.left=''; pop.style.top=''; pop.style.right=''; return; }
    pop.style.right = 'auto'; pop.style.left = '12px'; pop.style.top = '12px';
    const tr = trigger.getBoundingClientRect(), pr = pop.getBoundingClientRect(), gap = 10, pad = 12;
    let left = Math.min(Math.max(tr.left, pad), Math.max(pad, innerWidth - pr.width - pad));
    let top = tr.bottom + gap;
    if (top + pr.height > innerHeight - pad) top = Math.max(pad, tr.top - pr.height - gap);
    pop.style.left = `${Math.round(left)}px`; pop.style.top = `${Math.round(top)}px`;
  }
  function openTermNote(trigger, key) {
    const item = TERM_NOTES[key]; if (!item) return;
    const pop = ensureTermPopover();
    if (activeTermTrigger === trigger && !pop.hidden) { closeTermNote(false); return; }
    resetTermExpanded(trigger); activeTermTrigger = trigger; trigger.setAttribute('aria-expanded', 'true');
    document.getElementById('term-note-title').textContent = item.term;
    document.getElementById('term-note-body').textContent = item.definition;
    pop.hidden = false; requestAnimationFrame(() => positionTermPopover(trigger));
  }
  function closeTermNote(returnFocus = false) {
    if (!termPopover) return;
    const t = activeTermTrigger; resetTermExpanded(); termPopover.hidden = true; activeTermTrigger = null;
    if (returnFocus && t && t.isConnected) t.focus();
  }
  function createTermControl(host) {
    if (!host || host.dataset.rendered === 'true') return;
    const key = host.dataset.term, item = TERM_NOTES[key]; if (!item) return;
    const label = host.dataset.label || host.textContent;
    host.dataset.rendered = 'true'; host.textContent = '';
    const b = document.createElement('button'), text = document.createElement('span'), info = document.createElement('span');
    b.type='button'; b.className='term-trigger'; b.dataset.term=key;
    b.setAttribute('aria-label', `${label}. Пояснення терміна`); b.setAttribute('aria-expanded','false'); b.setAttribute('aria-controls','term-note-popover');
    text.className='term-text'; text.textContent=label; info.className='term-info'; info.setAttribute('aria-hidden','true'); info.textContent='ⓘ';
    b.append(text,info);
    b.addEventListener('click',()=>openTermNote(b,key));
    b.addEventListener('keydown',(e)=>{ if(e.key==='Escape'&&b.getAttribute('aria-expanded')==='true'){e.preventDefault();closeTermNote(true);} });
    host.append(b);
  }
  document.querySelectorAll('.term-inline').forEach(createTermControl);
  ensureTermPopover();
  document.addEventListener('pointerdown',(e)=>{ if(!termPopover||termPopover.hidden)return; const t=e.target; if(termPopover.contains(t)||t.closest?.('.term-trigger'))return; closeTermNote(false); },true);
  window.addEventListener('resize',()=>activeTermTrigger&&positionTermPopover(activeTermTrigger));
  document.addEventListener('scroll',()=>activeTermTrigger&&positionTermPopover(activeTermTrigger),true);

})();
