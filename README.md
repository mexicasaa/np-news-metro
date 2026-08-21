# NP News Metro 📰

> **Real News. Real Impact.**  
> A high-performance, editorial-first news website and WordPress theme designed for modern Indian newsrooms with multi-format publishing (breaking news, opinions, video hubs, photo galleries, live timelines, commercial ad zones, and bilingual support).

---

## 🌟 Overview & Architecture

This repository contains:

1. **WordPress Theme (`wordpress-theme/np-news-metro/`):**
   - 100% production-ready native WordPress theme (PHP 7.4 - 8.4+, WordPress 6.x+).
   - All 14 page templates (Homepage, Latest, Categories, Single Articles, Video Hub & Detail, Photo Galleries, Search, Author Profiles, Trending Top 10, Static Info, and 404).
   - Zero external plugin dependencies for custom editorial fields (Story Deks, Key Takeaways, Corrections Notes, Live Timelines, Video Transcripts).
   - Pre-compiled Tailwind CSS bundle (zero Node.js build required on the WordPress host).
   - Commercial monetization zones (Ad Zones A1–A7) with Cumulative Layout Shift (CLS) prevention.

2. **React 18 + Vite + TypeScript Prototype (`src/`):**
   - High-fidelity interactive SPA for headless React architecture or design testing.
   - 14 interactive templates with bilingual switching (English / Hindi).

---

## 🚀 WordPress Installation

### Method 1: Build & Upload ZIP
1. Run the build command to generate the latest installable archive:
   ```bash
   npm run build:zip
   ```
2. In your WordPress Admin Dashboard (`/wp-admin`):
   - Go to **Appearance > Themes > Add New Theme**.
   - Click **Upload Theme** and select `np-news-metro.zip`.
   - Click **Install Now**, then **Activate**.

### Method 2: Direct Directory Copy
Copy the `wordpress-theme/np-news-metro/` folder directly to:
```
wp-content/themes/np-news-metro/
```
Then activate it under **Appearance > Themes**.

---

## 🛠️ Development & Build Scripts

```bash
# Install dependencies
npm install

# Start React development server
npm run dev

# Compile React production build
npm run build

# Compile Tailwind CSS for WordPress theme
npm run build:theme

# Build and package WordPress ZIP archives
npm run build:zip
```

---

## 📂 Repository Structure

```
├── wordpress-theme/
│   └── np-news-metro/             # Standalone WordPress Theme
│       ├── style.css              # Theme metadata & base styles
│       ├── functions.php          # Theme setup & module loader
│       ├── header.php             # Global header, nav, tickers
│       ├── footer.php             # Footer & modals
│       ├── front-page.php         # 01 Homepage template
│       ├── archive.php            # 02 Latest news stream
│       ├── category.php           # 03 Category landing
│       ├── single.php             # 04, 05, 06 Article dispatcher
│       ├── archive-video.php      # 07 Video Hub
│       ├── single-video.php       # 08 Video Detail
│       ├── single-gallery.php     # 09 Photo Gallery
│       ├── search.php             # 10 Search results
│       ├── author.php             # 11 Author profile
│       ├── page-trending.php      # 12 Trending Top 10
│       ├── page.php               # 13 Static information pages
│       ├── 404.php                # 14 404 Error page
│       ├── inc/                   # Meta boxes, CPTs, widgets, tags
│       ├── template-parts/        # Reusable component cards & headers
│       └── assets/                # Compiled CSS, JS, and brand assets
├── src/                           # React + TypeScript Frontend SPA
├── scripts/
│   └── build-theme-zip.js         # Cross-platform ZIP builder
└── package.json
```

---

## 📄 License
GNU General Public License v2 or later.
