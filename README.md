# Pomodoro Timer PWA

A simple, beautiful Pomodoro timer app built with React that can be installed as a Progressive Web App (PWA).

Beautiful? This was just an experiment in vibe coding lol

## Features

- ⏱️ Adjustable focus time (default: 45 minutes)
- ☕ Adjustable short break (default: 5 minutes)
- 🍃 Adjustable long break (default: 10 minutes)
- 🔄 Adjustable number of sessions before a long break (default: 1)
- ⚡ Quick time entry for custom countdown timers (e.g., 17 minutes before a meeting)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Generating PWA Icons

Before building, you need to create the PWA icon files:

**Option 1: Using the HTML generator (easiest)**
1. Open `generate-icons.html` in your browser
2. Click "Generate Icons"
3. Save the downloaded PNG files to the `public/` folder

**Option 2: Convert SVG to PNG**
1. The SVG templates are already in `public/` (pwa-192x192.svg and pwa-512x512.svg)
2. Use an online converter like https://cloudconvert.com/svg-to-png
3. Convert to PNG at the exact sizes (192x192 and 512x512)
4. Save as `pwa-192x192.png` and `pwa-512x512.png` in the `public/` folder

**Option 3: Manual creation**
Create 192x192 and 512x512 PNG images and save them as `pwa-192x192.png` and `pwa-512x512.png` in the `public/` folder.

## Installing as PWA

After creating the icons and building the app:

1. Build the app: `npm run build`
2. Preview: `npm run preview`
3. Open the preview URL in Chrome
4. Look for the install icon (⊕) in the address bar, or check the browser menu
5. Click "Install" to add it to your home screen/desktop

The app will work offline and can be launched like a native app!

**Note:** If you don't see the install option, make sure:
- The icon files (pwa-192x192.png and pwa-512x512.png) exist in the `public/` folder
- You've rebuilt the app after adding the icons
- You're using a modern browser (Chrome, Edge, Safari)
- The app is served over HTTPS or localhost (required for PWA)

