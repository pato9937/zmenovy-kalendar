import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const ogHtml = pathToFileURL("/workspace/.grok/og-card.html").href;
const iconSvg = pathToFileURL("/workspace/.grok/icon-mark.svg").href;

const iconPage = (size) => `<!DOCTYPE html>
<html><head><style>
  html,body{margin:0;width:${size}px;height:${size}px;background:#09090B;}
  img{display:block;width:${size}px;height:${size}px;}
</style></head>
<body><img src="${iconSvg}" alt="" /></body></html>`;

const browser = await chromium.launch({ args: ["--no-sandbox"] });

{
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });
  await page.goto(ogHtml, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await page.screenshot({
    path: "/workspace/.grok/og-card-raw.png",
    type: "png",
  });
  await page.close();
}

for (const size of [180, 192, 512]) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 2,
  });
  await page.setContent(iconPage(size), { waitUntil: "load" });
  await page.screenshot({
    path: `/workspace/.grok/icon-${size}.raw.png`,
    type: "png",
  });
  await page.close();
}

{
  const page = await browser.newPage({
    viewport: { width: 32, height: 32 },
    deviceScaleFactor: 8,
  });
  const favUrl = pathToFileURL("/workspace/.grok/favicon.svg").href;
  await page.setContent(
    `<!DOCTYPE html><html><head><style>
      html,body{margin:0;width:32px;height:32px;background:transparent;}
      img{display:block;width:32px;height:32px;}
    </style></head><body><img src="${favUrl}" alt="" /></body></html>`,
    { waitUntil: "load" },
  );
  await page.screenshot({
    path: "/workspace/.grok/favicon-preview.png",
    type: "png",
    omitBackground: true,
  });
  await page.close();
}

await browser.close();
writeFileSync("/workspace/.grok/og-pending", "");
console.log("captured");
