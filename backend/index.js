import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper: make authenticated GitHub API requests
async function githubFetch(url, token) {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Repo-Viewer',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`GitHub API error: ${response.status}`);
        error.status = response.status;
        error.details = errorText;
        throw error;
    }

    return response.json();
}

// Middleware: extract and validate GitHub token
function requireToken(req, res, next) {
    const token = req.headers['x-github-token'];
    if (!token) {
        return res.status(401).json({ error: 'Missing GitHub token in X-GitHub-Token header' });
    }
    req.githubToken = token;
    next();
}

// GET /api/github/branches?owner=xxx&repo=xxx
app.get('/api/github/branches', requireToken, async (req, res) => {
    try {
        const { owner, repo } = req.query;

        if (!owner || !repo) {
            return res.status(400).json({ error: 'Missing required parameters: owner, repo' });
        }

        const url = `https://api.github.com/repos/${owner}/${repo}/branches`;
        const data = await githubFetch(url, req.githubToken);
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({
            error: error.message,
            details: error.details || 'Unknown error',
        });
    }
});

// GET /api/github/tree?owner=xxx&repo=xxx&branch=xxx
app.get('/api/github/tree', requireToken, async (req, res) => {
    try {
        const { owner, repo, branch } = req.query;

        if (!owner || !repo || !branch) {
            return res.status(400).json({ error: 'Missing required parameters: owner, repo, branch' });
        }

        const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
        const data = await githubFetch(url, req.githubToken);
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({
            error: error.message,
            details: error.details || 'Unknown error',
        });
    }
});

// GET /api/github/file?owner=xxx&repo=xxx&path=xxx&branch=xxx
app.get('/api/github/file', requireToken, async (req, res) => {
    try {
        const { owner, repo, path, branch } = req.query;

        if (!owner || !repo || !path || !branch) {
            return res.status(400).json({ error: 'Missing required parameters: owner, repo, path, branch' });
        }

        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`;
        const data = await githubFetch(url, req.githubToken);
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({
            error: error.message,
            details: error.details || 'Unknown error',
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 GitHub Proxy Server running on http://localhost:${PORT}`);
});
