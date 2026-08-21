<?php
/**
 * Template Part: Mobile Navigation Drawer
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$categories = get_categories(array('number' => 12, 'hide_empty' => false));
?>
<!-- Off-canvas Mobile Navigation Drawer -->
<div id="np-mobile-drawer" class="fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 opacity-0" aria-hidden="true">
    <!-- Backdrop -->
    <div id="np-drawer-backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"></div>

    <!-- Drawer Panel -->
    <div id="np-drawer-panel" class="fixed inset-y-0 left-0 max-w-xs w-full bg-primary text-white shadow-2xl z-10 flex flex-col justify-between transform -translate-x-full transition-transform duration-300 ease-in-out">
        
        <!-- Drawer Header -->
        <div class="p-4 border-b border-slate-700 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="font-serif font-bold text-lg text-white"><?php bloginfo('name'); ?></span>
            </div>
            <button id="np-drawer-close" type="button" aria-label="<?php esc_attr_e('Close Menu', 'np-news-metro'); ?>" class="p-1.5 rounded-xs text-slate-400 hover:text-white bg-primary-container cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        <!-- Navigation Links -->
        <div class="p-4 flex-1 overflow-y-auto space-y-1 text-sm font-semibold">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="block px-3 py-2.5 rounded-xs hover:bg-primary-container text-white">
                <?php esc_html_e('Home Frontpage', 'np-news-metro'); ?>
            </a>
            <a href="<?php echo esc_url(home_url('/latest')); ?>" class="block px-3 py-2.5 rounded-xs hover:bg-primary-container text-editorial-red font-bold">
                <?php esc_html_e('Latest Wire', 'np-news-metro'); ?>
            </a>

            <div class="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <?php esc_html_e('Editorial Sections', 'np-news-metro'); ?>
            </div>

            <?php foreach ($categories as $cat) : ?>
                <a href="<?php echo esc_url(get_category_link($cat->term_id)); ?>" class="block px-3 py-2 rounded-xs hover:bg-primary-container text-slate-200">
                    <?php echo esc_html($cat->name); ?>
                </a>
            <?php endforeach; ?>

            <div class="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <?php esc_html_e('Multimedia & Specials', 'np-news-metro'); ?>
            </div>

            <a href="<?php echo esc_url(home_url('/videos')); ?>" class="block px-3 py-2 rounded-xs hover:bg-primary-container text-slate-200">
                <?php esc_html_e('Videos Hub', 'np-news-metro'); ?>
            </a>
            <a href="<?php echo esc_url(home_url('/photos')); ?>" class="block px-3 py-2 rounded-xs hover:bg-primary-container text-slate-200">
                <?php esc_html_e('Photo Essays', 'np-news-metro'); ?>
            </a>
            <a href="<?php echo esc_url(home_url('/trending')); ?>" class="block px-3 py-2 rounded-xs hover:bg-primary-container text-secondary-gold font-bold">
                <?php esc_html_e('Trending Stories', 'np-news-metro'); ?>
            </a>
        </div>

        <!-- Drawer Footer -->
        <div class="p-4 border-t border-slate-700 bg-primary-dark">
            <button type="button" data-modal-target="newsletter-modal" class="w-full bg-secondary-gold text-primary font-bold py-2.5 rounded-xs text-xs uppercase tracking-wider hover:bg-yellow-500 transition-colors cursor-pointer">
                <?php esc_html_e('Subscribe to Daily Brief', 'np-news-metro'); ?>
            </button>
        </div>

    </div>
</div>
