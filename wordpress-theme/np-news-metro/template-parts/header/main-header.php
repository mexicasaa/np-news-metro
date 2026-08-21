<?php
/**
 * Template Part: Main Brand Header
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<header class="bg-primary text-white border-b border-secondary/30 relative z-30 shadow-md">
    <div class="max-w-site mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        
        <!-- Left: Mobile Menu Hamburger & Date Indicator -->
        <div class="flex items-center gap-3">
            <button 
                type="button" 
                id="np-menu-trigger" 
                aria-label="<?php esc_attr_e('Open Navigation Menu', 'np-news-metro'); ?>"
                class="p-2 rounded-xs bg-primary-container text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
            <span class="hidden lg:block text-xs text-slate-300 font-serif italic">
                <?php esc_html_e('Independent Journalism Since 2012', 'np-news-metro'); ?>
            </span>
        </div>

        <!-- Center: Publication Identity / Brand Logo -->
        <div class="text-center flex-1 sm:flex-initial">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="inline-block group focus:outline-none">
                <?php if (has_custom_logo()) : ?>
                    <?php the_custom_logo(); ?>
                <?php else : ?>
                    <h1 class="font-serif font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight text-white group-hover:text-secondary-gold transition-colors">
                        <?php bloginfo('name'); ?>
                    </h1>
                    <p class="text-[9px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-secondary-gold mt-0.5">
                        <?php echo get_bloginfo('description') ? get_bloginfo('description') : 'REAL NEWS. REAL IMPACT.'; ?>
                    </p>
                <?php endif; ?>
            </a>
        </div>

        <!-- Right: Search & Action Buttons -->
        <div class="flex items-center gap-2 sm:gap-3">
            <!-- Search Button -->
            <button 
                type="button" 
                id="np-search-trigger" 
                class="flex items-center gap-2 bg-primary-container hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xs border border-slate-700 text-xs transition-colors cursor-pointer"
            >
                <svg class="w-4 h-4 text-secondary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <span class="hidden md:inline"><?php esc_html_e('Search', 'np-news-metro'); ?></span>
                <kbd class="hidden md:inline-block bg-primary-dark text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">⌘K</kbd>
            </button>

            <!-- Subscribe Callout Button -->
            <button 
                type="button" 
                data-modal-target="newsletter-modal"
                class="hidden sm:inline-flex items-center gap-1.5 bg-secondary-gold hover:bg-yellow-500 text-primary font-bold text-xs px-3.5 py-1.5 rounded-xs transition-all shadow-sm cursor-pointer"
            >
                <span><?php esc_html_e('Subscribe', 'np-news-metro'); ?></span>
            </button>
        </div>

    </div>
</header>
