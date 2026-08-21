<?php
/**
 * Template Part: Video Card
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$duration = get_post_meta(get_the_ID(), '_np_video_duration', true);
$presenter = get_post_meta(get_the_ID(), '_np_video_presenter', true);
?>
<article class="group bg-primary-dark text-white rounded-xs overflow-hidden border border-slate-800 shadow-subtle hover:shadow-xl transition-all flex flex-col h-full">
    <!-- Video Poster with Play Icon -->
    <div class="aspect-[16/9] overflow-hidden bg-slate-950 relative">
        <a href="<?php the_permalink(); ?>" class="block w-full h-full">
            <img 
                src="<?php echo esc_url(np_get_thumbnail_url(get_the_ID(), 'np-card-large')); ?>" 
                alt="<?php the_title_attribute(); ?>"
                class="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                loading="lazy"
            />
            <!-- Play Button Overlay -->
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-12 h-12 rounded-full bg-editorial-red text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
            </div>
            <!-- Duration Badge -->
            <?php if ($duration) : ?>
                <span class="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-xs">
                    <?php echo esc_html($duration); ?>
                </span>
            <?php endif; ?>
        </a>
    </div>

    <!-- Details -->
    <div class="p-4 flex flex-col flex-1 justify-between">
        <div>
            <div class="flex items-center gap-2 mb-2">
                <span class="text-secondary-gold text-[10px] font-extrabold uppercase tracking-wider"><?php esc_html_e('VIDEO EXPLAINER', 'np-news-metro'); ?></span>
                <span class="text-slate-500 text-xs">&bull;</span>
                <span class="text-slate-400 text-xs"><?php echo np_get_formatted_time(); ?></span>
            </div>
            <h3 class="font-serif font-bold text-base sm:text-lg text-white leading-snug mb-2 group-hover:text-secondary-gold transition-colors">
                <a href="<?php the_permalink(); ?>">
                    <?php the_title(); ?>
                </a>
            </h3>
        </div>

        <?php if ($presenter) : ?>
            <div class="pt-3 border-t border-slate-800 text-xs text-slate-400">
                <span><?php esc_html_e('Hosted by', 'np-news-metro'); ?> <strong class="text-slate-200"><?php echo esc_html($presenter); ?></strong></span>
            </div>
        <?php endif; ?>
    </div>
</article>
