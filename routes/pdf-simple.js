const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

// Simple, reliable PDF generation route
router.get('/pdf-simple/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log('Generating simple PDF for job:', jobId);
    
    // Very basic HTML - guaranteed to work
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Service Report ${jobId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Service Report #${jobId}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <tr><th>Service</th><th>Details</th></tr>
            <tr><td>Client</td><td>Test Client</td></tr>
            <tr><td>Vehicle</td><td>Test Vehicle</td></tr>
            <tr><td>Status</td><td>Completed</td></tr>
          </table>
        </body>
      </html>
    `;
    
    // Launch Puppeteer with minimal configuration
    const browser = await puppeteer.launch({
      headless: true
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for it to load
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });
    
    // Cleanup
    await browser.close();
    
    // Send PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${jobId}.pdf"`);
    res.send(pdfBuffer);
    
    console.log('PDF generated and sent successfully');
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF', 
      message: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;