/**
 * Google Apps Script Diagnostic Tool
 * Run this to check if your script is working correctly
 */

/**
 * Simple test function to check basic functionality
 */
function simpleTest() {
  try {
    console.log('🧪 Running simple test...');
    
    // Test 1: Check if we can access the spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log('✅ Spreadsheet access:', spreadsheet.getName());
    
    // Test 2: Check if the sheet exists
    const sheet = spreadsheet.getSheetByName('Quiz Data');
    if (sheet) {
      console.log('✅ Sheet "Quiz Data" found');
      console.log('Sheet ID:', sheet.getSheetId());
      console.log('Last modified:', sheet.getLastModified());
    } else {
      console.log('❌ Sheet "Quiz Data" not found');
      console.log('Available sheets:', spreadsheet.getSheets().map(s => s.getName()));
    }
    
    // Test 3: Check if we can read data
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      console.log('✅ Data read successfully');
      console.log('Rows:', data.length);
      console.log('Columns:', data[0] ? data[0].length : 0);
      
      if (data.length > 0) {
        console.log('Headers:', data[0]);
      }
    }
    
    return {
      success: true,
      message: 'Simple test completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Simple test failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test the doGet function
 */
function testDoGet() {
  try {
    console.log('🧪 Testing doGet function...');
    
    // Create a mock event object
    const mockEvent = {
      parameter: {
        callback: 'testCallback'
      }
    };
    
    // Call doGet
    const result = doGet(mockEvent);
    
    console.log('✅ doGet executed successfully');
    console.log('Result type:', typeof result);
    console.log('Result content:', result.getContent());
    
    return {
      success: true,
      result: result.getContent()
    };
    
  } catch (error) {
    console.error('❌ doGet test failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test image extraction from a specific cell
 */
function testImageExtraction() {
  try {
    console.log('🧪 Testing image extraction...');
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Quiz Data');
    
    if (!sheet) {
      throw new Error('Sheet "Quiz Data" not found');
    }
    
    // Test cell B2 (first question image)
    console.log('Testing cell B2...');
    const cell = sheet.getRange(2, 2);
    
    // Check cell value
    const value = cell.getValue();
    console.log('Cell value type:', typeof value);
    console.log('Cell value:', value);
    
    // Check if it's an image
    if (value && value.valueType === SpreadsheetApp.ValueType.IMAGE) {
      console.log('✅ Found embedded image');
      const imageUrl = value.getContentUrl();
      console.log('Image URL:', imageUrl);
      
      // Try to fetch the image
      try {
        const response = UrlFetchApp.fetch(imageUrl);
        console.log('✅ Image fetch successful');
        console.log('Image size:', response.getBlob().getBytes().length, 'bytes');
      } catch (fetchError) {
        console.log('❌ Image fetch failed:', fetchError.message);
      }
    } else {
      console.log('❌ No embedded image found in cell B2');
      console.log('Value type:', value ? value.valueType : 'null');
    }
    
    return {
      success: true,
      message: 'Image extraction test completed'
    };
    
  } catch (error) {
    console.error('❌ Image extraction test failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test cache functionality
 */
function testCache() {
  try {
    console.log('🧪 Testing cache functionality...');
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Quiz Data');
    
    if (!sheet) {
      throw new Error('Sheet "Quiz Data" not found');
    }
    
    // Test cache filename generation
    const cacheFileName = generateCacheFileName(spreadsheet, sheet);
    console.log('Cache filename:', cacheFileName);
    
    // Test cache key generation
    const cacheKey = generateCacheKey(spreadsheet, sheet);
    console.log('Cache key:', cacheKey);
    
    // Test cache status
    const cacheStatus = getCacheStatus();
    console.log('Cache status:', cacheStatus);
    
    return {
      success: true,
      cacheFileName: cacheFileName,
      cacheKey: cacheKey,
      cacheStatus: cacheStatus
    };
    
  } catch (error) {
    console.error('❌ Cache test failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Full diagnostic test
 */
function runFullDiagnostic() {
  console.log('🔍 Running full diagnostic...');
  
  const results = {
    simpleTest: simpleTest(),
    doGetTest: testDoGet(),
    imageTest: testImageExtraction(),
    cacheTest: testCache()
  };
  
  console.log('📊 Diagnostic Results:', results);
  
  // Check if all tests passed
  const allPassed = Object.values(results).every(result => result.success);
  
  if (allPassed) {
    console.log('✅ All diagnostic tests passed!');
  } else {
    console.log('❌ Some diagnostic tests failed');
  }
  
  return {
    success: allPassed,
    results: results
  };
}

/**
 * Quick deployment test
 */
function testDeployment() {
  try {
    console.log('🚀 Testing deployment...');
    
    // Test basic response
    const result = doGet({});
    
    if (result) {
      console.log('✅ Deployment test passed');
      console.log('Response type:', typeof result);
      return {
        success: true,
        message: 'Deployment is working correctly'
      };
    } else {
      throw new Error('doGet returned null or undefined');
    }
    
  } catch (error) {
    console.error('❌ Deployment test failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}
