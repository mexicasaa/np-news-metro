<?php
/**
 * Template Part: Breaking News Bar
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

// Query Breaking Posts or fallback to latest posts
$breaking_query = new WP_Query(array(
    'post_type'      => 'post',
    'posts_per_page' => 3,
    'meta_query'     => array(
        array(
            'key'     => '_np_is_breaking',
            'value'   => '1',
            'compare' => '=',
        ),
    ),
));

if (!$breaking_query->have_posts()) {
    $breaking_query = new WP_Query(array(
        'post_type'      => 'post',
        'posts_per_page' => 3,
    ));
}
?>
<?php if ($breaking_query->have_posts()) : ?>
<div class="bg-editorial-red text-white py-1.5 px-4 text-xs font-sans shadow-inner">
    <div class="max-w-site mx-auto flex items-center gap-3 overflow-hidden">
        
        <!-- Badge -->
        <div class="flex items-center gap-1.5 bg-black/30 text-white font-extrabold uppercase px-2 py-0.5 rounded-xs tracking-wider shrink-0">
            <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span><?php esc_html_e('BREAKING NEWS', 'np-news-metro'); ?></span>
        </div>

        <!-- Headline Ticker Items -->
        <div class="flex-1 overflow-x-auto hide-scrollbar whitespace-nowrap">
            <div class="inline-flex items-center space-x-6">
                <?php while ($breaking_query->have_posts()) : $breaking_query->the_post(); ?>
                    <a href="<?php the_permalink(); ?>" class="hover:underline font-semibold flex items-center gap-1.5 transition-colors">
                        <span>&bull;</span>
                        <span><?php the_title(); ?></span>
                        <span class="text-white/70 text-[10px]">(<?php echo np_get_formatted_time(); ?>)</span>
                    </a>
                <?php endwhile; wp_reset_postdata(); ?>
            </div>
        </div>

    </div>
</div>
<?php endif; ?>
