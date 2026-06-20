/**
 * Webhook server — POST /rebuild
 *
 * Verifies HMAC-SHA256 signatures sent by the Laravel backend
 * (X-Webhook-Timestamp + X-Webhook-Signature headers).
 *
 * Env vars:
 *   WEBHOOK_PORT       Port to listen on (default: 9000)
 *   WEBHOOK_SECRET     Shared secret for HMAC-SHA256 verification
 *   WEBHOOK_BUILD_MODE Astro build mode — production or development (default: production)
 *   WEBHOOK_DEPLOY_CMD Optional shell command to run after a successful build
 *   WEBHOOK_SIGNATURE_TOLERANCE  Max age of timestamp in seconds (default: 300)
 */

import http from 'http';
import { spawn } from 'child_process';
import { createHmac, timingSafeEqual } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT      = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT      = parseInt(process.env.WEBHOOK_PORT || '9000', 10);
const SECRET    = process.env.WEBHOOK_SECRET || '';
const BUILD_MODE  = process.env.WEBHOOK_BUILD_MODE || 'production';
const DEPLOY_CMD  = process.env.WEBHOOK_DEPLOY_CMD || '';
const TOLERANCE   = parseInt(process.env.WEBHOOK_SIGNATURE_TOLERANCE || '300', 10);
const IS_WIN      = process.platform === 'win32';

function log(msg) {
    console.log(`[webhook] ${new Date().toISOString()}  ${msg}`);
}

// ── Build state ──────────────────────────────────────────────────────────────

let building = false;
let pendingRebuild = false;
let lastSuccessAt = null;
let currentRelease = null;

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
        await runStep('node', ['scripts/sync-content.js', '--clean', '--mode', BUILD_MODE]);
        await runStep('node', ['node_modules/.bin/astro', 'build', '--mode', BUILD_MODE]);

        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        log(`✅ Build complete in ${elapsed}s`);

        if (DEPLOY_CMD) {
            log(`Running deploy: ${DEPLOY_CMD}`);
            await runStep(DEPLOY_CMD, [], { shell: true });
            log('✅ Deploy complete');
        }

        lastSuccessAt = new Date().toISOString();
        currentRelease = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    } catch (err) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        log(`❌ Build failed after ${elapsed}s — ${err.message}`);
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

// ── HMAC verification ────────────────────────────────────────────────────────

function verifyHmac(timestamp, rawBody, receivedSig) {
    if (!SECRET) return true; // no secret configured → open
    const expected = 'sha256=' + createHmac('sha256', SECRET)
        .update(timestamp + '.' + rawBody)
        .digest('hex');
    const a = Buffer.from(receivedSig || '');
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}

function readBody(req) {
    return new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', () => resolve(''));
    });
}

// ── HTTP server ──────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            ok: true,
            building,
            last_success_at: lastSuccessAt,
            current_release: currentRelease,
        }));
    }

    if (req.method !== 'POST' || req.url !== '/rebuild') {
        res.writeHead(404);
        return res.end();
    }

    const rawBody  = await readBody(req);
    const timestamp = req.headers['x-webhook-timestamp'] || '';
    const signature = req.headers['x-webhook-signature'] || '';

    // Timestamp replay-attack guard
    if (SECRET && timestamp) {
        const age = Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp, 10));
        if (age > TOLERANCE) {
            log(`Rejected — timestamp too old (${age}s > ${TOLERANCE}s)`);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Timestamp expired' }));
        }
    }

    if (!verifyHmac(timestamp, rawBody, signature)) {
        log('Unauthorized request — invalid HMAC signature.');
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Rebuild triggered', building }));

    triggerBuild();
    log('Rebuild triggered via webhook.');
});

server.listen(PORT, () => {
    log(`Listening on port ${PORT}`);
    log(`POST http://localhost:${PORT}/rebuild  (HMAC-SHA256: ${SECRET ? 'enabled' : 'DISABLED — no secret set'})`);
    if (!SECRET) log('⚠️  WEBHOOK_SECRET is not set — any request will trigger a build!');
    if (DEPLOY_CMD) log(`Deploy command configured: ${DEPLOY_CMD}`);
});
