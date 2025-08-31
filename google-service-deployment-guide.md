# Google Apps Script Service Deployment Guide

This guide will help you deploy your Google Apps Script as a web service that your quiz app can call.

## 🚀 **Step 1: Deploy as Web App**

### **1.1 Open Google Apps Script**
1. Go to [script.google.com](https://script.google.com)
2. Open your "Quiz Generator Service" project

### **1.2 Deploy the Service**
1. Click **"Deploy"** in the top menu
2. Select **"New deployment"**
3. Click **"Select type"** → **"Web app"**

### **1.3 Configure the Deployment**
Fill in the deployment settings:

| Setting | Value | Description |
|---------|-------|-------------|
| **Description** | `Quiz Service v1.0` | Version description |
| **Execute as** | `Me` | Run as your account |
| **Who has access** | `Anyone` | Allow public access |

### **1.4 Deploy**
1. Click **"Deploy"**
2. **Authorize** the app when prompted
3. **Copy the Web App URL** (you'll need this)

## 🔗 **Step 2: Get Your Service URL**

After deployment, you'll get a URL like:
```
https://script.google.com/macros/s/AKfycbz.../exec
```

**Copy this URL** - you'll need it for your quiz app.

## ⚙️ **Step 3: Configure Your Quiz App**

### **3.1 Update the Service URL**
In your `script.js` file, update the `GOOGLE_SERVICE_URL`:

```javascript
const GOOGLE_SERVICE_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

### **3.2 Test the Connection**
1. Open your quiz app
2. Check the browser console
3. You should see: "Loading quiz data from Google service..."

## 🔧 **Step 4: How It Works**

### **4.1 Service Flow**
1. **Quiz app** calls your Google service URL
2. **Google service** reads your Google Sheet
3. **Service** extracts images and converts to base64
4. **Service** generates JSON file in Google Drive
5. **Quiz app** downloads the JSON file
6. **Quiz app** loads the quiz data

### **4.2 Error Handling**
- If Google service fails → Falls back to local file
- If local file fails → Shows error message
- Retry buttons for both options

## 🧪 **Step 5: Testing**

### **5.1 Test the Service**
1. **Run** `testQuizGeneration()` in Google Apps Script
2. **Check** that a JSON file is created in Google Drive
3. **Verify** the file contains your quiz data

### **5.2 Test the Web App**
1. **Visit** your deployed URL directly
2. **Check** that it returns JSON response
3. **Verify** the response contains `success: true`

### **5.3 Test the Quiz App**
1. **Open** your quiz app
2. **Check** browser console for loading messages
3. **Verify** quiz loads with data from Google service

## 🔄 **Step 6: Updating the Service**

### **6.1 Make Changes**
1. Edit your Google Apps Script code
2. Save the project

### **6.2 Redeploy**
1. Click **"Deploy"** → **"Manage deployments"**
2. Click **"Edit"** on your deployment
3. Click **"New version"**
4. Click **"Deploy"**

### **6.3 Update URL (if needed)**
- If you create a new deployment, you'll get a new URL
- Update `GOOGLE_SERVICE_URL` in your quiz app

## 🛡️ **Step 7: Security & Permissions**

### **7.1 Service Permissions**
- **Execute as**: Your account (has access to your Google Drive)
- **Who has access**: Anyone (public web service)

### **7.2 Google Sheet Access**
- Make sure your Google Sheet is accessible
- The service needs read access to your sheet

### **7.3 CORS Issues**
If you get CORS errors:
1. Add this to your Google Apps Script `doGet` function:
```javascript
return ContentService
  .createTextOutput(JSON.stringify(result))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeader('Access-Control-Allow-Origin', '*');
```

## 📋 **Step 8: Troubleshooting**

### **8.1 Common Issues**

**Service returns error:**
- Check Google Apps Script logs
- Verify sheet name and column headers
- Ensure images are properly inserted

**CORS errors:**
- Add CORS headers to your service
- Check browser console for details

**Authentication errors:**
- Make sure service is deployed as "Anyone"
- Check Google Apps Script permissions

### **8.2 Debug Steps**
1. **Test service directly**: Visit the URL in browser
2. **Check Google Apps Script logs**: View → Execution log
3. **Verify Google Drive**: Check if JSON files are created
4. **Test quiz app**: Check browser console for errors

## 🎯 **Step 9: Production Setup**

### **9.1 Optimize Performance**
- Add caching to your service
- Compress images before base64 conversion
- Limit the number of questions processed

### **9.2 Monitor Usage**
- Check Google Apps Script quotas
- Monitor Google Drive storage
- Track service usage

### **9.3 Backup Strategy**
- Keep local JSON files as backup
- Regular exports of your Google Sheet
- Version control for your service code

## ✅ **Success Checklist**

- [ ] Google Apps Script deployed as web app
- [ ] Service URL copied and configured
- [ ] Quiz app loads data from service
- [ ] Error handling works (fallback to local)
- [ ] Service generates JSON files correctly
- [ ] Images are properly converted to base64
- [ ] Quiz app displays questions correctly

## 🚀 **You're Ready!**

Your quiz app is now connected to your Google Sheets service! You can:
- Add questions to your Google Sheet
- Run the service to generate new quiz data
- Your quiz app will automatically load the latest data

The system is now fully automated and ready for production use! 🎉
