const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 8080;

// CORS configuration
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
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.post('/api/generate-pdf', async (req, res) => {
  console.log('Received request to generate PDF');
  const { data, date } = req.body;

  const pythonExecutable = process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');
  const scriptPath = path.join(__dirname, 'generate_pdf.py');
  const jsonData = JSON.stringify({ ...data, date });

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
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch all handler: send back React app for any non-API routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${port}`);
});
