# Deployment Guide for Jeopardy: The Brandsmen Edition

## Quick Deployment Steps

### Step 1: Build for Production
```bash
npm run build
```

### Step 2: Upload to cPanel
1. Go to your cPanel File Manager
2. Navigate to `public_html/`
3. Create folder `jeopardy` if it doesn't exist
4. Upload ALL contents from the `dist` folder into `public_html/jeopardy/`

### Step 3: Verify
- Visit: https://thebrandsmen.com/jeopardy
- All images, favicon, and assets should load correctly
- Game functionality should work identically to local development

## Important Notes

✅ **Local Development**: Still works at `http://localhost:8080/`
✅ **Production**: Will work at `https://thebrandsmen.com/jeopardy/`
✅ **No Code Changes Needed**: Vite automatically handles path differences
✅ **No Git Commits Required**: This is build-time configuration only

## Troubleshooting

If assets don't load:
1. Check that files are in `public_html/jeopardy/` (not `public_html/jeopardy/dist/`)
2. Verify folder permissions are set to 755
3. Clear browser cache and try again

## Future Updates

To update the live site:
1. Make changes locally
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Upload new `dist` contents to `public_html/jeopardy/`
5. No need to commit build files to Git!