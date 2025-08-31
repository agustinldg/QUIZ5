# Google Sheets Quiz Service Setup Guide

This guide will help you set up a Google Sheets service that automatically generates JSON files with embedded base64 images for your quiz app.

## 📋 Prerequisites

- Google account
- Google Sheets access
- Google Drive access
- Basic understanding of Google Apps Script

## 🚀 Step-by-Step Setup

### 1. Create Your Google Sheet

1. **Open Google Sheets** and create a new spreadsheet
2. **Name your sheet** "Quiz Data" (or update the script to match your name)
3. **Set up headers** in the first row:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Pregunta | Imagen Pregunta | Texto pregunta | Imagen respuesta correcta | Texto respuesta correcta | Imagen respuesta 2 | Texto respuesta 2 | Imagen respuesta 3 | Texto respuesta 3 | Imagen respuesta 4 | Texto respuesta 4 |

### 2. Add Your Quiz Data

Fill in your quiz data starting from row 2:

- **Column A**: Question number (1, 2, 3, etc.)
- **Column B**: Question image (insert image directly into cell)
- **Column C**: Question caption text
- **Column D**: Correct answer image (insert image directly into cell - always the correct answer)
- **Column E**: Correct answer caption text
- **Column F**: Answer 2 image (insert image directly into cell)
- **Column G**: Answer 2 caption text
- **Column H**: Answer 3 image (insert image directly into cell)
- **Column I**: Answer 3 caption text
- **Column J**: Answer 4 image (insert image directly into cell)
- **Column K**: Answer 4 caption text

#### How to Insert Images into Cells:

**Recommended Method: Using Insert Menu**
1. **Select the cell** where you want to insert the image
2. **Go to Insert → Image → Image in cell**
3. **Choose your image** from:
   - **Upload from computer**
   - **Search the web** (Google Images)
   - **Google Drive**
   - **By URL**
4. **Adjust the image** if needed (resize, crop)
5. **Click "Insert"** to place the image in the cell
6. **Repeat** for all image columns (B, D, F, H, J)

**Alternative Method: Using IMAGE Formula**
1. **Select the cell** where you want to insert the image
2. **Type the IMAGE formula**: `=IMAGE("URL")`
3. **Replace "URL"** with the actual image URL
4. **Example**: `=IMAGE("https://example.com/image.jpg")`
5. **Press Enter** to display the image
6. **Repeat** for all image columns (B, D, F, H, J)

**Note**: The script now supports both methods. For embedded images (Method 1), it extracts the image data directly. For IMAGE formulas (Method 2), it extracts the URL and downloads the image.

### 3. Set Up Google Apps Script

1. **Open your Google Sheet**
2. **Go to Extensions → Apps Script**
3. **Delete the default code** and paste the entire `google-sheets-quiz-service.gs` content
4. **Save the project** (Ctrl+S or Cmd+S)
5. **Name your project** "Quiz Generator Service"

### 4. Configure the Script

Update these variables in the script if needed:

```javascript
const SHEET_NAME = 'Quiz Data'; // Your sheet name
const SPREADSHEET_ID = ''; // Leave empty for active spreadsheet
```

### 5. Test the Script

1. **In Apps Script**, click the **"Select function"** dropdown
2. **Choose `testQuizGeneration`**
3. **Click the "Run"** button
4. **Grant permissions** when prompted
5. **Check the logs** for any errors

### 6. Deploy as Web App (Optional)

To make the service accessible via HTTP:

1. **Click "Deploy" → "New deployment"**
2. **Choose "Web app"**
3. **Set access** to "Anyone" or "Anyone with Google account"
4. **Click "Deploy"**
5. **Copy the web app URL**

## 📊 Expected Sheet Format

Here's an example of how your sheet should look:

| Pregunta | Imagen Pregunta | Texto pregunta | Imagen respuesta correcta | Texto respuesta correcta | Imagen respuesta 2 | Texto respuesta 2 | Imagen respuesta 3 | Texto respuesta 3 | Imagen respuesta 4 | Texto respuesta 4 |
|----------|-----------------|----------------|---------------------------|---------------------------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|
| 1 | [Insert Image] | What is this animal? | [Insert Image] | A cat | [Insert Image] | A dog | [Insert Image] | A bird | [Insert Image] | A fish |
| 2 | [Insert Image] | What color is this? | [Insert Image] | Red | [Insert Image] | Blue | [Insert Image] | Green | [Insert Image] | Yellow |

## 🔧 Available Functions

The script provides several functions:

### Main Functions
- **`generateQuizJSON()`** - Main function to generate the quiz JSON
- **`testQuizGeneration()`** - Test function to run the generation
- **`doGet(e)`** - Web app function for HTTP access

### Utility Functions
- **`getLatestQuizFile()`** - Get the most recently generated file
- **`cleanupOldQuizFiles()`** - Remove old files (keeps latest 5)

## 📁 Output

The script will create a JSON file in your Google Drive with:

- **Filename**: `quiz-data-YYYY-MM-DD.json`
- **Format**: Complete quiz data with embedded base64 images
- **Structure**: Compatible with your quiz app

## 🔗 Integration with Your Quiz App

To use the generated JSON in your quiz app:

### Option 1: Direct Google Drive URL
```javascript
// In your quiz app
const response = await fetch('https://drive.google.com/uc?export=download&id=YOUR_FILE_ID');
const quizData = await response.json();
```

### Option 2: Web App URL
```javascript
// If you deployed as web app
const response = await fetch('YOUR_WEB_APP_URL');
const result = await response.json();
// result.fileUrl contains the direct link to the JSON
```

### Option 3: Manual Download
1. Run the script in Apps Script
2. Check Google Drive for the generated file
3. Download and use locally

## ⚠️ Important Notes

### Embedded Images
- **Insert images directly into cells** (Insert → Image → Image in cell)
- **Supported formats**: JPG, PNG, GIF, WebP
- **Size limits**: Google Apps Script has memory limits (~50MB total)
- **One image per cell** (the script will use the first image if multiple are found)

### Processing Time
- **Depends on image count**: Each image takes 2-5 seconds
- **10 questions × 5 images = ~50-250 seconds**
- **Progress shown in logs**

### File Size
- **Base64 images are ~33% larger** than original files
- **Large files may take time to generate**
- **Consider image optimization** before adding to sheet

## 🛠️ Troubleshooting

### Common Issues

**"Sheet not found"**
- Check the `SHEET_NAME` variable matches your sheet name
- Ensure the sheet exists in your spreadsheet

**"Header mismatch"**
- Verify your headers exactly match the expected format
- Check for extra spaces or typos

**"Image extraction failed"**
- Verify images are inserted into the correct cells
- Check if images are properly embedded (not just linked)
- Ensure images are in supported formats

**"Script timeout"**
- Reduce number of questions per run
- Optimize image sizes before adding to sheet
- Run in smaller batches

### Debug Tips

1. **Check logs** in Apps Script console
2. **Test with 1-2 questions** first
3. **Verify images are properly embedded** in cells
4. **Check file permissions** in Google Drive

## 🔄 Automation

### Manual Trigger
- Run `generateQuizJSON()` whenever you update your sheet

### Time-based Trigger
1. **In Apps Script**, go to "Triggers"
2. **Click "Add trigger"**
3. **Set function** to `generateQuizJSON`
4. **Set frequency** (daily, weekly, etc.)
5. **Save trigger**

### Webhook Trigger
- Deploy as web app
- Call the web app URL from external systems

## 📈 Best Practices

1. **Optimize images** before adding URLs to sheet
2. **Use consistent image formats** (JPG recommended)
3. **Test with small datasets** first
4. **Monitor file sizes** in Google Drive
5. **Regular cleanup** of old files
6. **Backup your sheet** regularly

## 🆘 Support

If you encounter issues:

1. **Check the logs** in Apps Script console
2. **Verify your sheet format** matches the example
3. **Test with a single question** first
4. **Ensure all images are properly embedded** in cells
5. **Check Google Apps Script quotas** and limits
