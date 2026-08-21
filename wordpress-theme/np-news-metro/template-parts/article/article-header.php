<?php
/**
 * Template Part: Article Header
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$is_breaking  = get_post_meta(get_the_ID(), '_np_is_breaking', true);
$is_opinion   = get_post_meta(get_the_ID(), '_np_is_opinion', true);
$is_sponsored = get_post_meta(get_the_ID(), '_np_is_sponsored', true);
$sponsor_name = get_post_meta(get_the_ID(), '_np_sponsor_name', true);
$dek          = get_post_meta(get_the_ID(), '_np_post_dek', true);
$image_credit = get_post_meta(get_the_ID(), '_np_image_credit', true);
?>
<header class="mb-8">
    <!-- Breadcrumbs -->
    <?php np_render_breadcrumbs(); ?>

    <!-- Badges Row -->
    <div class="flex items-center gap-2 my-3 flex-wrap">
        <?php if ($is_breaking) : ?>
            <span class="bg-editorial-red text-white text-xs font-extrabold uppercase px-2.5 py-1 rounded-xs tracking-wider animate-pulse">
                <?php esc_html_e('LIVE / BREAKING', 'np-news-metro'); ?>
            </span>
        <?php elseif ($is_opinion) : ?>
            <span class="bg-secondary text-white text-xs font-extrabold uppercase px-2.5 py-1 rounded-xs tracking-wider">
                <?php esc_html_e('EDITORIAL OPINION', 'np-news-metro'); ?>
            </span>
        <?php elseif ($is_sponsored) : ?>
            <span class="bg-slate-200 text-slate-800 text-xs font-bold uppercase px-2 py-0.5 rounded-xs">
                <?php echo esc_html($sponsor_name ? 'SPONSORED: ' . $sponsor_name : 'SPONSORED'); ?>
            </span>
        <?php else : ?>
            <?php np_the_category_badge(get_the_ID(), '!text-xs !px-2.5 !py-1'); ?>
        <?php endif; ?>
        <span class="text-xs text-ink-muted">&bull;</span>
        <span class="text-xs text-ink-muted font-medium"><?php echo np_get_reading_time(); ?></span>
    </div>

    <!-- Main Headline -->
    <h1 class="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-ink leading-[1.15] mb-4">
        <?php the_title(); ?>
    </h1>

    <!-- Dek / Subtitle -->
    <?php if ($dek) : ?>
        <p class="text-lg sm:text-xl text-ink-secondary leading-relaxed font-sans mb-6 border-l-3 border-secondary-gold pl-4 italic">
            <?php echo esc_html($dek); ?>
        </p>
    <?php endif; ?>

    <!-- Author, Metadata & Share Row -->
    <div class="py-4 border-y border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
            <?php echo get_avatar(get_the_author_meta('ID'), 44, '', '', array('class' => 'rounded-full border border-slate-300')); ?>
            <div>
                <div class="font-serif font-bold text-base text-ink">
                    <?php the_author_posts_link(); ?>
                </div>
                <div class="text-xs text-ink-muted">
                    <span><?php esc_html_e('Published:', 'np-news-metro'); ?> <?php echo get_the_date('F j, Y, g:i A T'); ?></span>
                </div>
            </div>
        </div>

        <!-- Social Share Bar Integration -->
        <?php get_template_part('template-parts/article/share-bar'); ?>
    </div>

    <!-- Featured Hero Image -->
    <?php if (has_post_thumbnail()) : ?>
        <figure class="my-6">
            <div class="aspect-[16/9] overflow-hidden rounded-xs bg-slate-900 shadow-sm">
                <?php the_post_thumbnail('np-hero', array('class' => 'w-full h-full object-cover')); ?>
            </div>
            <?php 
            $caption = get_the_post_thumbnail_caption();
            if ($caption || $image_credit) : ?>
                <figcaption class="text-xs text-ink-muted mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
                    <span><?php echo esc_html($caption); ?></span>
                    <?php if ($image_credit) : ?>
                        <span class="font-semibold text-ink-secondary"><?php echo esc_html($image_credit); ?></span>
                    <?php endif; ?>
                </figcaption>
            <?php endif; ?>
        </figure>
    <?php endif; ?>
</header>
