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

        console.log(`[BACKEND] Fetching all branches for ${owner}/${repo}...`);

        let allBranches = [];
        let page = 1;
        let hasNextPage = true;

        while (hasNextPage) {
            const url = `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100&page=${page}`;
            console.log(`[BACKEND] Fetching page ${page}...`);

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${req.githubToken}`,
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'GitHub-Repo-Viewer',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw { status: response.status, message: `GitHub API error: ${response.status}`, details: errorText };
            }

            const branches = await response.json();
            allBranches = allBranches.concat(branches);
            console.log(`[BACKEND] Got ${branches.length} branches. Total so far: ${allBranches.length}`);

            // Check GitHub Link header for "next" page
            const linkHeader = response.headers.get('link');
            if (linkHeader && linkHeader.includes('rel="next"')) {
                page++;
            } else {
                hasNextPage = false;
            }
        }

        console.log(`[BACKEND] Finished. Total branches sent: ${allBranches.length}`);
        res.json(allBranches);
    } catch (error) {
        console.error('[BACKEND ERROR]', error);
        res.status(error.status || 500).json({
            error: error.message,
            details: error.details || 'Unknown error',
        });
    }
});

// GET /api/github/repo?owner=xxx&repo=xxx
app.get('/api/github/repo', requireToken, async (req, res) => {
    try {
        const { owner, repo } = req.query;

        if (!owner || !repo) {
            return res.status(400).json({ error: 'Missing required parameters: owner, repo' });
        }

        const url = `https://api.github.com/repos/${owner}/${repo}`;
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

// DELETE /api/github/branches?owner=xxx&repo=xxx&branch=xxx
app.delete('/api/github/branches', requireToken, async (req, res) => {
    try {
        const { owner, repo, branch } = req.query;

        if (!owner || !repo || !branch) {
            return res.status(400).json({ error: 'Missing required parameters: owner, repo, branch' });
        }

        console.log(`[BACKEND] Deleting branch ${branch} from ${owner}/${repo}...`);

        const url = `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${req.githubToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-Repo-Viewer',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw { status: response.status, message: `GitHub API error: ${response.status}`, details: errorText };
        }

        res.status(204).send();
    } catch (error) {
        console.error('[BACKEND ERROR]', error);
        res.status(error.status || 500).json({
            error: error.message,
            details: error.details || 'Unknown error',
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 GitHub Proxy Server running on http://localhost:${PORT}`);
});
