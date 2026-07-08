// Optional cross-origin support. On Vercel the page and API share an origin, so
// this does nothing unless you set ALLOWED_ORIGINS (comma-separated) — e.g. if
// you ever serve the page from a different domain. Returns true if it already
// handled the request (a preflight), in which case the caller should stop.
function applyCors(req, res) {
    const allowed = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const origin = req.headers.origin;

    if (origin && allowed.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return true;
    }
    return false;
}

module.exports = { applyCors };
