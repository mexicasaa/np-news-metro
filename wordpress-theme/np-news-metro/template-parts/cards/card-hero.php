<?php
/**
 * Template Part: Hero Story Card (Lead Article)
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<article class="group relative bg-surface-lowest border border-border-subtle rounded-xs overflow-hidden shadow-subtle hover:shadow-md transition-shadow">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        <!-- Image (7 Cols on desktop) -->
        <div class="lg:col-span-7 aspect-[16/9] lg:aspect-auto overflow-hidden bg-slate-900 relative">
            <a href="<?php the_permalink(); ?>" class="block w-full h-full">
                <img 
                    src="<?php echo esc_url(np_get_thumbnail_url(get_the_ID(), 'np-hero')); ?>" 
                    alt="<?php the_title_attribute(); ?>"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                />
            </a>
            <!-- Lead Badge -->
            <span class="absolute top-3 left-3 bg-editorial-red text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-xs shadow-md">
                <?php esc_html_e('DEVELOPING STORY', 'np-news-metro'); ?>
            </span>
        </div>

        <!-- Content (5 Cols on desktop) -->
        <div class="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between bg-surface-lowest">
            <div>
                <!-- Category Badge & Read Time -->
                <div class="flex items-center gap-2 mb-3">
                    <?php np_the_category_badge(); ?>
                    <span class="text-xs text-ink-muted">&bull;</span>
                    <span class="text-xs text-ink-muted font-medium"><?php echo np_get_reading_time(); ?></span>
                </div>

                <!-- Headline -->
                <h2 class="font-serif font-black text-2xl sm:text-3xl lg:text-3xl text-ink leading-tight mb-3 group-hover:text-secondary-dark transition-colors">
                    <a href="<?php the_permalink(); ?>" class="focus:outline-none">
                        <?php the_title(); ?>
                    </a>
                </h2>

                <!-- Dek / Subtitle -->
                <p class="text-ink-secondary text-sm sm:text-base leading-relaxed mb-4 line-clamp-3">
                    <?php echo np_get_dek(get_the_ID(), 28); ?>
                </p>
            </div>

            <!-- Author & Timestamp Footer -->
            <div class="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-ink-muted mt-auto">
                <div class="flex items-center gap-2">
                    <?php echo get_avatar(get_the_author_meta('ID'), 28, '', '', array('class' => 'rounded-full border border-slate-200')); ?>
                    <span class="font-semibold text-ink"><?php the_author_posts_link(); ?></span>
                </div>
                <span><?php echo np_get_formatted_time(); ?></span>
            </div>
        </div>

    </div>
</article>
