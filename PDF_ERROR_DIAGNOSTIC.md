# PDF Generation Error Diagnostic Guide

## Current Problem
- **Error**: 500 Internal Server Error
- **Endpoint**: `POST https://wathiq-7eby.onrender.com/generate-pdf`
- **Symptom**: Arabic text appears as garbled characters (þÞþāpŽþ¸þßþ•)

## How to Get the Exact Error

### Method 1: Browser Console (Easiest)
1. Open Chrome DevTools (F12)
2. Go to **Console** tab
3. Try generating a PDF
4. Look for these log messages:
   - `[ArabicPDFService] PDF generation error (JSON):` - This shows the error object
   - `[ArabicPDFService] Full error details:` - This shows the complete error
   - `[ArabicPDFService] Error details:` - This shows specific error details
   - `[ArabicPDFService] Error exitCode:` - This shows Python exit code

**Copy and paste ALL of these error messages here.**

### Method 2: Network Tab Response
1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Try generating a PDF
4. Click on the `generate-pdf` request (the one with red status)
5. Click on **Response** tab
6. You should see a JSON object like:
   ```json
   {
     "error": "PDF generation failed",
     "message": "...",
     "exitCode": 1,
     "details": "..."
   }
   ```

**Copy and paste the ENTIRE Response content here.**

### Method 3: Render Logs (Most Detailed)
1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service
3. Go to **Logs** tab
4. Try generating a PDF
5. Look for these log messages:
   - `[PDF Generation] Python script failed with code X`
   - `[PDF Generation] Error output: ...`
   - `ERROR: Font file not found: ...`
   - `ERROR: PDF generation failed: ...`
   - `INFO: Using font: ...`

**Copy and paste ALL relevant log lines here.**

## Most Likely Causes

### 1. Missing Python Dependencies
**Symptoms**: Error about missing module (WeasyPrint, pydyf, etc.)
**Solution**: Install dependencies in Render's build process

### 2. Font Files Not Found
**Symptoms**: `ERROR: Font file not found: ...`
**Solution**: Ensure `backend/fonts/Dubai-Regular.otf` and `backend/fonts/Dubai-Bold.ttf` exist

### 3. Python Not Available
**Symptoms**: `Failed to start Python subprocess`
**Solution**: Python needs to be installed on Render

### 4. WeasyPrint Installation Issue
**Symptoms**: Import errors or WeasyPrint crashes
**Solution**: WeasyPrint needs system dependencies (cairo, pango, etc.)

### 5. Data Format Issue
**Symptoms**: JSON parsing errors or missing data fields
**Solution**: Frontend sending wrong data format

## What I Need From You

Please provide:
1. **Browser Console error messages** (Method 1)
2. **Network Response content** (Method 2)  
3. **Render logs** (Method 3) - especially lines with `[PDF Generation]` or `ERROR:`

With this information, I can identify the exact problem and fix it.

