# GitHub Setup Instructions for HVP Dashboard

Follow these steps to push your dashboard project to GitHub and set up GitHub Pages:

## 1. Initialize Git Repository

```bash
cd /Users/scotthandley/Code/hvp/hvp-project-dashboard
git init
git add .
git commit -m "Initial commit of HVP Dashboard"
```

## 2. Connect to GitHub Repository

```bash
# Add your GitHub repository as the remote origin
git remote add origin https://github.com/shandley/hvp-project-dashboard.git

# Verify the remote was added correctly
git remote -v
```

## 3. Push to GitHub

```bash
# Push to main branch
git push -u origin main
```

If you're using a different default branch (e.g. master):
```bash
git push -u origin master
```

## 4. Set Up GitHub Pages

1. Go to your GitHub repository: https://github.com/shandley/hvp-project-dashboard
2. Click on "Settings" (top navigation)
3. On the left sidebar, click "Pages"
4. Under "Source", select "GitHub Actions"
5. You should see your existing workflow already configured

## 5. Check Deployment

1. GitHub Actions will automatically start building and deploying your site
2. Go to the "Actions" tab to monitor the workflow
3. Once complete, your site will be available at: https://shandley.github.io/hvp-project-dashboard/

## Troubleshooting

### Permission Issues
If you encounter permission issues when pushing:
- Make sure you have the correct GitHub permissions
- Consider using a personal access token or SSH key for authentication

### GitHub Pages Not Deploying
- Check your workflow run in the Actions tab for errors
- Verify the GitHub Pages settings are correct in the repository settings
- Ensure the repository visibility settings allow GitHub Pages

### Other Issues
- Check that node_modules is properly ignored in .gitignore
- Verify all necessary files are committed
- Make sure your main branch is properly set up