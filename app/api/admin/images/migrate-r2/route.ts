import path from "path";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { hasR2ImageStorage, uploadImageToR2 } from "@/lib/image-storage";
import { readSiteContent, writeSiteContentFromAdmin } from "@/lib/site-content";

export const runtime = "nodejs";

const blobHostPattern = /\.public\.blob\.vercel-storage\.com$/;

function isVercelBlobImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.startsWith("https://")) return false;
  try {
    const url = new URL(value);
    return blobHostPattern.test(url.hostname) && /\.(png|jpe?g|jfif|webp|gif)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function collectImageUrls(value: unknown, urls = new Set<string>()) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectImageUrls(item, urls));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectImageUrls(item, urls));
  } else if (isVercelBlobImageUrl(value)) {
    urls.add(value);
  }
  return urls;
}

function replaceImageUrls<T>(value: T, replacements: Map<string, string>): T {
  if (Array.isArray(value)) return value.map((item) => replaceImageUrls(item, replacements)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceImageUrls(item, replacements)])
    ) as T;
  }
  return (typeof value === "string" && replacements.get(value) ? replacements.get(value) : value) as T;
}

function inferContentType(url: string) {
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg" || ext === ".jfif") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}

function makeFilename(sourceUrl: string, index: number) {
  const source = new URL(sourceUrl);
  const originalName = decodeURIComponent(path.basename(source.pathname)).replace(/[^a-zA-Z0-9._-]/g, "-");
  return `migrated-${String(index + 1).padStart(4, "0")}-${originalName || "image.png"}`;
}

export async function POST(request: Request) {
  try {
    if (!hasR2ImageStorage()) {
      return NextResponse.json({ error: "Chưa cấu hình Cloudflare R2 cho kho ảnh." }, { status: 500 });
    }

    const url = new URL(request.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 10), 1), 25);
    const content = await readSiteContent();
    const urls = [...collectImageUrls(content)];
    const batch = urls.slice(0, limit);

    if (!batch.length) {
      return NextResponse.json({ migrated: 0, remaining: 0 }, {
        headers: { "Cache-Control": "no-store, max-age=0" }
      });
    }

    const replacements = new Map<string, string>();
    for (const [index, sourceUrl] of batch.entries()) {
      const response = await fetch(sourceUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Không tải được ảnh cũ từ Blob: ${response.status}`);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get("content-type") || inferContentType(sourceUrl);
      const r2Url = await uploadImageToR2({
        bytes,
        contentType,
        filename: makeFilename(sourceUrl, index)
      });
      replacements.set(sourceUrl, r2Url);
    }

    await writeSiteContentFromAdmin(replaceImageUrls(content, replacements));

    return NextResponse.json({
      migrated: replacements.size,
      remaining: Math.max(urls.length - replacements.size, 0)
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (error) {
    return jsonError(error);
  }
}
