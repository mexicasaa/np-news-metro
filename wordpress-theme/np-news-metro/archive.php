<?php
/**
 * Template 02: Latest News & General Archives
 *
 * @package NP_News_Metro
 */

get_header();
?>

<div class="space-y-8">
    <!-- Header -->
    <header class="border-b-2 border-primary pb-4">
        <?php np_render_breadcrumbs(); ?>
        <div class="flex items-center justify-between flex-wrap gap-2 mt-2">
            <div class="flex items-center gap-3">
                <span class="w-3 h-3 rounded-full bg-editorial-red animate-ping"></span>
                <h1 class="font-serif font-black text-2xl sm:text-4xl text-ink">
                    <?php
                    if (is_day()) {
                        printf(esc_html__('News Archive: %s', 'np-news-metro'), get_the_date());
                    } elseif (is_month()) {
                        printf(esc_html__('News Archive: %s', 'np-news-metro'), get_the_date('F Y'));
                    } elseif (is_tag()) {
                        single_tag_title(esc_html__('Topic: #', 'np-news-metro'));
                    } else {
                        esc_html_e('Latest News Stream (Chronological)', 'np-news-metro');
                    }
                    ?>
                </h1>
            </div>
            <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xs">
                <?php printf(esc_html__('%s Articles Published', 'np-news-metro'), $wp_query->found_posts); ?>
            </span>
        </div>
    </header>

    <!-- 2-Column Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Main Stream (8 cols) -->
        <div class="lg:col-span-8 space-y-6">
            <?php if (have_posts()) : ?>
                <div class="space-y-4">
                    <?php while (have_posts()) : the_post(); ?>
                        <?php get_template_part('template-parts/cards/card-horizontal'); ?>
                    <?php endwhile; ?>
                </div>

                <!-- Pagination -->
                <?php np_render_pagination(); ?>

            <?php else : ?>
                <div class="p-12 text-center bg-surface-lowest border border-border-subtle">
                    <h3 class="font-serif text-xl font-bold text-ink"><?php esc_html_e('No articles found in this archive.', 'np-news-metro'); ?></h3>
                </div>
            <?php endif; ?>
        </div>

        <!-- Right Sidebar (4 cols) -->
        <aside class="lg:col-span-4 space-y-8">
            <!-- Sidebar Ad Zone A4 -->
            <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A4')); ?>

            <!-- Trending Widget -->
            <div class="bg-surface-lowest border border-border-subtle p-5 rounded-xs shadow-subtle">
                <h3 class="font-serif font-bold text-lg text-ink border-b-2 border-secondary-gold pb-2 mb-4">
                    <?php esc_html_e('Trending on NP News', 'np-news-metro'); ?>
                </h3>
                <?php
                $trending_query = new WP_Query(array(
                    'post_type'      => 'post',
                    'posts_per_page' => 5,
                    'orderby'        => 'comment_count',
                ));
                $rank = 1;
                while ($trending_query->have_posts()) : $trending_query->the_post();
                    get_template_part('template-parts/cards/card-ranking', null, array('rank' => $rank++));
                endwhile;
                wp_reset_postdata();
                ?>
            </div>

            <!-- Sticky Ad Zone A5 -->
            <div class="sticky top-20">
                <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A5')); ?>
            </div>
        </aside>

    </div>
</div>

<?php
get_footer();
