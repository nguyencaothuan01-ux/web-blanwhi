import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const siteUrl = new URL(process.env.BLANWHI_LIVE_SITE_URL || "https://www.blanwhi.com/api/site");
siteUrl.searchParams.set("_preserve", String(Date.now()));
const outputFile = path.join(process.cwd(), "data", "site-content.json");
const backupDir = path.join(process.cwd(), "data", "backups", "site-content");

function countImages(content) {
  return (content.products || []).reduce((total, product) => total
    + (product.image ? 1 : 0)
    + (Array.isArray(product.galleryImages) ? product.galleryImages.filter(Boolean).length : 0)
    + Object.values(product.colorImages || {}).filter(Boolean).length
    + (product.classifications || []).reduce((sum, classification) =>
      sum + Object.values(classification.colorImages || {}).filter(Boolean).length, 0), 0);
}

function countLinks(content) {
  return (content.products || []).reduce((total, product) => total
    + (product.inventory || []).filter((item) => item.pancakeProductId || item.pancakeSku).length, 0);
}

function assertNoRegression(previous, next) {
  if (process.env.BLANWHI_ALLOW_DATA_REMOVAL === "1") return;
  const checks = [
    ["sản phẩm", previous.products?.length || 0, next.products?.length || 0],
    ["hình ảnh", countImages(previous), countImages(next)],
    ["liên kết Pancake", countLinks(previous), countLinks(next)]
  ];
  const regression = checks.find(([, before, after]) => after < before);
  if (regression) {
    const [label, before, after] = regression;
    throw new Error(`Safety check blocked overwrite: ${label} giảm từ ${before} xuống ${after}. Đặt BLANWHI_ALLOW_DATA_REMOVAL=1 chỉ khi chủ shop xác nhận xoá.`);
  }
}

const response = await fetch(siteUrl, { cache: "no-store" });

if (!response.ok) {
  throw new Error(`Cannot fetch live site content from ${siteUrl.toString()}: ${response.status}`);
}

const content = await response.json();

if (!content || !Array.isArray(content.products)) {
  throw new Error("Live site content is invalid: missing products array.");
}

await mkdir(path.dirname(outputFile), { recursive: true });
try {
  const previous = JSON.parse(await readFile(outputFile, "utf8"));
  assertNoRegression(previous, content);
  await mkdir(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await copyFile(outputFile, path.join(backupDir, `site-content-${timestamp}.json`));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
await writeFile(outputFile, `${JSON.stringify(content, null, 2)}\n`, "utf8");

console.log(`Preserved live site content to ${outputFile}`);
execFileSync(process.execPath, ["scripts/embed-site-content.mjs"], { stdio: "inherit" });
