/**
 * Webhook server — POST /rebuild
 *
 * Receives HMAC-SHA256 signed requests from the Laravel backend when content
 * changes (project created/updated/deleted). Runs git pull + sync + build +
 * rsync on each trigger, coalescing concurrent requests.
 *
 * Env vars:
 *   WEBHOOK_PORT                      Port to listen on (default: 9000)
 *   WEBHOOK_SECRET                    Shared secret for HMAC-SHA256 verification
 *   WEBHOOK_BUILD_MODE                "production" | "development" (default: production)
 *   WEBHOOK_DEPLOY_CMD                Shell command to run after build (e.g. rsync …)
 *   WEBHOOK_SIGNATURE_TOLERANCE       Max age of timestamp in seconds (default: 300)
 *   SYNC_DISABLE_SSL                  Set "true" to bypass self-signed cert on backoffice
 *   PUBLIC_API_URL                    API base URL used by sync-content.js
 */

import http    from 'http';
import crypto  from 'crypto';
import { spawn, execSync } from 'child_process';
import path    from 'path';
import { fileURLToPath } from 'url';

const ROOT        = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT        = parseInt(process.env.WEBHOOK_PORT || '9000', 10);
const SECRET      = process.env.WEBHOOK_SECRET || '';
const BUILD_MODE  = process.env.WEBHOOK_BUILD_MODE || 'production';
const DEPLOY_CMD  = process.env.WEBHOOK_DEPLOY_CMD || '';
const TOLERANCE   = parseInt(process.env.WEBHOOK_SIGNATURE_TOLERANCE || '300', 10);
const IS_WIN      = process.platform === 'win32';

function log(msg) {
    console.log(`[webhook] ${new Date().toISOString()}  ${msg}`);
}

// ── Signature verification ────────────────────────────────────────────────────

function verifyRequest(req, rawBody) {
    if (!SECRET) {
        log('WARNING: WEBHOOK_SECRET not set — accepting all requests (insecure)');
        return true;
    }

    const timestamp = req.headers['x-webhook-timestamp'];
    const sig       = req.headers['x-webhook-signature'];

    // HMAC mode (Laravel StaticSitePublicationService)
    if (sig && timestamp) {
        const ts = parseInt(timestamp, 10);
        if (isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > TOLERANCE) {
            log('REJECT: Timestamp out of tolerance window — possible replay attack.');
            return false;
        }
        const expected = 'sha256=' + crypto
            .createHmac('sha256', SECRET)
            .update(timestamp + '.' + rawBody)
            .digest('hex');
        try {
            return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
        } catch {
            return false;
        }
    }

    // Simple token fallback (X-Webhook-Secret or Authorization: Bearer)
    const token = req.headers['x-webhook-secret']
        || (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
    return token === SECRET;
}

// ── Build pipeline ────────────────────────────────────────────────────────────

let building       = false;
let pendingRebuild = false;

function runStep(cmd, args, opts = {}) {
    return new Promise((resolve, reject) => {
        const env = { ...process.env };
        if (process.env.SYNC_DISABLE_SSL === 'true') {
            env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
        const child = spawn(cmd, args, {
            cwd: ROOT, stdio: 'inherit', shell: IS_WIN, env, ...opts,
        });
        child.on('close', code => code === 0 ? resolve() : reject(new Error(`exit ${code}`)));
        child.on('error', reject);
    });
}

async function doBuild() {
    const start = Date.now();
    log('Starting git pull + sync + build...');

    try {
        // 0. Pull latest code
        log('git pull...');
        execSync('git pull --ff-only', { cwd: ROOT, stdio: 'inherit' });

        // 1. Install deps (fast if unchanged — npm ci uses lockfile)
        log('npm ci...');
        await runStep('npm', ['ci', '--prefer-offline']);

        // 2. Clean image cache and re-sync from backend
        await runStep('node', ['scripts/sync-content.js', '--clean', '--mode', BUILD_MODE]);

        // 3. Build Astro static site
        await runStep('node', ['node_modules/.bin/astro', 'build', '--mode', BUILD_MODE]);

        // 4. Copy v1-media assets into dist
        execSync('mkdir -p dist/v1-media && cp -r public/v1-media/. dist/v1-media/', { cwd: ROOT, shell: true });

        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        log(`Build complete in ${elapsed}s`);

        // 5. Optional deploy
        if (DEPLOY_CMD) {
            log(`Running deploy: ${DEPLOY_CMD}`);
            execSync(DEPLOY_CMD, { cwd: ROOT, stdio: 'inherit', shell: true });
            log('Deploy complete');
        }
    } catch (err) {
        log(`Build failed: ${err.message}`);
    }

    building = false;

    if (pendingRebuild) {
        pendingRebuild = false;
        triggerBuild();
    }
}

function triggerBuild() {
    if (building) {
        pendingRebuild = true;
        log('Build already running — will rebuild once current finishes.');
        return;
    }
    building = true;
    doBuild();
}

// ── HTTP server ───────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true, building }));
    }

    if (req.method !== 'POST' || req.url !== '/rebuild') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end();
    }

    // Collect raw body for HMAC verification
    let rawBody = '';
    req.on('data', chunk => { rawBody += chunk.toString(); });
    req.on('end', () => {
        if (!verifyRequest(req, rawBody)) {
            log('REJECT: Unauthorized request — signature mismatch or missing secret.');
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }

        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Rebuild triggered', building }));

        triggerBuild();
        log('Rebuild triggered via webhook.');
    });
});

server.listen(PORT, '127.0.0.1', () => {
    log(`Listening on 127.0.0.1:${PORT}`);
    log(`POST http://127.0.0.1:${PORT}/rebuild`);
    if (!SECRET) log('WARNING: WEBHOOK_SECRET is not set — any request will trigger a build!');
    if (DEPLOY_CMD) log(`Deploy: ${DEPLOY_CMD}`);
});
