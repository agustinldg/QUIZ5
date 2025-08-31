"use strict";

/**
 * Image Quiz with Captions
 * - 10 questions with descriptive captions
 * - Each question has: prompt image, 3 answer images (one correct)
 * - Click images to hear their captions via speech synthesis
 * - Keyboard accessible (1/2/3 to select, Enter to continue when locked) 
 */

// Quiz data will be loaded from JSON file
let quizData = [];

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
    promptImageEl.src = question.prompt.imageBase64;
    promptImageEl.alt = 'Question image';
    promptImageEl.onload = () => { /* noop visual */ };
    promptImageEl.onerror = () => { promptImageEl.alt = "Failed to load question image"; };
    promptCaption.textContent = question.prompt.caption;
    // Click handler for both image and caption (button click)
    promptBtn.onclick = () => {
      speakNow(question.prompt.caption);
    };
  }

  // Clear previous choices
  choicesEl.innerHTML = "";

  question.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.type = "button";
    btn.setAttribute("role", "listitem");
    btn.setAttribute("aria-label", `choice ${idx + 1}`);

    const img = document.createElement("img");
    img.src = choice.imageBase64;
    img.alt = `Answer option ${idx + 1}`;
    img.loading = "eager";
    img.onerror = () => { img.alt = "Image failed to load"; };

    btn.appendChild(img);
    
    // Add caption below each answer choice
    const choiceCaption = document.createElement('div');
    choiceCaption.className = 'caption';
    choiceCaption.textContent = choice.caption;
    btn.appendChild(choiceCaption);
    
    if (state.selections[state.currentIndex] === idx) {
      btn.classList.add("selected");
    }
    
    // Click handler for answer choices - reads the caption
    btn.addEventListener("click", () => {
      const caption = choice.caption;
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
    // Find the correct answer by matching the correctAnswerId
    const question = quizData[i];
    const correctChoiceIndex = question.choices.findIndex(choice => choice.id === question.correctAnswerId);
    if (sel === correctChoiceIndex) score += 1;
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
  // For base64 images, we don't need to preload since they're already in memory
  // But we can still call the function for consistency
  preload([q.prompt.imageBase64, ...q.choices.map(choice => choice.imageBase64)]);
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

// Configuration for Google service
const GOOGLE_SERVICE_URL = 'https://script.google.com/macros/s/AKfycbzhrxydtYzyqft3UqeQk08SQkCkl7rbS936vIe9WNANVkJc6oC5J7secgDF6WKbvW4/exec'; // Add your deployed service URL here

// Load quiz data from Google service or local file
async function loadQuizData() {
  try {
    let data;
    
    // Try to load from Google service first
    if (GOOGLE_SERVICE_URL) {
      console.log('Loading quiz data from Google service...');
      const response = await fetch(GOOGLE_SERVICE_URL);
      if (!response.ok) {
        throw new Error(`Google service error! status: ${response.status}`);
      }
      const serviceResult = await response.json();
      
      if (serviceResult.success && serviceResult.fileUrl) {
        // Download the generated JSON file
        const jsonResponse = await fetch(serviceResult.fileUrl);
        if (!jsonResponse.ok) {
          throw new Error(`Failed to download JSON file: ${jsonResponse.status}`);
        }
        data = await jsonResponse.json();
        console.log(`✅ Loaded quiz data from Google service: ${serviceResult.questionsCount} questions`);
      } else {
        throw new Error(`Google service failed: ${serviceResult.error || 'Unknown error'}`);
      }
    } else {
      // Fallback to local file
      console.log('Loading quiz data from local file...');
      const response = await fetch('quiz-data-base64.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = await response.json();
      console.log('✅ Loaded quiz data from local file');
    }
    
    quizData = data.questions;
    
    // Initialize the quiz after data is loaded
    renderQuestion();
    preloadForIndex(0);
    preloadForIndex(1);
    
  } catch (error) {
    console.error('Error loading quiz data:', error);
    // Show error message with retry options
    document.getElementById('quiz').innerHTML = `
      <div style="text-align: center; padding: 50px; color: white;">
        <h2>Error Loading Quiz</h2>
        <p>Could not load quiz data from Google service.</p>
        <p style="color: #ffcc00; font-size: 14px;">${error.message}</p>
        <div style="margin-top: 20px;">
          <button onclick="loadQuizData()" style="padding: 10px 20px; margin: 10px; border-radius: 8px; background: var(--accent); color: white; border: none; cursor: pointer;">Retry Google Service</button>
          <button onclick="loadLocalData()" style="padding: 10px 20px; margin: 10px; border-radius: 8px; background: #666; color: white; border: none; cursor: pointer;">Use Local File</button>
        </div>
      </div>
    `;
  }
}

// Fallback function to load local data
async function loadLocalData() {
  try {
    const response = await fetch('quiz-data-base64.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    quizData = data.questions;
    
    // Initialize the quiz after data is loaded
    renderQuestion();
    preloadForIndex(0);
    preloadForIndex(1);
    
    console.log('✅ Loaded quiz data from local file');
  } catch (error) {
    console.error('Error loading local data:', error);
    document.getElementById('quiz').innerHTML = `
      <div style="text-align: center; padding: 50px; color: white;">
        <h2>Error Loading Quiz</h2>
        <p>Could not load quiz data from local file either.</p>
        <p style="color: #ffcc00; font-size: 14px;">${error.message}</p>
        <button onclick="location.reload()" style="padding: 10px 20px; margin: 10px; border-radius: 8px; background: var(--accent); color: white; border: none; cursor: pointer;">Reload Page</button>
      </div>
    `;
  }
}

// Start the app by loading quiz data
loadQuizData();


