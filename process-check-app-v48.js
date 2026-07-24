(() => {
  "use strict";

  const root = document.querySelector("#app");
  const query = new URLSearchParams(window.location.search);
  const isMobileStandalone =
    query.get("mobile") === "1" &&
    window.matchMedia("(max-width: 700px)").matches;

  if (isMobileStandalone) {
    document.documentElement.classList.add("is-mobile-standalone");
  }

  const questions = [
    {
      title: "Процесс повторяется регулярно?",
      description:
        "Например, новые кандидаты, заявки или документы появляются каждую неделю или каждый месяц",
    },
    {
      title: "В процессе участвует небольшая команда?",
      description:
        "Для первого запуска лучше выбрать процесс с одной-двумя ролями и 3–6 участниками, а не со всей компанией",
    },
    {
      title: "У участников есть понятная проблема?",
      description:
        "Например, задачи теряются, статус приходится уточнять,<br>информацию — искать, а обратную связь — долго ждать",
    },
    {
      title: "У процесса есть видимый результат?",
      description:
        "Например, кандидат прошёл отбор, договор согласован<br>или заявка выполнена",
    },
    {
      title: "Работа идёт по последовательным этапам?",
      description:
        "Один объект движется от шага к шагу, а не проходит<br>несколько отделов одновременно",
    },
    {
      title: "Можно безопасно провести пилот?",
      description:
        "Ошибку в настройке можно исправить без остановки критичной работы и серьёзных последствий для бизнеса",
    },
  ];

  const state = {
    screen: isMobileStandalone ? "name" : "start",
    processName: "",
    questionIndex: 0,
    answers: Array(questions.length).fill(null),
    isTransitioning: false,
    displayedProgress: 0,
  };

  const answerPreviewDuration = 240;

  const escapeHtml = (value) =>
    value.replace(
      /[&<>'"]/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[character],
    );

  const logo = () => `
    <img
      class="tracker-logo"
      src="./public/tracker-logo.png"
      alt="Логотип Трекера"
      width="100"
      height="100"
    />
  `;

  const decoration = () => `
    <div class="decorative-shapes" aria-hidden="true">
      <span class="shape shape-top"></span>
      <span class="shape shape-right"></span>
    </div>
  `;

  const primaryButton = (label, action, options = {}) => `
    <button
      class="primary-button ${options.className || ""}"
      type="button"
      data-action="${action}"
      ${options.disabled ? "disabled" : ""}
    >${label}</button>
  `;

  const evaluateAnswers = () => {
    const [repeats, smallGroup, pain, outcome, sequential, safe] = state.answers;
    const processName = `Процесс «${state.processName}»`;
    const hardStops = [];

    if (!repeats) {
      hardStops.push(
        `${processName} не повторяется регулярно — на пилоте не получится быстро проверить новый порядок работы.`,
      );
    }
    if (!pain) {
      hardStops.push(
        "У участников не обозначена конкретная рабочая проблема — команде будет трудно увидеть пользу от изменений.",
      );
    }
    if (!outcome) {
      hardStops.push(
        "У процесса нет понятного результата на выходе — нельзя будет понять, улучшил ли пилот работу.",
      );
    }
    if (!safe) {
      hardStops.push(
        "В процессе нет права на ошибку. Он критичен для бизнеса и не подходит для пилота.",
      );
    }

    if (hardStops.length) {
      const allAnswersNo = state.answers.every((answer) => !answer);
      const feedback = allAnswersNo
        ? ["Ни один из критериев первого пилота не учтён.\nДля запуска лучше выбрать другой процесс."]
        : hardStops.length > 1
          ? [`${processName} пока не подходит: не соблюдены несколько ключевых условий для первого пилота.`]
          : hardStops;

      return {
        kind: "not-ready",
        title: "Пока не подходит",
        icon: "!",
        statement: "Этот процесс лучше не брать в пилот.",
        feedback,
      };
    }

    const conditions = [];
    if (!smallGroup) {
      conditions.push(
        "для старта нужно сократить число участников до 3–6 человек и оставить не больше двух ролей",
      );
    }
    if (!sequential) {
      conditions.push(
        "нужно выделить один последовательный участок работы без параллельных переходов между отделами",
      );
    }

    if (conditions.length === 2) {
      return {
        kind: "not-ready",
        title: "Пока не подходит",
        icon: "!",
        statement: "Этот процесс лучше не брать в пилот.",
        feedback: [
          `${processName} пока не подходит: для первого запуска в нём слишком много участников и параллельных этапов.`,
        ],
      };
    }

    if (conditions.length === 1) {
      return {
        kind: "refine",
        title: "Подходит с условиями",
        icon: "✓",
        statement: "Процесс можно взять в пилот, если немного сузить его границы.",
        feedback: [
          `${processName} регулярный, безопасный и даёт понятный результат — это хорошая основа для пилота.`,
          `Но ${conditions[0]}.`,
        ],
      };
    }

    return {
      kind: "ready",
      title: "Подходит для первого внедрения",
      icon: "✓",
      statement: "Похоже, процесс подходит для пилота!",
      feedback: [
        `Все ключевые условия для пилота выполнены.\n${processName} можно запускать.`,
      ],
    };
  };

const textWithBreaks = (value) => {
  const normalized = isMobileStandalone
    ? String(value).replace(/\n+/g, " ")
    : String(value);

  return escapeHtml(normalized).replace(/\n/g, "<br />");
};

const resultTitle = (content) => {
  if (!isMobileStandalone) return escapeHtml(content.title);

  if (content.kind === "ready") {
    return "Подходит<br />для первого<br />внедрения";
  }

  if (content.kind === "not-ready") {
    return "Пока<br />не подходит";
  }

  return escapeHtml(content.title);
};

  const mobileQuestionText = (value) => {
    if (!isMobileStandalone) return value;

    return value
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/(^|[\s(«—–-])([авикосуя])\s+/gi, "$1$2&nbsp;");
  };

  const startScreen = () => `
    <div class="screen-content start-content">
      ${logo()}
      <div class="start-copy">
        <h1>Процесс-чек</h1>
        <p>Проверьте, подходит ли ваш процесс<br />для первого внедрения в Яндекс Трекер</p>
      </div>
      <div class="start-actions">
        ${primaryButton("Проверить процесс", "start")}
      </div>
    </div>
  `;

  const nameScreen = () => `
    <div class="screen-content form-content">
      <h1>Какой процесс хотите проверить?</h1>
      <p class="lead">Введите короткое и понятное название.</p>
      <label class="visually-hidden" for="process-name">Название процесса</label>
      <input
        id="process-name"
        class="process-input"
        type="text"
        maxlength="50"
        autocomplete="off"
        value="${escapeHtml(state.processName)}"
      />
      <p class="input-hint">
        Лучше назвать конкретный процесс, а не целое направление.<br />
        Например, «найм дизайнеров», а не «работа HR».
      </p>
      ${primaryButton("Продолжить", "continue-name", {
        disabled: !state.processName.trim(),
      })}
    </div>
  `;

  const questionScreen = () => {
    const question = questions[state.questionIndex];
    const answer = state.answers[state.questionIndex];
    const progress = ((state.questionIndex + 1) / questions.length) * 100;
    const progressStart = state.displayedProgress;

    return `
      <div class="screen-content question-content">
        <div class="progress-block">
          <p>критерий ${state.questionIndex + 1} из ${questions.length}</p>
          <div
            class="progress-track"
            role="progressbar"
            aria-valuemin="1"
            aria-valuemax="${questions.length}"
            aria-valuenow="${state.questionIndex + 1}"
            aria-label="критерий ${state.questionIndex + 1} из ${questions.length}"
          >
            <span
              class="progress-value"
              data-progress-target="${progress}"
              style="width: ${progressStart}%"
            ></span>
          </div>
        </div>

        <div class="question-copy">
          <h1>${mobileQuestionText(question.title)}</h1>
          <p>${mobileQuestionText(question.description)}</p>
        </div>

        <div class="answer-group" role="radiogroup" aria-label="${question.title}">
          <button
            class="answer-card ${answer === true ? "is-yes" : ""}"
            type="button"
            role="radio"
            aria-checked="${answer === true}"
            ${state.isTransitioning ? "disabled" : ""}
            data-action="answer"
            data-answer="yes"
          >
            <span>Да</span>
          </button>
          <button
            class="answer-card ${answer === false ? "is-no" : ""}"
            type="button"
            role="radio"
            aria-checked="${answer === false}"
            ${state.isTransitioning ? "disabled" : ""}
            data-action="answer"
            data-answer="no"
          >
            <span>Нет</span>
          </button>
        </div>

      </div>
    `;
  };

  const resultScreen = () => {
    const content = evaluateAnswers();
    const { kind } = content;

    return `
      <div class="screen-content result-content result-${kind}">
        ${logo()}
        <header class="result-header">
          <span class="result-icon" aria-hidden="true">${content.icon}</span>
        <h1>${resultTitle(content)}</h1>
        </header>

        <div class="result-section result-feedback">
          ${content.feedback
            .map((paragraph) => `<p>${textWithBreaks(paragraph)}</p>`)
            .join("")}
        </div>

        ${primaryButton("Проверить другой процесс", "reset", {
          className: "result-button",
        })}
      </div>
    `;
  };

  const render = () => {
    const decorated = state.screen === "start" || state.screen === "result";
    const screen = {
      start: startScreen,
      name: nameScreen,
      question: questionScreen,
      result: resultScreen,
    }[state.screen]();

    root.innerHTML = `
      <main class="page-shell">
        <section
          class="process-card screen-${state.screen} ${decorated ? "has-decoration" : ""}"
          aria-live="polite"
        >
          ${decorated ? decoration() : ""}
          ${screen}
        </section>
      </main>
    `;

    if (state.screen === "name") {
      requestAnimationFrame(() => document.querySelector("#process-name")?.focus());
    }

    if (state.screen === "question") {
      const progressValue = root.querySelector(".progress-value");
      const progressTarget = Number(progressValue?.dataset.progressTarget ?? 0);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (progressValue) progressValue.style.width = `${progressTarget}%`;
        });
      });

      state.displayedProgress = progressTarget;
    }
  };

  root.addEventListener("input", (event) => {
    if (event.target.id !== "process-name") return;
    state.processName = event.target.value;
    const button = root.querySelector('[data-action="continue-name"]');
    button.disabled = !state.processName.trim();
  });

  root.addEventListener("keydown", (event) => {
    if (
      event.key === "Enter" &&
      event.target.id === "process-name" &&
      state.processName.trim()
    ) {
      state.processName = state.processName.trim();
      state.questionIndex = 0;
      state.displayedProgress = 0;
      state.screen = "question";
      render();
    }
  });

  root.addEventListener("click", (event) => {
    const control = event.target.closest("[data-action]");
    if (!control || control.disabled) return;

    const action = control.dataset.action;

    if (action === "start") {
      state.screen = "name";
    } else if (action === "continue-name") {
      state.processName = state.processName.trim();
      if (!state.processName) return;
      state.questionIndex = 0;
      state.displayedProgress = 0;
      state.screen = "question";
    } else if (action === "answer") {
      if (state.isTransitioning) return;
      state.answers[state.questionIndex] = control.dataset.answer === "yes";
      state.isTransitioning = true;
      render();

      window.setTimeout(() => {
        if (state.questionIndex === questions.length - 1) {
          state.screen = "result";
        } else {
          state.questionIndex += 1;
        }
        state.isTransitioning = false;
        render();
      }, answerPreviewDuration);
      return;
    } else if (action === "reset") {
      state.processName = "";
      state.answers = Array(questions.length).fill(null);
      state.questionIndex = 0;
      state.isTransitioning = false;
      state.displayedProgress = 0;
      state.screen = "name";
    }

    render();
  });

  render();
})();
