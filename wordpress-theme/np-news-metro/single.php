<?php
/**
 * Templates 04, 05, 06: Single Article Dispatcher (Standard, Breaking, Opinion)
 *
 * @package NP_News_Metro
 */

get_header();

while (have_posts()) : the_post();
    // Track article view
    np_set_post_views(get_the_ID());

    $is_breaking = get_post_meta(get_the_ID(), '_np_is_breaking', true);
    $is_opinion  = get_post_meta(get_the_ID(), '_np_is_opinion', true);
?>

<article id="post-<?php the_ID(); ?>" <?php post_class('article-container'); ?>>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        <!-- Left / Main Article Column (8 Cols) -->
        <div class="lg:col-span-8 max-w-reading">
            
            <!-- Article Header -->
            <?php get_template_part('template-parts/article/article-header'); ?>

            <!-- In-Article Top Ad (Zone A2) -->
            <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A2')); ?>

            <!-- Key Takeaways Box (if present) -->
            <?php get_template_part('template-parts/article/key-takeaways'); ?>

            <!-- Live Timeline Updates (if Breaking News) -->
            <?php if ($is_breaking) : ?>
                <?php get_template_part('template-parts/article/live-timeline'); ?>
            <?php endif; ?>

            <!-- Article Body / Gutenberg Content -->
            <div class="gutenberg-content font-sans text-ink leading-relaxed my-8 <?php echo $is_opinion ? 'editorial-dropcap text-lg' : ''; ?>">
                <?php the_content(); ?>
            </div>

            <!-- In-Article Mid-Body Ad (Zone A3) -->
            <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A3')); ?>

            <!-- Editorial Correction Notice (if present) -->
            <?php get_template_part('template-parts/article/correction-notice'); ?>

            <!-- Article Tags Row -->
            <?php if (has_tag()) : ?>
                <div class="my-6 pt-4 border-t border-border-subtle flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-bold text-ink uppercase"><?php esc_html_e('Topics:', 'np-news-metro'); ?></span>
                    <?php
                    $tags = get_the_tags();
                    foreach ($tags as $tag) {
                        echo '<a href="' . esc_url(get_tag_link($tag->term_id)) . '" class="text-xs bg-slate-100 hover:bg-primary hover:text-white px-2.5 py-1 rounded-xs transition-colors">#' . esc_html($tag->name) . '</a>';
                    }
                    ?>
                </div>
            <?php endif; ?>

            <!-- Author Bio Box -->
            <?php get_template_part('template-parts/article/author-bio'); ?>

            <!-- Comments Section -->
            <?php
            if (comments_open() || get_comments_number()) :
                comments_template();
            endif;
            ?>

            <!-- Related Stories in Same Section -->
            <?php get_template_part('template-parts/article/related-stories'); ?>

        </div>

        <!-- Right Article Sidebar (4 Cols) -->
        <aside class="lg:col-span-4 space-y-8">
            <!-- Sidebar Ad Zone A4 -->
            <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A4')); ?>

            <!-- Latest Section Stories -->
            <div class="bg-surface-lowest border border-border-subtle p-5 rounded-xs shadow-subtle">
                <h3 class="font-serif font-bold text-lg text-ink border-b-2 border-primary pb-2 mb-4">
                    <?php esc_html_e('Must Read Stories', 'np-news-metro'); ?>
                </h3>
                <div class="divide-y divide-border-subtle">
                    <?php
                    $must_read = new WP_Query(array(
                        'post_type'      => 'post',
                        'posts_per_page' => 4,
                        'post__not_in'   => array(get_the_ID()),
                    ));
                    while ($must_read->have_posts()) : $must_read->the_post();
                        get_template_part('template-parts/cards/card-compact');
                    endwhile;
                    wp_reset_postdata();
                    ?>
                </div>
            </div>

            <!-- Sticky Ad Zone A5 -->
            <div class="sticky top-20">
                <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A5')); ?>
            </div>
        </aside>

    </div>
</article>

<?php
endwhile;

get_footer();
