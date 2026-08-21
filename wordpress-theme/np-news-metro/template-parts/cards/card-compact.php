<?php
/**
 * Template Part: Compact Story Card (Sidebar / List with small thumb)
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<article class="group flex items-start gap-3 py-3 border-b border-border-subtle last:border-0">
    <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5 mb-1">
            <?php np_the_category_badge(get_the_ID(), '!text-[10px] !px-1.5'); ?>
            <span class="text-[10px] text-ink-muted">&bull;</span>
            <span class="text-[10px] text-ink-muted"><?php echo np_get_formatted_time(); ?></span>
        </div>
        <h4 class="font-serif font-bold text-xs sm:text-sm text-ink leading-snug group-hover:text-secondary-dark transition-colors line-clamp-2">
            <a href="<?php the_permalink(); ?>">
                <?php the_title(); ?>
            </a>
        </h4>
    </div>

    <div class="w-20 h-16 sm:w-24 sm:h-16 shrink-0 rounded-xs overflow-hidden bg-slate-800">
        <a href="<?php the_permalink(); ?>" class="block w-full h-full">
            <img 
                src="<?php echo esc_url(np_get_thumbnail_url(get_the_ID(), 'np-card-thumb')); ?>" 
                alt="<?php the_title_attribute(); ?>"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
            />
        </a>
    </div>
</article>
