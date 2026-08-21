<?php
/**
 * Template 01: Master Homepage Frontpage
 *
 * @package NP_News_Metro
 */

get_header();

// 1. Lead Story Query
$lead_query = new WP_Query(array(
    'post_type'      => 'post',
    'posts_per_page' => 1,
    'meta_query'     => array(
        'relation' => 'OR',
        array(
            'key'     => '_np_is_lead',
            'value'   => '1',
            'compare' => '=',
        ),
        array(
            'key'     => '_np_is_breaking',
            'value'   => '1',
            'compare' => '=',
        ),
    ),
));

if (!$lead_query->have_posts()) {
    $lead_query = new WP_Query(array(
        'post_type'      => 'post',
        'posts_per_page' => 1,
    ));
}

$lead_post_id = 0;
if ($lead_query->have_posts()) {
    $lead_post_id = $lead_query->posts[0]->ID;
}

// 2. Right Side Compact Stories Query
$side_query = new WP_Query(array(
    'post_type'      => 'post',
    'posts_per_page' => 4,
    'post__not_in'   => array($lead_post_id),
));
$exclude_ids = array($lead_post_id);
foreach ($side_query->posts as $p) {
    $exclude_ids[] = $p->ID;
}

// 3. 3-Card Featured Grid Query
$grid_query = new WP_Query(array(
    'post_type'      => 'post',
    'posts_per_page' => 3,
    'post__not_in'   => $exclude_ids,
));
foreach ($grid_query->posts as $p) {
    $exclude_ids[] = $p->ID;
}

// 4. Video Query
$video_query = new WP_Query(array(
    'post_type'      => 'video',
    'posts_per_page' => 3,
));
?>

<div class="space-y-12">

    <!-- ======================================================================
         SECTION 1: HERO SPOTLIGHT & WIRE
         ====================================================================== -->
    <section>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Lead Story Hero (8 cols) -->
            <div class="lg:col-span-8">
                <?php 
                if ($lead_query->have_posts()) : 
                    while ($lead_query->have_posts()) : $lead_query->the_post();
                        get_template_part('template-parts/cards/card-hero');
                    endwhile; 
                    wp_reset_postdata();
                else : 
                ?>
                    <div class="p-8 bg-surface-lowest border border-border-subtle text-center">
                        <h3 class="font-serif text-xl font-bold"><?php esc_html_e('No articles published yet.', 'np-news-metro'); ?></h3>
                        <p class="text-ink-secondary text-sm mt-2"><?php esc_html_e('Publish your first news post in WordPress Admin > Posts > Add New.', 'np-news-metro'); ?></p>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Fast Side Wire / Latest Briefs (4 cols) -->
            <div class="lg:col-span-4 bg-surface-lowest border border-border-subtle rounded-xs p-4 sm:p-5 shadow-subtle flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between pb-3 border-b-2 border-primary mb-3">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-editorial-red"></span>
                            <h3 class="font-serif font-black text-sm uppercase tracking-wider text-primary">
                                <?php esc_html_e('Latest Wire', 'np-news-metro'); ?>
                            </h3>
                        </div>
                        <a href="<?php echo esc_url(home_url('/latest')); ?>" class="text-[11px] font-bold text-secondary-dark hover:underline">
                            <?php esc_html_e('View All &rarr;', 'np-news-metro'); ?>
                        </a>
                    </div>

                    <div class="divide-y divide-border-subtle">
                        <?php 
                        if ($side_query->have_posts()) : 
                            while ($side_query->have_posts()) : $side_query->the_post();
                                get_template_part('template-parts/cards/card-compact');
                            endwhile; 
                            wp_reset_postdata();
                        endif; 
                        ?>
                    </div>
                </div>

                <!-- Trending Link Box -->
                <div class="pt-4 mt-4 border-t border-border-subtle">
                    <a href="<?php echo esc_url(home_url('/trending')); ?>" class="flex items-center justify-between p-2.5 bg-yellow-50/70 border border-secondary-gold/30 rounded-xs hover:bg-yellow-100/70 transition-colors">
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-secondary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            <span class="text-xs font-bold text-primary"><?php esc_html_e('Explore Top 10 Trending Reads', 'np-news-metro'); ?></span>
                        </div>
                        <span class="text-xs font-bold text-secondary-dark">&rarr;</span>
                    </a>
                </div>
            </div>

        </div>
    </section>

    <!-- ======================================================================
         SECTION 2: 3-COLUMN FEATURED EDITORIAL STORIES
         ====================================================================== -->
    <?php if ($grid_query->have_posts()) : ?>
    <section>
        <div class="flex items-center justify-between pb-3 border-b-2 border-primary mb-6">
            <h2 class="font-serif font-black text-xl sm:text-2xl text-ink">
                <?php esc_html_e('Top National & Policy Investigations', 'np-news-metro'); ?>
            </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <?php while ($grid_query->have_posts()) : $grid_query->the_post(); ?>
                <?php get_template_part('template-parts/cards/card-medium'); ?>
            <?php endwhile; wp_reset_postdata(); ?>
        </div>
    </section>
    <?php endif; ?>

    <!-- ======================================================================
         SECTION 3: MID-HOMEPAGE ADVERTISEMENT BANNER (Zone A6)
         ====================================================================== -->
    <section class="my-8">
        <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A6')); ?>
    </section>

    <!-- ======================================================================
         SECTION 4: MULTIMEDIA VIDEO HUB SHOWCASE
         ====================================================================== -->
    <section class="bg-primary text-white p-6 sm:p-8 rounded-xs shadow-lg">
        <div class="flex items-center justify-between pb-4 border-b border-slate-700 mb-6 flex-wrap gap-2">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-editorial-red flex items-center justify-center text-white">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <div>
                    <h2 class="font-serif font-black text-xl sm:text-2xl text-white">
                        <?php esc_html_e('Video Newsroom & Explainers', 'np-news-metro'); ?>
                    </h2>
                    <p class="text-xs text-slate-400"><?php esc_html_e('In-depth ground reports, policy breakdowns, and leadership conversations', 'np-news-metro'); ?></p>
                </div>
            </div>
            <a href="<?php echo esc_url(home_url('/videos')); ?>" class="text-xs font-bold text-secondary-gold hover:underline flex items-center gap-1">
                <span><?php esc_html_e('All Video Reports &rarr;', 'np-news-metro'); ?></span>
            </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <?php 
            if ($video_query->have_posts()) : 
                while ($video_query->have_posts()) : $video_query->the_post();
                    get_template_part('template-parts/cards/card-video');
                endwhile;
                wp_reset_postdata();
            else : 
                // Fallback mock representation or latest posts
                $fallback_posts = new WP_Query(array('post_type' => 'post', 'posts_per_page' => 3));
                while ($fallback_posts->have_posts()) : $fallback_posts->the_post();
                    get_template_part('template-parts/cards/card-video');
                endwhile;
                wp_reset_postdata();
            endif; 
            ?>
        </div>
    </section>

    <!-- ======================================================================
         SECTION 5: OPINION & EDITORIAL COMMENTARY STRIP
         ====================================================================== -->
    <?php
    $opinion_query = new WP_Query(array(
        'post_type'      => 'post',
        'posts_per_page' => 3,
        'meta_query'     => array(
            array(
                'key'     => '_np_is_opinion',
                'value'   => '1',
                'compare' => '=',
            ),
        ),
    ));
    if ($opinion_query->have_posts()) :
    ?>
    <section>
        <div class="flex items-center justify-between pb-3 border-b-2 border-secondary-gold mb-6">
            <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-secondary-gold"></span>
                <h2 class="font-serif font-black text-xl sm:text-2xl text-ink">
                    <?php esc_html_e('Opinion, Columns & Scholarly Debates', 'np-news-metro'); ?>
                </h2>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <?php while ($opinion_query->have_posts()) : $opinion_query->the_post(); ?>
                <article class="bg-surface-lowest border border-border-subtle border-t-4 border-t-secondary p-5 rounded-xs shadow-subtle flex flex-col justify-between">
                    <div>
                        <span class="text-secondary-dark text-[11px] font-bold uppercase tracking-wider block mb-2">
                            <?php esc_html_e('EDITORIAL ESSAY', 'np-news-metro'); ?>
                        </span>
                        <h3 class="font-serif font-bold text-lg text-ink leading-snug mb-3 hover:text-secondary-dark transition-colors">
                            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                        </h3>
                        <p class="text-ink-secondary text-xs sm:text-sm leading-relaxed italic mb-4 line-clamp-3">
                            &ldquo;<?php echo np_get_dek(get_the_ID(), 20); ?>&rdquo;
                        </p>
                    </div>
                    <div class="pt-3 border-t border-border-subtle flex items-center gap-3 text-xs">
                        <?php echo get_avatar(get_the_author_meta('ID'), 32, '', '', array('class' => 'rounded-full border border-slate-300')); ?>
                        <div>
                            <span class="font-bold text-ink block"><?php the_author_posts_link(); ?></span>
                            <span class="text-[11px] text-ink-muted"><?php echo np_get_formatted_time(); ?></span>
                        </div>
                    </div>
                </article>
            <?php endwhile; wp_reset_postdata(); ?>
        </div>
    </section>
    <?php endif; ?>

    <!-- ======================================================================
         SECTION 6: NEWSLETTER DISPATCH CALLOUT
         ====================================================================== -->
    <section class="bg-surface-low border border-border-subtle rounded-xs p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="max-w-xl">
            <span class="text-[10px] font-extrabold uppercase tracking-widest text-secondary-gold block mb-1">
                <?php esc_html_e('NEWSLETTER DISPATCH', 'np-news-metro'); ?>
            </span>
            <h3 class="font-serif font-black text-2xl text-ink">
                <?php esc_html_e('Start every weekday with India’s smartest news briefing', 'np-news-metro'); ?>
            </h3>
            <p class="text-ink-secondary text-xs sm:text-sm mt-2">
                <?php esc_html_e('Curated analysis on macroeconomics, policy, semiconductors, and South Asian geopolitics delivered at 7:00 AM IST.', 'np-news-metro'); ?>
            </p>
        </div>
        <button type="button" data-modal-target="newsletter-modal" class="bg-primary hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xs transition-colors shadow-md shrink-0 cursor-pointer">
            <?php esc_html_e('Subscribe Free &rarr;', 'np-news-metro'); ?>
        </button>
    </section>

</div>

<?php
get_footer();
