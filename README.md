# NP News Metro 📰

> **Real News. Real Impact.**  
> A high-performance, editorial-first news website and publishing platform built with **React 18, Vite, TypeScript, Tailwind CSS, and Supabase Cloud Database & Storage**.

---

## 🌟 Architecture (100% Pure React + Supabase)

NP News Metro is a modern, single-framework architecture:

1. **Frontend (React 18 + Vite + TypeScript):**
   - 14 full editorial reader templates (Homepage, Latest News, Desks/Categories, Standard Article, Breaking News, Opinion, Video Hub, Video Detail, Photo Gallery, Search, Author Profile, Trending Top 10, Static Info, and 404).
   - High-density Admin Dashboard (Publishing Center, Article Editor, Editorial List View, Layout Manager, Media Library, User Roles, and SEO Health).
   - Full bilingual support (English & Hindi).
   - Commercial monetization zones (Ad Zones A1–A7) with Cumulative Layout Shift (CLS) prevention.

2. **Backend & Database (Supabase PostgreSQL + Auth + Storage):**
   - PostgreSQL schema for `articles`, `deleted_articles` (recovery archive), `videos`, `profiles`, `media`, `categories`, `tags`, and `redirects`.
   - Real-time authenticated persistence with Row Level Security (RLS).
   - Supabase Storage for high-resolution featured image & media uploads.

3. **SEO & Discovery Engine:**
   - Public XML Sitemaps (`/sitemap.xml`, `/news-sitemap.xml`, `/image-sitemap.xml`, `/video-sitemap.xml`) with XSLT styling (`/sitemap.xsl`).
   - Robots crawler directives (`/robots.txt`) and RSS 2.0 feed (`/rss.xml`).
   - Automated JSON-LD structured data (`NewsArticle`, `VideoObject`, `WebSite`).

---

## 🛠️ Development & Deployment

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:3000)
npm run dev

# Compile production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🔒 Admin Access
- Navigate to `/admin` or click the Staff icon in the top header.
- Authenticate with your newsroom staff credentials.