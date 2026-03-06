import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let envApiUrl = 'http://localhost:8001/v1/website';
try {
    const envPath = path.join(__dirname, '../.env.development');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/PUBLIC_API_URL=(.*)/);
        if (match) {
            envApiUrl = match[1].trim();
        }
    }
} catch (e) {
    console.warn('Could not load .env.development:', e.message);
}

const API_URL = `${envApiUrl}/projects/test234`;

console.log(`Testing connection to: ${API_URL}`);

http.get(API_URL, (res) => {
    let data = '';
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);

    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const projects = json.data?.data || json.data || [];
            fs.writeFileSync('projects_dump.json', JSON.stringify(projects, null, 2), 'utf-8');
            console.log('Saved to projects_dump.json');
        } catch (e) {
            console.log('Response is not JSON:', data.substring(0, 200));
        }
    });
}).on('error', (e) => {
    console.error('Connection failed:', e.message);
});
