const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises; // Import fs.promises for async file operations
const cron = require('node-cron');

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
    const pythonExecutable = path.join('C:', 'Users', 'sulta', 'AppData', 'Local', 'Programs', 'Python', 'Python313', 'python.exe');
    const scriptPath = path.join(__dirname, 'generate_pdf.py');
    const dateStr = new Date().toISOString().slice(0, 10);
    // Expect the frontend-style payload to be available; fallback to a minimal shape
    const payload = { date: dateStr, finance: { currentLiquidity: '', entries: [] }, sales: { customersContacted: 0, entries: [] }, operations: { entries: [] }, marketing: { tasks: [] } };
    const jsonData = JSON.stringify(payload);
    const tempFilePath = path.join(__dirname, `temp_data_${Date.now()}.json`);
    await fs.writeFile(tempFilePath, jsonData);
    const pythonProcess = spawn(pythonExecutable, [scriptPath, tempFilePath], { shell: true });
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
const port = 5000; // Choose a different port than your React app

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true); // reflect request origin
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options('/generate-pdf', cors(corsOptions));
app.use(express.json());

app.post('/generate-pdf', async (req, res) => {
  console.log('Received request to generate PDF');
  const { data, date } = req.body; // Data from your frontend

  const pythonExecutable = path.join('C:', 'Users', 'sulta', 'AppData', 'Local', 'Programs', 'Python', 'Python313', 'python.exe');
  const scriptPath = path.join(__dirname, 'generate_pdf.py');
  const jsonData = JSON.stringify({ ...data, date });

  let tempFilePath;

  try {
    tempFilePath = path.join(__dirname, `temp_data_${Date.now()}.json`);
    await fs.writeFile(tempFilePath, jsonData);

    const pythonProcess = spawn(pythonExecutable, [scriptPath, tempFilePath], { shell: true });

    let pdfBuffer = Buffer.from('');
    let errorOutput = '';

    pythonProcess.stdout.on('data', (chunk) => {
      pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
    });

    pythonProcess.stderr.on('data', (chunk) => {
      errorOutput += chunk.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        // Fire-and-forget WhatsApp send (if configured)
        sendWhatsAppDocument(pdfBuffer, `wathiq-report-${Date.now()}.pdf`).catch(() => {});
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Vary', 'Origin');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');
        res.send(pdfBuffer);
      } else {
        console.error(`Python script exited with code ${code}: ${errorOutput}`);
        res.status(500).send(`Failed to generate PDF: ${errorOutput}`);
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
      console.error('Failed to start Python subprocess:', err);
      res.status(500).send('Failed to initiate PDF generation process.');
      if (tempFilePath) {
        try {
          await fs.rm(tempFilePath, { force: true });
        } catch (e) {
          if (e && e.code !== 'ENOENT') console.error('Error deleting temp file:', e);
        }
      }
    });
  } catch (err) {
    console.error('Error in PDF generation process:', err);
    res.status(500).send('Internal server error during PDF generation.');
    if (tempFilePath) {
      try {
        await fs.rm(tempFilePath, { force: true });
      } catch (e) {
        if (e && e.code !== 'ENOENT') console.error('Error deleting temp file:', e);
      }
    }
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
