/**
 * Google Sheets Quiz Service with Caching
 * Reads quiz data from Google Sheets and generates JSON with embedded base64 images
 * Implements caching to avoid regenerating JSON unless sheet has been modified
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
 * Main function to generate quiz JSON with caching
 */
function generateQuizJSON() {
  try {
    console.log('Starting quiz JSON generation with caching...');
    const startTime = new Date();
    
    // Get the spreadsheet and sheet
    const spreadsheet = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found. Please check the sheet name.`);
    }
    
    // Generate cache filename
    const cacheFileName = generateCacheFileName(spreadsheet, sheet);
    console.log(`Cache filename: ${cacheFileName}`);
    
    // Check if we can use cached version
    const cachedData = checkCache(spreadsheet, sheet, cacheFileName);
    if (cachedData) {
      console.log('✅ Using cached quiz data');
      return {
        success: true,
        quizData: cachedData,
        questionsCount: cachedData.questions.length,
        generatedAt: cachedData.metadata.created,
        processingTime: 0,
        source: 'cache'
      };
    }
    
    console.log('🔄 Cache miss - generating new quiz data...');
    
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
        console.log(`Processing question ${i}...`);
        const questionStartTime = new Date();
        const question = processQuestionRow(row, i, sheet);
        const questionEndTime = new Date();
        console.log(`Question ${i} processed in ${questionEndTime - questionStartTime}ms`);
        if (question) {
          questions.push(question);
        }
      }
    }
    
    // Create the final JSON structure
    const quizData = {
      quizTitle: "QUIZ5",
      totalQuestions: questions.length,
      questions: questions,
      metadata: {
        version: "1.0",
        created: new Date().toISOString(),
        description: "Quiz generated from Google Sheets",
        imageFormat: "base64",
        source: "Google Sheets",
        generatedBy: "Google Apps Script",
        cacheKey: generateCacheKey(spreadsheet, sheet)
      }
    };
    
    // Save to cache
    saveToCache(quizData, cacheFileName);
    
    const endTime = new Date();
    const totalTime = endTime - startTime;
    
    console.log(`✅ Quiz JSON generated and cached successfully!`);
    console.log(`📊 Questions processed: ${questions.length}`);
    console.log(`⏱️ Total processing time: ${totalTime}ms`);
    
    // Return the quiz data directly
    return {
      success: true,
      quizData: quizData,
      questionsCount: questions.length,
      generatedAt: new Date().toISOString(),
      processingTime: totalTime,
      source: 'generated'
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
 * Generate cache filename based on spreadsheet and sheet names
 */
function generateCacheFileName(spreadsheet, sheet) {
  const spreadsheetName = spreadsheet.getName().replace(/[^a-zA-Z0-9]/g, '_');
  const sheetName = sheet.getName().replace(/[^a-zA-Z0-9]/g, '_');
  return `${spreadsheetName}_${sheetName}_quiz_cache.json`;
}

/**
 * Generate cache key based on sheet modification time
 */
function generateCacheKey(spreadsheet, sheet) {
  // Use DriveApp to get the actual file's last modified time
  const lastModified = DriveApp.getFileById(spreadsheet.getId()).getLastUpdated();
  return `${spreadsheet.getId()}_${sheet.getSheetId()}_${lastModified.getTime()}`;
}

/**
 * Check if cached version exists and is valid
 */
function checkCache(spreadsheet, sheet, cacheFileName) {
  try {
    console.log('🔍 Checking cache...');
    
    // Get the folder where the spreadsheet is located
    const spreadsheetFile = DriveApp.getFileById(spreadsheet.getId());
    const parentFolder = spreadsheetFile.getParents().next();
    
    // Look for cache file in the same folder
    const cacheFiles = parentFolder.getFilesByName(cacheFileName);
    
    if (!cacheFiles.hasNext()) {
      console.log('❌ Cache file not found');
      return null;
    }
    
    const cacheFile = cacheFiles.next();
    console.log(`📁 Found cache file: ${cacheFile.getName()}`);
    
    // Check if cache file is newer than sheet modification
    const cacheLastModified = cacheFile.getLastUpdated();
    const sheetLastModified = DriveApp.getFileById(spreadsheet.getId()).getLastUpdated();
    
    console.log(`📅 Cache file modified: ${cacheLastModified}`);
    console.log(`📅 Sheet modified: ${sheetLastModified}`);
    
    if (cacheLastModified < sheetLastModified) {
      console.log('❌ Cache is outdated - sheet has been modified');
      return null;
    }
    
    // Read and parse cache file
    const cacheContent = cacheFile.getBlob().getDataAsString();
    const cachedData = JSON.parse(cacheContent);
    
    // Validate cache structure
    if (!cachedData.questions || !Array.isArray(cachedData.questions)) {
      console.log('❌ Invalid cache structure');
      return null;
    }
    
    console.log(`✅ Cache is valid with ${cachedData.questions.length} questions`);
    return cachedData;
    
  } catch (error) {
    console.error('❌ Error checking cache:', error);
    return null;
  }
}

/**
 * Save quiz data to cache file
 */
function saveToCache(quizData, cacheFileName) {
  try {
    console.log('💾 Saving to cache...');
    
    // Get the folder where the spreadsheet is located
    const spreadsheet = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const spreadsheetFile = DriveApp.getFileById(spreadsheet.getId());
    const parentFolder = spreadsheetFile.getParents().next();
    
    // Convert quiz data to JSON string
    const jsonString = JSON.stringify(quizData, null, 2);
    
    // Create or update cache file
    const cacheFiles = parentFolder.getFilesByName(cacheFileName);
    
    let cacheFile;
    if (cacheFiles.hasNext()) {
      // Update existing file
      cacheFile = cacheFiles.next();
      cacheFile.setContent(jsonString);
      console.log(`📝 Updated existing cache file: ${cacheFile.getName()}`);
    } else {
      // Create new file
      cacheFile = parentFolder.createFile(cacheFileName, jsonString, 'application/json');
      console.log(`📝 Created new cache file: ${cacheFile.getName()}`);
    }
    
    // Set file permissions to be accessible by the script
    cacheFile.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    console.log(`✅ Cache saved successfully: ${cacheFile.getUrl()}`);
    
  } catch (error) {
    console.error('❌ Error saving to cache:', error);
    // Don't throw error - caching is optional
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
    
    // Method 1: Check if cell contains an image using valueType
    try {
      const value = cell.getValue();
      if (value && value.valueType === SpreadsheetApp.ValueType.IMAGE) {
        console.log(`  Found embedded image using valueType.IMAGE`);
        const imageUrl = value.getContentUrl();
        console.log(`  Image URL: ${imageUrl}`);
        return urlToBase64(imageUrl);
      }
    } catch (valueTypeError) {
      console.log(`  valueType check failed: ${valueTypeError.message}`);
    }
    
    // Method 2: Try to get embedded images from rich text (Google Drive links)
    try {
      const richTextValue = cell.getRichTextValue();
      if (richTextValue && richTextValue.getRuns) {
        const runs = richTextValue.getRuns();
        for (let i = 0; i < runs.length; i++) {
          const run = runs[i];
          
          // Check if this run contains an embedded image (Google Drive link)
          if (run.getLinkUrl) {
            const imageUrl = run.getLinkUrl();
            if (imageUrl && imageUrl.includes('drive.google.com')) {
              console.log(`  Found embedded image URL: ${imageUrl}`);
              return urlToBase64(imageUrl);
            }
          }
        }
      }
    } catch (richTextError) {
      console.log(`  Rich text extraction failed: ${richTextError.message}`);
    }
    
    // Method 3: Try to get image from rich text (external URLs)
    try {
      const richTextValue = cell.getRichTextValue();
      if (richTextValue && richTextValue.getRuns) {
        const runs = richTextValue.getRuns();
        for (let i = 0; i < runs.length; i++) {
          const run = runs[i];
          
          // Check if this run contains an external image URL
          if (run.getLinkUrl) {
            const imageUrl = run.getLinkUrl();
            if (imageUrl && (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg') || imageUrl.includes('.png'))) {
              console.log(`  Found external image URL: ${imageUrl}`);
              return urlToBase64(imageUrl);
            }
          }
        }
      }
    } catch (richTextError) {
      console.log(`  Rich text extraction failed: ${richTextError.message}`);
    }
    
    // Method 4: Try to extract from IMAGE formula
    try {
      const cellFormula = cell.getFormula();
      if (cellFormula && cellFormula.includes('=IMAGE(')) {
        const imageUrlMatch = cellFormula.match(/=IMAGE\("([^"]+)"/);
        if (imageUrlMatch) {
          const imageUrl = imageUrlMatch[1];
          console.log(`  Found IMAGE formula: ${imageUrl}`);
          return urlToBase64(imageUrl);
        }
      }
    } catch (formulaError) {
      console.log(`  Formula extraction failed: ${formulaError.message}`);
    }
    
    // Method 5: Check if cell contains a direct image URL
    try {
      const cellValue = cell.getValue();
      if (cellValue && typeof cellValue === 'string') {
        // Check if it looks like an image URL
        if (cellValue.match(/https?:\/\/.*\.(jpg|jpeg|png|gif)/i)) {
          console.log(`  Found image URL in cell value: ${cellValue}`);
          return urlToBase64(cellValue);
        }
      }
    } catch (valueError) {
      console.log(`  Value extraction failed: ${valueError.message}`);
    }
    
    throw new Error('No image found in cell - please ensure image is properly inserted using "Insert → Image → Image in cell"');
    
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
      timeout: 90
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
    
    // Check if this is a JSONP request
    const callback = e.parameter.callback;
    
    if (callback) {
      // JSONP response
      const jsonpResponse = `${callback}(${JSON.stringify(result)})`;
      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      // Regular JSON response
      if (result.success) {
        return ContentService
          .createTextOutput(JSON.stringify(result))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService
          .createTextOutput(JSON.stringify({ error: result.error }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
  } catch (error) {
    const errorResult = { error: error.toString() };
    const callback = e.parameter.callback;
    
    if (callback) {
      // JSONP error response
      const jsonpResponse = `${callback}(${JSON.stringify(errorResult)})`;
      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      // Regular JSON error response
      return ContentService
        .createTextOutput(JSON.stringify(errorResult))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

/**
 * Handle CORS preflight requests
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
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
 * Quick test function without image processing
 */
function quickTest() {
  console.log('🧪 Quick test without image processing...');
  const startTime = new Date();
  
  try {
    // Get the spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found.`);
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    console.log(`Found ${data.length - 1} questions in the sheet`);
    console.log(`Headers: ${headers.join(', ')}`);
    
    const endTime = new Date();
    const totalTime = endTime - startTime;
    
    console.log(`✅ Quick test completed in ${totalTime}ms`);
    return {
      success: true,
      questionsFound: data.length - 1,
      headers: headers,
      processingTime: totalTime
    };
    
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}



/**
 * Diagnostic function to check what's in a specific cell
 */
function diagnoseCell(sheetName, row, column) {
  try {
    console.log(`🔍 Diagnosing cell ${row},${column} in sheet "${sheetName}"...`);
    
    // Get the spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      console.log(`❌ Sheet "${sheetName}" not found`);
      return;
    }
    
    // Get the cell
    const cell = sheet.getRange(row, column);
    
    // Check different properties
    console.log(`📋 Cell address: ${cell.getA1Notation()}`);
    console.log(`📝 Cell value: "${cell.getValue()}"`);
    console.log(`📄 Cell formula: "${cell.getFormula()}"`);
    console.log(`🎨 Cell background: ${cell.getBackground()}`);
    
    // Check rich text
    try {
      const richText = cell.getRichTextValue();
      console.log(`📖 Rich text runs: ${richText.getRuns().length}`);
      
      const runs = richText.getRuns();
      for (let i = 0; i < runs.length; i++) {
        const run = runs[i];
        console.log(`  Run ${i}: "${run.getText()}"`);
        if (run.getLinkUrl) {
          console.log(`    Link URL: ${run.getLinkUrl()}`);
        }
      }
    } catch (e) {
      console.log(`❌ Rich text error: ${e.message}`);
    }
    
    // Check for embedded images using valueType
    try {
      const value = cell.getValue();
      if (value && value.valueType === SpreadsheetApp.ValueType.IMAGE) {
        console.log(`🖼️ Found embedded image using valueType.IMAGE`);
        const imageUrl = value.getContentUrl();
        console.log(`  Image URL: ${imageUrl}`);
      } else {
        console.log(`❌ No embedded image found - valueType: ${value ? value.valueType : 'null'}`);
      }
    } catch (e) {
      console.log(`❌ valueType check error: ${e.message}`);
    }
    
    // Check cell notes
    const note = cell.getNote();
    if (note) {
      console.log(`📝 Cell note: "${note}"`);
    } else {
      console.log(`📝 No cell note`);
    }
    
    console.log(`✅ Diagnosis complete for cell ${row},${column}`);
    
  } catch (error) {
    console.error(`❌ Error diagnosing cell: ${error.message}`);
  }
}

/**
 * Test function to diagnose cell B2 specifically
 */
function testCellB2() {
  console.log('🧪 Testing cell B2...');
  diagnoseCell(SHEET_NAME, 2, 2);
}

/**
 * Clear cache file - useful for testing or forcing regeneration
 */
function clearCache() {
  try {
    console.log('🗑️ Clearing cache...');
    
    // Get the spreadsheet and sheet
    const spreadsheet = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found.`);
    }
    
    // Generate cache filename
    const cacheFileName = generateCacheFileName(spreadsheet, sheet);
    
    // Get the folder where the spreadsheet is located
    const spreadsheetFile = DriveApp.getFileById(spreadsheet.getId());
    const parentFolder = spreadsheetFile.getParents().next();
    
    // Look for cache file in the same folder
    const cacheFiles = parentFolder.getFilesByName(cacheFileName);
    
    if (cacheFiles.hasNext()) {
      const cacheFile = cacheFiles.next();
      cacheFile.setTrashed(true);
      console.log(`✅ Cache file deleted: ${cacheFile.getName()}`);
      return {
        success: true,
        message: `Cache file "${cacheFileName}" has been deleted`
      };
    } else {
      console.log('ℹ️ No cache file found to delete');
      return {
        success: true,
        message: 'No cache file found to delete'
      };
    }
    
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get cache status - useful for debugging
 */
function getCacheStatus() {
  try {
    console.log('📊 Getting cache status...');
    
    // Get the spreadsheet and sheet
    const spreadsheet = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found.`);
    }
    
    // Generate cache filename
    const cacheFileName = generateCacheFileName(spreadsheet, sheet);
    
    // Get the folder where the spreadsheet is located
    const spreadsheetFile = DriveApp.getFileById(spreadsheet.getId());
    const parentFolder = spreadsheetFile.getParents().next();
    
    // Look for cache file in the same folder
    const cacheFiles = parentFolder.getFilesByName(cacheFileName);
    
    const sheetLastModified = DriveApp.getFileById(spreadsheet.getId()).getLastUpdated();
    
    if (cacheFiles.hasNext()) {
      const cacheFile = cacheFiles.next();
      const cacheLastModified = cacheFile.getLastUpdated();
      const isOutdated = cacheLastModified < sheetLastModified;
      
      return {
        success: true,
        cacheExists: true,
        cacheFileName: cacheFileName,
        cacheLastModified: cacheLastModified.toISOString(),
        sheetLastModified: sheetLastModified.toISOString(),
        isOutdated: isOutdated,
        cacheFileUrl: cacheFile.getUrl(),
        cacheFileSize: cacheFile.getSize()
      };
    } else {
      return {
        success: true,
        cacheExists: false,
        cacheFileName: cacheFileName,
        sheetLastModified: sheetLastModified.toISOString(),
        message: 'No cache file found'
      };
    }
    
  } catch (error) {
    console.error('❌ Error getting cache status:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}
