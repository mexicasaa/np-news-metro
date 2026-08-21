<?php
/**
 * Template Part: Live Updates Timeline (Breaking News Articles)
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$is_breaking = get_post_meta(get_the_ID(), '_np_is_breaking', true);
if (!$is_breaking) return;
?>
<section class="my-10 p-5 sm:p-6 bg-red-50/50 border border-editorial-red/30 rounded-xs shadow-subtle">
    <div class="flex items-center justify-between pb-4 mb-6 border-b border-editorial-red/20">
        <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-editorial-red animate-ping"></span>
            <h3 class="font-serif font-black text-xl text-editorial-red uppercase tracking-wider">
                <?php esc_html_e('Live Updates Timeline', 'np-news-metro'); ?>
            </h3>
        </div>
        <span class="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
            <?php esc_html_e('Auto-refreshing coverage', 'np-news-metro'); ?>
        </span>
    </div>

    <!-- Timeline Entries -->
    <div class="relative pl-6 border-l-2 border-editorial-red/40 space-y-6">
        <!-- Entry 1 -->
        <div class="relative">
            <span class="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-editorial-red border-2 border-white shadow"></span>
            <div class="flex items-center gap-2 text-xs font-bold text-editorial-red uppercase mb-1">
                <span><?php echo date_i18n('g:i A'); ?></span>
                <span>&bull;</span>
                <span><?php esc_html_e('OFFICIAL BRIEFING', 'np-news-metro'); ?></span>
            </div>
            <h4 class="font-serif font-bold text-base text-ink mb-1">
                <?php esc_html_e('Cabinet briefing confirms Phase 1 operational rollout by Q3 2027', 'np-news-metro'); ?>
            </h4>
            <p class="text-sm text-ink-secondary leading-relaxed">
                <?php esc_html_e('The Union Minister addressed journalists outlining initial capital expenditure and environmental compliance protocols.', 'np-news-metro'); ?>
            </p>
        </div>

        <!-- Entry 2 -->
        <div class="relative">
            <span class="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white shadow"></span>
            <div class="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase mb-1">
                <span><?php echo date_i18n('g:i A', strtotime('-45 minutes')); ?></span>
                <span>&bull;</span>
                <span><?php esc_html_e('MARKET REACTION', 'np-news-metro'); ?></span>
            </div>
            <h4 class="font-serif font-bold text-base text-ink mb-1">
                <?php esc_html_e('Port operator and infrastructure stocks surge up to 4.5%', 'np-news-metro'); ?>
            </h4>
            <p class="text-sm text-ink-secondary leading-relaxed">
                <?php esc_html_e('BSE Capital Goods index recorded broad gains following the morning announcement.', 'np-news-metro'); ?>
            </p>
        </div>
    </div>
</section>
