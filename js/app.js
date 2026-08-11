(function () {
  const LOGIN_KEY = "savemind_user";
  const ANSWERS_KEY = "savemind_answers";
  const RESULT_KEY = "savemind_result";
  const TRANSITION_MS = 320;
  const RESULT_DELAY_MS = 5000;

  function setupIllustrations() {
    document.querySelectorAll(".illustration, .question-visual, .option-icon").forEach((wrapper) => {
      const img = wrapper.querySelector("img");
      if (!img) return;

      const markLoaded = () => wrapper.classList.add("has-image");
      const markMissing = () => wrapper.classList.remove("has-image");

      if (img.complete && img.naturalWidth > 0) {
        markLoaded();
      } else {
        markMissing();
      }

      img.addEventListener("load", markLoaded);
      img.addEventListener("error", markMissing);
    });
  }

  function bindImagePlaceholder(wrapper) {
    const img = wrapper?.querySelector("img");
    if (!wrapper || !img) return;

    const markLoaded = () => wrapper.classList.add("has-image");
    const markMissing = () => wrapper.classList.remove("has-image");

    img.addEventListener("load", markLoaded);
    img.addEventListener("error", markMissing);

    if (img.getAttribute("src") && img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else if (img.getAttribute("src") && img.complete) {
      markMissing();
    }
  }

  function setupLoginPage() {
    const form = document.getElementById("login-form");
    if (!form) return;

    const emailInput = document.getElementById("email");
    const rememberInput = document.getElementById("remember");
    const errorEl = document.getElementById("login-error");
    const forgotLink = document.getElementById("forgot-password");

    try {
      const saved = JSON.parse(localStorage.getItem(LOGIN_KEY) || "null");
      if (saved?.email) {
        emailInput.value = saved.email;
        rememberInput.checked = true;
      }
    } catch {
      /* ignore corrupt storage */
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = emailInput.value.trim();

      errorEl.hidden = true;

      if (rememberInput.checked && email) {
        localStorage.setItem(LOGIN_KEY, JSON.stringify({ email }));
      } else {
        localStorage.removeItem(LOGIN_KEY);
      }

      sessionStorage.setItem("savemind_logged_in", "1");
      window.location.href = "bienvenida.html";
    });

    if (forgotLink) {
      forgotLink.addEventListener("click", (event) => {
        event.preventDefault();
        alert("Pronto podrás recuperar tu contraseña desde aquí.");
      });
    }
  }

  function setupWelcomePage() {
    const startBtn = document.getElementById("start-test");
    if (!startBtn) return;

    if (sessionStorage.getItem("savemind_logged_in") !== "1") {
      window.location.href = "index.html";
      return;
    }

    startBtn.addEventListener("click", () => {
      sessionStorage.removeItem(ANSWERS_KEY);
      sessionStorage.removeItem(RESULT_KEY);
      window.location.href = "test.html";
    });
  }

  function setupTestPage() {
    const card = document.getElementById("question-card");
    if (!card) return;

    if (sessionStorage.getItem("savemind_logged_in") !== "1") {
      window.location.href = "index.html";
      return;
    }

    const questions = window.SAVEMIND_QUESTIONS || [];
    if (!questions.length) return;

    const headerEl = document.querySelector(".test-header");
    const progressEl = document.getElementById("test-progress");
    const titleEl = document.getElementById("question-title");
    const bodyEl = document.getElementById("question-body");
    const visualEl = document.getElementById("question-visual");
    const visualImg = visualEl.querySelector(".question-visual__img");
    const visualLabel = document.getElementById("question-visual-label");
    const footerEl = document.getElementById("test-footer");
    const nextBtn = document.getElementById("question-next");
    const backBtn = document.getElementById("test-back");

    const TOTAL_STEPS = 10;
    const MID_PROGRESS = 5;
    const total = questions.length;
    let index = 0;
    let answers = [];
    let pendingStars = 0;
    let isAnimating = false;
    let passedMidProgress = false;
    let resultTimer = null;
    let lastResultStored = null;
    let view = "question"; /* question | progress | done | result | tips */

    function saveAnswers() {
      const totalWeight = answers.reduce((sum, item) => sum + item.weight, 0);
      const payload = { answers, totalWeight, completedAt: Date.now() };
      sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(payload));
      return payload;
    }

    function setVisual(src, visible = true) {
      visualEl.hidden = !visible;
      if (!visible) return;

      visualEl.classList.remove("has-image");
      visualLabel.textContent = src;
      visualImg.alt = "";
      visualImg.src = src;
      bindImagePlaceholder(visualEl);
    }

    function playEnter() {
      card.classList.remove("is-leaving", "is-entering");
      void card.offsetWidth;
      card.classList.add("is-entering");
    }

    function transitionTo(callback) {
      if (isAnimating) return;
      isAnimating = true;
      card.classList.remove("is-entering");
      card.classList.add("is-leaving");

      window.setTimeout(() => {
        callback();
        isAnimating = false;
      }, TRANSITION_MS);
    }

    function resetChrome() {
      card.classList.remove(
        "question-card--progress",
        "question-card--done",
        "question-card--result",
        "question-card--tips"
      );
      visualEl.classList.remove("question-visual--progress", "question-visual--done");
      headerEl?.classList.remove("test-header--tips");
      progressEl.classList.remove("test-progress--title");
      if (headerEl) headerEl.hidden = false;
      progressEl.hidden = false;
      titleEl.hidden = false;
      footerEl.hidden = true;
      nextBtn.disabled = true;
      nextBtn.textContent = "Siguiente";
      backBtn.hidden = false;
    }

    function renderOptions(question) {
      const list = document.createElement("div");
      list.className = "option-list";

      question.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `option-btn option-btn--${option.tone || "blue"}`;
        button.dataset.optionId = option.id;
        button.dataset.weight = String(option.weight);

        button.innerHTML = `
          <span class="option-icon" aria-hidden="true">
            <img src="${option.icon}" alt="" width="28" height="28">
            <span class="option-icon__fallback"></span>
          </span>
          <span class="option-btn__label">${option.label}</span>
        `;

        button.addEventListener("click", () => {
          if (isAnimating) return;
          button.classList.add("is-selected");
          selectAnswer({
            questionId: question.id,
            optionId: option.id,
            label: option.label,
            weight: option.weight
          });
        });

        list.appendChild(button);
        bindImagePlaceholder(button.querySelector(".option-icon"));
      });

      bodyEl.appendChild(list);
    }

    function renderStars(question) {
      const wrap = document.createElement("div");
      wrap.className = "stars-picker";

      const row = document.createElement("div");
      row.className = "stars-row";
      row.setAttribute("role", "radiogroup");
      row.setAttribute("aria-label", "Calificación de 1 a 5 estrellas");

      for (let star = 1; star <= question.maxStars; star += 1) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "star-btn";
        btn.dataset.value = String(star);
        btn.setAttribute("role", "radio");
        btn.setAttribute("aria-checked", "false");
        btn.setAttribute("aria-label", `${star} estrella${star > 1 ? "s" : ""}`);
        btn.innerHTML = `
          <span class="star-btn__icon" aria-hidden="true">
            <img src="img/icons/star.png" alt="" width="36" height="36">
            <span class="star-btn__fallback">★</span>
          </span>
        `;

        btn.addEventListener("click", () => {
          pendingStars = star;
          row.querySelectorAll(".star-btn").forEach((el) => {
            const value = Number(el.dataset.value);
            const active = value <= star;
            el.classList.toggle("is-active", active);
            el.setAttribute("aria-checked", value === star ? "true" : "false");
          });
          nextBtn.disabled = false;
        });

        row.appendChild(btn);
        bindImagePlaceholder(btn.querySelector(".star-btn__icon"));
      }

      const hint = document.createElement("p");
      hint.className = "stars-hint";
      hint.textContent = question.hint || "Selecciona de 1 a 5 estrellas";

      wrap.append(row, hint);
      bodyEl.appendChild(wrap);
    }

    function renderQuestion(direction = "in") {
      view = "question";
      resetChrome();
      const question = questions[index];
      progressEl.textContent = `${index + 1}/${TOTAL_STEPS}`;
      titleEl.textContent = question.text;
      bodyEl.innerHTML = "";
      pendingStars = 0;

      setVisual(question.image, true);

      if (question.type === "stars") {
        footerEl.hidden = false;
        renderStars(question);
      } else {
        footerEl.hidden = true;
        renderOptions(question);
      }

      if (direction === "in") playEnter();
    }

    function renderProgressScreen() {
      view = "progress";
      resetChrome();
      const current = MID_PROGRESS;
      const pct = Math.round((current / TOTAL_STEPS) * 100);
      const radius = 54;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference * (1 - current / TOTAL_STEPS);

      card.classList.add("question-card--progress");
      progressEl.hidden = true;
      titleEl.textContent = "Tu test está en progreso";
      footerEl.hidden = false;
      nextBtn.disabled = false;
      nextBtn.textContent = "Continuar";
      pendingStars = 0;

      setVisual("img/progress-bot.png", true);
      visualEl.classList.add("question-visual--progress");

      bodyEl.innerHTML = `
        <div class="progress-meter" role="img" aria-label="Progreso ${current} de ${TOTAL_STEPS}, ${pct}%">
          <svg class="progress-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle class="progress-ring__track" cx="60" cy="60" r="${radius}"></circle>
            <circle
              class="progress-ring__value"
              cx="60"
              cy="60"
              r="${radius}"
              stroke-dasharray="${circumference.toFixed(2)}"
              style="--progress-offset-from:${circumference.toFixed(2)}; --progress-offset-to:${offset.toFixed(2)}"
            ></circle>
          </svg>
          <div class="progress-meter__label">
            <span class="progress-meter__count">${current}/${TOTAL_STEPS}</span>
          </div>
        </div>
        <p class="progress-cheer">Vamos muy bien, sigue así 💙</p>
        <aside class="progress-tip">
          <div class="progress-tip__copy">
            <p class="progress-tip__title">Tip SaveMind</p>
            <p class="progress-tip__text">
              Respira profundo y recuerda que está bien pedir ayuda cuando la necesitas.
            </p>
          </div>
          <div class="progress-tip__art" aria-hidden="true">
            <img src="img/icons/tip-leaf.png" alt="" width="48" height="48">
            <span class="progress-tip__fallback">🌿</span>
          </div>
        </aside>
      `;

      bindImagePlaceholder(bodyEl.querySelector(".progress-tip__art"));
      playEnter();

      const ringValue = bodyEl.querySelector(".progress-ring__value");
      if (ringValue) {
        void ringValue.offsetWidth;
        ringValue.classList.add("is-animated");
      }
    }

    function renderDoneScreen(stored) {
      view = "done";
      resetChrome();
      card.classList.add("question-card--done");
      if (headerEl) headerEl.hidden = true;
      progressEl.hidden = true;
      titleEl.hidden = true;
      footerEl.hidden = true;
      backBtn.hidden = true;

      setVisual("img/done-bot.png", true);
      visualEl.classList.add("question-visual--done");

      bodyEl.innerHTML = `
        <div class="done-check" aria-hidden="true">
          <img src="img/icons/check-circle.png" alt="" width="64" height="64">
          <span class="done-check__fallback">✓</span>
        </div>
        <h1 class="test-done__title">¡Test completado!</h1>
        <p class="test-done__text">
          Estamos analizando tus respuestas para brindarte recomendaciones personalizadas.
        </p>
        <div class="done-dots" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
      `;

      bindImagePlaceholder(bodyEl.querySelector(".done-check"));
      playEnter();

      if (resultTimer) window.clearTimeout(resultTimer);
      resultTimer = window.setTimeout(() => {
        transitionTo(() => renderResultScreen(stored));
      }, RESULT_DELAY_MS);
    }

    function renderResultScreen(stored) {
      view = "result";
      lastResultStored = stored;
      resetChrome();
      const result =
        (window.SAVEMIND_resolveResult && window.SAVEMIND_resolveResult(stored.totalWeight)) ||
        window.SAVEMIND_RESULTS.regular;

      sessionStorage.setItem(
        RESULT_KEY,
        JSON.stringify({
          id: result.id,
          totalWeight: stored.totalWeight,
          answers: stored.answers
        })
      );

      card.classList.add("question-card--result", `question-card--result-${result.tone}`);
      if (headerEl) headerEl.hidden = true;
      progressEl.hidden = true;
      backBtn.hidden = true;
      titleEl.hidden = false;
      titleEl.textContent = result.title;
      footerEl.hidden = false;
      nextBtn.disabled = false;
      nextBtn.textContent = result.cta;

      setVisual(result.image, true);

      const recs = result.recommendations
        .map(
          (item) => `
          <li class="result-rec">
            <span class="result-rec__icon" aria-hidden="true">
              <img src="${item.icon}" alt="" width="28" height="28">
              <span class="result-rec__fallback"></span>
            </span>
            <span class="result-rec__text">${item.text}</span>
          </li>
        `
        )
        .join("");

      bodyEl.innerHTML = `
        <p class="result-headline result-headline--${result.tone}">${result.headline}</p>
        <div class="result-block">
          <p class="result-block__label">Recomendaciones para ti</p>
          <ul class="result-list">${recs}</ul>
        </div>
      `;

      bodyEl.querySelectorAll(".result-rec__icon").forEach(bindImagePlaceholder);
      playEnter();
    }

    function renderTipsScreen() {
      view = "tips";
      resetChrome();
      const tips = window.SAVEMIND_TIPS || [];

      card.classList.add("question-card--tips");
      headerEl?.classList.add("test-header--tips");
      progressEl.classList.add("test-progress--title");
      progressEl.hidden = false;
      progressEl.textContent = "Consejos para ti";
      titleEl.hidden = true;
      footerEl.hidden = true;
      backBtn.hidden = false;
      setVisual("", false);

      const items = tips
        .map(
          (tip) => `
          <button type="button" class="tip-item tip-item--${tip.tone}" data-tip-id="${tip.id}">
            <span class="tip-item__icon" aria-hidden="true">
              <img src="${tip.icon}" alt="" width="32" height="32">
              <span class="tip-item__fallback"></span>
            </span>
            <span class="tip-item__copy">
              <span class="tip-item__title">${tip.title}</span>
              <span class="tip-item__subtitle">${tip.subtitle}</span>
            </span>
            <span class="tip-item__chevron" aria-hidden="true">›</span>
          </button>
        `
        )
        .join("");

      bodyEl.innerHTML = `
        <div class="tips-list">${items}</div>
        <aside class="tips-bot">
          <div class="tips-bot__avatar" aria-hidden="true">
            <img src="img/tips-bot.png" alt="" class="illustration__img" width="56" height="56">
            <span class="tips-bot__placeholder">img/tips-bot.png</span>
          </div>
          <p class="tips-bot__text">
            <strong>SaveBot:</strong> Recuerda: cuidar tu mente es cuidar tu vida. 💙
          </p>
        </aside>
      `;

      bodyEl.querySelectorAll(".tip-item__icon").forEach(bindImagePlaceholder);
      bindImagePlaceholder(bodyEl.querySelector(".tips-bot__avatar"));

      bodyEl.querySelectorAll(".tip-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tip = tips.find((item) => item.id === btn.dataset.tipId);
          alert(tip ? `${tip.title}\n\nPronto abrirá este consejo.` : "Consejo");
        });
      });

      playEnter();
    }

    function goTo(nextIndex, answerPayload) {
      if (answerPayload) {
        answers = answers.slice(0, index);
        answers[index] = answerPayload;
        saveAnswers();
      }

      transitionTo(() => {
        index = nextIndex;

        if (!passedMidProgress && index === MID_PROGRESS) {
          renderProgressScreen();
          return;
        }

        if (index >= total) {
          const stored = saveAnswers();
          sessionStorage.setItem("savemind_test_done", "1");
          renderDoneScreen(stored);
          return;
        }

        renderQuestion("in");
      });
    }

    function selectAnswer(payload) {
      goTo(index + 1, payload);
    }

    nextBtn.addEventListener("click", () => {
      if (isAnimating) return;

      if (view === "progress") {
        passedMidProgress = true;
        transitionTo(() => renderQuestion("in"));
        return;
      }

      if (view === "result") {
        transitionTo(() => renderTipsScreen());
        return;
      }

      if (!pendingStars) return;
      const question = questions[index];
      const weight = question.weightFromStars
        ? question.weightFromStars(pendingStars)
        : pendingStars;

      selectAnswer({
        questionId: question.id,
        optionId: `stars-${pendingStars}`,
        label: `${pendingStars} estrella${pendingStars > 1 ? "s" : ""}`,
        weight,
        stars: pendingStars
      });
    });

    backBtn.addEventListener("click", () => {
      if (isAnimating || view === "done" || view === "result") return;

      if (view === "tips") {
        transitionTo(() => {
          if (lastResultStored) renderResultScreen(lastResultStored);
        });
        return;
      }

      if (view === "progress") {
        transitionTo(() => {
          index = MID_PROGRESS - 1;
          renderQuestion("in");
        });
        return;
      }

      if (index === 0) {
        window.location.href = "bienvenida.html";
        return;
      }

      /* Desde la pregunta 6, volver a la 5 (sin reabrir el progreso) */
      transitionTo(() => {
        index -= 1;
        if (index < MID_PROGRESS) passedMidProgress = false;
        answers = answers.slice(0, index);
        saveAnswers();
        renderQuestion("in");
      });
    });

    renderQuestion("in");
  }

  setupIllustrations();
  setupLoginPage();
  setupWelcomePage();
  setupTestPage();
})();
