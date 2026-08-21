<?php
/**
 * Template 10: Search Results Page
 *
 * @package NP_News_Metro
 */

get_header();

global $wp_query;
$query_str = get_search_query();
?>

<div class="space-y-8 max-w-4xl mx-auto">
    
    <!-- Search Header -->
    <header class="border-b-2 border-primary pb-6">
        <?php np_render_breadcrumbs(); ?>
        
        <h1 class="font-serif font-black text-2xl sm:text-4xl text-ink my-3">
            <?php printf(esc_html__('Search Results for: "%s"', 'np-news-metro'), $query_str); ?>
        </h1>
        
        <p class="text-xs sm:text-sm text-ink-muted">
            <?php printf(esc_html__('Found %d published articles matching your query.', 'np-news-metro'), $wp_query->found_posts); ?>
        </p>

        <!-- In-page Search Bar -->
        <form role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>" class="mt-4 flex gap-2">
            <input 
                type="search" 
                name="s" 
                value="<?php echo esc_attr($query_str); ?>" 
                placeholder="<?php esc_attr_e('Search topics, investigations, authors...', 'np-news-metro'); ?>"
                class="flex-1 px-4 py-2.5 bg-surface-lowest border border-border-subtle rounded-xs text-sm text-ink focus:border-primary focus:outline-hidden"
            />
            <button type="submit" class="bg-primary hover:bg-slate-800 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xs transition-colors cursor-pointer">
                <?php esc_html_e('Search', 'np-news-metro'); ?>
            </button>
        </form>
    </header>

    <!-- Search Results Stream -->
    <?php if (have_posts()) : ?>
        <div class="space-y-4">
            <?php while (have_posts()) : the_post(); ?>
                <?php get_template_part('template-parts/cards/card-horizontal'); ?>
            <?php endwhile; ?>
        </div>

        <!-- Pagination -->
        <?php np_render_pagination(); ?>

    <?php else : ?>
        <!-- Empty State -->
        <div class="p-8 sm:p-12 text-center bg-surface-lowest border border-border-subtle rounded-xs shadow-subtle space-y-4">
            <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <h2 class="font-serif font-bold text-2xl text-ink"><?php esc_html_e('No articles found matching your query', 'np-news-metro'); ?></h2>
            <p class="text-ink-secondary text-sm max-w-md mx-auto">
                <?php esc_html_e('Check your spelling or try searching broader editorial keywords like "Infrastructure", "Markets", "Parliament", or "Technology".', 'np-news-metro'); ?>
            </p>
            <div class="pt-4">
                <a href="<?php echo esc_url(home_url('/latest')); ?>" class="inline-block bg-secondary-gold text-primary font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xs hover:bg-yellow-500 transition-colors">
                    <?php esc_html_e('Browse Latest Wire Instead &rarr;', 'np-news-metro'); ?>
                </a>
            </div>
        </div>
    <?php endif; ?>

</div>

<?php
get_footer();
