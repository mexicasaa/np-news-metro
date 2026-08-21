<?php
/**
 * Template Part: Author Bio Box
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$author_id = get_the_author_meta('ID');
$author_name = get_the_author_meta('display_name');
$author_bio = get_the_author_meta('description');
$author_url = get_author_posts_url($author_id);
?>
<div class="my-10 p-5 sm:p-6 bg-surface-lowest border border-border-subtle rounded-xs shadow-subtle flex flex-col sm:flex-row items-start sm:items-center gap-5">
    <div class="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden border-2 border-secondary-gold shadow-sm">
        <a href="<?php echo esc_url($author_url); ?>">
            <?php echo get_avatar($author_id, 80, '', $author_name, array('class' => 'w-full h-full object-cover')); ?>
        </a>
    </div>

    <div class="flex-1">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h4 class="font-serif font-bold text-lg text-ink">
                <a href="<?php echo esc_url($author_url); ?>" class="hover:text-primary transition-colors">
                    <?php echo esc_html($author_name); ?>
                </a>
            </h4>
            <span class="bg-secondary-fixed/60 text-secondary-dark text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                <?php esc_html_e('VERIFIED JOURNALIST', 'np-news-metro'); ?>
            </span>
        </div>

        <p class="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-3">
            <?php echo $author_bio ? esc_html($author_bio) : esc_html__('Special correspondent covering national policy, economics, and public institutions for NP News Metro.', 'np-news-metro'); ?>
        </p>

        <div class="flex items-center gap-4 text-xs font-semibold text-primary">
            <a href="<?php echo esc_url($author_url); ?>" class="hover:underline flex items-center gap-1">
                <span><?php esc_html_e('View all stories by this author', 'np-news-metro'); ?></span>
                <span>&rarr;</span>
            </a>
        </div>
    </div>
</div>
