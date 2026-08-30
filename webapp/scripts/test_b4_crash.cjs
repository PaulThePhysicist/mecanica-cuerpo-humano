const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message, err.stack));

    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173');
    await new Promise(r => setTimeout(r, 2000));

    // Ir a Slide 7 (Cap 1 Slide 7 / B4)
    console.log('Navigating to Chapter 1, Slide 7 (B4)...');
    await page.evaluate(() => {
      // Find slide buttons or navigate
      const btns = Array.from(document.querySelectorAll('button, span, div'));
      const b4Btn = btns.find(b => b.textContent && b.textContent.includes('B4') || b.textContent.includes('antagonistas'));
      if (b4Btn) {
        b4Btn.click();
      }
    });

    await new Promise(r => setTimeout(r, 2000));

    // Click on "🦾 Brazo y Palanca"
    console.log('Clicking "Brazo y Palanca"...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, span'));
      const armBtn = btns.find(b => b.textContent && (b.textContent.includes('Brazo') || b.textContent.includes('Palanca')));
      if (armBtn) {
        console.log('Found arm button, clicking:', armBtn.textContent);
        armBtn.click();
      } else {
        console.log('Arm button NOT found!');
      }
    });

    await new Promise(r => setTimeout(r, 3000));
    console.log('Test completed successfully without crash if no errors above.');
    await browser.close();
  } catch (e) {
    console.error('Puppeteer Script Error:', e);
  }
})();
