const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

// Working PDF route that sends buffer correctly
router.get('/working-pdf/:id', async (req, res) => {
  try {
    console.log('Generating PDF for ID:', req.params.id);
    
    // Simple HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Report ${req.params.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Service Report #${req.params.id}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          
          <table>
            <tr><th>Service</th><th>Details</th></tr>
            <tr><td>Client</td><td>John Doe</td></tr>
            <tr><td>Vehicle</td><td>Toyota Camry</td></tr>
            <tr><td>Work</td><td>Oil change, brake inspection</td></tr>
          </table>
        </body>
      </html>
    `;
    
    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });
    
    await browser.close();
    
    // Verify it's a valid PDF
    if (pdfBuffer.length < 4 || !pdfBuffer.slice(0, 4).toString('ascii').startsWith('%PDF')) {
      throw new Error('Generated content is not a valid PDF');
    }
    
    console.log('PDF generated successfully, size:', pdfBuffer.length);
    
    // Send PDF with correct headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${req.params.id}.pdf"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

module.exports = router;