# Push to GitHub

Quick guide to push this project to your GitHub repository.

## Step 1: Initialize Git (if not already done)

```bash
cd AC_SewingCircle/v3.1
git init
```

## Step 2: Add Remote Repository

```bash
git remote add origin https://github.com/nitinraj21x/SewingCircle.git
```

If remote already exists, update it:
```bash
git remote set-url origin https://github.com/nitinraj21x/SewingCircle.git
```

## Step 3: Add Files

```bash
git add .
```

## Step 4: Commit

```bash
git commit -m "Prepare for Render deployment"
```

## Step 5: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

If you get an error about existing files:
```bash
git push -u origin main --force
```

## Verify

Go to https://github.com/nitinraj21x/SewingCircle and verify your files are there.

## Next Step

After pushing to GitHub, follow **[DEPLOY_TO_RENDER.md](./DEPLOY_TO_RENDER.md)** to deploy your application.
