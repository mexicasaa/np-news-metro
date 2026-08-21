<?php
/**
 * Template Part: Instant Search Modal
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<!-- Instant Search Overlay Modal -->
<div id="np-search-modal" class="fixed inset-0 z-50 pointer-events-none transition-opacity duration-200 opacity-0" aria-hidden="true">
    <!-- Backdrop -->
    <div id="np-search-backdrop" class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"></div>

    <!-- Modal Content -->
    <div class="fixed inset-x-0 top-16 sm:top-24 max-w-2xl mx-auto px-4 z-10">
        <div class="bg-surface-lowest rounded-xs shadow-modal border border-border-subtle overflow-hidden">
            
            <!-- Search Input Form -->
            <form role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>" class="relative flex items-center border-b border-border-subtle p-3 sm:p-4">
                <svg class="w-5 h-5 text-slate-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input 
                    type="search" 
                    id="np-search-input"
                    name="s" 
                    placeholder="<?php esc_attr_e('Search news, topics, authors...', 'np-news-metro'); ?>" 
                    value="<?php echo get_search_query(); ?>"
                    class="w-full bg-transparent text-ink text-base sm:text-lg focus:outline-hidden font-sans"
                    autocomplete="off"
                />
                <button type="button" id="np-search-close" aria-label="<?php esc_attr_e('Close search', 'np-news-metro'); ?>" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-xs font-mono font-bold cursor-pointer">
                    ESC
                </button>
            </form>

            <!-- Popular Search Topics -->
            <div class="p-4 bg-surface-low text-xs text-ink-muted flex items-center gap-2 flex-wrap">
                <span class="font-bold text-ink uppercase tracking-wider text-[10px]"><?php esc_html_e('Popular Topics:', 'np-news-metro'); ?></span>
                <a href="<?php echo esc_url(home_url('/?s=Infrastructure')); ?>" class="bg-white px-2 py-1 rounded border border-border-subtle hover:text-primary hover:border-primary transition-colors">#Infrastructure</a>
                <a href="<?php echo esc_url(home_url('/?s=RBI')); ?>" class="bg-white px-2 py-1 rounded border border-border-subtle hover:text-primary hover:border-primary transition-colors">#RBI</a>
                <a href="<?php echo esc_url(home_url('/?s=Semiconductors')); ?>" class="bg-white px-2 py-1 rounded border border-border-subtle hover:text-primary hover:border-primary transition-colors">#Semiconductors</a>
                <a href="<?php echo esc_url(home_url('/?s=Elections')); ?>" class="bg-white px-2 py-1 rounded border border-border-subtle hover:text-primary hover:border-primary transition-colors">#Elections</a>
            </div>

        </div>
    </div>
</div>
