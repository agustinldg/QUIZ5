#!/usr/bin/env python3
"""
Quiz Data Converter: Converts quiz-data.json to quiz-data-base64.json
Downloads images from URLs and converts them to base64 strings
"""

import json
import requests
import base64
import time
from pathlib import Path
from urllib.parse import urlparse
import sys

def download_image_to_base64(url, timeout=30):
    """
    Download an image from URL and convert to base64
    """
    try:
        print(f"Downloading: {url}")
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()
        
        # Get content type from response headers
        content_type = response.headers.get('content-type', 'image/jpeg')
        
        # Convert to base64
        image_base64 = base64.b64encode(response.content).decode('utf-8')
        
        # Return data URL format
        return f"data:{content_type};base64,{image_base64}"
        
    except requests.exceptions.RequestException as e:
        print(f"Error downloading {url}: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error with {url}: {e}")
        return None

def convert_quiz_data(input_file, output_file):
    """
    Convert quiz data from URL-based to base64-based
    """
    try:
        # Load the original quiz data
        print(f"Loading quiz data from {input_file}...")
        with open(input_file, 'r', encoding='utf-8') as f:
            quiz_data = json.load(f)
        
        print(f"Found {len(quiz_data['questions'])} questions to convert")
        
        # Convert each question
        for i, question in enumerate(quiz_data['questions']):
            print(f"\nProcessing question {i+1}/{len(quiz_data['questions'])}")
            
            # Convert prompt image
            if 'prompt' in question and 'imageUrl' in question['prompt']:
                print(f"  Converting prompt image...")
                base64_image = download_image_to_base64(question['prompt']['imageUrl'])
                if base64_image:
                    question['prompt']['imageBase64'] = base64_image
                    # Keep the original URL for reference
                    question['prompt']['originalImageUrl'] = question['prompt']['imageUrl']
                    del question['prompt']['imageUrl']
                else:
                    print(f"  Warning: Failed to convert prompt image for question {i+1}")
            
            # Convert choice images
            if 'choices' in question:
                for j, choice in enumerate(question['choices']):
                    if 'imageUrl' in choice:
                        print(f"  Converting choice {j+1} image...")
                        base64_image = download_image_to_base64(choice['imageUrl'])
                        if base64_image:
                            choice['imageBase64'] = base64_image
                            # Keep the original URL for reference
                            choice['originalImageUrl'] = choice['imageUrl']
                            del choice['imageUrl']
                        else:
                            print(f"  Warning: Failed to convert choice {j+1} image for question {i+1}")
            
            # Add a small delay to be respectful to the image servers
            time.sleep(0.5)
        
        # Update metadata
        quiz_data['metadata']['imageFormat'] = 'base64'
        quiz_data['metadata']['convertedFrom'] = input_file
        quiz_data['metadata']['conversionDate'] = time.strftime('%Y-%m-%d %H:%M:%S')
        
        # Save the converted data
        print(f"\nSaving converted quiz data to {output_file}...")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(quiz_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Successfully converted quiz data!")
        print(f"📁 Output file: {output_file}")
        
        # Calculate file sizes
        input_size = Path(input_file).stat().st_size / 1024  # KB
        output_size = Path(output_file).stat().st_size / 1024  # KB
        
        print(f"📊 File sizes:")
        print(f"   Input:  {input_size:.1f} KB")
        print(f"   Output: {output_size:.1f} KB")
        print(f"   Ratio:  {output_size/input_size:.1f}x larger")
        
    except FileNotFoundError:
        print(f"❌ Error: Could not find {input_file}")
        print("Make sure the file exists in the current directory")
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in {input_file}: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def main():
    """
    Main function
    """
    input_file = "quiz-data.json"
    output_file = "quiz-data-base64.json"
    
    print("🔄 Quiz Data Converter: URL to Base64")
    print("=" * 50)
    
    # Check if input file exists
    if not Path(input_file).exists():
        print(f"❌ Error: {input_file} not found!")
        print("Please make sure you have quiz-data.json in the current directory")
        sys.exit(1)
    
    # Check if output file already exists
    if Path(output_file).exists():
        response = input(f"⚠️  {output_file} already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Conversion cancelled.")
            sys.exit(0)
    
    # Install requests if not available
    try:
        import requests
    except ImportError:
        print("❌ Error: 'requests' library not found!")
        print("Please install it with: pip install requests")
        sys.exit(1)
    
    # Start conversion
    convert_quiz_data(input_file, output_file)

if __name__ == "__main__":
    main()
