<?php
/**
 * Main Fallback Index Template
 *
 * @package NP_News_Metro
 */

get_header();
?>

<div class="space-y-8">
    <header class="border-b-2 border-primary pb-4">
        <h1 class="font-serif font-black text-2xl sm:text-4xl text-ink">
            <?php esc_html_e('News Stream', 'np-news-metro'); ?>
        </h1>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-8 space-y-6">
            <?php if (have_posts()) : ?>
                <div class="space-y-4">
                    <?php while (have_posts()) : the_post(); ?>
                        <?php get_template_part('template-parts/cards/card-horizontal'); ?>
                    <?php endwhile; ?>
                </div>

                <?php np_render_pagination(); ?>
            <?php else : ?>
                <div class="p-12 text-center bg-surface-lowest border border-border-subtle">
                    <h3 class="font-serif text-xl font-bold"><?php esc_html_e('No articles found.', 'np-news-metro'); ?></h3>
                </div>
            <?php endif; ?>
        </div>

        <aside class="lg:col-span-4 space-y-8">
            <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A4')); ?>
            <div class="sticky top-20">
                <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A5')); ?>
            </div>
        </aside>
    </div>
</div>

<?php
get_footer();
