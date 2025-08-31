/**
 * Google Sheets Quiz Service
 * Reads quiz data from Google Sheets and generates JSON with embedded base64 images
 * 
 * Sheet columns:
 * A: Pregunta (Question number)
 * B: Imagen Pregunta (Question image - embedded in cell)
 * C: Texto pregunta (Question caption)
 * D: Imagen respuesta correcta (Correct answer image - embedded in cell)
 * E: Texto respuesta correcta (Correct answer caption)
 * F: Imagen respuesta 2 (Answer 2 image - embedded in cell)
 * G: Texto respuesta 2 (Answer 2 caption)
 * H: Imagen respuesta 3 (Answer 3 image - embedded in cell)
 * I: Texto respuesta 3 (Answer 3 caption)
 * J: Imagen respuesta 4 (Answer 4 image - embedded in cell)
 * K: Texto respuesta 4 (Answer 4 caption)
 */

// Configuration
const SHEET_NAME = 'Quiz Data'; // Change this to your sheet name
const SPREADSHEET_ID = ''; // Leave empty to use active spreadsheet, or add your ID

/**
 * Main function to generate quiz JSON
 */
function generateQuizJSON() {
  try {
    console.log('Starting quiz JSON generation...');
    
    // Get the spreadsheet and sheet
    const spreadsheet = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found. Please check the sheet name.`);
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    console.log(`Found ${data.length - 1} questions in the sheet`);
    
    // Validate headers
    validateHeaders(headers);
    
    // Process questions (skip header row)
    const questions = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // Skip empty rows
        const question = processQuestionRow(row, i, sheet);
        if (question) {
          questions.push(question);
        }
      }
    }
    
    // Create the final JSON structure
    const quizData = {
      quizTitle: "Quiz App",
      totalQuestions: questions.length,
      questions: questions,
      metadata: {
        version: "1.0",
        created: new Date().toISOString(),
        description: "Quiz generated from Google Sheets",
        imageFormat: "base64",
        source: "Google Sheets",
        generatedBy: "Google Apps Script"
      }
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(quizData, null, 2);
    
    // Create a file in Google Drive
    const fileName = `quiz-data-${new Date().toISOString().split('T')[0]}.json`;
    const file = DriveApp.createFile(fileName, jsonString, MimeType.PLAIN_TEXT);
    
    console.log(`✅ Quiz JSON generated successfully!`);
    console.log(`📁 File: ${fileName}`);
    console.log(`🔗 File ID: ${file.getId()}`);
    console.log(`📊 Questions processed: ${questions.length}`);
    
    // Return the file URL for easy access
    return {
      success: true,
      fileId: file.getId(),
      fileName: fileName,
      fileUrl: file.getUrl(),
      questionsCount: questions.length
    };
    
  } catch (error) {
    console.error('❌ Error generating quiz JSON:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Validate that the sheet has the expected headers
 */
function validateHeaders(headers) {
  const expectedHeaders = [
    'Pregunta',
    'Imagen Pregunta',
    'Texto pregunta',
    'Imagen respuesta correcta',
    'Texto respuesta correcta',
    'Imagen respuesta 2',
    'Texto respuesta 2',
    'Imagen respuesta 3',
    'Texto respuesta 3',
    'Imagen respuesta 4',
    'Texto respuesta 4'
  ];
  
  for (let i = 0; i < expectedHeaders.length; i++) {
    if (headers[i] !== expectedHeaders[i]) {
      throw new Error(`Header mismatch at column ${i + 1}. Expected: "${expectedHeaders[i]}", Found: "${headers[i]}"`);
    }
  }
  
  console.log('✅ Headers validated successfully');
}

/**
 * Process a single question row
 */
function processQuestionRow(row, rowIndex, sheet) {
  try {
    console.log(`Processing question ${rowIndex}...`);
    
    // Extract data from row
    const questionNumber = row[0];
    const questionCaption = row[2];
    const correctAnswerCaption = row[4];
    const answer2Caption = row[6];
    const answer3Caption = row[8];
    const answer4Caption = row[10];
    
    // Get embedded images from cells
    const questionImageBase64 = getEmbeddedImageFromCell(sheet, rowIndex + 1, 2); // Column B
    const correctAnswerBase64 = getEmbeddedImageFromCell(sheet, rowIndex + 1, 4); // Column D
    const answer2Base64 = getEmbeddedImageFromCell(sheet, rowIndex + 1, 6); // Column F
    const answer3Base64 = getEmbeddedImageFromCell(sheet, rowIndex + 1, 8); // Column H
    const answer4Base64 = getEmbeddedImageFromCell(sheet, rowIndex + 1, 10); // Column J
    
    // Create choices array (correct answer is always first)
    const choices = [
      {
        id: `${questionNumber}a`,
        imageBase64: correctAnswerBase64,
        caption: correctAnswerCaption
      },
      {
        id: `${questionNumber}b`,
        imageBase64: answer2Base64,
        caption: answer2Caption
      },
      {
        id: `${questionNumber}c`,
        imageBase64: answer3Base64,
        caption: answer3Caption
      },
      {
        id: `${questionNumber}d`,
        imageBase64: answer4Base64,
        caption: answer4Caption
      }
    ];
    
    // Create the question object
    const question = {
      id: parseInt(questionNumber),
      prompt: {
        imageBase64: questionImageBase64,
        caption: questionCaption
      },
      choices: choices,
      correctAnswerId: `${questionNumber}a` // Correct answer is always first (column D)
    };
    
    console.log(`✅ Question ${questionNumber} processed successfully`);
    return question;
    
  } catch (error) {
    console.error(`❌ Error processing question ${rowIndex}:`, error);
    return null;
  }
}

/**
 * Extract embedded image from a cell and convert to base64
 */
function getEmbeddedImageFromCell(sheet, row, column) {
  try {
    console.log(`  Extracting image from cell ${row},${column}...`);
    
    // Get the cell
    const cell = sheet.getRange(row, column);
    
    // Get the rich text value to check for embedded images
    const richTextValue = cell.getRichTextValue();
    
    // Check if the cell has embedded images
    if (!richTextValue || !richTextValue.getRuns || richTextValue.getRuns().length === 0) {
      throw new Error('No image found in cell - cell appears to be empty');
    }
    
    // Try to get the image from the cell
    // For embedded images, we need to use a different approach
    try {
      // Get the cell as a blob (this works for embedded images)
      const cellBlob = cell.getBlob();
      
      if (cellBlob && cellBlob.getContentType && cellBlob.getContentType().startsWith('image/')) {
        console.log(`  Found embedded image with type: ${cellBlob.getContentType()}`);
        
        // Convert blob to base64
        const imageBytes = cellBlob.getBytes();
        const base64String = Utilities.base64Encode(imageBytes);
        const contentType = cellBlob.getContentType();
        
        return `data:${contentType};base64,${base64String}`;
      }
    } catch (blobError) {
      console.log(`  Blob method failed, trying alternative approach...`);
    }
    
    // Alternative approach: try to get image from the cell's rich text
    const runs = richTextValue.getRuns();
    for (let i = 0; i < runs.length; i++) {
      const run = runs[i];
      
      // Check if this run contains an image
      if (run.getLinkUrl) {
        const imageUrl = run.getLinkUrl();
        if (imageUrl && (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg') || imageUrl.includes('.png'))) {
          console.log(`  Found image URL in rich text: ${imageUrl}`);
          return urlToBase64(imageUrl);
        }
      }
    }
    
    // If we get here, try to extract from the cell's HTML content
    try {
      const cellHtml = cell.getFormula();
      if (cellHtml && cellHtml.includes('=IMAGE(')) {
        const imageUrlMatch = cellHtml.match(/=IMAGE\("([^"]+)"/);
        if (imageUrlMatch) {
          const imageUrl = imageUrlMatch[1];
          console.log(`  Found IMAGE formula: ${imageUrl}`);
          return urlToBase64(imageUrl);
        }
      }
    } catch (formulaError) {
      console.log(`  Formula extraction failed`);
    }
    
    throw new Error('No embedded image found in cell - please ensure image is properly inserted');
    
  } catch (error) {
    console.error(`  ❌ Error extracting image from cell ${row},${column}:`, error);
    throw new Error(`Failed to extract image from cell ${row},${column} - ${error.message}`);
  }
}

/**
 * Convert image URL to base64 (kept for backward compatibility)
 */
function urlToBase64(imageUrl) {
  try {
    if (!imageUrl || imageUrl.trim() === '') {
      throw new Error('Empty image URL');
    }
    
    console.log(`  Converting image: ${imageUrl}`);
    
    // Fetch the image
    const response = UrlFetchApp.fetch(imageUrl, {
      muteHttpExceptions: true,
      timeout: 30
    });
    
    const responseCode = response.getResponseCode();
    if (responseCode !== 200) {
      throw new Error(`HTTP ${responseCode}: ${response.getContentText()}`);
    }
    
    // Get the image content
    const imageBlob = response.getBlob();
    const imageBytes = imageBlob.getBytes();
    
    // Convert to base64
    const base64String = Utilities.base64Encode(imageBytes);
    
    // Get content type
    const contentType = imageBlob.getContentType();
    
    // Return data URL format
    return `data:${contentType};base64,${base64String}`;
    
  } catch (error) {
    console.error(`  ❌ Error converting image ${imageUrl}:`, error);
    // Return a placeholder image or throw error
    throw new Error(`Failed to convert image: ${imageUrl} - ${error.message}`);
  }
}

/**
 * Web app function - can be called via HTTP
 */
function doGet(e) {
  try {
    const result = generateQuizJSON();
    
    if (result.success) {
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ error: result.error }))
        .setMimeType(ContentService.MimeType.JSON)
        .setStatusCode(500);
    }
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setStatusCode(500);
  }
}

/**
 * Test function - run this to test the script
 */
function testQuizGeneration() {
  console.log('🧪 Testing quiz generation...');
  const result = generateQuizJSON();
  console.log('Test result:', result);
  return result;
}

/**
 * Get the latest generated quiz file
 */
function getLatestQuizFile() {
  const files = DriveApp.getFilesByName('quiz-data-*.json');
  let latestFile = null;
  let latestDate = new Date(0);
  
  while (files.hasNext()) {
    const file = files.next();
    const fileDate = file.getDateCreated();
    if (fileDate > latestDate) {
      latestDate = fileDate;
      latestFile = file;
    }
  }
  
  if (latestFile) {
    console.log(`Latest quiz file: ${latestFile.getName()}`);
    console.log(`Created: ${latestFile.getDateCreated()}`);
    console.log(`URL: ${latestFile.getUrl()}`);
    return latestFile;
  } else {
    console.log('No quiz files found');
    return null;
  }
}

/**
 * Clean up old quiz files (keep only the latest 5)
 */
function cleanupOldQuizFiles() {
  const files = DriveApp.getFilesByName('quiz-data-*.json');
  const fileList = [];
  
  while (files.hasNext()) {
    fileList.push(files.next());
  }
  
  // Sort by creation date (newest first)
  fileList.sort((a, b) => b.getDateCreated() - a.getDateCreated());
  
  // Keep only the latest 5 files
  if (fileList.length > 5) {
    for (let i = 5; i < fileList.length; i++) {
      const file = fileList[i];
      console.log(`Deleting old file: ${file.getName()}`);
      file.setTrashed(true);
    }
    console.log(`Cleaned up ${fileList.length - 5} old files`);
  } else {
    console.log('No cleanup needed');
  }
}
