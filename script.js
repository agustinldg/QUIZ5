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
const GOOGLE_SERVICE_URL = 'https://script.google.com/macros/s/AKfycbyOePxK7OIlNpaJqz4u7WV7t0wHR42VDpi6bl96yRaHtrHLxPX5By4QI1Vw8ozeZ0yq/exec';

// Load quiz data from Google service or local file
async function loadQuizData() {
  try {
    let data;
    
    // Try to load from Google service first
    if (GOOGLE_SERVICE_URL) {
      console.log('Loading quiz data from Google service...');
      
      // Use JSONP approach directly since it works
      const response = await fetchGoogleService(GOOGLE_SERVICE_URL);
      console.log('Google service response:', response);
      
      if (response && response.success) {
        if (response.quizData) {
          // New format: quiz data directly in response
          data = response.quizData;
          console.log(`✅ Loaded quiz data from Google service: ${response.questionsCount} questions`);
        } else if (response.fileUrl) {
          // Old format: need to download file from Google Drive
          console.log('Service returned file URL, downloading...');
          const directUrl = convertGoogleDriveUrl(response.fileUrl);
          console.log(`Downloading from: ${directUrl}`);
          
          const jsonResponse = await fetch(directUrl);
          if (!jsonResponse.ok) {
            throw new Error(`Failed to download JSON file: ${jsonResponse.status}`);
          }
          data = await jsonResponse.json();
          console.log(`✅ Loaded quiz data from Google Drive: ${response.questionsCount} questions`);
        } else {
          const errorMsg = 'Service returned success but no quiz data or file URL';
          console.error('Google service error details:', response);
          throw new Error(`Google service failed: ${errorMsg}`);
        }
      } else {
        const errorMsg = response ? (response.error || 'Unknown error') : 'No response from service';
        console.error('Google service error details:', response);
        throw new Error(`Google service failed: ${errorMsg}`);
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

// Fetch Google service using JSONP to avoid CORS
function fetchGoogleService(url) {
  return new Promise((resolve, reject) => {
    // Create a unique callback name
    const callbackName = 'googleServiceCallback_' + Math.random().toString(36).substr(2, 9);
    
    // Create script element
    const script = document.createElement('script');
    script.src = url + '?callback=' + callbackName;
    
    // Set up global callback
    window[callbackName] = function(data) {
      // Clean up
      document.head.removeChild(script);
      delete window[callbackName];
      resolve(data);
    };
    
    // Handle errors
    script.onerror = (error) => {
      document.head.removeChild(script);
      delete window[callbackName];
      console.error('JSONP script error:', error);
      reject(new Error('Failed to load Google service - script error'));
    };
    
    // Add script to page
    document.head.appendChild(script);
    
    // Timeout after 30 seconds (increased for image processing)
    setTimeout(() => {
      if (window[callbackName]) {
        document.head.removeChild(script);
        delete window[callbackName];
        console.error('JSONP timeout - script URL:', script.src);
        reject(new Error('Google service timeout after 30 seconds'));
      }
    }, 30000);
  });
}




// Convert Google Drive URL to direct download URL
function convertGoogleDriveUrl(url) {
  // Extract file ID from Google Drive URL
  const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    const fileId = match[1];
    // Return direct download URL
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return url; // Return original URL if no match
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

// Test function to debug Google service
async function testGoogleService() {
  console.log('🧪 Testing Google service...');
  console.log('Service URL:', GOOGLE_SERVICE_URL);
  
  try {
    // Test JSONP (the working method)
    console.log('Testing JSONP...');
    const data = await fetchGoogleService(GOOGLE_SERVICE_URL);
    console.log('JSONP data:', data);
    return data;
  } catch (error) {
    console.log('JSONP failed:', error.message);
    throw error;
  }
}

// Simple test to check if service URL is accessible
function testServiceUrl() {
  console.log('🔗 Testing service URL accessibility...');
  console.log('URL:', GOOGLE_SERVICE_URL);
  
  // Create a simple script tag to test
  const testScript = document.createElement('script');
  testScript.src = GOOGLE_SERVICE_URL + '?callback=testCallback';
  
  // Set up a test callback
  window.testCallback = function(data) {
    console.log('✅ Service URL is accessible!');
    console.log('Test response:', data);
    document.head.removeChild(testScript);
    delete window.testCallback;
  };
  
  // Handle errors
  testScript.onerror = function(error) {
    console.error('❌ Service URL is not accessible:', error);
    document.head.removeChild(testScript);
    delete window.testCallback;
  };
  
  // Add to page
  document.head.appendChild(testScript);
  
  // Cleanup after 10 seconds
  setTimeout(() => {
    if (window.testCallback) {
      console.log('⚠️ Test callback not called within 10 seconds');
      document.head.removeChild(testScript);
      delete window.testCallback;
    }
  }, 10000);
}

// Start the app by loading quiz data
loadQuizData();


