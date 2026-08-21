<?php
/**
 * Template Part: Medium Story Card (Standard 3-col Grid)
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<article class="group bg-surface-lowest border border-border-subtle rounded-xs overflow-hidden shadow-subtle hover:shadow-md transition-all flex flex-col h-full">
    <div class="aspect-[16/10] overflow-hidden bg-slate-900 relative">
        <a href="<?php the_permalink(); ?>" class="block w-full h-full">
            <img 
                src="<?php echo esc_url(np_get_thumbnail_url(get_the_ID(), 'np-card-medium')); ?>" 
                alt="<?php the_title_attribute(); ?>"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
            />
        </a>
    </div>

    <div class="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
            <div class="flex items-center gap-2 mb-2">
                <?php np_the_category_badge(); ?>
                <span class="text-[11px] text-ink-muted">&bull;</span>
                <span class="text-[11px] text-ink-muted"><?php echo np_get_reading_time(); ?></span>
            </div>

            <h3 class="font-serif font-bold text-base sm:text-lg text-ink leading-snug mb-2 group-hover:text-secondary-dark transition-colors">
                <a href="<?php the_permalink(); ?>">
                    <?php the_title(); ?>
                </a>
            </h3>

            <p class="text-ink-secondary text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2">
                <?php echo np_get_dek(get_the_ID(), 14); ?>
            </p>
        </div>

        <div class="pt-2.5 border-t border-border-subtle flex items-center justify-between text-[11px] text-ink-muted">
            <span class="font-medium text-ink truncate max-w-[120px]"><?php the_author_posts_link(); ?></span>
            <span><?php echo np_get_formatted_time(); ?></span>
        </div>
    </div>
</article>
