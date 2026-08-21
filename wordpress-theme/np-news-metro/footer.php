<?php
/**
 * The Footer template for NP News Metro
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

$categories = get_categories(array('number' => 8, 'hide_empty' => false));
?>
    </main><!-- #primary -->

    <!-- Pre-Footer Leaderboard Ad (Zone A7) -->
    <div class="max-w-site mx-auto px-4 w-full">
        <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A7')); ?>
    </div>

    <!-- Master Site Footer -->
    <footer class="bg-primary text-slate-300 pt-12 pb-8 border-t-4 border-secondary-gold text-xs font-sans mt-12">
        <div class="max-w-site mx-auto px-4">
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-700">
                
                <!-- Col 1: Brand & Mission -->
                <div>
                    <h2 class="font-serif font-black text-2xl text-white mb-2"><?php bloginfo('name'); ?></h2>
                    <p class="text-[10px] uppercase tracking-widest text-secondary-gold font-bold mb-4">
                        <?php echo get_bloginfo('description') ? get_bloginfo('description') : 'REAL NEWS. REAL IMPACT.'; ?>
                    </p>
                    <p class="text-slate-400 leading-relaxed mb-4">
                        <?php esc_html_e('NP News Metro is an independent, multimedia Indian news organization committed to fearless investigative reporting, macroeconomic analysis, and democratic accountability.', 'np-news-metro'); ?>
                    </p>
                    <div class="text-[11px] text-slate-400 space-y-1">
                        <p><strong><?php esc_html_e('Registered Office:', 'np-news-metro'); ?></strong> Press Enclave, New Delhi - 110001</p>
                        <p><strong><?php esc_html_e('ISSN:', 'np-news-metro'); ?></strong> 2455-8923 &bull; Registered with RNI</p>
                    </div>
                </div>

                <!-- Col 2: Top Sections -->
                <div>
                    <h4 class="font-serif font-bold text-base text-white border-b border-slate-700 pb-2 mb-4">
                        <?php esc_html_e('News Sections', 'np-news-metro'); ?>
                    </h4>
                    <ul class="space-y-2">
                        <?php foreach ($categories as $cat) : ?>
                            <li>
                                <a href="<?php echo esc_url(get_category_link($cat->term_id)); ?>" class="hover:text-secondary-gold transition-colors flex items-center justify-between">
                                    <span><?php echo esc_html($cat->name); ?></span>
                                    <span class="text-slate-500 text-[10px]"><?php echo esc_html($cat->count); ?></span>
                                </a>
                            </li>
                        <?php endforeach; ?>
                        <li><a href="<?php echo esc_url(home_url('/videos')); ?>" class="hover:text-secondary-gold transition-colors font-semibold text-secondary-gold"><?php esc_html_e('Video Newsroom &rarr;', 'np-news-metro'); ?></a></li>
                    </ul>
                </div>

                <!-- Col 3: Editorial Standards & Governance -->
                <div>
                    <h4 class="font-serif font-bold text-base text-white border-b border-slate-700 pb-2 mb-4">
                        <?php esc_html_e('Governance & Ethics', 'np-news-metro'); ?>
                    </h4>
                    <ul class="space-y-2 text-slate-400">
                        <li><a href="<?php echo esc_url(home_url('/about')); ?>" class="hover:text-white"><?php esc_html_e('About Our Newsroom', 'np-news-metro'); ?></a></li>
                        <li><a href="<?php echo esc_url(home_url('/editorial-team')); ?>" class="hover:text-white"><?php esc_html_e('Editorial Board & Leadership', 'np-news-metro'); ?></a></li>
                        <li><a href="<?php echo esc_url(home_url('/ethics-policy')); ?>" class="hover:text-white"><?php esc_html_e('Code of Editorial Ethics', 'np-news-metro'); ?></a></li>
                        <li><a href="<?php echo esc_url(home_url('/corrections')); ?>" class="hover:text-white"><?php esc_html_e('Corrections & Clarifications Policy', 'np-news-metro'); ?></a></li>
                        <li><a href="<?php echo esc_url(home_url('/privacy-policy')); ?>" class="hover:text-white"><?php esc_html_e('Privacy & Cookie Policy', 'np-news-metro'); ?></a></li>
                        <li><a href="<?php echo esc_url(home_url('/terms')); ?>" class="hover:text-white"><?php esc_html_e('Terms of Service', 'np-news-metro'); ?></a></li>
                        <li><a href="<?php echo esc_url(home_url('/contact')); ?>" class="hover:text-white"><?php esc_html_e('Contact Grievance Officer', 'np-news-metro'); ?></a></li>
                    </ul>
                </div>

                <!-- Col 4: Newsletter Box -->
                <div>
                    <h4 class="font-serif font-bold text-base text-white border-b border-slate-700 pb-2 mb-4">
                        <?php esc_html_e('Daily Morning Brief', 'np-news-metro'); ?>
                    </h4>
                    <p class="text-slate-400 mb-3 leading-relaxed">
                        <?php esc_html_e('Subscribe to receive our daily curated briefing of essential national and business stories.', 'np-news-metro'); ?>
                    </p>
                    <button type="button" data-modal-target="newsletter-modal" class="w-full bg-secondary-gold text-primary font-bold py-2.5 px-4 rounded-xs uppercase tracking-wider text-xs hover:bg-yellow-500 transition-colors shadow-xs cursor-pointer">
                        <?php esc_html_e('Subscribe Free', 'np-news-metro'); ?>
                    </button>
                    <p class="text-[10px] text-slate-500 mt-2 text-center">
                        <?php esc_html_e('Zero spam. Verified journalism only.', 'np-news-metro'); ?>
                    </p>
                </div>

            </div>

            <!-- Copyright & Disclaimers -->
            <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
                <p>
                    &copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. <?php esc_html_e('All rights reserved. Reproduction in whole or in part without permission is prohibited.', 'np-news-metro'); ?>
                </p>
                <div class="flex items-center gap-4">
                    <a href="#page" class="hover:text-white font-semibold flex items-center gap-1">
                        <span><?php esc_html_e('Back to Top', 'np-news-metro'); ?></span>
                        <span>&uarr;</span>
                    </a>
                </div>
            </div>

        </div>
    </footer>

</div><!-- #page -->

<!-- Modals & Overlays -->
<?php get_template_part('template-parts/modals/mobile-drawer'); ?>
<?php get_template_part('template-parts/modals/search-modal'); ?>
<?php get_template_part('template-parts/modals/newsletter-modal'); ?>

<?php wp_footer(); ?>
</body>
</html>
