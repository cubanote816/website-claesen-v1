#!/usr/bin/env node
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGOS_DIR = join(__dirname, "../public/assets/logo_partner");
const MAX_DIM = 400;
const EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function optimizeImage(filePath) {
    const ext = extname(filePath).toLowerCase();
    if (!EXTS.has(ext)) return;

    const name = basename(filePath);
    const fileStat = await stat(filePath);
    const origSize = fileStat.size;
    const img = sharp(filePath);
    const meta = await img.metadata();
    const { width, height } = meta;

    const needsResize = width > MAX_DIM || height > MAX_DIM;
    const resizeOpts = needsResize
        ? { width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true }
        : {};

    let pipeline = sharp(filePath);
    if (needsResize) pipeline = pipeline.resize(resizeOpts);

    const outPath = filePath.replace(/\.(jpg|jpeg|webp)$/i, ".png");
    const outBuffer = await pipeline
        .png({ compressionLevel: 9, palette: false })
        .toBuffer();

    const saved = origSize - outBuffer.byteLength;
    const savedKB = Math.abs(Math.round(saved / 1024 * 10) / 10).toFixed(1);
    const pct = ((saved / origSize) * 100).toFixed(1);

    await sharp(outBuffer).toFile(outPath);

    const newMeta = await sharp(outPath).metadata();
    const statusDims = needsResize
        ? `${newMeta.width}x${newMeta.height}`
        : `${newMeta.width}x${newMeta.height}`;

    if (outPath !== filePath) {
        const { unlink } = await import("node:fs/promises");
        await unlink(filePath);
        console.log(`  ✓ ${name} → ${basename(outPath)}  ${statusDims}  ${savedKB}KB saved (${pct}%)`);
    } else {
        const sign = saved >= 0 ? `-${savedKB}KB (${pct}%)` : `+${savedKB}KB (${pct}%)`;
        console.log(`  ✓ ${name}  ${statusDims}  ${sign}`);
    }
}

const files = await readdir(LOGOS_DIR);
console.log(`Optimizing ${files.length} files in ${LOGOS_DIR}\n`);
for (const f of files.sort()) {
    const fp = join(LOGOS_DIR, f);
    const s = await stat(fp);
    if (!s.isFile()) continue;
    try {
        await optimizeImage(fp);
    } catch (e) {
        console.error(`  ✗ ${f}: ${e.message}`);
    }
}
console.log("\nDone.");
