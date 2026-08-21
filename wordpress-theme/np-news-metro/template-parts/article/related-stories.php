<?php
/**
 * Template Part: Related Stories Block
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$categories = get_the_category();
if (empty($categories)) return;

$cat_ids = wp_list_pluck($categories, 'term_id');

$related_query = new WP_Query(array(
    'category__in'        => $cat_ids,
    'post__not_in'        => array(get_the_ID()),
    'posts_per_page'      => 3,
    'ignore_sticky_posts' => 1,
));

if ($related_query->have_posts()) :
?>
<section class="my-12 pt-8 border-t-2 border-primary">
    <div class="flex items-center justify-between mb-6">
        <h3 class="font-serif font-black text-xl sm:text-2xl text-ink">
            <?php esc_html_e('More from this Section', 'np-news-metro'); ?>
        </h3>
        <a href="<?php echo esc_url(get_category_link($cat_ids[0])); ?>" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span><?php esc_html_e('View all', 'np-news-metro'); ?></span>
            <span>&rarr;</span>
        </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <?php while ($related_query->have_posts()) : $related_query->the_post(); ?>
            <?php get_template_part('template-parts/cards/card-medium'); ?>
        <?php endwhile; wp_reset_postdata(); ?>
    </div>
</section>
<?php endif; ?>
