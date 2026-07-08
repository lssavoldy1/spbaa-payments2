// Optional cross-origin support. Does nothing unless you set ALLOWED_ORIGINS.
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
