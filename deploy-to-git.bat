@echo off
echo Pushing Sewing Circle v3.2 to GitHub...
echo.
echo Make sure you have created the repo at: https://github.com/nitinraj21x/v3.2
echo.

git init
git add .
git commit -m "Deploy v3.2"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/nitinraj21x/v3.2.git
git push -u origin main

echo.
echo Done! Now deploy on Render - see DEPLOY_TO_RENDER.md
pause
