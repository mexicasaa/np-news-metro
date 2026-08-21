<?php
/**
 * Template Part: Primary Navigation Bar
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$categories = get_categories(array(
    'orderby'    => 'count',
    'order'      => 'DESC',
    'number'     => 10,
    'hide_empty' => false,
));
?>
<nav class="bg-surface-lowest border-b-2 border-primary/20 sticky top-0 z-20 shadow-xs">
    <div class="max-w-site mx-auto px-4 flex items-center justify-between">
        
        <!-- Categories Horizontal Scroll Container -->
        <div class="flex items-center space-x-1 sm:space-x-2 overflow-x-auto hide-scrollbar py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            
            <a href="<?php echo esc_url(home_url('/')); ?>" class="px-2.5 py-1 rounded-xs hover:bg-slate-100 transition-colors whitespace-nowrap <?php echo is_front_page() ? 'text-primary font-bold border-b-2 border-primary' : 'text-ink-secondary'; ?>">
                <?php esc_html_e('Home', 'np-news-metro'); ?>
            </a>

            <a href="<?php echo esc_url(home_url('/latest')); ?>" class="px-2.5 py-1 rounded-xs hover:bg-slate-100 transition-colors whitespace-nowrap text-editorial-red font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-editorial-red animate-ping"></span>
                <span><?php esc_html_e('Latest', 'np-news-metro'); ?></span>
            </a>

            <?php if (has_nav_menu('primary-menu')) : ?>
                <?php
                wp_nav_menu(array(
                    'theme_location' => 'primary-menu',
                    'container'      => false,
                    'items_wrap'     => '%3$s',
                    'fallback_cb'    => false,
                ));
                ?>
            <?php else : ?>
                <?php foreach ($categories as $cat) : 
                    $is_current = is_category($cat->term_id);
                ?>
                    <a href="<?php echo esc_url(get_category_link($cat->term_id)); ?>" class="px-2.5 py-1 rounded-xs hover:bg-slate-100 transition-colors whitespace-nowrap <?php echo $is_current ? 'text-primary font-bold border-b-2 border-primary' : 'text-ink-secondary hover:text-primary'; ?>">
                        <?php echo esc_html($cat->name); ?>
                    </a>
                <?php endforeach; ?>
            <?php endif; ?>

            <!-- Media Links -->
            <a href="<?php echo esc_url(get_post_type_archive_link('video') ? get_post_type_archive_link('video') : home_url('/videos')); ?>" class="px-2.5 py-1 rounded-xs hover:bg-slate-100 transition-colors whitespace-nowrap text-ink-secondary hover:text-primary flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-editorial-red" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <span><?php esc_html_e('Videos', 'np-news-metro'); ?></span>
            </a>

            <a href="<?php echo esc_url(get_post_type_archive_link('gallery') ? get_post_type_archive_link('gallery') : home_url('/photos')); ?>" class="px-2.5 py-1 rounded-xs hover:bg-slate-100 transition-colors whitespace-nowrap text-ink-secondary hover:text-primary">
                <?php esc_html_e('Photos', 'np-news-metro'); ?>
            </a>

            <a href="<?php echo esc_url(home_url('/trending')); ?>" class="px-2.5 py-1 rounded-xs hover:bg-yellow-50 text-secondary-dark font-bold transition-colors whitespace-nowrap flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-secondary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                <span><?php esc_html_e('Trending', 'np-news-metro'); ?></span>
            </a>
        </div>

    </div>
</nav>
