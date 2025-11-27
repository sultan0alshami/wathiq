require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises; // Import fs.promises for async file operations
const cron = require('node-cron');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch'); // Use node-fetch explicitly

// Initialize Supabase client for notifications with custom fetch
let supabase = null;
const TRIP_BUCKET = process.env.TRIPS_BUCKET || 'trip-evidence';
if (process.env.SUPABASE_SERVICE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_SERVICE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        fetch: fetch // Use node-fetch instead of built-in fetch
      }
    }
  );
  console.log('[Backend] ✅ Supabase client initialized with node-fetch');
} else {
  console.warn('[Backend] ⚠️ Supabase credentials not found in environment');
}

let tripBucketEnsured = false;
async function ensureTripBucket() {
  if (!supabase || tripBucketEnsured) return;
  try {
    const { data, error } = await supabase.storage.getBucket(TRIP_BUCKET);
    if (error && error.message && !error.message.includes('not found')) {
      throw error;
    }
    if (!data) {
      const { error: createError } = await supabase.storage.createBucket(TRIP_BUCKET, {
        public: false,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB ceiling per photo
      });
      if (createError && !createError.message?.includes('already exists')) {
        throw createError;
      }
    }
    tripBucketEnsured = true;
  } catch (bucketError) {
    console.error('[Backend] ❌ Failed to ensure trip bucket:', bucketError.message || bucketError);
  }
}

// WhatsApp Cloud API config via environment variables
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';
const MANAGER_PHONE = process.env.MANAGER_PHONE || '';

async function sendWhatsAppDocument(pdfBuffer, filename) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID || !MANAGER_PHONE) {
    console.log('WhatsApp not configured; skipping send.');
    return;
  }
  try {
    const form = new FormData();
    form.append('messaging_product', 'whatsapp');
    form.append('type', 'application/pdf');
    form.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), filename);

    const uploadRes = await fetch(`https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
      body: form,
    });
    const uploadJson = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(`Upload failed: ${JSON.stringify(uploadJson)}`);

    const mediaId = uploadJson.id;
    const msgRes = await fetch(`https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: MANAGER_PHONE,
        type: 'document',
        document: { id: mediaId, filename },
      }),
    });
    const msgJson = await msgRes.json();
    if (!msgRes.ok) throw new Error(`Send failed: ${JSON.stringify(msgJson)}`);

    console.log('WhatsApp message sent successfully.');
  } catch (e) {
    console.error('Failed to send WhatsApp document:', e);
  }
}

async function runDailyReportAndSend() {
  try {
    const pythonExecutable = process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');
    const scriptPath = path.join(__dirname, 'generate_pdf.py');
    const dateStr = new Date().toISOString().slice(0, 10);
    const { gregorian, hijri } = deriveDateLabels(dateStr);
    // Expect the frontend-style payload to be available; fallback to a minimal shape
    const payload = {
      date: dateStr,
      gregorianDateLabel: gregorian,
      hijriDateLabel: hijri,
      finance: { currentLiquidity: '', entries: [] },
      sales: { customersContacted: 0, entries: [] },
      operations: { entries: [] },
      marketing: { tasks: [] },
      trips: { entries: [], pendingSync: 0, totalTrips: 0 },
    };
    const jsonData = JSON.stringify(payload);
    const tempFilePath = path.join(__dirname, `temp_data_${Date.now()}.json`);
    await fs.writeFile(tempFilePath, jsonData);
    const pythonProcess = spawn(pythonExecutable, [scriptPath, tempFilePath]);
    let pdfBuffer = Buffer.from('');
    let errorOutput = '';
    await new Promise((resolve) => {
      pythonProcess.stdout.on('data', (chunk) => { pdfBuffer = Buffer.concat([pdfBuffer, chunk]); });
      pythonProcess.stderr.on('data', (chunk) => { errorOutput += chunk.toString(); });
      pythonProcess.on('close', async (code) => {
        try { await fs.rm(tempFilePath, { force: true }); } catch (_) {}
        if (code === 0) {
          sendWhatsAppDocument(pdfBuffer, `wathiq-report-${Date.now()}.pdf`).catch(() => {});
        } else {
          console.error('Daily report generation failed:', errorOutput);
        }
        resolve();
      });
    });
  } catch (e) {
    console.error('Daily report job error:', e);
  }
}

// Every day at 18:00 local time
cron.schedule('0 18 * * *', () => {
  console.log('Running scheduled daily report...');
  runDailyReportAndSend();
});

const app = express();
const port = process.env.PORT || 5000; // Honor Cloud Run/Heroku-style PORT

function deriveDateLabels(dateInput) {
  const baseDate = dateInput ? new Date(dateInput) : new Date();
  const safeDate = Number.isNaN(baseDate.getTime()) ? new Date() : baseDate;
  const gregorian = new Intl.DateTimeFormat('ar-SA', { dateStyle: 'full' }).format(safeDate);
  let hijri = gregorian;
  try {
    hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { dateStyle: 'full' }).format(safeDate);
  } catch {
    // Ignore if hijri calendar isn't available in the current runtime.
  }
  return { gregorian, hijri };
}

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8080',
      'https://wathiq-7eby.onrender.com',
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options('/generate-pdf', cors(corsOptions));
app.options('/api/trips/sync', cors(corsOptions));
app.options('/trips/sync', cors(corsOptions));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Simple in-memory rate limiting (per IP)
const rateWindowMs = 15 * 60 * 1000; // 15 minutes
const maxRequests = 10;
const ipHits = new Map();

function rateLimitMiddleware(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const entry = ipHits.get(ip) || { count: 0, start: now };
  if (now - entry.start > rateWindowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  ipHits.set(ip, entry);
  if (entry.count > maxRequests) {
    return res.status(429).json({ message: 'Too many PDF generation requests. Please try again later.' });
  }
  next();
}

app.post('/generate-pdf', rateLimitMiddleware, async (req, res) => {
  console.log('Received request to generate PDF');
  const { data = {}, date } = req.body; // Data from your frontend
  const targetDate = date || new Date().toISOString().slice(0, 10);
  const { gregorian, hijri } = deriveDateLabels(targetDate);
  const payload = {
    ...data,
    date: targetDate,
    gregorianDateLabel: data.gregorianDateLabel || gregorian,
    hijriDateLabel: data.hijriDateLabel || hijri,
  };

  const pythonExecutable = process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');
  const scriptPath = path.join(__dirname, 'generate_pdf.py');
  const jsonData = JSON.stringify(payload);

  let tempFilePath;

  try {
    tempFilePath = path.join(__dirname, `temp_data_${Date.now()}.json`);
    await fs.writeFile(tempFilePath, jsonData);

    const pythonProcess = spawn(pythonExecutable, [scriptPath, tempFilePath]);

    let pdfBuffer = Buffer.from('');
    let errorOutput = '';

    pythonProcess.stdout.on('data', (chunk) => {
      pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
    });

    pythonProcess.stderr.on('data', (chunk) => {
      errorOutput += chunk.toString();
      console.error('[PDF Generation] Python stderr:', chunk.toString());
    });

    pythonProcess.on('close', async (code) => {
      console.log(`[PDF Generation] Python process exited with code ${code}`);
      if (code === 0) {
        // Fire-and-forget WhatsApp send (if configured)
        sendWhatsAppDocument(pdfBuffer, `wathiq-report-${Date.now()}.pdf`).catch(() => {});
        
        // Emit a broadcast notification to Supabase if configured
        if (process.env.SUPABASE_SERVICE_URL && process.env.SUPABASE_SERVICE_KEY) {
          console.log('[Backend] Attempting to emit Supabase notification...');
          console.log('[Backend] Using URL:', process.env.SUPABASE_SERVICE_URL);
          
          // Try Supabase client first
          try {
            const { data, error } = await supabase
              .from('notifications')
              .insert({
                user_id: null,
                is_broadcast: true,
                type: 'success',
                title: 'تم إنشاء تقرير PDF',
                message: `تم إنشاء التقرير بتاريخ ${date || 'اليوم'} بنجاح وهو متاح للتنزيل.`,
                created_at: new Date().toISOString(),
              });
            
            if (error) {
              console.error('[Backend] ❌ Supabase client failed:', error.message);
              throw new Error(`Supabase client error: ${error.message}`);
            } else {
              console.log('[Backend] ✅ Supabase notification emitted successfully via client!');
            }
          } catch (e) {
            console.error('[Backend] ⚠️ Supabase client failed, trying direct HTTP...');
            console.error('[Backend] Client error:', e?.message);
            
            // Fallback to direct HTTP request
            try {
              const response = await fetch(`${process.env.SUPABASE_SERVICE_URL}/rest/v1/notifications`, {
                method: 'POST',
                headers: {
                  'apikey': process.env.SUPABASE_SERVICE_KEY,
                  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                  user_id: null,
                  is_broadcast: true,
                  type: 'success',
                  title: 'تم إنشاء تقرير PDF',
                  message: `تم إنشاء التقرير بتاريخ ${date || 'اليوم'} بنجاح وهو متاح للتنزيل.`,
                  created_at: new Date().toISOString(),
                })
              });
              
              if (response.ok) {
                console.log('[Backend] ✅ Supabase notification emitted successfully via HTTP!');
              } else {
                const errorText = await response.text();
                console.error('[Backend] ❌ HTTP request failed:', response.status, errorText);
              }
            } catch (httpError) {
              console.error('[Backend] ❌ Both client and HTTP failed:', httpError?.message);
            }
          }
        } else {
          console.warn('[Backend] ⚠️ Supabase credentials not configured. Skipping notification.');
        }
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Vary', 'Origin');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');
        res.send(pdfBuffer);
      } else {
        console.error(`[PDF Generation] Python script failed with code ${code}`);
        console.error(`[PDF Generation] Error output: ${errorOutput}`);
        console.error(`[PDF Generation] PDF buffer length: ${pdfBuffer.length}`);
        
        // Return detailed error to help debug
        const errorMessage = errorOutput || 'Unknown error occurred during PDF generation';
        res.status(500).json({ 
          error: 'PDF generation failed',
          message: errorMessage,
          exitCode: code,
          details: 'Check backend logs for more information. Common issues: missing fonts, WeasyPrint errors, or invalid data format.'
        });
      }
      if (tempFilePath) {
        try {
          await fs.rm(tempFilePath, { force: true });
        } catch (e) {
          if (e && e.code !== 'ENOENT') console.error('Error deleting temp file:', e);
        }
      }
    });

    pythonProcess.on('error', async (err) => {
      console.error('[PDF Generation] Failed to start Python subprocess:', err);
      console.error('[PDF Generation] Python executable:', pythonExecutable);
      console.error('[PDF Generation] Script path:', scriptPath);
      res.status(500).json({ 
        error: 'Failed to start PDF generation process',
        message: err.message,
        details: `Python executable: ${pythonExecutable}, Script: ${scriptPath}`
      });
      if (tempFilePath) {
        try {
          await fs.rm(tempFilePath, { force: true });
        } catch (e) {
          if (e && e.code !== 'ENOENT') console.error('Error deleting temp file:', e);
        }
      }
    });
  } catch (err) {
    console.error('[PDF Generation] Exception in PDF generation process:', err);
    console.error('[PDF Generation] Stack trace:', err.stack);
    res.status(500).json({ 
      error: 'Internal server error during PDF generation',
      message: err.message,
      details: 'Check backend logs for full stack trace'
    });
    if (tempFilePath) {
      try {
        await fs.rm(tempFilePath, { force: true });
      } catch (e) {
        if (e && e.code !== 'ENOENT') console.error('Error deleting temp file:', e);
      }
    }
  }
});

const tripSyncHandler = async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ message: 'Supabase service credentials are missing' });
  }

  const { trip, attachments } = req.body || {};

  if (!trip) {
    return res.status(400).json({ message: 'بيانات الرحلة مفقودة' });
  }

  if (!Array.isArray(attachments) || attachments.length === 0) {
    return res.status(400).json({ message: 'يلزم صورة واحدة على الأقل لإرسال التقرير' });
  }

  try {
    await ensureTripBucket();

    const tripId = trip.id || crypto.randomUUID();
    const { data: existingTrip, error: existingTripError } = await supabase
      .from('trip_reports')
      .select('id')
      .eq('id', tripId)
      .maybeSingle();

    if (existingTripError && existingTripError.code !== 'PGRST116') {
      console.error('[Trips Sync] Failed to inspect existing trip:', existingTripError);
      throw existingTripError;
    }

    const isUpdate = Boolean(existingTrip);
    let previousPhotoRecords = [];
    if (isUpdate) {
      const { data: prevPhotos, error: prevPhotosError } = await supabase
        .from('trip_photos')
        .select('id, storage_path')
        .eq('trip_id', tripId);
      if (prevPhotosError && prevPhotosError.code !== 'PGRST116') {
        console.error('[Trips Sync] Failed to load existing photos:', prevPhotosError);
        throw prevPhotosError;
      }
      previousPhotoRecords = prevPhotos || [];
    }
    const cleanedChecklist = {
      externalClean: trip.checklist?.externalClean || 'bad',
      internalClean: trip.checklist?.internalClean || 'bad',
      carSmell: trip.checklist?.carSmell || 'bad',
      driverAppearance: trip.checklist?.driverAppearance || 'bad',
      acStatus: trip.checklist?.acStatus || 'bad',
      engineStatus: trip.checklist?.engineStatus || 'bad',
    };

    const uploadedPhotos = [];

    for (const photo of attachments) {
      if (!photo || typeof photo.base64 !== 'string') continue;
      const base64Payload = photo.base64.includes(',')
        ? photo.base64.split(',').pop()
        : photo.base64;
      if (!base64Payload) continue;

      const buffer = Buffer.from(base64Payload, 'base64');
      if (!buffer.length) continue;

      const originalName = photo.name || `evidence-${photo.id || Date.now()}.jpg`;
      const extension = path.extname(originalName) || '.jpg';
      const safeFileName = originalName.replace(/[^a-zA-Z0-9_\-\.]/g, '_') || `photo_${Date.now()}${extension}`;
      const storageFileName = `${Date.now()}-${photo.id || crypto.randomUUID()}${extension}`;
      const storagePath = `trip-reports/${tripId}/${storageFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(TRIP_BUCKET)
        .upload(storagePath, buffer, {
          contentType: photo.mimeType || photo.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('[Trips Sync] Upload failed:', uploadError);
        throw uploadError;
      }

      uploadedPhotos.push({
        trip_id: tripId,
        storage_path: storagePath,
        file_name: originalName || safeFileName,
        file_size: buffer.length,
        mime_type: photo.mimeType || photo.type || 'image/jpeg',
      });
    }

    if (!uploadedPhotos.length) {
      return res.status(400).json({ message: 'لم يتم حفظ أي مرفقات. يرجى إعادة المحاولة.' });
    }

    const tripPayload = {
      booking_id: trip.bookingId,
      day_date: trip.date || new Date().toISOString().slice(0, 10),
      source_ref: trip.sourceRef,
      booking_source: trip.bookingSource,
      supplier: trip.supplier,
      client_name: trip.clientName,
      driver_name: trip.driverName,
      car_type: trip.carType,
      parking_location: trip.parkingLocation,
      pickup_point: trip.pickupPoint,
      dropoff_point: trip.dropoffPoint,
      supervisor_name: trip.supervisorName,
      supervisor_rating: trip.supervisorRating,
      supervisor_notes: trip.supervisorNotes,
      passenger_feedback: trip.passengerFeedback,
      checklist: cleanedChecklist,
      status: trip.status || 'approved',
      photo_count: uploadedPhotos.length,
      created_by: trip.createdBy || null,
      sync_source: trip.syncSource || (trip.offline ? 'offline-cache' : 'web'),
    };

    let insertedTrip = null;
    if (isUpdate) {
      const { data, error } = await supabase
        .from('trip_reports')
        .update(tripPayload)
        .eq('id', tripId)
        .select()
        .single();

      if (error) {
        console.error('[Trips Sync] Trip update failed:', error);
        throw error;
      }
      insertedTrip = data;
    } else {
      const { data, error } = await supabase
        .from('trip_reports')
        .insert({ id: tripId, ...tripPayload })
        .select()
        .single();

      if (error) {
        console.error('[Trips Sync] Trip insert failed:', error);
        throw error;
      }
      insertedTrip = data;
    }

    const { error: photosError } = await supabase
      .from('trip_photos')
      .insert(uploadedPhotos);

    if (photosError) {
      console.error('[Trips Sync] Photos insert failed:', photosError);
      throw photosError;
    }

    if (isUpdate && previousPhotoRecords.length) {
      const idsToDelete = previousPhotoRecords.map((photo) => photo.id);
      if (idsToDelete.length) {
        const { error: deletePhotosError } = await supabase
          .from('trip_photos')
          .delete()
          .in('id', idsToDelete);
        if (deletePhotosError) {
          console.warn('[Trips Sync] Failed to delete previous photo metadata:', deletePhotosError);
        }
      }

      const pathsToRemove = previousPhotoRecords
        .map((photo) => photo.storage_path)
        .filter(Boolean);
      if (pathsToRemove.length) {
        const { error: storageCleanupError } = await supabase.storage
          .from(TRIP_BUCKET)
          .remove(pathsToRemove);
        if (storageCleanupError) {
          console.warn('[Trips Sync] Failed to cleanup previous photo files:', storageCleanupError);
        }
      }
    }

    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: null,
          is_broadcast: true,
          type: 'info',
          title: isUpdate ? '✏️ تم تحديث رحلة' : '📋 تم تسجيل رحلة جديدة',
          message: `${isUpdate ? 'تم تحديث' : 'تم تسجيل'} رحلة رقم ${trip.bookingId} بواسطة ${trip.supervisorName || 'فريق العمليات'}.`,
          created_at: new Date().toISOString(),
        });
    } catch (notifyError) {
      console.warn('[Trips Sync] Notification insert warning:', notifyError.message || notifyError);
    }

    return res.json({
      success: true,
      tripId: insertedTrip.id,
      photosUploaded: uploadedPhotos.length,
      photos: uploadedPhotos,
    });
  } catch (error) {
    console.error('[Trips Sync] Unexpected error:', error);
    return res.status(500).json({
      message: 'حدث خطأ أثناء مزامنة الرحلة',
      detail: error?.message || 'unknown_error',
    });
  }
};

app.post('/api/trips/sync', rateLimitMiddleware, tripSyncHandler);
app.post('/trips/sync', rateLimitMiddleware, tripSyncHandler);

// Serve static files from the public directory (React build)
app.use(express.static(path.join(__dirname, 'public')));

// Handle React routing - send all non-API requests to React app
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/generate-pdf') || req.path.startsWith('/health')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve React app for all other routes
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend server listening on 0.0.0.0:${port}`);
});

// Also add a health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
