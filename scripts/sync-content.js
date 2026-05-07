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
const CACHE_DIR = path.join(__dirname, '../public/v1-media');
const DATA_FILE = path.join(__dirname, '../public/v1-media/projects-static.json');

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
        if (!url || typeof url !== 'string' || !url.startsWith('http')) {
            resolve(null);
            return;
        }

        // Check if file already exists
        if (fs.existsSync(localPath)) {
            // console.log(`   ⏩ Skipping download (already exists): ${path.basename(localPath)}`);
            resolve(true);
            return;
        }

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        const file = fs.createWriteStream(localPath);
        https.get(url, options, (response) => {
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

// Helper to get extension from URL (normalized to lowercase)
const getExtension = (url) => {
    if (typeof url !== 'string') {
        // console.warn('⚠️ getExtension received non-string URL:', url);
        return '.jpg';
    }
    try {
        const ext = path.extname(new URL(url).pathname).toLowerCase();
        return ext || '.jpg';
    } catch (e) {
        return '.jpg';
    }
};

async function syncContent() {
    console.log('🔄 Starting Content Sync...');
    console.log(`📡 Fetching data from ${API_URL}/projects...`);

    try {
        // Fetch Projects
        const projectsResponse = await new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            };
            https.get(`${API_URL}/projects?per_page=100`, options, (res) => {
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
                    console.warn(`   ⚠️ Failed to download optimized: ${e.message}. Falling back to original...`);
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
            const gallerySource = Array.isArray(project.gallery) && project.gallery.length > 0 ? project.gallery : (Array.isArray(project.api_gallery) ? project.api_gallery : []);

            if (gallerySource.length > 0) {
                for (const img of gallerySource) {
                    const optUrlCandidate = img.optimized || img.url || img.original_url || '';
                    const optUrl = (typeof optUrlCandidate === 'string') ? optUrlCandidate : (optUrlCandidate?.optimized || optUrlCandidate?.url || '');
                    
                    if (!optUrl || typeof optUrl !== 'string') continue;

                    const ext = getExtension(optUrl);
                    const filename = `${filenamePrefix}g_${img.id}${ext}`;
                    const localFilePath = path.join(CACHE_DIR, filename);
                    
                    try {
                        await downloadImage(optUrl, localFilePath);
                        processedGallery.push({
                            ...img,
                            url: `/v1-media/${filename}`,
                            thumb: `/v1-media/${filename}`
                        });
                    } catch (e) {
                        console.warn(`   ⚠️ Gallery img ${img.id} failed: ${e.message}. Skipping...`);
                        
                        const fallbackCandidate = img.url || img.original_url;
                        const fallbackUrl = (typeof fallbackCandidate === 'string') ? fallbackCandidate : (fallbackCandidate?.original || fallbackCandidate?.url);
                        
                        if (fallbackUrl && typeof fallbackUrl === 'string' && fallbackUrl !== optUrl) {
                             try {
                                const fExt = getExtension(fallbackUrl);
                                const fFilename = `${filenamePrefix}g_${img.id}${fExt}`;
                                const fLocalPath = path.join(CACHE_DIR, fFilename);
                                await downloadImage(fallbackUrl, fLocalPath);
                                processedGallery.push({
                                    ...img,
                                    url: `/v1-media/${fFilename}`,
                                    thumb: `/v1-media/${fFilename}`
                                });
                             } catch (e3) {
                                console.error(`   ❌ Gallery fallback failed: ${e3.message}`);
                             }
                        }
                    }
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
