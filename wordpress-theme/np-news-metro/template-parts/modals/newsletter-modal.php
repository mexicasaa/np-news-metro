<?php
/**
 * Template Part: Newsletter Subscription Modal
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<!-- Reader Newsletter Modal -->
<div id="newsletter-modal" class="fixed inset-0 z-50 pointer-events-none transition-opacity duration-200 opacity-0" aria-hidden="true">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs modal-backdrop"></div>

    <!-- Modal Card -->
    <div class="fixed inset-x-0 top-20 max-w-lg mx-auto px-4 z-10">
        <div class="bg-surface-lowest rounded-xs shadow-modal border border-border-subtle overflow-hidden relative p-6 sm:p-8">
            
            <button type="button" class="modal-close-btn absolute top-4 right-4 text-slate-400 hover:text-ink cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div class="text-center mb-6">
                <span class="inline-block p-2.5 rounded-full bg-secondary-gold/20 text-secondary-dark mb-3">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </span>
                <h3 class="font-serif font-black text-2xl text-ink">
                    <?php esc_html_e('The Morning Metro Brief', 'np-news-metro'); ?>
                </h3>
                <p class="text-xs sm:text-sm text-ink-secondary mt-2">
                    <?php esc_html_e('Get India’s top national, economic, and geopolitical investigations delivered to your inbox every morning at 7:00 AM IST.', 'np-news-metro'); ?>
                </p>
            </div>

            <!-- Form -->
            <form onsubmit="event.preventDefault(); alert('Thank you for subscribing to NP News Metro Daily Brief!');" class="space-y-3">
                <div>
                    <label class="block text-xs font-bold text-ink uppercase mb-1"><?php esc_html_e('Work Email Address', 'np-news-metro'); ?></label>
                    <input 
                        type="email" 
                        required 
                        placeholder="editor@organization.in" 
                        class="w-full px-3.5 py-2.5 bg-surface-low border border-border-subtle rounded-xs text-sm text-ink focus:border-primary focus:outline-hidden"
                    />
                </div>

                <div class="flex items-center gap-2 text-xs text-ink-muted">
                    <input type="checkbox" id="news-consent" required class="rounded-xs" checked />
                    <label for="news-consent"><?php esc_html_e('I agree to the editorial privacy policy. Unsubscribe anytime.', 'np-news-metro'); ?></label>
                </div>

                <button type="submit" class="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3 rounded-xs text-sm uppercase tracking-wider transition-colors shadow-sm cursor-pointer">
                    <?php esc_html_e('Subscribe Free', 'np-news-metro'); ?>
                </button>
            </form>

        </div>
    </div>
</div>
