# Google Apps Script Service Troubleshooting Guide

## Current Issue: JSONP Script Error

The error `JSONP script error` indicates that the Google Apps Script is not returning a valid response. Here's how to diagnose and fix it:

## 🔍 **Step 1: Test the Service**

### **Option A: Use the Test Page**
1. Open `http://localhost:8000/test-service.html` in your browser
2. Click "Test URL Accessibility" to check if the service is reachable
3. Click "Test JSONP" to see the exact error
4. Click "Test Direct Fetch" to see the raw response

### **Option B: Use Browser Console**
1. Open your quiz app in the browser
2. Open Developer Tools (F12)
3. Run these commands in the console:

```javascript
// Test the service URL
testServiceUrl()

// Test JSONP
testGoogleService()

// Check the current URL
console.log('Service URL:', GOOGLE_SERVICE_URL)
```

## 🔧 **Step 2: Check Google Apps Script**

### **A. Verify Deployment**
1. Go to your Google Apps Script project
2. Check if the script is deployed as a web app
3. Verify the deployment URL matches `GOOGLE_SERVICE_URL` in `script.js`
4. Make sure the deployment is set to "Execute as: Me" and "Who has access: Anyone"

### **B. Run Diagnostic Tests**
1. In Google Apps Script, add the diagnostic functions from `google-apps-script-diagnostic.gs`
2. Run these functions in the Apps Script editor:

```javascript
// Basic functionality test
simpleTest()

// Test the web app function
testDoGet()

// Test image extraction
testImageExtraction()

// Full diagnostic
runFullDiagnostic()
```

### **C. Check for Errors**
1. Look at the Apps Script execution log
2. Check for any error messages in the console
3. Verify the sheet name is correct (`Quiz Data`)

## 🚨 **Common Issues and Solutions**

### **Issue 1: Service URL Changed**
**Symptoms**: JSONP timeout or 404 error
**Solution**: 
1. Redeploy your Google Apps Script
2. Copy the new deployment URL
3. Update `GOOGLE_SERVICE_URL` in `script.js`

### **Issue 2: Sheet Name Mismatch**
**Symptoms**: "Sheet not found" error
**Solution**:
1. Check your Google Sheet tab name
2. Update `SHEET_NAME` in the Apps Script (default: `Quiz Data`)

### **Issue 3: Image Extraction Fails**
**Symptoms**: "No image found in cell" error
**Solution**:
1. Ensure images are inserted using "Insert → Image → Image in cell"
2. Check that images are actually embedded (not just links)
3. Run `testImageExtraction()` to diagnose

### **Issue 4: CORS Issues**
**Symptoms**: Direct fetch fails but JSONP works
**Solution**: This is expected - use JSONP (already implemented)

### **Issue 5: Script Execution Timeout**
**Symptoms**: 30-second timeout error
**Solution**:
1. Reduce the number of images in your sheet
2. Check if images are too large
3. Consider using the cache feature

## 🛠️ **Step 3: Debugging Steps**

### **1. Check Service Response**
```javascript
// In browser console
fetch('YOUR_SERVICE_URL')
  .then(response => response.text())
  .then(text => console.log(text))
  .catch(error => console.error(error))
```

### **2. Test Individual Functions**
```javascript
// In Apps Script console
generateQuizJSON()
```

### **3. Check Cache Status**
```javascript
// In Apps Script console
getCacheStatus()
```

### **4. Clear Cache if Needed**
```javascript
// In Apps Script console
clearCache()
```

## 📋 **Step 4: Verification Checklist**

- [ ] Google Apps Script is deployed as web app
- [ ] Deployment URL is correct in `script.js`
- [ ] Sheet name matches `SHEET_NAME` in Apps Script
- [ ] Images are properly embedded in cells
- [ ] Headers match expected format
- [ ] No errors in Apps Script execution log
- [ ] Service responds to direct fetch
- [ ] JSONP callback is working

## 🔄 **Step 5: Fallback Options**

If the Google service continues to fail:

### **Option A: Use Local File**
1. Click "Use Local File" button in the error message
2. The app will load from `quiz-data-base64.json`

### **Option B: Generate Local File**
1. Run the Python converter: `python3 convert_to_base64.py`
2. This creates `quiz-data-base64.json` from `quiz-data.json`

### **Option C: Manual Cache**
1. Run `generateQuizJSON()` in Apps Script
2. Copy the output and save as `quiz-data-base64.json`

## 📞 **Getting Help**

If you're still having issues:

1. **Check the browser console** for detailed error messages
2. **Run the diagnostic tests** in Apps Script
3. **Verify your Google Sheet setup** matches the expected format
4. **Test with a simple sheet** with just 1-2 questions first

## 🎯 **Quick Fix Commands**

```javascript
// In browser console - test everything
testServiceUrl()
testGoogleService()
console.log('Current URL:', GOOGLE_SERVICE_URL)

// In Apps Script console - diagnose issues
runFullDiagnostic()
testDeployment()
getCacheStatus()
```
