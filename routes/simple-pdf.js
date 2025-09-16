const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

// UNUSED: Simple PDF test route (development/testing only)
/*
router.get('/simple-pdf-test', async (req, res) => {
  console.log('Simple PDF test route called');
  
  try {
    // Simple HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Simple Test PDF</title>
        </head>
        <body>
          <h1>Test PDF</h1>
          <p>This is a simple test PDF generated with Puppeteer.</p>
          <table border="1">
            <tr>
              <th>Item</th>
              <th>Value</th>
            </tr>
            <tr>
              <td>Test 1</td>
              <td>Value 1</td>
            </tr>
            <tr>
              <td>Test 2</td>
              <td>Value 2</td>
            </tr>
          </table>
        </body>
      </html>
    `;
    
    console.log('HTML content created, length:', htmlContent.length);
    
    // Launch Puppeteer
    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    console.log('Puppeteer launched');
    const page = await browser.newPage();
    
    // Set content
    console.log('Setting content...');
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    console.log('Content set');
    
    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });
    
    console.log('PDF generated, length:', pdfBuffer.length);
    
    // Close browser
    await browser.close();
    console.log('Browser closed');
    
    // Check PDF header
    if (pdfBuffer.length >= 4) {
      const header = pdfBuffer.slice(0, 4).toString('ascii');
      console.log('PDF header:', header);
      if (header.startsWith('%PDF')) {
        console.log('Valid PDF header detected');
      } else {
        console.log('Invalid PDF header');
        return res.status(500).send('Generated file is not a valid PDF');
      }
    }
    
    // Send PDF
    res.contentType('application/pdf');
    res.send(pdfBuffer);
    console.log('PDF sent to client');
    
  } catch (error) {
    console.error('Error in simple PDF test:', error);
    res.status(500).send('Error generating PDF: ' + error.message);
  }
});
*/

module.exports = router;