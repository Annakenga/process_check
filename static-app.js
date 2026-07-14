(() => {
  "use strict";

  const root = document.querySelector("#app");

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
        "Например, задачи теряются, статус приходится уточнять, информацию — искать, а обратную связь — долго ждать",
    },
    {
      title: "У процесса есть видимый результат?",
      description:
        "Например, кандидат прошёл отбор, договор согласован или заявка выполнена",
    },
    {
      title: "Работа идёт по последовательным этапам?",
      description:
        "Один объект движется от шага к шагу, а не проходит несколько отделов одновременно",
    },
    {
      title: "Можно безопасно провести пилот?",
      description:
        "Ошибку в настройке можно исправить без остановки критичной работы и серьёзных последствий для бизнеса",
    },
  ];

  const readyReasons = [
    "процесс регулярно повторяется;",
    "у команды есть понятная проблема;",
    "работа идёт по последовательным этапам;",
    "результат можно увидеть;",
    "пилот можно провести на небольшой группе без серьёзного риска.",
  ];

  const refineReasons = {
    1: "сократите пилотную группу и возможные риски.",
    3: "определите, как будет выглядеть результат.",
  };

  const notReadyReasons = {
    0: "процесс возникает от случая к случаю;",
    1: "пилотная группа слишком большая;",
    2: "у команды нет общей понятной проблемы;",
    3: "результат сложно увидеть или измерить;",
    4: "этапы и роли пока не определены;",
    5: "ошибка во время пилота может дорого обойтись.",
  };

  const reasonPriority = [5, 4, 0, 2, 1, 3];

  const state = {
    screen: "start",
    processName: "",
    questionIndex: 0,
    answers: Array(questions.length).fill(null),
  };

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
      <span class="shape shape-bottom"></span>
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
    const keyCriteriaPass = [0, 2, 4, 5].every(
      (index) => state.answers[index] === true,
    );

    if (!keyCriteriaPass) return "not-ready";
    if (state.answers.every((answer) => answer === true)) return "ready";
    return "refine";
  };

  const startScreen = () => `
    <div class="screen-content start-content">
      ${logo()}
      <div class="start-copy">
        <h1>Процесс-чек</h1>
        <p>Проверьте, подходит ли ваш процесс<br />для первого внедрения в Трекер</p>
      </div>
      <div class="start-actions">
        ${primaryButton("Проверить процесс", "start")}
        <span class="privacy-note">Ответы не сохраняются</span>
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

    return `
      <div class="screen-content question-content">
        <div class="progress-block">
          <p>Критерий ${state.questionIndex + 1} из ${questions.length}</p>
          <div
            class="progress-track"
            role="progressbar"
            aria-valuemin="1"
            aria-valuemax="${questions.length}"
            aria-valuenow="${state.questionIndex + 1}"
            aria-label="Критерий ${state.questionIndex + 1} из ${questions.length}"
          >
            <span class="progress-value" style="width: ${progress}%"></span>
          </div>
        </div>

        <div class="question-copy">
          <h1>${question.title}</h1>
          <p>${question.description}</p>
        </div>

        <div class="answer-group" role="radiogroup" aria-label="${question.title}">
          <button
            class="answer-card ${answer === true ? "is-yes" : ""}"
            type="button"
            role="radio"
            aria-checked="${answer === true}"
            data-action="answer"
            data-answer="yes"
          >
            <span class="answer-mark" aria-hidden="true"></span>
            <span>Да</span>
          </button>
          <button
            class="answer-card ${answer === false ? "is-no" : ""}"
            type="button"
            role="radio"
            aria-checked="${answer === false}"
            data-action="answer"
            data-answer="no"
          >
            <span class="answer-mark" aria-hidden="true"></span>
            <span>Нет</span>
          </button>
        </div>

        ${primaryButton(
          state.questionIndex === questions.length - 1
            ? "Узнать результат"
            : "Далее",
          "continue-question",
          { disabled: answer === null },
        )}
      </div>
    `;
  };

  const resultScreen = () => {
    const kind = evaluateAnswers();
    const safeName = escapeHtml(state.processName);
    const statementMaxFont = Math.max(
      14,
      21 - Math.max(0, state.processName.length - 24) * 0.28,
    );

    const content = {
      ready: {
        title: "Можно начинать",
        icon: "✓",
        statement: "подходит для первого внедрения в Трекере",
        listTitle: null,
        reasons: [],
        next: `
          Поговорите с участниками процесса и разберите последний реальный случай.<br />
          Затем нарисуйте текущую схему работы — после этого маршрут можно переносить в Трекер.
        `,
      },
      refine: {
        title: "Стоит доработать",
        icon: "✓",
        statement: "стоит доработать перед первым внедрением в Трекер",
        listTitle: "Что стоит уточнить",
        reasons: [1, 3]
          .filter((index) => state.answers[index] === false)
          .map((index) => refineReasons[index]),
        next: `
          Обсудите эти пункты с участниками и обновите схему процесса.<br />
          После этого пройдите проверку ещё раз и переходите к настройке Трекера.
        `,
      },
      "not-ready": {
        title: "Пока не подходит",
        icon: "!",
        statement: "пока не подходит для первого внедрения в Трекер",
        listTitle: "Что мешает",
        reasons: reasonPriority
          .filter((index) => state.answers[index] === false)
          .map((index) => notReadyReasons[index]),
        next: `
          Выберите более регулярный и понятный процесс с небольшой группой участников.<br />
          Или уточните этапы, результат и границы этого процесса, а затем проверьте его снова.
        `,
      },
    }[kind];

    return `
      <div class="screen-content result-content result-${kind}">
        ${logo()}
        <header class="result-header">
          <span class="result-icon" aria-hidden="true">${content.icon}</span>
          <h1>${content.title}</h1>
        </header>

        <div
          class="result-statement"
          style="font-size: clamp(7px, 1.55vw, ${statementMaxFont}px)"
        >
          Процесс <strong>«${safeName}»</strong> ${content.statement}
        </div>

        ${content.listTitle ? `
          <div class="result-section">
            <h2>${content.listTitle}</h2>
            <ul class="reason-list">
              ${content.reasons.map((reason) => `<li>${reason}</li>`).join("")}
            </ul>
          </div>
        ` : ""}

        <div class="result-section next-section">
          <h2>Что делать дальше</h2>
          <p>${content.next}</p>
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
      state.screen = "question";
    } else if (action === "answer") {
      state.answers[state.questionIndex] = control.dataset.answer === "yes";
    } else if (action === "continue-question") {
      if (state.answers[state.questionIndex] === null) return;
      if (state.questionIndex === questions.length - 1) {
        state.screen = "result";
      } else {
        state.questionIndex += 1;
      }
    } else if (action === "reset") {
      state.processName = "";
      state.answers = Array(questions.length).fill(null);
      state.questionIndex = 0;
      state.screen = "name";
    }

    render();
  });

  render();
})();
