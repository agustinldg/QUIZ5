"use strict";

/**
 * Image Quiz with Captions
 * - 10 questions with descriptive captions
 * - Each question has: prompt image, 3 answer images (one correct)
 * - Click images to hear their captions via speech synthesis
 * - Keyboard accessible (1/2/3 to select, Enter to continue when locked) 
 */

const quizData = [
  {
    prompt: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 2,
    captions: {
      prompt: "A beautiful coastal landscape with dramatic cliffs and ocean waves",
      choices: [
        "A serene mountain lake reflecting the sky",
        "A tropical beach with palm trees and turquoise water",
        "A beautiful coastal landscape with dramatic cliffs and ocean waves"
      ]
    }
  },
  {
    prompt: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0,
    captions: {
      prompt: "A majestic mountain peak covered in snow and clouds",
      choices: [
        "A majestic mountain peak covered in snow and clouds",
        "A dense forest with tall trees and green foliage",
        "A peaceful river flowing through a valley"
      ]
    }
  },
  {
    prompt: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 1,
    captions: {
      prompt: "A vibrant city skyline at sunset with modern buildings",
      choices: [
        "A colorful garden with blooming flowers",
        "A vibrant city skyline at sunset with modern buildings",
        "A peaceful countryside with rolling hills"
      ]
    }
  },
  {
    prompt: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517817748490-58b28e49ae80?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 2,
    captions: {
      prompt: "A stunning mountain range with peaks reaching the clouds",
      choices: [
        "A beautiful sunset over the ocean",
        "A cozy cabin in the woods",
        "A stunning mountain range with peaks reaching the clouds"
      ]
    }
  },
  {
    prompt: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0,
    captions: {
      prompt: "A pristine tropical beach with crystal clear water",
      choices: [
        "A pristine tropical beach with crystal clear water",
        "A dramatic coastal landscape with rocky cliffs",
        "A lush rainforest with dense vegetation"
      ]
    }
  },
  {
    prompt: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0,
    captions: {
      prompt: "A peaceful river winding through a green valley",
      choices: [
        "A peaceful river winding through a green valley",
        "A colorful autumn forest with orange leaves",
        "A serene lake surrounded by mountains"
      ]
    }
  },
  {
    prompt: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517817748490-58b28e49ae80?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0,
    captions: {
      prompt: "A colorful autumn forest with golden leaves",
      choices: [
        "A colorful autumn forest with golden leaves",
        "A rustic wooden cabin in the mountains",
        "A modern cityscape with skyscrapers"
      ]
    }
  },
  {
    prompt: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0,
    captions: {
      prompt: "A serene lake reflecting the mountains and sky",
      choices: [
        "A serene lake reflecting the mountains and sky",
        "A peaceful mountain lake with clear water",
        "A beautiful sunset over the ocean"
      ]
    }
  },
  {
    prompt: "https://images.unsplash.com/photo-1517817748490-58b28e49ae80?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1517817748490-58b28e49ae80?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0,
    captions: {
      prompt: "A cozy wooden cabin nestled in the forest",
      choices: [
        "A cozy wooden cabin nestled in the forest",
        "A colorful garden with blooming flowers",
        "A peaceful river flowing through the valley"
      ]
    }
  },
  {
    prompt: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 1,
    captions: {
      prompt: "A beautiful sunset over the ocean horizon",
      choices: [
        "A peaceful countryside with rolling hills",
        "A beautiful sunset over the ocean horizon",
        "A lush rainforest with dense vegetation"
      ]
    }
  },
  {
    prompt: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop",
    choices: [
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop"
    ],
    correctIndex: 0,
    captions: {
      prompt: "A stunning sunset over the ocean with golden clouds",
      choices: [
        "A stunning sunset over the ocean with golden clouds",
        "A serene lake reflecting the mountains",
        "A pristine tropical beach with clear water"
      ]
    }
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

  // Update the prompt image and caption inside the button
  const promptBtn = document.getElementById('prompt-btn');
  const promptCaption = document.getElementById('prompt-caption');
  if (promptBtn && promptCaption) {
    promptImageEl.src = question.prompt;
    promptImageEl.alt = 'Question image';
    promptImageEl.onload = () => { /* noop visual */ };
    promptImageEl.onerror = () => { promptImageEl.alt = "Failed to load question image"; };
    promptCaption.textContent = question.captions.prompt;
    // Click handler for both image and caption (button click)
    promptBtn.onclick = () => {
      speakNow(question.captions.prompt);
    };
  }

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
    
    // Add caption below each answer choice
    const choiceCaption = document.createElement('div');
    choiceCaption.className = 'caption';
    choiceCaption.textContent = question.captions.choices[idx];
    btn.appendChild(choiceCaption);
    
    if (state.selections[state.currentIndex] === idx) {
      btn.classList.add("selected");
    }
    
    // Click handler for answer choices - reads the caption
    btn.addEventListener("click", () => {
      const caption = question.captions.choices[idx];
      speakNow(caption);
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

// Keyboard shortcuts: 1/2/3 to select, Enter to continue, Arrow keys to navigate
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

// Initial render
renderQuestion();
preloadForIndex(0);
preloadForIndex(1);


