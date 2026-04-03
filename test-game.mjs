import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ 
  headless: true, 
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
});
const page = await browser.newPage();

const logs = [];
page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
page.on('pageerror', err => logs.push({ type: 'ERROR', text: err.message }));

try {
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle0', timeout: 15000 });
  console.log('=== PAGE LOADED ===');
  console.log('Title:', await page.title());

  // Check elements
  const state = await page.evaluate(() => {
    return {
      hasProfileScreen: !!document.querySelector('#profile-screen'),
      hasClickToPlay: !!document.querySelector('#click-to-play'),
      hasCanvas: !!document.querySelector('#game-canvas'),
      bodyPreview: document.body.innerText.substring(0, 300),
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()),
    };
  });
  console.log('State:', JSON.stringify(state, null, 2));

  // Try creating profile
  const nameInput = await page.$('.form-group input');
  if (nameInput) {
    await nameInput.type('TestBot');
    const btn = await page.$('.create-btn');
    if (btn) {
      await btn.click();
      console.log('Created profile, waiting...');
      await new Promise(r => setTimeout(r, 4000));
    }
  }

  // Dump logs
  console.log('\n=== BROWSER CONSOLE (' + logs.length + ' messages) ===');
  for (const log of logs) {
    console.log(log.type + ':', log.text);
  }
} catch (err) {
  console.error('Error:', err.message);
  console.log('Logs so far:');
  for (const log of logs) console.log(log.type + ':', log.text);
}
await browser.close();
