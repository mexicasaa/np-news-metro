# NP News Metro — WordPress News Portal Page Design Specification

## Purpose

This document is the master design-generation and implementation prompt for the **NP News Metro** WordPress news portal.

The goal is to create a **simple, minimal, editorial, trustworthy, Indian news-media website** that looks like a professional publication rather than a generic blog, SaaS website, news theme demo, or overly decorative AI-generated interface.

The design must be:

- Clean
- Minimal
- Premium
- Editorial
- Highly readable
- Mobile-first
- WordPress-compatible
- Easy for editors to update daily
- Modular
- SEO-friendly
- Advertisement-ready
- Video-ready
- Fast and performance-conscious
- Consistent across all pages

The approved visual direction for NP News Metro should be based on the latest logo direction:

**NP NEWS METRO**  
**REAL NEWS. REAL IMPACT.**

Use the brand identity as a foundation, but do not let the logo force the entire interface into a heavy corporate or overly colorful style.

---

# 1. Exact Number of Page Templates

Design exactly **14 unique page templates**.

Do NOT create separate designs for every news category.

The following all use the same reusable Category template:

- India
- Politics
- Business
- Economy
- World
- Technology
- Sports
- Entertainment
- Lifestyle
- Education
- Health
- Science
- Auto
- Real Estate
- Jobs
- Other editorial categories

Likewise, individual authors use the same Author template, and individual articles use the appropriate Article template.

## The 14 templates

| # | Template | Primary Purpose |
|---|---|---|
| 01 | Homepage | Main editorial front page |
| 02 | Latest News | Chronological news stream |
| 03 | Category / Section | Reusable category landing page |
| 04 | Standard News Article | Normal news story |
| 05 | Breaking News Article | Urgent/breaking story |
| 06 | Opinion Article | Opinion/editorial story |
| 07 | Video Hub | All video content |
| 08 | Video Detail | Individual video story |
| 09 | Photo / Gallery | Image-led story |
| 10 | Search Results | Search and filtering |
| 11 | Author Profile | Journalist/contributor page |
| 12 | Trending / Most Read | Popular and trending content |
| 13 | Static Information | About, editorial team, contact, advertise, newsletter, policies |
| 14 | 404 / Error | Broken or unavailable pages |

These are **templates**, not 14 unrelated pages.

---

# 2. Overall Information Architecture

## Primary Navigation

Design the main navigation around the publication's editorial hierarchy.

Recommended structure:

**Home | Latest | India | Politics | Business | Economy | World | Technology | Sports | Entertainment | Lifestyle | Opinion | Videos**

Do not force every category into the first-level navigation if the screen becomes crowded.

Use a **More** or mega-menu for secondary sections.

## Secondary / Utility Navigation

Possible items:

- Trending
- Most Read
- Photos
- Explainers
- Newsletter
- About
- Advertise

## Footer Navigation

Include:

- About Us
- Editorial Team
- Contact Newsroom
- Advertise With Us
- Careers
- Newsletter
- Editorial Policy
- Corrections Policy
- Fact-checking / Ethics
- Privacy Policy
- Terms
- Cookie Policy
- RSS
- Social links

---

# 3. Global Design System

Every page must use the same design system.

## Brand

Primary brand:

**NP NEWS METRO**

Tagline:

**REAL NEWS. REAL IMPACT.**

## Visual personality

The design should feel:

- Indian
- Urban
- Contemporary
- Editorial
- Credible
- Fast
- Human
- Professional

It should NOT feel:

- Royal
- Hotel-like
- Luxury fashion
- Political party branding
- Government portal
- Generic international startup
- Overly futuristic
- Cartoonish
- AI-generated

## Color direction

Primary neutral palette:

- Off-white / warm white background
- White content surfaces
- Deep charcoal text
- Soft gray borders
- Muted gray metadata

Brand accent:

- Use the approved NP News Metro red and dark navy/black identity.

Red should be selective, primarily for:

- Important labels
- Active states
- Breaking News
- Small accents
- Buttons where needed
- Editorial rules

Do not turn the whole website red.

## Typography

Use a strong editorial typography pairing:

### Headlines

A modern newspaper-inspired serif or sophisticated display serif.

### Interface and body

A clean contemporary sans-serif.

The combination should communicate:

**Newspaper heritage + modern digital journalism**

Do not use handwritten fonts.

Do not use decorative royal typography.

Do not use more than 2 primary font families.

---

# 4. Global Header Structure

The header must remain consistent across the site.

## Desktop

### Utility bar

Very compact.

Possible items:

- Date
- Edition/location
- Weather
- Newsletter
- Search
- Login/Account if needed

Keep this visually quiet.

### Main header

Left:

Menu

Center/left:

**NP NEWS METRO logo**

Right:

Search

Subscribe / Newsletter / Account if required

### Primary navigation

Horizontal category navigation.

Active section should have a subtle underline or brand-color indicator.

### Breaking News strip

Immediately below navigation.

Example:

**BREAKING NEWS**  
Headline headline headline...

Use restrained animation if needed.

The strip must never create an annoying flashing-news effect.

---

# 5. Global Ad Architecture

Advertisements must be treated as part of the product architecture.

Design reusable ad slots:

### A1 — Header Leaderboard

Desktop:

728x90 style reserved space.

### A2 — Top Content Ad

Between header and main editorial content.

### A3 — Sidebar Ad

300x250 or responsive equivalent.

### A4 — In-content Ad

Inserted between article sections.

### A5 — Mobile Inline Ad

Responsive mobile ad slot.

### A6 — Bottom Sticky Ad

Optional and configurable.

### A7 — Homepage Section Ad

Between major editorial blocks.

Every ad slot must have:

**ADVERTISEMENT**

as small muted text.

Ad slots must never break grid alignment or push content into awkward positions.

---

# 6. Template 01 — Homepage

## Purpose

The homepage is the most important screen.

It should behave like a **digital newspaper front page**, not a marketing landing page.

## Structure

### 1. Header

Global header.

### 2. Breaking News

Compact ticker.

### 3. Top Advertisement

Reserved ad space.

### 4. Lead Editorial Grid

Primary story:

- Large image
- Category
- Headline
- Summary
- Author
- Time
- Read time

Secondary stories:

- 2–4 supporting stories
- Smaller visual hierarchy

Important rule:

The primary story must clearly dominate.

### 5. Latest News

Chronological stream.

Each item:

- Time
- Category
- Headline
- Optional thumbnail

### 6. Major Categories

Use reusable editorial section blocks.

Examples:

- India
- Politics
- Business
- Economy
- World
- Technology
- Sports
- Entertainment
- Lifestyle

Each section should have:

Section title

View all

1 featured story

2–6 supporting stories

### 7. Video Section

Featured video + supporting videos.

### 8. Opinion Section

Distinct but restrained editorial styling.

### 9. Most Read

Rank:

01  
02  
03  
04  
05

### 10. Newsletter

Compact newsletter module.

### 11. Footer

Global footer.

## Homepage must support WordPress controls

Editors should be able to change:

- Lead story
- Featured stories
- Section order
- Category used in a section
- Number of cards
- Video selection
- Most-read block
- Ad slots
- Breaking news
- Newsletter placement

without redesigning the page.

---

# 7. Template 02 — Latest News Page

## Purpose

Provide a clean chronological stream.

## Structure

Header

Page title:

**Latest News**

Optional date/filter controls.

Featured latest story.

Chronological feed.

Optional sidebar:

- Most Read
- Trending
- Advertisement

Each result:

Thumbnail

Category

Headline

Excerpt

Date

Author if available

## WordPress requirements

Stories should be pulled automatically by publication date.

Editors should NOT manually build this page.

---

# 8. Template 03 — Category / Section Page

This is a reusable template.

Examples:

/india/  
/politics/  
/business/  
/technology/  
/sports/

All use the same design.

## Structure

Header

Breadcrumb

Category title

Optional category description

Featured story

Top stories grid

Latest stories feed

Most Read / Trending

Advertisement

Related sections

Footer

## Optional category features

Support:

- Subcategories
- Category-specific hero image
- Category color
- Category description

Do not create unique visual designs for every category.

Use one template with editable content.

---

# 9. Template 04 — Standard News Article

This is the most important content template after the homepage.

The majority of Google, social and direct traffic will enter through this page.

## Above the fold

Breadcrumb

Category

Large headline

Subheadline / deck

Author

Published date

Updated date if applicable

Read time

Social share

Hero image

Caption

Photo credit

## Article body

Support:

- Paragraphs
- Headings
- Subheadings
- Bold
- Italics
- Lists
- Quotes
- Pull quotes
- Inline images
- Galleries
- Videos
- Embeds
- Charts
- Tables
- Infographics
- Related stories
- Advertisements

## Desktop layout

Recommended:

Main article column

Right sidebar containing:

- Advertisement
- Most Read
- Related content

## Mobile

Single-column reading experience.

Do not squeeze the sidebar under every paragraph.

## Article bottom

Author block

Related stories

Most read

Newsletter

Comments if enabled

Footer

---

# 10. Template 05 — Breaking News Article

Use the Standard Article template as the foundation.

Do not create an entirely different site.

Differences:

- Strong Breaking News label
- Red indicator
- More prominent publication/update time
- Compact urgency styling
- Optional live-update timeline
- Optional related breaking stories

Example:

**BREAKING NEWS**

Headline

Published 12 minutes ago

Updated 3 minutes ago

## Optional live updates

Time

Update

Time

Update

The design must communicate urgency without becoming sensationalist.

---

# 11. Template 06 — Opinion Article

Base it on the article template.

Create a stronger editorial identity.

## Above fold

Opinion label

Headline

Author photo

Author name

Designation

Date

Hero image if required

## Body

Long-form reading layout.

Use pull quotes and editorial separators sparingly.

## Bottom

Author profile

More from author

Related opinion

Most read

Newsletter

Do not make Opinion look like a political campaign page.

---

# 12. Template 07 — Video Hub

## Purpose

A dedicated media/video destination.

## Structure

Header

Page title:

**Videos**

Featured video

Latest videos

Categories:

- News
- Interviews
- Explainers
- Business
- Politics
- Sports
- Short Videos

Trending videos

Advertisement

Newsletter

Footer

## Video cards

Each card should show:

- Thumbnail
- Play icon
- Duration
- Category
- Headline
- Date

Use high-quality thumbnails.

Do not make the design look like YouTube.

It should feel like a professional newsroom video platform.

---

# 13. Template 08 — Video Detail

## Structure

Breadcrumb

Category

Headline

Video player

Description

Presenter / author

Published date

Transcript

Related stories

Related videos

Most Read

Advertisement

Newsletter

Footer

## Player requirements

Support:

- Native video
- YouTube embed
- Vimeo embed if required

Video player should be responsive.

Never allow embedded video to overflow mobile screens.

---

# 14. Template 09 — Photo / Gallery Page

## Purpose

For image-led journalism.

## Structure

Category

Headline

Description

Featured image

Gallery

Image counter

Captions

Photo credits

Related stories

Most Read

Advertisement

## Gallery interactions

Support:

- Next/previous
- Fullscreen
- Swipe on mobile
- Captions
- Photo credits

Use clean controls.

Do not overdecorate the gallery.

---

# 15. Template 10 — Search Results

## Search header

Large search field.

Search icon/button.

## Filters

Optional:

- Category
- Date
- Author
- Content type

## Results

Each result:

Thumbnail

Category

Headline

Excerpt

Date

Author

## Empty state

Create an intelligent empty result experience.

Example:

**No stories found**

Then suggest:

- Popular stories
- Latest news
- Related topics

Do NOT create a dead-end blank page.

---

# 16. Template 11 — Author Profile

## Structure

Author photo

Author name

Role

Short biography

Social profiles

Areas of coverage

Latest articles

Popular articles

## Optional

Author contact information should NOT be exposed unless intentionally published.

Use a clean editorial profile, not a social-media profile.

---

# 17. Template 12 — Trending / Most Read

## Purpose

A dedicated popular-content destination.

## Structure

Title:

**Trending / Most Read**

Top ranked stories:

01

02

03

04

05

06

07

08

09

10

Use strong typography.

Optional thumbnail on each ranking.

Sections:

- Today
- This Week
- Most Shared
- Most Commented if available

## Important

The same ranking system should also be available as a reusable component on:

- Homepage
- Article page
- Category page
- Video page

---

# 18. Template 13 — Static Information Template

Do not create separate designs for every informational page.

Use one reusable clean static-page template for:

- About Us
- Editorial Team
- Contact
- Advertise With Us
- Newsletter
- Careers
- Editorial Policy
- Corrections Policy
- Ethics Policy
- Privacy
- Terms
- Cookie Policy

## Structure

Header

Breadcrumb

Page title

Intro

Content sections

Optional sidebar/navigation

Footer

## Special static pages

### About Us

Mission

Publication story

Coverage

Editorial standards

### Editorial Team

Profiles

Roles

Areas of coverage

### Contact

Newsroom contact

Editorial contact

Advertising contact

Technical contact

Forms

### Advertise

Audience summary

Ad formats

Placement examples

Contact

### Newsletter

Benefits

Newsletter examples

Email field

Consent

Subscribe CTA

Do not make static pages visually more complicated than necessary.

---

# 19. Template 14 — 404 / Error

The 404 page should still look like part of the publication.

## Structure

NP News Metro logo

**Page not found**

Short explanation

Search box

Buttons:

Latest News

Homepage

Trending

Most Read

Recommended stories

Do not use a generic WordPress error screen.

---

# 20. Reusable Components

Design these once and reuse them across every template.

## Navigation

- Utility bar
- Header
- Desktop navigation
- Mobile navigation
- Mega menu if needed
- Search overlay

## Editorial

- Hero story
- Large story card
- Medium story card
- Compact card
- Horizontal story card
- Latest story row
- Trending item
- Most-read ranking
- Category header
- Related story block

## Media

- Video card
- Featured video
- Video player
- Gallery
- Photo card
- Audio player if required

## Article

- Breadcrumb
- Article metadata
- Author block
- Social share
- Pull quote
- Inline image
- Image caption
- Photo credit
- Related stories
- Article footer

## Commercial

- Header ad
- Leaderboard
- Sidebar ad
- In-content ad
- Mobile ad
- Sticky ad

## Engagement

- Newsletter
- Search
- Comments if enabled
- Share
- Follow/subscribe

## Site

- Footer
- Cookie banner
- Pagination
- Loading state
- Empty state
- Error state

---

# 21. WordPress Compatibility Requirements

The design must be implementation-friendly for WordPress.

## Preferred approach

Build around:

- WordPress
- Gutenberg / Block Editor
- Reusable blocks
- Custom blocks where required
- Dynamic templates
- WordPress categories
- Tags
- Authors
- Featured images
- Media library
- Custom fields where required

Do not design components that require manual HTML editing for every article.

## Editors should be able to

Create a news article.

Add:

- Headline
- Slug
- Category
- Author
- Featured image
- Caption
- Credit
- Excerpt
- Content
- Tags
- Video
- Gallery
- SEO title
- SEO description
- Social image

Then publish.

The page must automatically render using the correct template.

---

# 22. Dynamic WordPress Content Rules

Design all major content areas as data-driven.

## Homepage

Dynamic.

## Latest News

Dynamic.

## Category

Dynamic.

## Article

Dynamic.

## Author

Dynamic.

## Search

Dynamic.

## Trending

Dynamic.

## Video

Dynamic.

The designer should NEVER create a separate visual screen for:

"Business Article 1"

"Business Article 2"

"Politics Article 1"

etc.

These are data entries rendered by reusable templates.

---

# 23. Editorial Workflow Requirements

The UI must support a newsroom workflow:

Draft

Review

Edit

Schedule

Publish

Update

Correct

Republish

Archive

The frontend must display updated timestamps when a published article changes.

Support:

**Published:** 10:30 AM

**Updated:** 12:14 PM

For important corrections, design a subtle correction notice.

---

# 24. SEO Requirements

The design must support:

- Clean URLs
- Breadcrumbs
- Category hierarchy
- Author pages
- Article metadata
- Canonical URLs
- XML sitemap compatibility
- News sitemap compatibility
- Open Graph
- Social cards
- Article structured data
- NewsArticle schema where appropriate
- Video schema where appropriate
- Image metadata
- Alt text

Avoid design patterns that hide article content behind excessive interactions.

---

# 25. Mobile Requirements

Every one of the 14 templates must have a mobile layout.

Mobile design is NOT simply a scaled desktop design.

## Mobile priorities

1. Branding
2. Navigation
3. Breaking news
4. Main story
5. Latest content
6. Readability
7. Video
8. Advertisement
9. Newsletter
10. Footer

Use one-column layouts where appropriate.

Keep tap targets comfortable.

Do not allow horizontal overflow.

---

# 26. Tablet Requirements

Use a dedicated responsive state.

Typical behavior:

Desktop: 3–4 columns

Tablet: 2 columns

Mobile: 1 column

Sidebars can become:

- Inline
- Collapsible
- Lower-page modules

Do not allow overly dense tablet layouts.

---

# 27. Accessibility Requirements

Design for:

- Keyboard navigation
- Visible focus states
- Strong contrast
- Large enough controls
- Alt text
- Video captions
- Accessible labels
- Screen reader-friendly structure
- Logical heading hierarchy

Do not use color alone to communicate meaning.

---

# 28. Performance Requirements

The design must remain lightweight.

Avoid:

- Video backgrounds
- Heavy animations
- Full-screen transitions
- Excessive JavaScript
- Huge hero assets
- Decorative effects everywhere

Prefer:

- Optimized images
- Responsive image sizes
- Lazy loading
- Systematic spacing
- CSS-based interaction states
- Minimal animation

Visual sophistication must come from typography, layout, imagery and hierarchy.

---

# 29. Editorial Photography Guidelines

Use realistic Indian newsroom photography.

Visual language should cover:

- India
- Indian cities
- Government / public affairs
- Business
- Markets
- Technology
- Sports
- Culture
- People

Avoid excessive stock-photo clichés.

Avoid obviously AI-generated faces.

Photography should feel like actual editorial reporting.

---

# 30. News Card Hierarchy

Every card should visually communicate importance.

### Level 1

Large image

Large headline

Summary

### Level 2

Medium image

Headline

Metadata

### Level 3

Headline

Time

Category

Do not make every story equally large.

The homepage must visually communicate editorial priority.

---

# 31. Design the States Too

Do not design only the ideal content state.

Include:

## Loading

Skeleton cards.

## Empty

No results.

## Error

Content unavailable.

## Missing image

Clean fallback.

## Long headline

Wrap gracefully.

## No excerpt

Card still looks balanced.

## No author photo

Use controlled placeholder.

## Advertiser unavailable

Ad slot collapses cleanly.

## Video unavailable

Fallback thumbnail + link.

---

# 32. URL / Template Examples

The final design must support URL structures such as:

/
/latest/
/india/
/politics/
/business/
/economy/
/world/
/technology/
/sports/
/entertainment/
/lifestyle/
/opinion/
/videos/
/videos/story-name/
/photos/
/search/?q=keyword
/author/author-name/
/trending/
/about/
/contact/
/advertise/
/newsletter/

Article URLs should remain short, clean and readable.

---

# 33. Recommended Homepage Content Order

Use this as the default structure:

1. Utility bar
2. Main header
3. Navigation
4. Breaking News
5. Top advertisement
6. Hero / Lead Stories
7. Latest News
8. India
9. Politics
10. Business
11. Economy
12. Technology
13. World
14. Sports
15. Entertainment / Lifestyle
16. Video
17. Opinion
18. Most Read
19. Newsletter
20. Footer

The exact section order must remain configurable in WordPress.

---

# 34. Desktop Design Specifications

Primary design frame:

**1440px desktop**

Use a consistent max content width around:

**1200–1280px**

Use a structured 12-column grid.

Maintain clear horizontal alignment between:

- Header
- Navigation
- Content
- Ads
- Footer

Do not let each section use a different container width without a strong reason.

---

# 35. Mobile Design Specifications

Primary mobile design frame:

**390px**

Also validate at:

**360px**

The design must be usable at both widths.

Test:

- Long headlines
- Long navigation labels
- Ad slots
- Video
- Tables
- Gallery
- Search
- Forms
- Article body

---

# 36. Final Design Deliverables

Generate:

## Page templates

14 desktop templates

14 mobile versions

## Component library

All reusable components.

## States

Loading

Empty

Error

No-image

Long-content

## Responsive states

Desktop

Tablet

Mobile

## Design tokens

Colors

Typography

Spacing

Borders

Radius

Shadows

Icons

Buttons

---

# 37. Final Design Generation Prompt

Generate a complete **high-fidelity production-ready WordPress news portal design system for NP News Metro**.

The design must include exactly **14 unique page templates**:

1. Homepage
2. Latest News
3. Category / Section
4. Standard News Article
5. Breaking News Article
6. Opinion Article
7. Video Hub
8. Video Detail
9. Photo / Gallery
10. Search Results
11. Author Profile
12. Trending / Most Read
13. Static Information
14. 404 / Error

For each template, show realistic Indian news content, realistic editorial headlines, realistic images, timestamps, categories, authors, videos, advertisement slots and related stories.

Make the visual system consistent across every page.

The website should feel like a **modern Indian newspaper brand with digital-first usability**.

It should combine:

**Newspaper editorial character + modern Indian media identity + clean digital product design**

The design must NOT look:

- Royal
- Luxury hotel
- Generic newspaper from another country
- SaaS
- Corporate consulting
- Government
- Political campaign
- Overly futuristic
- Overly colorful
- AI-generated

Use the NP News Metro identity:

**NP NEWS METRO**

**REAL NEWS. REAL IMPACT.**

Use a restrained black/navy/red editorial palette, strong typography, white space, fine divider rules, structured grids, realistic journalism imagery, and subtle editorial motifs such as:

- Newspaper column lines
- Small metadata rules
- Pen/nib references
- Simple newsroom icons
- Editorial dividers
- Minimal breaking-news indicators

These details must remain subtle.

Do not overload the interface with icons.

The final product must be **WordPress-compatible**, modular and easy for a newsroom team to operate daily.

Every major content area must be implemented conceptually as a reusable dynamic WordPress component.

Do not design separate pages for every category or author.

Use reusable templates.

Prioritize:

**Readability > Decoration**

**Editorial hierarchy > Visual effects**

**Usability > Complexity**

**WordPress maintainability > One-off visuals**

The final result should look like a **real professional Indian digital news publication ready to launch**, not a design exercise.
