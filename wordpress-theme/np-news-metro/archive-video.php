<?php
/**
 * Template 07: Video Hub Archive
 *
 * @package NP_News_Metro
 */

get_header();
?>

<div class="space-y-10">
    <!-- Hub Header -->
    <header class="bg-primary text-white p-6 sm:p-8 rounded-xs shadow-md">
        <?php np_render_breadcrumbs(); ?>
        <div class="flex items-center gap-3 my-3">
            <div class="w-10 h-10 rounded-full bg-editorial-red text-white flex items-center justify-center">
                <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div>
                <h1 class="font-serif font-black text-2xl sm:text-4xl text-white">
                    <?php esc_html_e('NP News Video Hub & Explainers', 'np-news-metro'); ?>
                </h1>
                <p class="text-xs sm:text-sm text-slate-300 mt-1">
                    <?php esc_html_e('Documentaries, daily policy breakdowns, and ground reportage from across India.', 'np-news-metro'); ?>
                </p>
            </div>
        </div>
    </header>

    <!-- Main Videos Grid -->
    <?php if (have_posts()) : ?>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <?php while (have_posts()) : the_post(); ?>
                <?php get_template_part('template-parts/cards/card-video'); ?>
            <?php endwhile; ?>
        </div>

        <!-- Pagination -->
        <?php np_render_pagination(); ?>

    <?php else : ?>
        <div class="p-12 text-center bg-surface-lowest border border-border-subtle">
            <h3 class="font-serif text-xl font-bold text-ink"><?php esc_html_e('No videos published yet.', 'np-news-metro'); ?></h3>
        </div>
    <?php endif; ?>
</div>

<?php
get_footer();
