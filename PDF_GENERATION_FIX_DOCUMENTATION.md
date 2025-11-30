# PDF Generation Fix - Complete Documentation

## Problem Summary

The PDF generation feature was failing with multiple issues:
1. **404 Not Found** - Frontend couldn't reach the backend endpoint
2. **500 Internal Server Error** - Backend couldn't find the Python script
3. **Garbled Arabic Text** - Arabic characters appeared as corrupted symbols (e.g., `þÞþāpŽþ¸þßþ•`)

## Final Solution (Shortcut)

**The root cause was missing files in the Docker image.** The Dockerfile wasn't copying the Python script and fonts directory.

### Quick Fix:
```dockerfile
# Add these lines to Dockerfile after line 49:
COPY backend/generate_pdf.py ./
COPY backend/fonts/ ./fonts/
```

**That's it!** Once these files were included in the Docker image, everything worked.

---

## Detailed Problem Analysis

### Issue 1: 404 Not Found Error

**Error Message:**
```
POST https://wathiq-7eby.onrender.com/api/generate-pdf 404 (Not Found)
```

**Root Cause:**
- Frontend was incorrectly appending `/api/` prefix to `VITE_BACKEND_URL`
- When `VITE_BACKEND_URL=https://wathiq-7eby.onrender.com`, the frontend was calling `/api/generate-pdf` instead of `/generate-pdf`

**Solution Applied:**
- Modified `src/services/ArabicPDFService.ts` to remove `/api/` prefix when using explicit backend URL
- Added runtime fallback to infer Render URL if `VITE_BACKEND_URL` not set at build time

**Code Change:**
```typescript
// Before:
endpoint = `${backendBase}/api/generate-pdf`;

// After:
endpoint = `${backendBase}/generate-pdf`;
```

**Status:** ✅ Fixed

---

### Issue 2: 500 Internal Server Error - File Not Found

**Error Message:**
```json
{
    "error": "PDF generation failed",
    "message": "python3: can't open file '/app/generate_pdf.py': [Errno 2] No such file or directory\n",
    "exitCode": 2
}
```

**Root Cause:**
- The Dockerfile was copying `server.js` to `/app/` but **NOT** copying `generate_pdf.py` or the `fonts/` directory
- When `server.js` tried to spawn the Python script using `path.join(__dirname, 'generate_pdf.py')`, it looked for `/app/generate_pdf.py` which didn't exist

**Solution Applied:**
- Added `COPY backend/generate_pdf.py ./` to Dockerfile
- Added `COPY backend/fonts/ ./fonts/` to Dockerfile

**Dockerfile Changes:**
```dockerfile
# Copy backend source (excluding node_modules)
COPY backend/server.js ./
COPY backend/generate_pdf.py ./          # ← ADDED
COPY backend/assets/ ./assets/
COPY backend/fonts/ ./fonts/             # ← ADDED
```

**Status:** ✅ Fixed (This was the final fix that made everything work)

---

### Issue 3: Garbled Arabic Text

**Error Symptom:**
- Arabic text appeared as corrupted characters: `þÞþāpŽþ¸þßþ• þòþāpîþôþßþ.`
- Should have been: "تقرير واثق اليومي الشامل"

**Root Cause:**
- Font loading issues in WeasyPrint
- Initial implementation used `data:` URIs for fonts, which WeasyPrint doesn't handle well
- Missing `base_url` configuration for WeasyPrint to resolve relative font paths
- Missing Arabic typography settings (`unicode-range`, `font-feature-settings`)

**Solutions Applied:**

#### 3.1 Font Loading Method
**What We Tried:**
- ❌ Using `data:` URIs (Base64 encoded fonts) - WeasyPrint couldn't load them reliably
- ✅ Using relative file paths with proper `base_url` configuration

**Code Change in `backend/generate_pdf.py`:**
```python
# Before (didn't work):
@font-face {
    font-family: 'Dubai';
    src: url("data:font/opentype;base64,...") format('opentype');
}

# After (works):
@font-face {
    font-family: 'Dubai';
    src: url("fonts/Dubai-Regular.otf") format('opentype');
}
```

#### 3.2 WeasyPrint base_url Configuration
**What We Tried:**
- ❌ Not setting `base_url` - WeasyPrint couldn't resolve relative font paths
- ✅ Setting `base_url` to script directory

**Code Change:**
```python
# In generate_pdf.py
script_dir = path.dirname(path.abspath(__file__))
html = HTML(string=html_content_utf8, base_url=script_dir)
```

#### 3.3 Arabic Typography Settings
**What We Tried:**
- ❌ Basic `@font-face` without `unicode-range` - fonts didn't apply to Arabic characters
- ✅ Added `unicode-range` to specify Arabic character ranges
- ✅ Added `font-feature-settings` for ligatures and contextual forms

**Code Change:**
```css
@font-face {
    font-family: 'Dubai';
    src: url("fonts/Dubai-Regular.otf") format('opentype');
    font-weight: normal;
    font-style: normal;
    unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF; /* ← ADDED */
}

body {
    font-family: 'Dubai', 'Arial Unicode MS', 'Tahoma', sans-serif;
    direction: rtl;
    text-align: right;
    font-feature-settings: "liga" on, "calt" on; /* ← ADDED */
}
```

**Status:** ✅ Fixed

---

## What We Tried That Didn't Work

### 1. Data URI Font Encoding
- **Attempt:** Embedding fonts as Base64 `data:` URIs in CSS
- **Why It Failed:** WeasyPrint has inconsistent support for data URIs, especially for fonts
- **Lesson:** Always use file paths with proper `base_url` for WeasyPrint

### 2. Absolute Font Paths
- **Attempt:** Using absolute paths like `/app/fonts/Dubai-Regular.otf`
- **Why It Failed:** Paths need to be relative to `base_url` for WeasyPrint to resolve them correctly
- **Lesson:** Use relative paths and set `base_url` to the directory containing the fonts

### 3. Missing base_url
- **Attempt:** Creating HTML without specifying `base_url` parameter
- **Why It Failed:** WeasyPrint couldn't resolve relative font paths without knowing the base directory
- **Lesson:** Always set `base_url` when using relative paths in WeasyPrint

### 4. Basic Font-Face Without Unicode Range
- **Attempt:** Simple `@font-face` declaration without `unicode-range`
- **Why It Failed:** Fonts didn't apply to Arabic Unicode ranges
- **Lesson:** Explicitly specify `unicode-range` for non-Latin scripts

### 5. Missing Font Feature Settings
- **Attempt:** Using fonts without `font-feature-settings`
- **Why It Failed:** Arabic requires ligatures and contextual alternates for proper rendering
- **Lesson:** Enable `liga` (ligatures) and `calt` (contextual alternates) for Arabic

### 6. Frontend URL Construction Issues
- **Attempt:** Hardcoding `/api/` prefix in frontend
- **Why It Failed:** Backend endpoint is `/generate-pdf`, not `/api/generate-pdf`
- **Lesson:** Match frontend endpoint construction to actual backend routes

---

## Complete Working Solution

### 1. Dockerfile (Critical Fix)
```dockerfile
# Copy backend source (excluding node_modules)
COPY backend/server.js ./
COPY backend/generate_pdf.py ./          # ← MUST INCLUDE
COPY backend/assets/ ./assets/
COPY backend/fonts/ ./fonts/             # ← MUST INCLUDE
```

### 2. Python Script (`backend/generate_pdf.py`)

**Font Path Resolution:**
```python
script_dir = path.dirname(path.abspath(__file__))
font_dir = path.join(script_dir, 'fonts')

# Convert absolute paths to relative paths
def font_to_relative_path(font_path: str, base_dir: str):
    abs_font = path.abspath(font_path)
    abs_base = path.abspath(base_dir)
    rel_path = path.relpath(abs_font, abs_base)
    return rel_path.replace('\\', '/'), 'opentype'
```

**HTML Template with Arabic Support:**
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Dubai';
            src: url("fonts/Dubai-Regular.otf") format('opentype');
            font-weight: normal;
            font-style: normal;
            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
        }
        @font-face {
            font-family: 'Dubai';
            src: url("fonts/Dubai-Bold.ttf") format('truetype');
            font-weight: bold;
            font-style: normal;
            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
        }
        body {
            font-family: 'Dubai', 'Arial Unicode MS', 'Tahoma', sans-serif;
            direction: rtl;
            text-align: right;
            font-feature-settings: "liga" on, "calt" on;
        }
    </style>
</head>
<body>
    <!-- Arabic content -->
</body>
</html>
```

**WeasyPrint Configuration:**
```python
script_dir = path.dirname(path.abspath(__file__))
html_content_utf8 = final_html_content.encode('utf-8')
html = HTML(string=html_content_utf8, base_url=script_dir)
pdf_bytes = html.write_pdf()
```

### 3. Frontend Service (`src/services/ArabicPDFService.ts`)

**Correct Endpoint Construction:**
```typescript
const backendBase = import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/+$/, '');

let endpoint: string;
if (backendBase && backendBase.length > 0) {
    endpoint = `${backendBase}/generate-pdf`; // ← No /api/ prefix
} else {
    // Runtime fallback for Render
    const hostname = window.location.hostname;
    if (hostname.includes('onrender.com')) {
        endpoint = `${window.location.protocol}//${hostname}/generate-pdf`;
    } else {
        endpoint = '/api/generate-pdf';
    }
}
```

**Error Handling:**
```typescript
if (!response.ok) {
    let errorDetails = '';
    try {
        const errorJson = await response.json();
        errorDetails = errorJson.message || errorJson.error || JSON.stringify(errorJson);
    } catch {
        const errorText = await response.text().catch(() => '');
        errorDetails = errorText || response.statusText;
    }
    throw new Error(`Failed to generate PDF (${response.status}): ${errorDetails}`);
}
```

### 4. Backend Server (`backend/server.js`)

**Error Reporting from Python:**
```javascript
pythonProcess.stderr.on('data', (chunk) => {
    errorOutput += chunk.toString();
});

pythonProcess.on('close', async (code) => {
    if (code !== 0) {
        console.error(`[PDF Generation] Python script failed with code ${code}`);
        console.error(`[PDF Generation] Error output: ${errorOutput}`);
        res.status(500).json({
            error: 'PDF_GENERATION_FAILED',
            message: `Failed to generate PDF: ${errorOutput}`,
            pythonExitCode: code,
        });
    }
});
```

---

## Key Lessons Learned

1. **Dockerfile is Critical:** Always verify that ALL required files are copied in the Dockerfile, not just the main server file
2. **WeasyPrint Font Loading:** Use relative file paths with `base_url`, not data URIs
3. **Arabic Typography:** Requires `unicode-range` and `font-feature-settings` for proper rendering
4. **Error Handling:** Capture and forward Python `stderr` to frontend for debugging
5. **Path Resolution:** Always use `path.join(__dirname, ...)` for cross-platform compatibility
6. **Environment Variables:** Handle both build-time and runtime environment variable resolution

---

## Verification Checklist

After deployment, verify:
- [ ] PDF generation endpoint returns 200 (not 404 or 500)
- [ ] Arabic text renders correctly (no garbled characters)
- [ ] Fonts are applied (text uses Dubai font, not fallback)
- [ ] RTL layout is correct (text aligned right, content flows right-to-left)
- [ ] Dates display in both Gregorian and Hijri formats
- [ ] All sections (Finance, Sales, Operations, Marketing) render properly
- [ ] Error messages are descriptive if generation fails

---

## Quick Reference (Shortcut)

**If PDF generation fails with "file not found":**
1. Check Dockerfile includes: `COPY backend/generate_pdf.py ./`
2. Check Dockerfile includes: `COPY backend/fonts/ ./fonts/`
3. Verify `server.js` uses: `path.join(__dirname, 'generate_pdf.py')`

**If Arabic text is garbled:**
1. Verify fonts use relative paths: `url("fonts/Dubai-Regular.otf")`
2. Verify `base_url` is set: `HTML(string=..., base_url=script_dir)`
3. Verify `unicode-range` includes Arabic ranges
4. Verify `font-feature-settings: "liga" on, "calt" on;`

**If getting 404:**
1. Check frontend doesn't add `/api/` to `VITE_BACKEND_URL`
2. Verify backend route is `/generate-pdf` (not `/api/generate-pdf`)

---

## Files Modified

1. `Dockerfile` - Added `generate_pdf.py` and `fonts/` directory copying
2. `backend/generate_pdf.py` - Fixed font loading, added `base_url`, Arabic typography
3. `backend/server.js` - Enhanced error reporting from Python subprocess
4. `src/services/ArabicPDFService.ts` - Fixed endpoint URL construction, improved error handling

---

## Date Created
November 25, 2025

## Status
✅ **RESOLVED** - PDF generation with Arabic text is now working correctly.

