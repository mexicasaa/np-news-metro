<?php
/**
 * Template Part: Ranking Item Card (Trending Top 10)
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$rank = isset($args['rank']) ? $args['rank'] : 1;
?>
<article class="group flex items-start gap-4 py-4 border-b border-border-subtle last:border-0">
    <!-- Big Number Rank -->
    <span class="font-serif font-black text-3xl sm:text-4xl text-secondary-gold/80 group-hover:text-secondary-dark transition-colors shrink-0 w-8 text-right leading-none pt-1">
        <?php echo esc_html(sprintf('%02d', $rank)); ?>
    </span>

    <!-- Content -->
    <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
            <?php np_the_category_badge(get_the_ID(), '!text-[10px] !px-1.5'); ?>
            <span class="text-[10px] text-ink-muted">&bull;</span>
            <span class="text-[10px] text-ink-muted"><?php echo np_get_formatted_time(); ?></span>
        </div>
        <h4 class="font-serif font-bold text-sm sm:text-base text-ink leading-snug group-hover:text-secondary-dark transition-colors">
            <a href="<?php the_permalink(); ?>">
                <?php the_title(); ?>
            </a>
        </h4>
        <div class="flex items-center gap-3 mt-2 text-[11px] text-ink-muted">
            <span><?php the_author_posts_link(); ?></span>
            <span>&bull;</span>
            <span class="text-secondary-dark font-semibold"><?php echo np_get_post_views(); ?> <?php esc_html_e('reads', 'np-news-metro'); ?></span>
        </div>
    </div>
</article>
