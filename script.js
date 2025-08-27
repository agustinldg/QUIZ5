"use strict";

/**
 * Image Quiz
 * - 10 questions
 * - Each question has: prompt image, 3 answer images (one correct)
 * - Keyboard accessible (1/2/3 to select, Enter to continue when locked)
 */

/**
 * Replace these URLs with your own JPGs as desired.
 * Using picsum (randomized) and unsplash (stable-ish) placeholders by default.
 */
const quizData = [
  // Each item: { prompt: 'url.jpg', choices: ['a.jpg','b.jpg','c.jpg'], correctIndex: 0-2 }
  {
    prompt: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 2
  },
  {
    prompt: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0
  },
  {
    prompt: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 1
  },
  {
    prompt: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517817748490-58b28e49ae80?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 2
  },
  {
    prompt: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0
  },
  {
    prompt: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0
  },
  {
    prompt: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517817748490-58b28e49ae80?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0
  },
  {
    prompt: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0
  },
  {
    prompt: "https://images.unsplash.com/photo-1517817748490-58b28e49ae80?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1517817748490-58b28e49ae80?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0
  },
  {
    prompt: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 1
  },
  {
    prompt: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0
  }
];

const state = {
  currentIndex: 0,
  selections: Array.from({ length: quizData.length }, () => null),
  score: 0
};

const promptImageEl = document.getElementById("prompt-image");
const choicesEl = document.querySelector(".choices");
const progressBarEl = document.getElementById("progress-bar");
const progressTextEl = document.getElementById("progress-text");
const resultsEl = document.getElementById("results");
const scoreTextEl = document.getElementById("score-text");
const restartBtn = document.getElementById("restart-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

function updateProgress() {
  const questionNumber = state.currentIndex + 1;
  progressBarEl.style.width = `${(questionNumber - 1) / quizData.length * 100}%`;
  progressBarEl.setAttribute("aria-valuenow", String(questionNumber - 1));
  progressTextEl.textContent = `Question ${questionNumber} / ${quizData.length}`;
  prevBtn.disabled = state.currentIndex === 0;
  nextBtn.textContent = state.currentIndex === quizData.length - 1 ? "Finish" : "Next";
}

function renderQuestion() {
  const question = quizData[state.currentIndex];

  updateProgress();

  promptImageEl.src = question.prompt;
  promptImageEl.onload = () => { /* noop visual */ };
  promptImageEl.onerror = () => { promptImageEl.alt = "Failed to load question image"; };
  promptImageEl.onclick = () => {
    const label = getFileName(question.prompt);
    speakNow(`This is the question number ${state.currentIndex + 1} ${label}`);
  };

  // Clear previous choices
  choicesEl.innerHTML = "";

  question.choices.forEach((src, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.type = "button";
    btn.setAttribute("role", "listitem");
    btn.setAttribute("aria-label", `choice ${idx + 1}`);

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Answer option ${idx + 1}`;
    img.loading = "eager";
    img.onerror = () => { img.alt = "Image failed to load"; };

    btn.appendChild(img);
    if (state.selections[state.currentIndex] === idx) {
      btn.classList.add("selected");
    }
    btn.addEventListener("click", () => {
      const label = getFileName(src);
      speakNow(`This is the answer number ${idx + 1} ${label}`);
      onChoose(idx);
    });
    choicesEl.appendChild(btn);
  });
}  

function onChoose(index) {
  state.selections[state.currentIndex] = index;
  const allButtons = Array.from(document.querySelectorAll(".choice-btn"));
  allButtons.forEach((b, idx) => {
    b.classList.toggle("selected", idx === index);
  });
}

function nextQuestion() {
  if (state.currentIndex >= quizData.length - 1) {
    return showResults();
  }
  state.currentIndex += 1;
  renderQuestion();
}

function prevQuestion() {
  if (state.currentIndex <= 0) return;
  state.currentIndex -= 1;
  renderQuestion();
}

function showResults() {
  // Calculate score from selections
  let score = 0;
  state.selections.forEach((sel, i) => {
    if (sel === quizData[i].correctIndex) score += 1;
  });
  state.score = score;

  document.getElementById("quiz").hidden = true;
  resultsEl.hidden = false;
  progressBarEl.style.width = "100%";
  progressBarEl.setAttribute("aria-valuenow", String(quizData.length));
  progressTextEl.textContent = `Completed`;
  scoreTextEl.textContent = `You scored ${state.score} / ${quizData.length}`;
}

function restart() {
  state.currentIndex = 0;
  state.selections = Array.from({ length: quizData.length }, () => null);
  state.score = 0;
  resultsEl.hidden = true;
  document.getElementById("quiz").hidden = false;
  renderQuestion();
}

restartBtn.addEventListener("click", restart);
prevBtn.addEventListener("click", prevQuestion);
nextBtn.addEventListener("click", nextQuestion);

// Keyboard shortcuts: 1/2/3 to select
document.addEventListener("keydown", (e) => {
  if (resultsEl.hidden === false) return; // ignore on results
  const mapping = { "1": 0, "2": 1, "3": 2 };
  if (mapping[e.key] != null) {
    const btn = document.querySelectorAll(".choice-btn")[mapping[e.key]];
    if (btn) btn.click();
  }
  if (e.key === "Enter") {
    nextBtn.click();
  }
  if (e.key === "ArrowLeft") prevBtn.click();
  if (e.key === "ArrowRight") nextBtn.click();
});

// Preload next images for snappier UX
function preload(urls) {
  urls.forEach((u) => {
    const img = new Image();
    img.src = u;
  });
}

function preloadForIndex(i) {
  if (i < 0 || i >= quizData.length) return;
  const q = quizData[i];
  preload([q.prompt, ...q.choices]);
}

// Initial render
renderQuestion();
preloadForIndex(0);
preloadForIndex(1);

// Speech utilities
function speakNow(text) {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    window.speechSynthesis.speak(utter);
  } catch (e) {
    // ignore
  }
}

function getFileName(url) {
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const last = pathname.substring(pathname.lastIndexOf('/') + 1) || pathname.replaceAll('/', '-');
    return last || 'image';
  } catch (e) {
    return url.split('/').pop() || 'image';
  }
}


