<?php
/**
 * Template 08: Video Detail & Timestamped Transcript
 *
 * @package NP_News_Metro
 */

get_header();

while (have_posts()) : the_post();
    $video_url   = get_post_meta(get_the_ID(), '_np_video_url', true);
    $duration    = get_post_meta(get_the_ID(), '_np_video_duration', true);
    $presenter   = get_post_meta(get_the_ID(), '_np_video_presenter', true);
    $transcript  = get_post_meta(get_the_ID(), '_np_video_transcript', true);
?>

<article class="space-y-8 max-w-4xl mx-auto">
    <!-- Breadcrumbs -->
    <?php np_render_breadcrumbs(); ?>

    <!-- Video Embed Player Stage -->
    <div class="aspect-[16/9] w-full bg-black rounded-xs overflow-hidden shadow-2xl relative">
        <?php if ($video_url) : ?>
            <?php echo wp_oembed_get($video_url, array('width' => 1200, 'height' => 675)); ?>
        <?php else : ?>
            <div class="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900">
                <div class="w-16 h-16 rounded-full bg-editorial-red flex items-center justify-center mb-3">
                    <svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <p class="text-sm font-semibold text-slate-300"><?php esc_html_e('Video Player Ready (Add video embed URL in WordPress Admin)', 'np-news-metro'); ?></p>
            </div>
        <?php endif; ?>
    </div>

    <!-- Video Header & Meta -->
    <header class="border-b border-border-subtle pb-6">
        <div class="flex items-center gap-2 mb-3">
            <span class="bg-editorial-red text-white text-xs font-extrabold uppercase px-2.5 py-1 rounded-xs">
                <?php esc_html_e('VIDEO REPORT', 'np-news-metro'); ?>
            </span>
            <?php if ($duration) : ?>
                <span class="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-xs text-ink"><?php echo esc_html($duration); ?></span>
            <?php endif; ?>
            <span class="text-xs text-ink-muted">&bull;</span>
            <span class="text-xs text-ink-muted"><?php echo np_get_formatted_time(); ?></span>
        </div>

        <h1 class="font-serif font-black text-2xl sm:text-4xl text-ink leading-tight mb-4">
            <?php the_title(); ?>
        </h1>

        <div class="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-border-subtle text-xs text-ink-secondary">
            <?php if ($presenter) : ?>
                <div>
                    <span><?php esc_html_e('Presented by:', 'np-news-metro'); ?> <strong class="text-ink text-sm"><?php echo esc_html($presenter); ?></strong></span>
                </div>
            <?php endif; ?>
            
            <?php get_template_part('template-parts/article/share-bar'); ?>
        </div>
    </header>

    <!-- Video Description & Content -->
    <div class="gutenberg-content font-sans text-ink leading-relaxed text-base sm:text-lg">
        <?php the_content(); ?>
    </div>

    <!-- Interactive Transcript Section -->
    <?php if (!empty($transcript)) : ?>
        <section class="p-6 bg-surface-low border border-border-subtle rounded-xs shadow-subtle my-8">
            <div class="flex items-center gap-2 pb-3 mb-4 border-b border-border-subtle">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <h3 class="font-serif font-bold text-lg text-ink uppercase tracking-wide">
                    <?php esc_html_e('Verified Video Transcript & Timestamps', 'np-news-metro'); ?>
                </h3>
            </div>
            <div class="space-y-3 font-sans text-sm text-ink-secondary leading-relaxed">
                <?php 
                $lines = array_filter(array_map('trim', explode("\n", $transcript)));
                foreach ($lines as $line) :
                ?>
                    <p class="flex items-start gap-3">
                        <span class="font-mono font-bold text-xs bg-slate-200 text-primary px-1.5 py-0.5 rounded-xs shrink-0">&bull;</span>
                        <span><?php echo esc_html($line); ?></span>
                    </p>
                <?php endforeach; ?>
            </div>
        </section>
    <?php endif; ?>

    <!-- Related Videos Section -->
    <?php
    $related_videos = new WP_Query(array(
        'post_type'      => 'video',
        'posts_per_page' => 3,
        'post__not_in'   => array(get_the_ID()),
    ));
    if ($related_videos->have_posts()) :
    ?>
        <section class="pt-8 border-t-2 border-primary">
            <h3 class="font-serif font-bold text-xl text-ink mb-6"><?php esc_html_e('More Video Explainers', 'np-news-metro'); ?></h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <?php while ($related_videos->have_posts()) : $related_videos->the_post(); ?>
                    <?php get_template_part('template-parts/cards/card-video'); ?>
                <?php endwhile; wp_reset_postdata(); ?>
            </div>
        </section>
    <?php endif; ?>

</article>

<?php
endwhile;

get_footer();
