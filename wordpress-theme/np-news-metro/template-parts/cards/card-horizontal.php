<?php
/**
 * Template Part: Horizontal Story Card (Wire / Latest Feed)
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<article class="group bg-surface-lowest border border-border-subtle rounded-xs p-4 sm:p-5 shadow-subtle hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
    <!-- Thumbnail -->
    <div class="w-full sm:w-56 md:w-64 aspect-[16/10] shrink-0 rounded-xs overflow-hidden bg-slate-900">
        <a href="<?php the_permalink(); ?>" class="block w-full h-full">
            <img 
                src="<?php echo esc_url(np_get_thumbnail_url(get_the_ID(), 'np-card-large')); ?>" 
                alt="<?php the_title_attribute(); ?>"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
            />
        </a>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col justify-between w-full">
        <div>
            <div class="flex items-center gap-2 mb-2">
                <?php np_the_category_badge(); ?>
                <span class="text-xs text-ink-muted">&bull;</span>
                <span class="text-xs text-ink-muted"><?php echo np_get_reading_time(); ?></span>
            </div>

            <h3 class="font-serif font-bold text-lg sm:text-xl text-ink leading-snug mb-2 group-hover:text-secondary-dark transition-colors">
                <a href="<?php the_permalink(); ?>">
                    <?php the_title(); ?>
                </a>
            </h3>

            <p class="text-ink-secondary text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
                <?php echo np_get_dek(get_the_ID(), 22); ?>
            </p>
        </div>

        <div class="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-ink-muted">
            <span class="font-semibold text-ink"><?php the_author_posts_link(); ?></span>
            <span><?php echo np_get_formatted_time(); ?></span>
        </div>
    </div>
</article>
