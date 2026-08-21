<?php
/**
 * Template Part: Commercial Ad Slot Renderer
 * Supports dynamic WordPress Widget / Ad Inserter or reservation placeholder
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$zone = isset($args['zone']) ? strtoupper($args['zone']) : 'A1';
$zone_id = 'ad-zone-' . strtolower($zone);

$dimensions = array(
    'A1' => '970x90 / 728x90 Leaderboard',
    'A2' => '728x90 / 300x250 Article Top',
    'A3' => '300x250 In-Content Inline',
    'A4' => '300x250 Sidebar Top Rectangle',
    'A5' => '300x600 Sidebar Half-Page Sticky',
    'A6' => '970x90 Mid-Homepage Ribbon',
    'A7' => '728x90 Pre-Footer Leaderboard',
);

$dim_label = isset($dimensions[$zone]) ? $dimensions[$zone] : 'Advertisement';
?>
<div class="my-6 text-center">
    <span class="block text-[9px] uppercase tracking-widest font-mono text-slate-400 mb-1">
        <?php esc_html_e('ADVERTISEMENT &bull;', 'np-news-metro'); ?> <?php echo esc_html($zone); ?>
    </span>

    <?php if (is_active_sidebar($zone_id)) : ?>
        <div class="ad-dynamic-container overflow-hidden mx-auto flex justify-center">
            <?php dynamic_sidebar($zone_id); ?>
        </div>
    <?php else : ?>
        <!-- Reserved Dimension Container (Zero CLS) -->
        <div class="border border-dashed border-slate-300 bg-slate-50/70 rounded-xs p-4 flex flex-col items-center justify-center min-h-[90px] mx-auto text-slate-400 transition-colors hover:bg-slate-100/80">
            <span class="text-[11px] font-mono font-semibold text-slate-500">
                <?php echo esc_html($dim_label); ?>
            </span>
            <span class="text-[10px] text-slate-400 mt-0.5">
                <?php esc_html_e('Managed via WordPress Widgets / Ad Inserter', 'np-news-metro'); ?>
            </span>
        </div>
    <?php endif; ?>
</div>
