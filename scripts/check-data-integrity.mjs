import { readFile } from "node:fs/promises";
import path from "node:path";

const contentPath = path.join(process.cwd(), "data", "site-content.json");
const content = JSON.parse(await readFile(contentPath, "utf8"));

if (!Array.isArray(content.products) || content.products.length === 0) {
  throw new Error("Dữ liệu không có sản phẩm.");
}

const ids = new Set();
const skus = new Set();
let duplicateSkuCount = 0;
let imageCount = 0;
let linkCount = 0;

for (const product of content.products) {
  if (!product.id || ids.has(product.id)) throw new Error(`ID sản phẩm thiếu hoặc trùng: ${product.id || "(trống)"}`);
  ids.add(product.id);
  if (!product.name?.trim()) throw new Error(`Sản phẩm ${product.id} chưa có tên.`);

  const images = [
    product.image,
    ...(product.galleryImages || []),
    ...Object.values(product.colorImages || {}),
    ...(product.classifications || []).flatMap((classification) => Object.values(classification.colorImages || {}))
  ].filter(Boolean);
  imageCount += images.length;

  const inventoryKeys = new Set();
  for (const item of product.inventory || []) {
    if (!item.key || inventoryKeys.has(item.key)) {
      throw new Error(`Khóa phân loại bị thiếu hoặc trùng trong ${product.name}: ${item.key || "(trống)"}`);
    }
    inventoryKeys.add(item.key);
    if (item.sku) {
      const normalized = String(item.sku).trim().toUpperCase();
      if (skus.has(normalized)) duplicateSkuCount += 1;
      skus.add(normalized);
    }
    if (item.pancakeProductId || item.pancakeSku) linkCount += 1;
  }
}

if (imageCount === 0) throw new Error("Không còn URL hình ảnh nào trong dữ liệu.");

console.log(`Data OK: ${content.products.length} sản phẩm, ${imageCount} hình, ${linkCount} liên kết Pancake.`);
if (duplicateSkuCount > 0) {
  console.warn(`Cảnh báo: có ${duplicateSkuCount} SKU hiển thị trùng giữa các sản phẩm; khóa phân loại nội bộ vẫn hợp lệ.`);
}