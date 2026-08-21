<?php
/**
 * Template 03: Category / Section Landing Page
 *
 * @package NP_News_Metro
 */

get_header();

$current_cat = get_queried_object();
?>

<div class="space-y-8">
    <!-- Category Header -->
    <header class="border-b-2 border-primary pb-6">
        <?php np_render_breadcrumbs(); ?>
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div>
                <span class="text-xs font-bold uppercase tracking-widest text-secondary-gold block mb-1">
                    <?php esc_html_e('SECTION REPORTING', 'np-news-metro'); ?>
                </span>
                <h1 class="font-serif font-black text-3xl sm:text-5xl text-ink">
                    <?php single_cat_title(); ?>
                </h1>
                <?php if (category_description()) : ?>
                    <p class="text-ink-secondary text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
                        <?php echo category_description(); ?>
                    </p>
                <?php endif; ?>
            </div>

            <span class="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xs shrink-0 self-start sm:self-auto">
                <?php printf(esc_html__('%s Stories Filed', 'np-news-metro'), $current_cat->count); ?>
            </span>
        </div>
    </header>

    <!-- Main Content Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Feed (8 Cols) -->
        <div class="lg:col-span-8 space-y-6">
            <?php if (have_posts()) : ?>
                <!-- Category Hero (First post) -->
                <?php the_post(); ?>
                <div class="mb-8">
                    <?php get_template_part('template-parts/cards/card-hero'); ?>
                </div>

                <!-- Remaining Category Posts Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <?php while (have_posts()) : the_post(); ?>
                        <?php get_template_part('template-parts/cards/card-medium'); ?>
                    <?php endwhile; ?>
                </div>

                <!-- Pagination -->
                <?php np_render_pagination(); ?>

            <?php else : ?>
                <div class="p-12 text-center bg-surface-lowest border border-border-subtle">
                    <h3 class="font-serif text-xl font-bold text-ink"><?php esc_html_e('No articles published in this section yet.', 'np-news-metro'); ?></h3>
                </div>
            <?php endif; ?>
        </div>

        <!-- Right Sidebar (4 Cols) -->
        <aside class="lg:col-span-4 space-y-8">
            <!-- Sidebar Top Ad A4 -->
            <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A4')); ?>

            <!-- Most Read in this Category -->
            <div class="bg-surface-lowest border border-border-subtle p-5 rounded-xs shadow-subtle">
                <h3 class="font-serif font-bold text-lg text-ink border-b-2 border-primary pb-2 mb-4">
                    <?php printf(esc_html__('Top in %s', 'np-news-metro'), single_cat_title('', false)); ?>
                </h3>
                <div class="divide-y divide-border-subtle">
                    <?php
                    $cat_top_query = new WP_Query(array(
                        'cat'            => $current_cat->term_id,
                        'posts_per_page' => 4,
                    ));
                    while ($cat_top_query->have_posts()) : $cat_top_query->the_post();
                        get_template_part('template-parts/cards/card-compact');
                    endwhile;
                    wp_reset_postdata();
                    ?>
                </div>
            </div>

            <!-- Sticky Sidebar Ad A5 -->
            <div class="sticky top-20">
                <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A5')); ?>
            </div>
        </aside>

    </div>
</div>

<?php
get_footer();
