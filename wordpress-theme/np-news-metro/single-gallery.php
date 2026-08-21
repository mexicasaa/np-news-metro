<?php
/**
 * Template 09: Photo Gallery & Picture Essay
 *
 * @package NP_News_Metro
 */

get_header();

while (have_posts()) : the_post();
?>

<article class="space-y-8 max-w-4xl mx-auto">
    <!-- Breadcrumbs -->
    <?php np_render_breadcrumbs(); ?>

    <header class="border-b border-border-subtle pb-6">
        <span class="bg-secondary text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs inline-block mb-3">
            <?php esc_html_e('PHOTO ESSAY & VISUAL REPORT', 'np-news-metro'); ?>
        </span>
        <h1 class="font-serif font-black text-3xl sm:text-5xl text-ink leading-tight mb-4">
            <?php the_title(); ?>
        </h1>
        <div class="flex items-center justify-between flex-wrap gap-4 text-xs text-ink-muted pt-3 border-t border-border-subtle">
            <span><?php esc_html_e('Photography by:', 'np-news-metro'); ?> <strong class="text-ink"><?php the_author_posts_link(); ?></strong></span>
            <span><?php echo get_the_date('F j, Y'); ?></span>
        </div>
    </header>

    <!-- Lead Visual -->
    <?php if (has_post_thumbnail()) : ?>
        <figure class="rounded-xs overflow-hidden shadow-lg bg-slate-900">
            <?php the_post_thumbnail('np-hero', array('class' => 'w-full h-auto object-cover')); ?>
            <?php if (get_the_post_thumbnail_caption()) : ?>
                <figcaption class="p-3 bg-surface-lowest text-xs text-ink-secondary border-t border-border-subtle italic">
                    <?php echo esc_html(get_the_post_thumbnail_caption()); ?>
                </figcaption>
            <?php endif; ?>
        </figure>
    <?php endif; ?>

    <!-- Editorial Story Body -->
    <div class="gutenberg-content font-sans text-ink leading-relaxed text-base sm:text-lg">
        <?php the_content(); ?>
    </div>

    <!-- Share Bar -->
    <div class="py-4 border-y border-border-subtle flex items-center justify-between">
        <span class="font-serif font-bold text-sm text-ink"><?php esc_html_e('Share this visual story:', 'np-news-metro'); ?></span>
        <?php get_template_part('template-parts/article/share-bar'); ?>
    </div>

    <!-- Author Box -->
    <?php get_template_part('template-parts/article/author-bio'); ?>
</article>

<?php
endwhile;

get_footer();
