# Sewing Circle v3.2

Full-stack social platform for the Sewing Circle community.

## Stack

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + MongoDB Atlas
- Deployment: Render (backend as Web Service, frontend as Static Site)

## Local Development

```bash
# Backend
cd backend
npm install
npm run dev   # runs on http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev   # runs on http://localhost:5173
```

## Deployment

See [DEPLOY_TO_RENDER.md](./DEPLOY_TO_RENDER.md) for full Render deployment instructions.

Run `deploy-to-git.bat` to push to GitHub.
