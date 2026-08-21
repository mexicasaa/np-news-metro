<?php
/**
 * Template Part: Key Takeaways Block
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$takeaways_raw = get_post_meta(get_the_ID(), '_np_key_takeaways', true);
if (empty($takeaways_raw)) return;

$takeaways = array_filter(array_map('trim', explode("\n", $takeaways_raw)));
if (empty($takeaways)) return;
?>
<div class="my-8 p-5 sm:p-6 bg-surface-low border-l-4 border-primary rounded-r-xs shadow-subtle">
    <div class="flex items-center gap-2 mb-3">
        <svg class="w-5 h-5 text-secondary-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="font-serif font-bold text-base sm:text-lg text-primary uppercase tracking-wide">
            <?php esc_html_e('Key Takeaways & Core Facts', 'np-news-metro'); ?>
        </h3>
    </div>
    <ul class="space-y-2.5 text-sm sm:text-base text-ink-secondary list-disc pl-5">
        <?php foreach ($takeaways as $point) : ?>
            <li class="leading-relaxed"><?php echo esc_html($point); ?></li>
        <?php endforeach; ?>
    </ul>
</div>
