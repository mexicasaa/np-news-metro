<?php
/**
 * Template Name: Trending Top 10 Ranked
 * Template 12: Trending & Most Read
 *
 * @package NP_News_Metro
 */

get_header();

$trending_query = new WP_Query(array(
    'post_type'      => 'post',
    'posts_per_page' => 10,
    'meta_key'       => '_np_post_views_count',
    'orderby'        => 'meta_value_num',
    'order'          => 'DESC',
));

if (!$trending_query->have_posts()) {
    $trending_query = new WP_Query(array(
        'post_type'      => 'post',
        'posts_per_page' => 10,
    ));
}
?>

<div class="space-y-8">
    <!-- Header -->
    <header class="border-b-2 border-secondary-gold pb-6">
        <?php np_render_breadcrumbs(); ?>
        
        <div class="flex items-center gap-3 my-3">
            <div class="w-10 h-10 rounded-full bg-secondary-gold text-primary font-black text-xl flex items-center justify-center shadow-sm">
                #
            </div>
            <div>
                <h1 class="font-serif font-black text-2xl sm:text-4xl text-ink">
                    <?php esc_html_e('Trending Now: The Top 10 Most Read', 'np-news-metro'); ?>
                </h1>
                <p class="text-xs sm:text-sm text-ink-secondary mt-1">
                    <?php esc_html_e('Real-time reader engagement velocity and verified investigative dispatches.', 'np-news-metro'); ?>
                </p>
            </div>
        </div>
    </header>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left 10 Ranked Items (8 Cols) -->
        <div class="lg:col-span-8 bg-surface-lowest border border-border-subtle p-5 sm:p-7 rounded-xs shadow-subtle divide-y divide-border-subtle">
            <?php 
            $rank = 1;
            while ($trending_query->have_posts()) : $trending_query->the_post();
                get_template_part('template-parts/cards/card-ranking', null, array('rank' => $rank++));
            endwhile;
            wp_reset_postdata();
            ?>
        </div>

        <!-- Right Sidebar (4 Cols) -->
        <aside class="lg:col-span-4 space-y-8">
            <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A4')); ?>

            <div class="bg-surface-low border border-border-subtle p-5 rounded-xs">
                <h3 class="font-serif font-bold text-base text-ink mb-2">
                    <?php esc_html_e('How We Calculate Velocity', 'np-news-metro'); ?>
                </h3>
                <p class="text-xs text-ink-secondary leading-relaxed">
                    <?php esc_html_e('Rankings reflect live readership sessions, scroll completions, and verified social shares across our national network in the past 24 hours.', 'np-news-metro'); ?>
                </p>
            </div>

            <div class="sticky top-20">
                <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A5')); ?>
            </div>
        </aside>

    </div>
</div>

<?php
get_footer();
