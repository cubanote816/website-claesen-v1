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
const CACHE_DIR = path.join(__dirname, '../public/assets/cache');
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

            // Create folder for project images
            const projectDir = path.join(CACHE_DIR, project.id.toString());
            if (!fs.existsSync(projectDir)) {
                fs.mkdirSync(projectDir, { recursive: true });
            }

            // Process Featured Image
            let featuredLocalPath = null;
            if (project.featured_image_url) {
                const ext = getExtension(project.featured_image_url);
                const filename = `featured${ext}`;
                const localFilePath = path.join(projectDir, filename);
                await downloadImage(project.featured_image_url, localFilePath);
                featuredLocalPath = `/assets/cache/${project.id}/${filename}`;
            }

            // Process Gallery Images
            const processedGallery = [];
            if (Array.isArray(project.gallery)) {
                for (const img of project.gallery) {
                    const ext = getExtension(img.url);
                    const filename = `gallery_${img.id}${ext}`;
                    const localFilePath = path.join(projectDir, filename);
                    await downloadImage(img.url, localFilePath);

                    processedGallery.push({
                        ...img,
                        url: `/assets/cache/${project.id}/${filename}`,
                        thumb: `/assets/cache/${project.id}/${filename}` // Use same for thumb in static mode
                    });
                }
            }

            processedProjects.push({
                ...project,
                featured_image_url: featuredLocalPath || project.featured_image_url,
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
