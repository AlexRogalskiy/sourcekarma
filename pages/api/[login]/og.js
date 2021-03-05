const chromium = require("chrome-aws-lambda");

export default async function (req, res) {
  let browser;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const [page] = await browser.pages();
    await page.goto(
      `https://sourcekarma-dev.eu.ngrok.io/${req.query.login}/badge`
    );
    await page.waitForSelector('#badge[data-qa="loaded"]', {
      timeout: 10000,
    });
    const element = await page.$("#badge");
    const screenshot = await element.screenshot({
      type: "png",
    });
    await browser.close();
    res.statusCode = 200;
    res.setHeader("content-type", "image/png");
    res.setHeader(
      "cache-control",
      `public, max-age=${process.env.CACHE_IN_SECONDS}, immutable`
    );
    res.end(screenshot);
  } catch (error) {
    try {
      browser.close();
    } catch (_) {}

    res.status(404).end();
  }
}