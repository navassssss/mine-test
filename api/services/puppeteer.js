import puppeteer from 'puppeteer';
import { config } from '../config.js';
import { sessionStore } from '../sessionStore.js';

export async function refreshTokens() {
  console.log('Starting Puppeteer token refresh...');
  let browser;
  try {
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    };

    // Use specific chrome executable if configured (e.g. for Render native environments)
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Set a modern User-Agent to pass security checks
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'
    );

    // Set page viewport
    await page.setViewport({ width: 1280, height: 800 });

    const domain = config.MINE_TEST_DOMAIN;
    const cookieDomain = `.${domain.replace('www.', '')}`;
    const brand = domain.includes('kimi') ? 'kimi' : 'kimi';

    console.log(`Setting authentication cookies for domain: ${cookieDomain} with brand: ${brand}`);

    // Inject the main auth cookie
    await page.setCookie({
      name: `${brand}-auth`,
      value: config.MINE_TEST_AUTH_COOKIE,
      domain: cookieDomain,
      path: '/'
    });

    // Inject theme and other tracking cookies so it mimics a normal session
    await page.setCookie({
      name: 'theme',
      value: 'dark',
      domain: cookieDomain,
      path: '/'
    });

    let interceptedShieldData = null;

    // Set request interception or just listen to request headers
    page.on('request', request => {
      const headers = request.headers();
      if (headers['x-msh-shield-data']) {
        interceptedShieldData = headers['x-msh-shield-data'];
        console.log('Successfully intercepted x-msh-shield-data header:', interceptedShieldData);
      }
    });

    console.log(`Navigating to https://${domain}/chat`);
    await page.goto(`https://${domain}/chat`, {
      waitUntil: 'networkidle2',
      timeout: 120000
    });

    // Trigger a dummy fetch request in page context to force shield data generation
    console.log(`Triggering API call in browser context for brand: ${brand}...`);
    await page.evaluate(async (brandName) => {
      try {
        await fetch(`/apiv2/${brandName}.gateway.account.v1.UserService/GetCurrentUser`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'connect-protocol-version': '1'
          },
          body: '{}'
        });
      } catch (e) {
        console.log('Dummy request evaluated: ', e);
      }
    }, brand);

    // Wait a brief moment to ensure request completes and is intercepted
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get cookies
    const cookies = await page.cookies();
    const cfBmCookie = cookies.find(c => c.name === '__cf_bm');
    const freshCfBm = cfBmCookie ? cfBmCookie.value : null;

    console.log('Refresh completed.');
    if (freshCfBm) console.log('Found __cf_bm cookie:', freshCfBm.substring(0, 20) + '...');
    if (interceptedShieldData) console.log('Found x-msh-shield-data:', interceptedShieldData);

    const sessionUpdates = { cookies: {}, headers: {} };
    if (freshCfBm) {
      sessionUpdates.cookies['__cf_bm'] = freshCfBm;
    }
    if (interceptedShieldData) {
      sessionUpdates.headers['x-msh-shield-data'] = interceptedShieldData;
    }

    if (freshCfBm || interceptedShieldData) {
      sessionStore.writeSession(sessionUpdates);
      console.log('Updated session.json store successfully!');
      return { success: true, CF_BM: freshCfBm, X_MSH_SHIELD_DATA: interceptedShieldData };
    } else {
      console.log('No token updates found.');
      return { success: false, reason: 'No new values intercepted' };
    }

  } catch (error) {
    console.error('Puppeteer refresh failed:', error);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

sessionStore.registerRefreshHandler(refreshTokens);
