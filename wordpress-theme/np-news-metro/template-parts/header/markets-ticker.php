<?php
/**
 * Template Part: Financial Markets Live Ticker
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$markets = array(
    array('name' => 'BSE SENSEX', 'val' => '81,785.50', 'chg' => '+342.10', 'pct' => '+0.42%', 'up' => true),
    array('name' => 'NSE NIFTY 50', 'val' => '24,964.25', 'chg' => '+112.40', 'pct' => '+0.45%', 'up' => true),
    array('name' => 'BANK NIFTY', 'val' => '51,320.80', 'chg' => '-65.20', 'pct' => '-0.13%', 'up' => false),
    array('name' => 'GOLD (10g)', 'val' => '₹72,450', 'chg' => '+180.00', 'pct' => '+0.25%', 'up' => true),
    array('name' => 'USD / INR', 'val' => '₹83.88', 'chg' => '-0.04', 'pct' => '-0.05%', 'up' => false),
    array('name' => 'BRENT CRUDE', 'val' => '$77.24', 'chg' => '+0.85', 'pct' => '+1.11%', 'up' => true),
);
?>
<div class="bg-surface-low border-b border-border-subtle py-1 px-4 text-[11px] font-mono overflow-hidden">
    <div class="max-w-site mx-auto flex items-center gap-3">
        <!-- Label -->
        <div class="flex items-center gap-1 font-bold text-ink uppercase tracking-wider whitespace-nowrap pr-2 border-r border-slate-300">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span><?php esc_html_e('MARKETS', 'np-news-metro'); ?></span>
        </div>

        <!-- Ticker Scroll -->
        <div class="flex items-center space-x-6 overflow-x-auto hide-scrollbar whitespace-nowrap py-0.5">
            <?php foreach ($markets as $m) : ?>
                <div class="flex items-center gap-1.5">
                    <span class="font-bold text-ink-secondary"><?php echo esc_html($m['name']); ?></span>
                    <span class="font-semibold text-ink"><?php echo esc_html($m['val']); ?></span>
                    <span class="<?php echo $m['up'] ? 'text-emerald-600' : 'text-editorial-red'; ?> font-bold flex items-center">
                        <?php echo $m['up'] ? '▲' : '▼'; ?> <?php echo esc_html($m['chg']); ?> (<?php echo esc_html($m['pct']); ?>)
                    </span>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
