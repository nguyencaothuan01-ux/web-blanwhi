import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const siteUrl = new URL(process.env.BLANWHI_LIVE_SITE_URL || "https://www.blanwhi.com/api/site");
siteUrl.searchParams.set("_preserve", String(Date.now()));
const outputFile = path.join(process.cwd(), "data", "site-content.json");

const response = await fetch(siteUrl, { cache: "no-store" });

if (!response.ok) {
  throw new Error(`Cannot fetch live site content from ${siteUrl.toString()}: ${response.status}`);
}

const content = await response.json();

if (!content || !Array.isArray(content.products)) {
  throw new Error("Live site content is invalid: missing products array.");
}

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(content, null, 2)}\n`, "utf8");

console.log(`Preserved live site content to ${outputFile}`);
execFileSync(process.execPath, ["scripts/embed-site-content.mjs"], { stdio: "inherit" });
