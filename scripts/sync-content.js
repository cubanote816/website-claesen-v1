import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Disable SSL verification for build script
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configuration
const args = process.argv.slice(2);
const modeIndex = args.indexOf('--mode');
const mode = modeIndex !== -1 ? args[modeIndex + 1] : 'production';

console.log(`ℹ️ Running in ${mode} mode`);

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
const CACHE_DIR = path.join(__dirname, '../public/portfolio-media');
const DATA_FILE = path.join(__dirname, '../src/data/projects-cache.json');

// Ensure directories exist
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Helper to download image
const downloadImage = (url, localPath) => {
    return new Promise((resolve, reject) => {
        if (!url || !url.startsWith('http')) {
            resolve(null);
            return;
        }

        const file = fs.createWriteStream(localPath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(true);
            });
        }).on('error', (err) => {
            fs.unlink(localPath, () => { });
            reject(err);
        });
    });
};

// Helper to get extension from URL
const getExtension = (url) => {
    return path.extname(new URL(url).pathname) || '.jpg';
};

async function syncContent() {
    console.log('🔄 Starting Content Sync...');
    console.log(`📡 Fetching data from ${API_URL}/projects...`);

    try {
        // Fetch Projects
        const projectsResponse = await new Promise((resolve, reject) => {
            https.get(`${API_URL}/projects?per_page=100`, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
                res.on('error', reject);
            });
        });

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
            const featuredSourceUrl = project.featured_image_url || project.api_featured_image_url || project.featured_image;
            if (featuredSourceUrl) {
                const ext = getExtension(featuredSourceUrl);
                const filename = `${filenamePrefix}featured${ext}`;
                const localFilePath = path.join(CACHE_DIR, filename);
                await downloadImage(featuredSourceUrl, localFilePath);
                featuredLocalPath = `/portfolio-media/${filename}`;
            }

            // Process Gallery Images
            const processedGallery = [];
            const gallerySource = Array.isArray(project.gallery) && project.gallery.length > 0 ? project.gallery : (Array.isArray(project.api_gallery) ? project.api_gallery : []);

            if (gallerySource.length > 0) {
                for (const img of gallerySource) {
                    const ext = getExtension(img.url || img.original_url || '');
                    const filename = `${filenamePrefix}g_${img.id}${ext}`;
                    const localFilePath = path.join(CACHE_DIR, filename);
                    await downloadImage(img.url || img.original_url, localFilePath);

                    processedGallery.push({
                        ...img,
                        url: `/portfolio-media/${filename}`,
                        thumb: `/portfolio-media/${filename}` // Use same for thumb in static mode
                    });
                }
            }

            processedProjects.push({
                ...project,
                featured_image_url: featuredLocalPath || project.featured_image_url || project.api_featured_image_url,
                gallery: processedGallery,
                gallery_images: processedGallery // Keep compatibility
            });
        }

        // Save Cache File
        const cacheData = {
            projects: processedProjects,
            generatedAt: new Date().toISOString()
        };

        fs.writeFileSync(DATA_FILE, JSON.stringify(cacheData, null, 2));
        console.log(`💾 Saved cache to ${DATA_FILE}`);
        console.log('✨ Sync Complete!');

    } catch (error) {
        console.error('❌ Sync Failed:', error);
        process.exit(1);
    }
}

syncContent();
