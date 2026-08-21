<?php
/**
 * Template Part: Editorial Correction Notice
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$correction_date = get_post_meta(get_the_ID(), '_np_correction_date', true);
$correction_text = get_post_meta(get_the_ID(), '_np_correction_text', true);

if (empty($correction_text)) return;
?>
<div class="my-8 p-4 bg-yellow-50/80 border-l-4 border-secondary-gold text-xs sm:text-sm text-ink-secondary rounded-r-xs">
    <div class="flex items-center gap-2 mb-1 text-secondary-dark font-bold uppercase tracking-wider text-[11px]">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <span><?php esc_html_e('CORRECTION & CLARIFICATION NOTE', 'np-news-metro'); ?></span>
        <?php if ($correction_date) : ?>
            <span class="text-slate-500 font-normal">(<?php echo esc_html($correction_date); ?>)</span>
        <?php endif; ?>
    </div>
    <p class="leading-relaxed"><?php echo esc_html($correction_text); ?></p>
</div>
