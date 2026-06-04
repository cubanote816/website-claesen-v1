/**
 * Webhook server — POST /rebuild
 *
 * The backend calls this endpoint whenever a project is created, updated,
 * or deleted. The server runs sync:clean + astro build so the static site
 * and the image cache stay in sync with the backend.
 *
 * Env vars:
 *   WEBHOOK_PORT       Port to listen on (default: 9000)
 *   WEBHOOK_SECRET     Token the backend must send in X-Webhook-Secret header
 *   WEBHOOK_BUILD_MODE Astro build mode — "production" or "development" (default: production)
 *   WEBHOOK_DEPLOY_CMD Optional shell command to run after a successful build
 *                      e.g.  rsync -a dist/ /var/www/claesen/v1/
 *                      or    cp -r dist/. /var/www/claesen/v1/
 */

import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT  = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT  = parseInt(process.env.WEBHOOK_PORT || '9000', 10);
const SECRET      = process.env.WEBHOOK_SECRET || '';
const BUILD_MODE  = process.env.WEBHOOK_BUILD_MODE || 'production';
const DEPLOY_CMD  = process.env.WEBHOOK_DEPLOY_CMD || '';
const IS_WIN      = process.platform === 'win32';

function log(msg) {
    console.log(`[webhook] ${new Date().toISOString()}  ${msg}`);
}

// ── Build state ──────────────────────────────────────────────────────────────

let building = false;
let pendingRebuild = false; // coalesce multiple requests while building

function runStep(cmd, args, opts = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, {
            cwd: ROOT,
            stdio: 'inherit',
            shell: IS_WIN,
            ...opts,
        });
        child.on('close', code => code === 0 ? resolve() : reject(new Error(`exit ${code}`)));
        child.on('error', reject);
    });
}

async function doBuild() {
    const start = Date.now();
    log(`Starting sync + build  (mode: ${BUILD_MODE})`);

    try {
        // 1. Clean cache and re-sync images + JSON from backend
        await runStep('node', ['scripts/sync-content.js', '--clean', '--mode', BUILD_MODE]);

        // 2. Rebuild Astro static site
        await runStep('node', ['node_modules/.bin/astro', 'build', '--mode', BUILD_MODE]);

        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        log(`✅ Build complete in ${elapsed}s`);

        // 3. Optional deploy command (e.g. rsync to web root)
        if (DEPLOY_CMD) {
            log(`Running deploy: ${DEPLOY_CMD}`);
            await runStep(DEPLOY_CMD, [], { shell: true });
            log('✅ Deploy complete');
        }
    } catch (err) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        log(`❌ Build failed after ${elapsed}s — ${err.message}`);
    }

    building = false;

    // If a new request arrived while we were building, run one more time
    if (pendingRebuild) {
        pendingRebuild = false;
        triggerBuild();
    }
}

function triggerBuild() {
    if (building) {
        pendingRebuild = true; // coalesce — only one extra build queued
        log('Build already running — will rebuild once current finishes.');
        return;
    }
    building = true;
    doBuild(); // intentionally not awaited — runs in background
}

// ── HTTP server ──────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
    // Health check
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true, building }));
    }

    if (req.method !== 'POST' || req.url !== '/rebuild') {
        res.writeHead(404);
        return res.end();
    }

    // Validate secret token
    if (SECRET) {
        const token =
            req.headers['x-webhook-secret'] ||
            (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
        if (token !== SECRET) {
            log('Unauthorized request — wrong or missing secret.');
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
    }

    // 202 immediately — build runs asynchronously
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Rebuild triggered', building }));

    triggerBuild();
    log('Rebuild triggered via webhook.');
});

server.listen(PORT, () => {
    log(`Listening on port ${PORT}`);
    log(`POST http://localhost:${PORT}/rebuild  (X-Webhook-Secret: ${SECRET ? '***' : 'NOT SET'})`);
    if (!SECRET) log('⚠️  WEBHOOK_SECRET is not set — any request will trigger a build!');
    if (DEPLOY_CMD) log(`Deploy command configured: ${DEPLOY_CMD}`);
});
