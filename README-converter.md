# Quiz Data Converter

This Python script converts your `quiz-data.json` file (with image URLs) to `quiz-data-base64.json` (with embedded base64 images).

## What It Does

1. **Downloads Images**: Fetches all images from the URLs in your quiz data
2. **Converts to Base64**: Converts each image to a base64 string
3. **Creates New JSON**: Generates a new file with embedded images
4. **Preserves Original URLs**: Keeps the original URLs as reference

## Requirements

- Python 3.6 or higher
- `requests` library

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   Or install manually:
   ```bash
   pip install requests
   ```

## Usage

1. **Make sure you have `quiz-data.json` in the current directory**

2. **Run the conversion script:**
   ```bash
   python convert_to_base64.py
   ```

3. **The script will:**
   - Download all images from URLs
   - Convert them to base64
   - Create `quiz-data-base64.json`
   - Show progress and file size comparison

## Output

The script creates a new `quiz-data-base64.json` file with:
- All images embedded as base64 strings
- Original URLs preserved as `originalImageUrl` for reference
- Updated metadata showing conversion details
- File size comparison (base64 files are typically 33% larger)

## Features

- **Progress Tracking**: Shows which question/image is being processed
- **Error Handling**: Gracefully handles failed downloads
- **Rate Limiting**: Adds delays between downloads to be respectful to servers
- **File Size Analysis**: Shows before/after file sizes
- **Overwrite Protection**: Asks before overwriting existing files

## Example Output

```
🔄 Quiz Data Converter: URL to Base64
==================================================
Loading quiz data from quiz-data.json...
Found 10 questions to convert

Processing question 1/10
  Converting prompt image...
Downloading: https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop
  Converting choice 1 image...
Downloading: https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop
...

✅ Successfully converted quiz data!
📁 Output file: quiz-data-base64.json
📊 File sizes:
   Input:  8.2 KB
   Output: 12,847.3 KB
   Ratio:  1566.7x larger
```

## Notes

- **Large File Size**: Base64 images make the JSON file much bigger
- **Download Time**: Converting 10 questions with 3 images each = 40 image downloads
- **Internet Required**: Script needs internet access to download images
- **Server Respect**: Script adds delays between downloads to avoid overwhelming servers

## Troubleshooting

- **"requests library not found"**: Run `pip install requests`
- **"quiz-data.json not found"**: Make sure the file is in the same directory
- **Download errors**: Check your internet connection and the image URLs
- **Large file size**: This is normal - base64 images are much larger than URLs
