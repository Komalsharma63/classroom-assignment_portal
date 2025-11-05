# Deploying the backend to Render

This file describes exactly how to deploy the `server` backend (Node + Express) to Render.com when your repository contains a `server` folder for the backend.

## Quick summary (use these values in Render)
- Service type: Web Service
- Root Directory: `server`  <-- important
- Branch: `main`
- Build Command: `npm install`
- Start Command: `npm start`
- Instance Type / Plan: Free (or choose one you prefer)

## Before you start on Render (local checks)
1. Ensure `server/package.json` includes a start script:
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```
2. Ensure the server uses the Render port variable:
   ```js
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`Server running on ${PORT}`));
   ```
3. Do not commit real secrets to the repo. Keep `.env` out of git and use Render environment variables.

## Steps on Render
1. Sign in to https://render.com using your GitHub account and authorize access to the repository.
2. Click **New +** → **Web Service**.
3. Choose the repository and branch `main`.
4. Set the following fields:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node` (default)
   - Region: your nearest region
   - Instance type: `Free`
5. Click **Create Web Service**.

## Add environment variables (if needed)
If your server uses environment variables (recommended), add them in the service settings: **Settings → Environment**.
Common variables:
- `MONGO_URI` = mongodb+srv://... (MongoDB Atlas connection string)
- `JWT_SECRET` = your_jwt_secret_here
- `NODE_ENV` = production

After adding env vars: click **Save** and then **Manual Deploy → Clear build cache & deploy**.

## Notes & recommendations
- Uploaded files stored in `/uploads` are ephemeral on Render — use S3 / Cloud Storage for persistence.
- Remove or protect debug routes (like `/__routes` or `/debug-users`) before making the site public.
- If the build fails, copy the Render build logs and share them here; I can troubleshoot specific errors.

## Troubleshooting quick tips
- If `mongoose` fails with "uri must be a string, got undefined", make sure `MONGO_URI` is set in Render environment variables and you are not committing `.env` with a wrong path.
- If server exits on start, check logs for missing env vars or dependency install errors.

---
If you’d like, I can also:
- Create a `render.yaml` to declare the service automatically (I can add it to the repo), or
- Add a root-level `package.json` helper that does `npm --prefix server install` and `npm --prefix server start` (handy if you want to run from root),
- Or walk you through the Render UI live and confirm your env vars and deploy.

Which of those next steps would you like me to do? (I can add `render.yaml`, add a root helper script, or walk you through the Render UI.)