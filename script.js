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
  progressTextEl.textContent = `Pregunta ${questionNumber} / ${quizData.length}`;
  prevBtn.disabled = state.currentIndex === 0;
  nextBtn.textContent = state.currentIndex === quizData.length - 1 ? "Finalizar" : "Siguiente";
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function renderQuestion() {
  const question = quizData[state.currentIndex];

  updateProgress();

  // Update the prompt image and caption inside the button
  const promptBtn = document.getElementById('prompt-btn');
  const promptCaption = document.getElementById('prompt-caption');
  if (promptBtn && promptCaption) {
    promptImageEl.src = question.prompt.imageBase64;
    promptImageEl.alt = 'Imagen de la pregunta';
    promptImageEl.onload = () => { /* noop visual */ };
    promptImageEl.onerror = () => { promptImageEl.alt = "Error al cargar la imagen de la pregunta"; };
    promptCaption.textContent = question.prompt.caption;
    // Click handler for both image and caption (button click)
    promptBtn.onclick = () => {
      speakNow(question.prompt.caption);
    };
  }

  // Clear previous choices
  choicesEl.innerHTML = "";

  // Shuffle the choices for this question
  const shuffledChoices = shuffleArray(question.choices);
  
  // Find the correct answer ID in the shuffled array
  const correctChoiceIndex = shuffledChoices.findIndex(choice => choice.id === question.correctAnswerId);
  
  // Store the shuffled choices and correct index for this question
  if (!question.shuffledData) {
    question.shuffledData = {
      choices: shuffledChoices,
      correctIndex: correctChoiceIndex
    };
  }

  question.shuffledData.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.type = "button";
    btn.setAttribute("role", "listitem");
    btn.setAttribute("aria-label", `choice ${idx + 1}`);

    const img = document.createElement("img");
    img.src = choice.imageBase64;
    img.alt = `Opción de respuesta ${idx + 1}`;
    img.loading = "eager";
    img.onerror = () => { img.alt = "Error al cargar la imagen"; };

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
    const question = quizData[i];
    // Use the shuffled correct index if available, otherwise fall back to original
    const correctChoiceIndex = question.shuffledData ? question.shuffledData.correctIndex : 
      question.choices.findIndex(choice => choice.id === question.correctAnswerId);
    if (sel === correctChoiceIndex) score += 1;
  });
  state.score = score;

  document.getElementById("quiz").hidden = true;
  resultsEl.hidden = false;
  progressBarEl.style.width = "100%";
  progressBarEl.setAttribute("aria-valuenow", String(quizData.length));
  progressTextEl.textContent = `Completado`;
  scoreTextEl.textContent = `Obtuviste ${state.score} / ${quizData.length}`;
}

function restart() {
  state.currentIndex = 0;
  state.selections = Array.from({ length: quizData.length }, () => null);
  state.score = 0;
  // Clear shuffled data to get new random order
  quizData.forEach(question => {
    if (question.shuffledData) {
      delete question.shuffledData;
    }
  });
  resultsEl.hidden = true;
  document.getElementById("quiz").hidden = false;
  renderQuestion();
}

restartBtn.addEventListener("click", restart);
prevBtn.addEventListener("click", prevQuestion);
nextBtn.addEventListener("click", nextQuestion);

// Add event listener for download results button
const downloadResultsBtn = document.getElementById("download-results-btn");
if (downloadResultsBtn) {
  downloadResultsBtn.addEventListener("click", downloadResults);
}

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

// Voice selection configuration
let selectedVoice = null;
let selectedLanguage = 'es-ES';

// Speech utilities
function speakNow(text) {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    
    // Use selected voice or find best available
    if (selectedVoice) {
      utter.voice = selectedVoice;
      utter.lang = selectedVoice.lang;
      console.log(`Using selected voice: ${selectedVoice.name}`);
    } else {
      // Default to Spanish
      utter.lang = selectedLanguage;
      const voices = window.speechSynthesis.getVoices();
      const defaultVoice = voices.find(voice => 
        voice.lang.startsWith('es') || 
        voice.name.toLowerCase().includes('spanish') ||
        voice.name.toLowerCase().includes('español')
      );
      
      if (defaultVoice) {
        utter.voice = defaultVoice;
        console.log(`Using default Spanish voice: ${defaultVoice.name}`);
      } else {
        console.log('No Spanish voice found, using system default');
      }
    }
    
    // Voice settings
    utter.rate = 0.9;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    
    window.speechSynthesis.speak(utter);
  } catch (e) {
    console.error('Speech synthesis error:', e);
  }
}

// Function to show available voices
function showAvailableVoices() {
  const voices = window.speechSynthesis.getVoices();
  console.log('🎤 Available voices:');
  
  // Group voices by language
  const voiceGroups = {};
  voices.forEach(voice => {
    const lang = voice.lang.split('-')[0];
    if (!voiceGroups[lang]) voiceGroups[lang] = [];
    voiceGroups[lang].push(voice);
  });
  
  // Display grouped voices
  Object.keys(voiceGroups).forEach(lang => {
    console.log(`\n${lang.toUpperCase()} voices:`);
    voiceGroups[lang].forEach(voice => {
      console.log(`  - ${voice.name} (${voice.lang})`);
    });
  });
  
  return voices;
}

// Function to select a specific voice
function selectVoice(voiceName) {
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.name === voiceName);
  
  if (voice) {
    selectedVoice = voice;
    selectedLanguage = voice.lang;
    console.log(`✅ Selected voice: ${voice.name} (${voice.lang})`);
    return true;
  } else {
    console.log(`❌ Voice "${voiceName}" not found`);
    return false;
  }
}

// Function to select voice by language
function selectVoiceByLanguage(languageCode) {
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.startsWith(languageCode));
  
  if (voice) {
    selectedVoice = voice;
    selectedLanguage = voice.lang;
    console.log(`✅ Selected ${languageCode} voice: ${voice.name}`);
    return true;
  } else {
    console.log(`❌ No voice found for language: ${languageCode}`);
    return false;
  }
}

// Function to reset to default Spanish voice
function resetToDefaultVoice() {
  selectedVoice = null;
  selectedLanguage = 'es-ES';
  console.log('🔄 Reset to default Spanish voice');
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
      console.log('Cargando datos del quiz desde el servicio de Google...');
      
      // Show countdown timer
      const countdownEl = showCountdownTimer();
      
      try {
        // Use JSONP approach directly since it works
        const response = await fetchGoogleService(GOOGLE_SERVICE_URL);
        console.log('Google service response:', response);
        
        // Hide countdown timer
        hideCountdownTimer();
        
        if (response && response.success) {
          if (response.quizData) {
            // New format: quiz data directly in response
            data = response.quizData;
            console.log(`✅ Datos del quiz cargados desde el servicio de Google: ${response.questionsCount} preguntas`);
          } else if (response.fileUrl) {
            // Old format: need to download file from Google Drive
            console.log('El servicio devolvió URL del archivo, descargando...');
            const directUrl = convertGoogleDriveUrl(response.fileUrl);
            console.log(`Descargando desde: ${directUrl}`);
            
            const jsonResponse = await fetch(directUrl);
            if (!jsonResponse.ok) {
                          throw new Error(`Error al descargar archivo JSON: ${jsonResponse.status}`);
          }
          data = await jsonResponse.json();
          console.log(`✅ Datos del quiz cargados desde Google Drive: ${response.questionsCount} preguntas`);
          } else {
                      const errorMsg = 'El servicio devolvió éxito pero sin datos del quiz ni URL del archivo';
          console.error('Detalles del error del servicio de Google:', response);
          throw new Error(`El servicio de Google falló: ${errorMsg}`);
          }
        } else {
          const errorMsg = response ? (response.error || 'Error desconocido') : 'Sin respuesta del servicio';
          console.error('Detalles del error del servicio de Google:', response);
          throw new Error(`El servicio de Google falló: ${errorMsg}`);
        }
      } catch (error) {
        // Hide countdown timer on error
        hideCountdownTimer();
        throw error;
      }
    } else {
      // Fallback to local file
      console.log('Cargando datos del quiz desde archivo local...');
      const response = await fetch('quiz-data-base64.json');
      if (!response.ok) {
        throw new Error(`Error HTTP! estado: ${response.status}`);
      }
      data = await response.json();
      console.log('✅ Datos del quiz cargados desde archivo local');
    }
    
    quizData = data.questions;
    
    // Initialize the quiz after data is loaded
    renderQuestion();
    preloadForIndex(0);
    preloadForIndex(1);
    
  } catch (error) {
    console.error('Error al cargar datos del quiz:', error);
    // Show error message with retry options
    document.getElementById('quiz').innerHTML = `
      <div style="text-align: center; padding: 50px; color: white;">
        <h2>Error al Cargar el Quiz</h2>
        <p>No se pudieron cargar los datos del quiz desde el servicio de Google.</p>
        <p style="color: #ffcc00; font-size: 14px;">${error.message}</p>
        <div style="margin-top: 20px;">
          <button onclick="loadQuizData()" style="padding: 10px 20px; margin: 10px; border-radius: 8px; background: var(--accent); color: white; border: none; cursor: pointer;">Reintentar Servicio de Google</button>
          <button onclick="loadLocalData()" style="padding: 10px 20px; margin: 10px; border-radius: 8px; background: #666; color: white; border: none; cursor: pointer;">Usar Archivo Local</button>
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
      reject(new Error('Error al cargar el servicio de Google - error de script'));
    };
    
    // Add script to page
    document.head.appendChild(script);
    
    // Timeout after 90 seconds (increased for image processing)
    setTimeout(() => {
      if (window[callbackName]) {
        document.head.removeChild(script);
        delete window[callbackName];
        console.error('JSONP timeout - script URL:', script.src);
        reject(new Error('Tiempo de espera del servicio de Google agotado después de 90 segundos'));
      }
    }, 90000);
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
    
          console.log('✅ Datos del quiz cargados desde archivo local');
    } catch (error) {
      console.error('Error al cargar datos locales:', error);
      document.getElementById('quiz').innerHTML = `
        <div style="text-align: center; padding: 50px; color: white;">
          <h2>Error al Cargar el Quiz</h2>
          <p>Tampoco se pudieron cargar los datos del quiz desde el archivo local.</p>
          <p style="color: #ffcc00; font-size: 14px;">${error.message}</p>
          <button onclick="location.reload()" style="padding: 10px 20px; margin: 10px; border-radius: 8px; background: var(--accent); color: white; border: none; cursor: pointer;">Recargar Página</button>
        </div>
      `;
  }
}

// Test function to debug Google service
async function testGoogleService() {
  console.log('🧪 Probando servicio de Google...');
  console.log('URL del servicio:', GOOGLE_SERVICE_URL);
  
  try {
    // Test JSONP (the working method)
    console.log('Probando JSONP...');
    const data = await fetchGoogleService(GOOGLE_SERVICE_URL);
    console.log('Datos JSONP:', data);
    return data;
  } catch (error) {
    console.log('JSONP falló:', error.message);
    throw error;
  }
}

// Show countdown timer while service is responding
function showCountdownTimer() {
  // Create countdown overlay
  const overlay = document.createElement('div');
  overlay.id = 'countdown-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    font-family: 'Comic Sans MS', cursive;
  `;
  
  // Create countdown container
  const container = document.createElement('div');
  container.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 30px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border: 3px solid #fff;
  `;
  
  // Create title
  const title = document.createElement('h2');
  title.textContent = '🔄 Cargando Datos del Quiz...';
  title.style.cssText = `
    color: white;
    margin: 0 0 20px 0;
    font-size: 24px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  `;
  
  // Create countdown display
  const countdownDisplay = document.createElement('div');
  countdownDisplay.id = 'countdown-display';
  countdownDisplay.style.cssText = `
    color: white;
    font-size: 48px;
    font-weight: bold;
    margin: 20px 0;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
  `;
  
  // Create message
  const message = document.createElement('p');
  message.textContent = 'Por favor espera mientras procesamos tus imágenes...';
  message.style.cssText = `
    color: white;
    margin: 10px 0 0 0;
    font-size: 16px;
    opacity: 0.9;
  `;
  
  // Assemble the countdown
  container.appendChild(title);
  container.appendChild(countdownDisplay);
  container.appendChild(message);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  // Start countdown from 90 seconds
  let timeLeft = 90;
  countdownDisplay.textContent = `${timeLeft}s`;
  
  const countdownInterval = setInterval(() => {
    timeLeft--;
    countdownDisplay.textContent = `${timeLeft}s`;
    
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
  
  // Store interval ID for cleanup
  overlay.dataset.intervalId = countdownInterval;
  
  return overlay;
}

// Hide countdown timer
function hideCountdownTimer() {
  const overlay = document.getElementById('countdown-overlay');
  if (overlay) {
    // Clear the interval
    const intervalId = overlay.dataset.intervalId;
    if (intervalId) {
      clearInterval(parseInt(intervalId));
    }
    
    // Remove the overlay
    document.body.removeChild(overlay);
  }
}

// Simple test to check if service URL is accessible
function testServiceUrl() {
  console.log('🔗 Probando accesibilidad de la URL del servicio...');
  console.log('URL:', GOOGLE_SERVICE_URL);
  
  // Create a simple script tag to test
  const testScript = document.createElement('script');
  testScript.src = GOOGLE_SERVICE_URL + '?callback=testCallback';
  
  // Set up a test callback
  window.testCallback = function(data) {
    console.log('✅ ¡La URL del servicio es accesible!');
    console.log('Respuesta de prueba:', data);
    document.head.removeChild(testScript);
    delete window.testCallback;
  };
  
  // Handle errors
  testScript.onerror = function(error) {
    console.error('❌ La URL del servicio no es accesible:', error);
    document.head.removeChild(testScript);
    delete window.testCallback;
  };
  
  // Add to page
  document.head.appendChild(testScript);
  
  // Cleanup after 10 seconds
  setTimeout(() => {
    if (window.testCallback) {
      console.log('⚠️ La función de prueba no fue llamada dentro de 10 segundos');
      document.head.removeChild(testScript);
      delete window.testCallback;
    }
  }, 10000);
}

// Function to generate and download PDF results
async function downloadResults() {
  console.log('Starting PDF generation...');
  try {
    // Create new PDF document
    if (!window.jspdf) {
      throw new Error('jsPDF library not loaded');
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Helper function to add image to PDF with optional effects
    async function addImageToPDF(base64Data, x, y, width, height, options = {}) {
      try {
        if (base64Data && base64Data.startsWith('data:image')) {
          await doc.addImage(base64Data, 'JPEG', x, y, width, height);
          
          // Add green border for correct answers
          if (options.correct) {
            doc.setDrawColor(0, 128, 0); // Green
            doc.setLineWidth(2);
            doc.rect(x - 1, y - 1, width + 2, height + 2);
          }
          
          // Add diagonal lines for incorrect answers
          if (options.incorrect) {
            doc.setDrawColor(255, 0, 0); // Red
            doc.setLineWidth(1);
            // Diagonal line from top-left to bottom-right
            doc.line(x, y, x + width, y + height);
            // Diagonal line from top-right to bottom-left
            doc.line(x + width, y, x, y + height);
          }
          
          // Reset line width
          doc.setLineWidth(0.1);
        }
      } catch (error) {
        console.log('Error adding image to PDF:', error);
      }
    }
    
    // Set up document properties
    doc.setProperties({
      title: 'Resultados del Quiz',
      subject: 'Quiz de Imágenes',
      author: 'Quiz App',
      creator: 'Quiz App'
    });
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultados del Quiz', 105, 20, { align: 'center' });
    
    // Add score
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Puntuación: ${state.score} / ${quizData.length}`, 105, 35, { align: 'center' });
    
    // Add date
    const currentDate = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha: ${currentDate}`, 105, 45, { align: 'center' });
    
    // Add separator
    doc.line(20, 55, 190, 55);
    
    let yPosition = 70;
    const pageHeight = 280;
    const lineHeight = 8;
    
    // Helper function to calculate space needed for a question
    function calculateQuestionSpace(question, selection, questionIndex) {
      console.log('calculateQuestionSpace called with:', { question, selection, questionIndex });
      let space = 0;
      
      // Separator line (if not first question)
      if (questionIndex > 0) space += 10;
      
      // Question number and prompt
      space += lineHeight;
      
      // Question image
      space += 35; // Space for larger image
      
      // User answer
      space += 20;
      
      // Correct/Incorrect indicator
      space += lineHeight;
      
      // If incorrect or unanswered, add correct answer
      let isCorrect = false;
      if (selection !== null && question.choices[selection]) {
        console.log('Checking correctness for selection:', selection, 'choices:', question.choices);
        if (question.shuffledData) {
          console.log('Using shuffled data');
          isCorrect = question.shuffledData.choices[selection].id === question.shuffledData.choices[question.shuffledData.correctIndex].id;
        } else {
          console.log('Using original data');
          const correctChoiceIndex = question.choices.findIndex(choice => choice.id === question.correctAnswerId);
          isCorrect = question.choices[selection].id === question.choices[correctChoiceIndex].id;
        }
      }
      
      if (!isCorrect) {
        space += 20; // Space for correct answer image and text
      }
      
      // Separator line at end
      space += 15;
      
      return space;
    }
    
    // Process each question
    console.log(`Processing ${state.selections.length} questions...`);
    for (let index = 0; index < state.selections.length; index++) {
      const selection = state.selections[index];
      const question = quizData[index];
      console.log(`Processing question ${index + 1}...`);
      
      // Calculate space needed for this question
      console.log(`Question ${index + 1} - Selection:`, selection, 'Question:', question);
      const spaceNeeded = calculateQuestionSpace(question, selection, index);
      
      // Check if we need a new page
      if (yPosition + spaceNeeded > pageHeight) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Add separator line before each question (except the first one)
      if (index > 0) {
        doc.line(20, yPosition - 5, 190, yPosition - 5);
        yPosition += 10; // Add extra space after separator
      }
      
      // Question number and prompt
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Pregunta ${index + 1}:`, 20, yPosition);
      yPosition += lineHeight;
      
      // Add question image (larger than answer images)
      if (question.prompt.imageBase64) {
        try {
          await addImageToPDF(question.prompt.imageBase64, 20, yPosition, 40, 30);
        } catch (error) {
          console.log('Error adding question image:', error);
        }
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Pregunta: ${question.prompt.caption}`, 70, yPosition + 10);
      yPosition += 35; // More space for larger image
      
      // Get the correct answer and user's answer considering shuffled data
      let correctChoiceIndex, correctChoice, userChoice;
      
      if (question.shuffledData) {
        // Use shuffled data
        correctChoiceIndex = question.shuffledData.correctIndex;
        correctChoice = question.shuffledData.choices[correctChoiceIndex];
        userChoice = selection !== null && question.shuffledData.choices[selection] ? question.shuffledData.choices[selection] : null;
      } else {
        // Fallback to original data (shouldn't happen but just in case)
        correctChoiceIndex = question.choices.findIndex(choice => choice.id === question.correctAnswerId);
        correctChoice = question.choices[correctChoiceIndex];
        userChoice = selection !== null && question.choices[selection] ? question.choices[selection] : null;
      }
      
      // Display user's answer with images
      if (userChoice) {
        // Check if correct (comparing the actual choice IDs, not indices)
        const isCorrect = userChoice.id === correctChoice.id;
        
        // Add user's answer image with visual effects
        if (userChoice.imageBase64) {
          try {
            await addImageToPDF(userChoice.imageBase64, 20, yPosition, 25, 15, {
              correct: isCorrect,
              incorrect: !isCorrect
            });
          } catch (error) {
            console.log('Error adding user answer image:', error);
          }
        }
        
        if (isCorrect) {
          doc.setTextColor(0, 128, 0); // Green
        } else {
          doc.setTextColor(255, 0, 0); // Red
        }
        doc.text(`Tu respuesta: ${userChoice.caption}`, 50, yPosition + 5);
        doc.setTextColor(0, 0, 0); // Reset to black
        yPosition += 20;
        
        if (isCorrect) {
          doc.setTextColor(0, 128, 0); // Green
          doc.text('✅ Correcta', 20, yPosition);
        } else {
          doc.setTextColor(255, 0, 0); // Red
          doc.text('❌ Incorrecta', 20, yPosition);
          yPosition += lineHeight;
          
          // Add correct answer image with green border
          if (correctChoice.imageBase64) {
            try {
              await addImageToPDF(correctChoice.imageBase64, 20, yPosition, 25, 15, {
                correct: true
              });
            } catch (error) {
              console.log('Error adding correct answer image:', error);
            }
          }
          doc.setTextColor(0, 128, 0); // Green
          doc.text(`Respuesta correcta: ${correctChoice.caption}`, 50, yPosition + 5);
          doc.setTextColor(0, 0, 0); // Reset to black
          yPosition += 20;
        }
        doc.setTextColor(0, 0, 0); // Reset to black
      } else {
        doc.setTextColor(255, 0, 0); // Red
        doc.text('❓ Sin responder', 20, yPosition);
        yPosition += lineHeight;
        
        // Add correct answer image for unanswered questions with green border
        if (correctChoice.imageBase64) {
          try {
            await addImageToPDF(correctChoice.imageBase64, 20, yPosition, 25, 15, {
              correct: true
            });
          } catch (error) {
            console.log('Error adding correct answer image:', error);
          }
        }
        doc.setTextColor(0, 128, 0); // Green
        doc.text(`Respuesta correcta: ${correctChoice.caption}`, 50, yPosition + 5);
        doc.setTextColor(0, 0, 0); // Reset to black
        yPosition += 20;
      }
      
      // Add separator line at the end of each question
      doc.line(20, yPosition + 5, 190, yPosition + 5);
      yPosition += 15; // Add extra space after separator
    }
    
    // Add summary
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.line(20, yPosition, 190, yPosition);
    yPosition += lineHeight;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen:', 20, yPosition);
    yPosition += lineHeight;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de preguntas: ${quizData.length}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Respuestas correctas: ${state.score}`, 20, yPosition);
    yPosition += lineHeight;
    
    // Calculate unanswered questions
    const unansweredCount = state.selections.filter(selection => selection === null).length;
    const incorrectCount = quizData.length - state.score - unansweredCount;
    
    doc.text(`Respuestas incorrectas: ${incorrectCount}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Preguntas sin responder: ${unansweredCount}`, 20, yPosition);
    yPosition += lineHeight;
    
    const percentage = Math.round((state.score / quizData.length) * 100);
    doc.text(`Porcentaje de acierto: ${percentage}%`, 20, yPosition);
    
    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `resultados_quiz_${dateStr}.pdf`;
    
    console.log('Saving PDF...');
    // Save the PDF
    doc.save(filename);
    
    console.log('✅ PDF generado y descargado exitosamente');
    
  } catch (error) {
    console.error('❌ Error al generar el PDF:', error);
    alert('Error al generar el PDF. Por favor, intenta de nuevo.');
  }
}

// Start the app by loading quiz data
loadQuizData();


