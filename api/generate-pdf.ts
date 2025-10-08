import type { VercelRequest, VercelResponse } from '@vercel/node';

// Minimal serverless function that returns a basic PDF so the frontend endpoint works in Vercel.
// You can later replace this with a call to your backend or integrate your Python rendering via a hosted service.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // Create a tiny PDF by hand (valid PDF header + one empty page) as a fallback.
    // This avoids bundling heavy PDF libs in the serverless function.
    const minimalPdf = Buffer.from(
      '%PDF-1.4\n' +
        '1 0 obj<<>>endobj\n' +
        '2 0 obj<< /Type /Catalog /Pages 3 0 R >>endobj\n' +
        '3 0 obj<< /Type /Pages /Kids [4 0 R] /Count 1 >>endobj\n' +
        '4 0 obj<< /Type /Page /Parent 3 0 R /MediaBox [0 0 595 842] >>endobj\n' +
        'xref\n0 5\n0000000000 65535 f \n' +
        '0000000010 00000 n \n0000000051 00000 n \n0000000103 00000 n \n0000000165 00000 n \n' +
        'trailer<< /Size 5 /Root 2 0 R >>\nstartxref\n223\n%%EOF\n',
      'utf8'
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="wathiq-report.pdf"');
    return res.status(200).send(minimalPdf);
  } catch (e: any) {
    return res.status(500).send(`Failed to generate PDF: ${e?.message || e}`);
  }
}
