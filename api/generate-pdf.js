export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const backendBaseUrl = process.env.PDF_BACKEND_URL;
  if (!backendBaseUrl) {
    return res.status(500).send('PDF_BACKEND_URL is not configured.');
  }

  try {
    const { data, date } = req.body || {};

    const backendResponse = await fetch(`${backendBaseUrl.replace(/\/$/, '')}/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, date }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return res.status(backendResponse.status).send(`Backend PDF generation failed: ${errorText}`);
    }

    const pdfBuffer = Buffer.from(await backendResponse.arrayBuffer());
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error in /api/generate-pdf:', error);
    return res.status(500).send('Internal Server Error during PDF generation.');
  }
}
