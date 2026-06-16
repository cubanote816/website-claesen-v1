import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('🚀 --- SYNC CONTENT SCRIPT VERSION: 2.3 ---');
console.log('📅 Timestamp:', new Date().toISOString());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const args = process.argv.slice(2);
const modeIndex = args.indexOf('--mode');
const mode = modeIndex !== -1 ? args[modeIndex + 1] : 'production';
const shouldClean = args.includes('--clean');

// SSL bypass only when explicitly requested (e.g. self-signed cert on own server)
if (process.env.SYNC_DISABLE_SSL === 'true') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn('⚠️  SSL verification disabled (SYNC_DISABLE_SSL=true)');
}

console.log(`ℹ️ Running in ${mode} mode${shouldClean ? ' [--clean]' : ''}`);

let envApiUrl = '';
try {
    const envPath = path.join(__dirname, `../.env.${mode}`);
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/PUBLIC_API_URL=(.*)/);
        if (match) {
            envApiUrl = match[1].trim();
            console.log(`ℹ️ Loaded PUBLIC_API_URL from .env.${mode}`);
        }
    }
} catch (e) {
    console.warn(`⚠️ Could not load .env.${mode}: ${e.message}`);
}

const API_URL = process.env.PUBLIC_API_URL || envApiUrl || 'https://backend.claesen-verlichting.be/v1/website';
const CACHE_DIR = path.join(__dirname, '../public/v1-media');
const DATA_FILE = path.join(__dirname, '../public/v1-media/projects-static.json');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Ensure directories exist
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// --clean: remove all cached images before syncing (preserves the JSON manifest)
if (shouldClean && fs.existsSync(CACHE_DIR)) {
    console.log('🧹 Cleaning cached images in', CACHE_DIR);
    const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']);
    const files = fs.readdirSync(CACHE_DIR);
    let removed = 0;
    for (const file of files) {
        if (IMAGE_EXTS.has(path.extname(file).toLowerCase())) {
            fs.unlinkSync(path.join(CACHE_DIR, file));
            removed++;
        }
    }
    console.log(`   ✅ Removed ${removed} image file(s).`);
}

// Download an image via fetch — works with both http:// and https://
const downloadImage = async (url, localPath) => {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) return null;

    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) return true;

    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(localPath, Buffer.from(buffer));
    return true;
};

// Helper to get extension from URL (normalized to lowercase)
const getExtension = (url) => {
    if (typeof url !== 'string') return '.jpg';
    try {
        const ext = path.extname(new URL(url).pathname).toLowerCase();
        return ext || '.jpg';
    } catch {
        return '.jpg';
    }
};

async function syncContent() {
    console.log('🔄 Starting Content Sync...');
    console.log(`📡 Fetching data from ${API_URL}/projects...`);

    try {
        // Fetch project list via fetch (supports http:// and https://)
        const apiRes = await fetch(`${API_URL}/projects?per_page=100`, {
            headers: { 'User-Agent': UA }
        });
        if (!apiRes.ok) throw new Error(`API returned ${apiRes.status}`);
        const projectsResponse = await apiRes.json();

        const projects = Array.isArray(projectsResponse?.data?.data)
            ? projectsResponse.data.data
            : (Array.isArray(projectsResponse?.data) ? projectsResponse.data : projectsResponse || []);

        if (!Array.isArray(projects)) {
            throw new Error(`Invalid API response format. Expected array, got ${typeof projects}`);
        }

        console.log(`✅ Found ${projects.length} projects.`);

        const processedProjects = [];

        for (const project of projects) {
            console.log(`   Processing: ${project.title?.en || project.title?.nl || project.id}`);

            // Use flat structure to avoid 'mkdir' failures on strict SFTP server
            const filenamePrefix = `p${project.id}_`;

            // Process Featured Image
            let featuredLocalPath = null;
            const featuredImageObj = (project.featured_image && typeof project.featured_image === 'object') ? project.featured_image : null;

            const optimizedUrl = featuredImageObj?.optimized || null;
            const originalUrl =
                project.featured_image_url ||
                project.api_featured_image_url ||
                (typeof project.featured_image === 'string' ? project.featured_image : featuredImageObj?.original) ||
                null;

            let featuredSourceUrl = (typeof optimizedUrl === 'string' ? optimizedUrl : null) || (typeof originalUrl === 'string' ? originalUrl : null);

            if (featuredSourceUrl) {
                const ext = getExtension(featuredSourceUrl);
                const filename = `${filenamePrefix}featured${ext}`;
                const localFilePath = path.join(CACHE_DIR, filename);

                try {
                    await downloadImage(featuredSourceUrl, localFilePath);
                } catch (e) {
                    console.warn(`   ⚠️ Failed to download featured: ${e.message}. Trying original...`);
                    if (optimizedUrl && originalUrl && optimizedUrl !== originalUrl) {
                        try {
                            const origExt = getExtension(originalUrl);
                            const origFilename = `${filenamePrefix}featured${origExt}`;
                            const origLocalPath = path.join(CACHE_DIR, origFilename);
                            await downloadImage(originalUrl, origLocalPath);
                            featuredSourceUrl = originalUrl;
                            featuredLocalPath = `/v1-media/${origFilename}`;
                        } catch (e2) {
                            console.error(`   ❌ Failed to download original too: ${e2.message}`);
                        }
                    }
                }
                if (!featuredLocalPath) featuredLocalPath = `/v1-media/${filename}`;
            }

            // Process Gallery Images
            const processedGallery = [];
            const gallerySource = Array.isArray(project.gallery) && project.gallery.length > 0
                ? project.gallery
                : (Array.isArray(project.api_gallery) ? project.api_gallery : []);

            for (const img of gallerySource) {

                const optUrlCandidate = img.optimized || img.url || img.original_url || img.original || '';
                const optUrl = (typeof optUrlCandidate === 'string') ? optUrlCandidate : (optUrlCandidate?.optimized || optUrlCandidate?.url || '');

                if (!optUrl || typeof optUrl !== 'string') continue;

                const ext = getExtension(optUrl);
                const filename = `${filenamePrefix}g_${img.id}${ext}`;
                const localFilePath = path.join(CACHE_DIR, filename);

                try {
                    await downloadImage(optUrl, localFilePath);
                    processedGallery.push({ ...img, url: `/v1-media/${filename}`, thumb: `/v1-media/${filename}` });
                } catch (e) {
                    console.warn(`   ⚠️ Gallery img ${img.id} failed: ${e.message}. Skipping...`);

                    const fallbackCandidate = img.original || img.url || img.original_url;
                    const fallbackUrl = (typeof fallbackCandidate === 'string') ? fallbackCandidate : (fallbackCandidate?.original || fallbackCandidate?.url);

                    if (fallbackUrl && typeof fallbackUrl === 'string' && fallbackUrl !== optUrl) {
                        try {
                            const fExt = getExtension(fallbackUrl);
                            const fFilename = `${filenamePrefix}g_${img.id}${fExt}`;
                            const fLocalPath = path.join(CACHE_DIR, fFilename);
                            await downloadImage(fallbackUrl, fLocalPath);
                            processedGallery.push({ ...img, url: `/v1-media/${fFilename}`, thumb: `/v1-media/${fFilename}` });
                        } catch (e3) {
                            console.error(`   ❌ Gallery fallback failed: ${e3.message}`);
                        }
                    }
                }
            }

            // Extract work-details fields.
            // Post-migration the list endpoint includes these fields directly — use them if present
            // ('work_story' in project distinguishes null-but-present from absent).
            // If absent (pre-migration or legacy list response) fall back to GET /projects/{slug}.
            let workStory = null, challenge = null, solution = null, result = null;
            let detailGallerySourceRaw = Array.isArray(project.detail_gallery) ? project.detail_gallery : [];

            if ('work_story' in project) {
                // List already has work-details — no extra request needed
                workStory = project.work_story ?? null;
                challenge = project.challenge  ?? null;
                solution  = project.solution   ?? null;
                result    = project.result     ?? null;
            } else {
                // Pre-migration list — fetch individual detail endpoint
                try {
                    const detailRes = await fetch(`${API_URL}/projects/${project.slug}`, {
                        headers: { 'User-Agent': UA }
                    });
                    if (detailRes.ok) {
                        const detailJson = await detailRes.json();
                        const detail = detailJson.data || detailJson;
                        workStory = detail.work_story ?? null;
                        challenge = detail.challenge  ?? null;
                        solution  = detail.solution   ?? null;
                        result    = detail.result     ?? null;
                        if (Array.isArray(detail.detail_gallery) && detail.detail_gallery.length > 0) {
                            detailGallerySourceRaw = detail.detail_gallery;
                        }
                    }
                } catch (e) {
                    console.warn(`   ⚠️ Work-details fetch failed for ${project.slug}: ${e.message}`);
                }
            }

            // Process Detail Gallery Images (website-work-details fields)
            const processedDetailGallery = [];

            for (const img of detailGallerySourceRaw) {
                const urlCandidate = img.optimized || img.url || img.original_url || img.original || '';
                const imgUrl = (typeof urlCandidate === 'string') ? urlCandidate : '';
                if (!imgUrl) continue;

                const ext = getExtension(imgUrl);
                const filename = `${filenamePrefix}dg_${img.id}${ext}`;
                const localFilePath = path.join(CACHE_DIR, filename);

                try {
                    await downloadImage(imgUrl, localFilePath);
                    processedDetailGallery.push({ ...img, url: `/v1-media/${filename}`, thumb: `/v1-media/${filename}` });
                } catch (e) {
                    console.warn(`   ⚠️ Detail gallery img ${img.id} failed: ${e.message}. Skipping...`);
                }
            }

            processedProjects.push({
                ...project,
                featured_image_url: featuredLocalPath || project.featured_image_url,
                gallery: processedGallery,
                gallery_images: processedGallery,
                detail_gallery: processedDetailGallery,
                work_story: workStory,
                challenge:  challenge,
                solution:   solution,
                result:     result,
            });
        }

        // Save cache file
        fs.writeFileSync(DATA_FILE, JSON.stringify({
            projects: processedProjects,
            generatedAt: new Date().toISOString()
        }, null, 2));
        console.log(`💾 Saved cache to ${DATA_FILE}`);
        console.log('✨ Sync Complete!');

    } catch (error) {
        console.error('❌ Sync Failed:', error);
        process.exit(1);
    }
}

syncContent();
