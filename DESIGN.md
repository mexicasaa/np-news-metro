---
name: Ethos Chronicle
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#43474c'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4e6073'
  primary: '#162839'
  on-primary: '#ffffff'
  primary-container: '#2c3e50'
  on-primary-container: '#96a9be'
  inverse-primary: '#b5c8df'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#362308'
  on-tertiary: '#ffffff'
  tertiary-container: '#4e381c'
  on-tertiary-container: '#c1a17d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4fb'
  primary-fixed-dim: '#b5c8df'
  on-primary-fixed: '#091d2e'
  on-primary-fixed-variant: '#36485b'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#ffddb7'
  tertiary-fixed-dim: '#e3c19b'
  on-tertiary-fixed: '#291802'
  on-tertiary-fixed-variant: '#5a4225'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  canvas: '#FDFCFB'
  border-subtle: '#E5E7EB'
  ink-secondary: '#4B5563'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 60px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 42px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.7'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.5'
    letterSpacing: 0.08em
  caption:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-desktop: 4rem
  margin-mobile: 1.25rem
  gutter: 2rem
  stack-sm: 1rem
  stack-md: 2.5rem
  stack-lg: 5rem
  container-max: 1200px
---

## Brand & Style

This design system embodies the "Ethos Editorial" aesthetic, a refined movement that captures the prestige of a global flagship newspaper. It is designed for a discerning audience that values intellectual depth and clarity over sensationalism. 

The style is **Modern Editorial**, characterized by a rigorous commitment to white space, a limited and sophisticated color palette, and a focus on typographic hierarchy. It utilizes a **Minimalist** approach with subtle **Tactile** cues through "paper" like off-white backgrounds. The emotional response should be one of authority, calm, and unwavering reliability—every page must feel like a singular, cohesive edition of a high-end publication.

## Colors

The palette is strictly curated to ensure brand cohesion across all sections. 

- **Primary Accent (Slate Blue):** Used for all primary actions, active navigation states, and branding marks. It represents professional authority.
- **Secondary Accent (Gold/Tan):** Reserved for premium content markers, category tags, or subtle labels that denote quality.
- **Canvas (Off-White):** The universal background color (#FDFCFB). It is non-negotiable for all pages to avoid the harshness of pure digital white.
- **Ink (Charcoal):** #1A1A1A is the standard for headlines and primary text to ensure a sharp, high-contrast reading experience.
- **Structural Gray:** #E5E7EB is the only color permitted for borders and dividers to maintain a lightweight framework.

## Typography

Typography is the backbone of this system. It relies on the pairing of an authoritative serif with a highly legible sans-serif.

- **Headlines:** Must use **Playfair Display**. Use tighter tracking for larger display sizes to maintain a sophisticated "tight-set" look. All main headings use Charcoal (#1A1A1A).
- **Body Text:** Must use **Inter**. It is prioritized for long-form reading with a generous line-height (1.6x - 1.7x) to ensure legibility on all screens.
- **Labels:** Use uppercase Inter for category markers, dates, and author bylines. This provides a clear functional distinction from the narrative text.

## Layout & Spacing

The system uses a **Fixed Grid** model for desktop to provide a structured, "printed page" feel. 

- **Grid System:** A 12-column grid is used for the homepage and section landing pages. Long-form articles transition to a single, centered 720px - 800px column to eliminate distractions.
- **Spacing Rhythm:** Spacing is used as a structural tool. Large vertical "stacks" (80px+) are used between major editorial blocks to allow for clear thematic separation.
- **Responsiveness:** On mobile devices, margins are reduced to 20px. Grid-based layouts collapse into a single vertical stream, maintaining the exact same header and footer styling across every single page for total cohesion.

## Elevation & Depth

This system avoids the use of shadows to maintain its clean, editorial integrity. Depth is created through **Low-Contrast Outlines** and **Tonal Layers**.

- **Surfaces:** All pages use the canvas color (#FDFCFB). Interactive elements like cards or modals may use a subtle white (#FFFFFF) background to appear slightly closer to the user.
- **Borders:** Define all logical groupings with a consistent 1px solid border (#E5E7EB). This includes card containers, section dividers, and the global navigation bar.
- **Visual Stacking:** Use the #FDFCFB background as the base, and use structural lines to "anchor" content rather than floating it with shadows.

## Shapes

The shape language is rigid and professional. 

- **Standard Radius:** A very subtle 2px radius is applied to buttons, input fields, and UI cards. This "softens" the edges just enough to feel modern without losing the authoritative architectural feel of a newspaper.
- **Rectilinear Elements:** Photographic assets and large-scale editorial banners should remain at 0px (sharp corners) to maintain the traditional broadsheet aesthetic.

## Components

- **Buttons:** Primary buttons use Slate Blue (#2C3E50) with white text. They are strictly rectangular with a 2px radius. Secondary buttons use a 1px border of Slate Blue.
- **Editorial Cards:** All cards must use the same 1px border (#E5E7EB), 2px radius, and internal padding. Headlines within cards must be Playfair Display in Charcoal.
- **Navigation:** The header and footer are persistent and identical across all pages. The navigation bar uses a 1px bottom border and centered branding.
- **Input Fields:** Use a clean 1px border (#E5E7EB) and the canvas background (#FDFCFB). On focus, the border transitions to Slate Blue (#2C3E50).
- **Categories & Chips:** Category labels use the Gold/Tan (#C5A059) color in the `label-caps` typographic style.
- **Dividers:** Horizontal and vertical dividers must consistently use #E5E7EB at 1px thickness. No thicker lines are permitted except for branding-specific flourishes.