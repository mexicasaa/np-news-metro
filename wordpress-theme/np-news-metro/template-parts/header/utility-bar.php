<?php
/**
 * Template Part: Top Utility Bar
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="bg-primary-dark text-slate-300 border-b border-slate-800 text-[11px] font-sans py-1.5 px-4">
    <div class="max-w-site mx-auto flex items-center justify-between flex-wrap gap-2">
        <!-- Left: Date, Edition, Weather -->
        <div class="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span class="font-medium text-slate-200">
                <?php echo date_i18n('l, F j, Y'); ?>
            </span>
            <span class="hidden sm:inline-block text-slate-600">|</span>
            <span class="hidden sm:flex items-center gap-1.5 text-secondary-gold font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span><?php esc_html_e('New Delhi Edition', 'np-news-metro'); ?> &bull; 28&deg;C Hazy</span>
            </span>
        </div>

        <!-- Right: Fast Actions & Language Switcher -->
        <div class="flex items-center gap-3 sm:gap-4 ml-auto">
            <!-- Language Switcher Indicator -->
            <div class="flex items-center bg-primary-container px-2 py-0.5 rounded border border-slate-700 text-[10px] font-bold">
                <span class="text-secondary-gold">ENG</span>
                <span class="text-slate-500 mx-1">/</span>
                <span class="text-slate-400 hover:text-white cursor-pointer"><?php esc_html_e('हिंदी', 'np-news-metro'); ?></span>
            </div>

            <!-- Quick Links -->
            <a href="<?php echo esc_url(home_url('/latest')); ?>" class="hidden md:inline-block hover:text-white transition-colors">
                <?php esc_html_e('Today\'s Paper', 'np-news-metro'); ?>
            </a>
            <button type="button" data-modal-target="newsletter-modal" class="text-secondary-gold font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                <span><?php esc_html_e('Get Newsletter', 'np-news-metro'); ?></span>
            </button>
        </div>
    </div>
</div>
