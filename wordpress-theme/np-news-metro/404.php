<?php
/**
 * Template 14: 404 Error Page
 *
 * @package NP_News_Metro
 */

get_header();
?>

<div class="max-w-3xl mx-auto py-12 px-4 text-center space-y-8">
    <!-- Big 404 Editorial Stamp -->
    <div class="inline-block p-4 border-4 border-editorial-red rounded-xs font-serif font-black text-6xl sm:text-8xl text-editorial-red tracking-tight">
        404
    </div>

    <div>
        <span class="text-xs uppercase tracking-widest font-extrabold text-secondary-gold block mb-2">
            <?php esc_html_e('PAGE NOT FOUND &bull; ARCHIVE NOTICE', 'np-news-metro'); ?>
        </span>
        <h1 class="font-serif font-black text-2xl sm:text-4xl text-ink">
            <?php esc_html_e('The story or page you requested could not be located.', 'np-news-metro'); ?>
        </h1>
        <p class="text-ink-secondary text-sm sm:text-base mt-3 max-w-lg mx-auto leading-relaxed">
            <?php esc_html_e('This article may have been archived, renamed, or moved during our latest newsroom editorial updates.', 'np-news-metro'); ?>
        </p>
    </div>

    <!-- Search Form -->
    <div class="max-w-md mx-auto">
        <form role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>" class="flex gap-2">
            <input 
                type="search" 
                name="s" 
                placeholder="<?php esc_attr_e('Search topics, investigations...', 'np-news-metro'); ?>" 
                class="flex-1 px-4 py-2.5 bg-surface-lowest border border-border-subtle rounded-xs text-sm text-ink focus:border-primary focus:outline-hidden"
            />
            <button type="submit" class="bg-primary hover:bg-slate-800 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xs transition-colors cursor-pointer">
                <?php esc_html_e('Search', 'np-news-metro'); ?>
            </button>
        </form>
    </div>

    <!-- Quick Navigation Links -->
    <div class="pt-6 border-t border-border-subtle flex items-center justify-center gap-4 flex-wrap text-xs font-semibold">
        <a href="<?php echo esc_url(home_url('/')); ?>" class="text-primary hover:underline">&larr; <?php esc_html_e('Return to Frontpage', 'np-news-metro'); ?></a>
        <span class="text-slate-300">&bull;</span>
        <a href="<?php echo esc_url(home_url('/latest')); ?>" class="text-editorial-red hover:underline"><?php esc_html_e('Read Latest Wire', 'np-news-metro'); ?></a>
        <span class="text-slate-300">&bull;</span>
        <a href="<?php echo esc_url(home_url('/trending')); ?>" class="text-secondary-dark hover:underline"><?php esc_html_e('Top 10 Trending', 'np-news-metro'); ?></a>
    </div>
</div>

<?php
get_footer();
