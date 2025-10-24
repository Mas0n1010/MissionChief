# Deploying to Vercel

## Quick Deploy

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from this directory**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new one
   - Accept the default settings
   - Deploy!

## Deploy via GitHub

1. **Push this repository to GitHub**

2. **Go to [Vercel](https://vercel.com)**

3. **Import your repository**:
   - Click "New Project"
   - Import from GitHub
   - Select this repository

4. **Deploy**:
   - Vercel will automatically detect this is a static site
   - Click "Deploy"
   - Done!

## Deploy via Vercel Dashboard

1. **Zip these files**:
   - `landing.html`
   - `rnli-game.html`
   - `rnli-game.css`
   - `rnli-game.js`
   - `game.html`
   - `game.js`
   - `style.css`
   - `menu.html`
   - `menu.css`
   - `index.html`
   - `vercel.json`

2. **Go to Vercel Dashboard**

3. **Drag and drop the zip file**

4. **Deploy!**

## File Structure

```
/
├── landing.html         (Main landing page)
├── rnli-game.html       (Dispatch simulation game)
├── rnli-game.css        (Dispatch game styles)
├── rnli-game.js         (Dispatch game logic)
├── game.html            (Action game)
├── game.js              (Action game logic)
├── style.css            (Action game styles)
├── menu.html            (Action game menu)
├── menu.css             (Action game menu styles)
├── index.html           (Action game menu duplicate)
└── vercel.json          (Vercel configuration)
```

## Access URLs

After deployment, you can access:
- **Main Landing**: `https://your-project.vercel.app/`
- **Dispatch Game**: `https://your-project.vercel.app/rnli-game.html`
- **Action Game**: `https://your-project.vercel.app/game.html`

## Troubleshooting

### CSS Not Loading
- Make sure all files are in the root directory
- Check browser console for 404 errors
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

### Game Not Starting
- Check browser console for JavaScript errors
- Make sure JavaScript is enabled
- Try in a different browser

### Vercel Build Fails
- Verify `vercel.json` syntax is correct
- Check all file paths are relative
- Ensure no file names have spaces

## Local Testing

To test locally before deploying:

1. **Use Python**:
   ```bash
   python3 -m http.server 8000
   ```
   Then visit: `http://localhost:8000/landing.html`

2. **Use Node.js**:
   ```bash
   npx http-server -p 8000
   ```
   Then visit: `http://localhost:8000/landing.html`

3. **Use VS Code Live Server**:
   - Install "Live Server" extension
   - Right-click `landing.html`
   - Select "Open with Live Server"

## Notes

- This is a static site (no backend required)
- All game logic runs in the browser
- No database or server needed
- Perfect for Vercel's free tier!
