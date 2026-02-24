# GitHub Repo Viewer

A full-stack web application that allows users to view GitHub repositories in read-only mode using a Personal Access Token (PAT).

## Features

- View any GitHub repository (public or private) with a valid PAT
- Browse repository branches
- Explore file tree with expandable/collapsible folders
- View file contents with syntax highlighting (Monaco Editor)
- Copy file contents to clipboard
- Clean and responsive UI
- Secure token handling (never stored, only used per request)

## Tech Stack

**Frontend:**
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Monaco Editor for code viewing
- Lucide React for icons

**Backend:**
- Supabase Edge Functions (Deno runtime)
- GitHub REST API integration

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- GitHub Personal Access Token with appropriate repository permissions

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

The project comes pre-configured with Supabase credentials in `.env`. The file should contain:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Edge Function Deployment

The GitHub proxy edge function is already deployed to Supabase. It handles all communication with the GitHub API.

### 4. Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## How to Use

### Step 1: Get a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name
4. Select scopes:
   - For public repos: `public_repo`
   - For private repos: `repo` (full control)
5. Generate and copy the token

### Step 2: Load a Repository

1. Enter the GitHub repository URL (e.g., `https://github.com/owner/repo`)
2. Paste your Personal Access Token
3. Click "Load Repository"

### Step 3: Browse and View Files

1. Select a branch from the dropdown
2. Navigate through the file tree
3. Click on any file to view its contents
4. Use the "Copy" button to copy file contents to clipboard

## Security

- PAT is never stored in localStorage, cookies, or any database
- PAT is only sent via headers to the secure edge function
- Edge function validates all requests
- CORS is properly configured for security
- All API calls go through the Supabase Edge Function proxy

## API Endpoints (Edge Function)

The application uses a single edge function endpoint with different query parameters:

### Get Branches
```
GET /functions/v1/github-proxy?endpoint=branches&owner={owner}&repo={repo}
Headers: X-GitHub-Token: {your_pat}
```

### Get Repository Tree
```
GET /functions/v1/github-proxy?endpoint=tree&owner={owner}&repo={repo}&branch={branch}
Headers: X-GitHub-Token: {your_pat}
```

### Get File Content
```
GET /functions/v1/github-proxy?endpoint=file&owner={owner}&repo={repo}&path={path}&branch={branch}
Headers: X-GitHub-Token: {your_pat}
```

## Project Structure

```
/project
├── src/
│   ├── components/
│   │   ├── RepoInputForm.tsx      # Repository URL and PAT input
│   │   ├── BranchSelector.tsx     # Branch selection dropdown
│   │   ├── FileExplorer.tsx       # File tree navigation
│   │   └── CodeViewer.tsx         # Code display with Monaco Editor
│   ├── services/
│   │   └── githubService.ts       # GitHub API integration
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles
├── supabase/
│   └── functions/
│       └── github-proxy/
│           └── index.ts           # Edge function for GitHub API proxy
├── .env                           # Environment variables
└── README.md                      # This file
```

## Troubleshooting

### "Failed to load repository"
- Verify the repository URL is correct
- Check that your PAT has the necessary permissions
- Ensure the PAT hasn't expired

### "GitHub API error: 404"
- The repository doesn't exist or your PAT doesn't have access
- Check the repository visibility and PAT scopes

### "Failed to load file content"
- The file might be too large
- Binary files may not display correctly
- Try a different file

## License

MIT

## Credits

Built with React, Vite, Supabase, and Monaco Editor.
