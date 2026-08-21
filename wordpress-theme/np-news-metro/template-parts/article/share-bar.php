<?php
/**
 * Template Part: Article Social Share Bar
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$post_url = urlencode(get_permalink());
$post_title = urlencode(get_the_title());
?>
<div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
    <span class="text-xs font-bold text-ink-muted uppercase mr-1 hidden sm:inline">
        <?php esc_html_e('Share:', 'np-news-metro'); ?>
    </span>

    <!-- WhatsApp -->
    <a 
        href="https://api.whatsapp.com/send?text=<?php echo $post_title . '%20' . $post_url; ?>" 
        target="_blank" 
        rel="noopener noreferrer"
        class="p-2 rounded-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
    >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
    </a>

    <!-- Twitter / X -->
    <a 
        href="https://twitter.com/intent/tweet?text=<?php echo $post_title; ?>&url=<?php echo $post_url; ?>" 
        target="_blank" 
        rel="noopener noreferrer"
        class="p-2 rounded-xs bg-slate-100 text-slate-800 hover:bg-black hover:text-white transition-colors"
        title="Share on X"
        aria-label="Share on X"
    >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    </a>

    <!-- LinkedIn -->
    <a 
        href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo $post_url; ?>" 
        target="_blank" 
        rel="noopener noreferrer"
        class="p-2 rounded-xs bg-sky-50 text-sky-700 hover:bg-sky-700 hover:text-white transition-colors"
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
    >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
    </a>

    <!-- Copy Link Button -->
    <button 
        type="button" 
        class="np-copy-link-btn p-2 rounded-xs bg-slate-100 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
        data-url="<?php echo esc_url(get_permalink()); ?>"
        title="<?php esc_attr_e('Copy article link', 'np-news-metro'); ?>"
        aria-label="<?php esc_attr_e('Copy article link', 'np-news-metro'); ?>"
    >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
    </button>
</div>
