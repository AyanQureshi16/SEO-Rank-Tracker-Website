import { chromium } from "playwright";

const MAX_PAGES_TO_SCAN = 5; // Google result pages to check (10 organic results/page)

/**
 * Scans Google search results for `keyword` and finds where `targetDomain` ranks.
 * Connects to a remote Chromium instance via Browserless.io (CDP).
 *
 * @param {string} keyword
 * @param {string} targetDomain
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function rankTracker(keyword, targetDomain) {
  let browser;

  try {
    if (!process.env.BROWSERLESS_TOKEN) {
      throw new Error("BROWSERLESS_TOKEN is not set");
    }

    browser = await chromium.connectOverCDP(
      `wss://production-sfo.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`
    );

    const context = browser.contexts()[0] || (await browser.newContext());
    const page = await context.newPage();

    await page.goto("https://www.google.com", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Accept the cookie/consent dialog if Google shows it
    try {
      await page
        .getByRole("button", { name: /accept|i agree/i })
        .click({ timeout: 3000 });
    } catch {}

    await page.fill('textarea[name="q"]', keyword);
    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle");

    const normalizedTarget = targetDomain.replace(/^www\./i, "").toLowerCase();

    let totalResultsScanned = 0;
    let foundPosition = null;
    let foundPageNum = null;
    let foundTitle = "";
    let foundSnippet = "";
    const competitors = [];

    for (let pageNum = 1; pageNum <= MAX_PAGES_TO_SCAN; pageNum++) {
      await page.waitForSelector("#search", { timeout: 15000 }).catch(() => {});

      // Organic result wrapper. Fallback selector kept for when Google
      // tweaks its markup.
      let resultBlocks = await page.locator("#search div.g").all();
      if (resultBlocks.length === 0) {
        resultBlocks = await page.locator("#search a[href^='http']:has(h3)").all();
      }

      for (const block of resultBlocks) {
        let href = "";
        let title = "";
        let snippet = "";

        try {
          href = (await block.locator("a[href^='http']").first().getAttribute("href")) || "";
        } catch {}
        try {
          title = (await block.locator("h3").first().innerText()).trim();
        } catch {}
        try {
          snippet = (
            await block.locator("div[data-sncf], div.VwiC3b, span.aCOpRe").first().innerText()
          ).trim();
        } catch {}

        if (!href) continue;

        let resultDomain = "";
        try {
          resultDomain = new URL(href).hostname.replace(/^www\./i, "").toLowerCase();
        } catch {
          continue;
        }

        totalResultsScanned++;
        const position = totalResultsScanned;

        if (resultDomain === normalizedTarget && foundPosition === null) {
          foundPosition = position;
          foundPageNum = pageNum;
          foundTitle = title;
          foundSnippet = snippet;
        } else if (competitors.length < 10) {
          competitors.push({ position, domain: resultDomain, url: href, title, snippet });
        }
      }

      if (foundPosition !== null) break; // no need to keep scanning once found

      const nextButton = page.locator('a#pnnext, a[aria-label="Next page"]');
      if (!(await nextButton.count())) break; // no more pages

      await Promise.all([
        page.waitForLoadState("networkidle"),
        nextButton.first().click(),
      ]).catch(() => {});
    }

    return {
      success: true,
      data: {
        position: foundPosition,   // null if not found in scanned pages
        page: foundPageNum,        // which Google results page it appeared on
        title: foundTitle,
        snippet: foundSnippet,
        competitors,
        totalResultsScanned,
      },
    };
  } catch (error) {
    console.error("rankTracker error:", error.message);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}