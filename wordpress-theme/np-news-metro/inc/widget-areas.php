<?php
/**
 * Register Widget Areas and Commercial Ad Slots (A1 to A7)
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

function np_news_register_sidebars() {
    // 1. Primary Editorial Sidebar
    register_sidebar(array(
        'name'          => esc_html__('Primary Editorial Sidebar', 'np-news-metro'),
        'id'            => 'sidebar-primary',
        'description'   => esc_html__('Main sidebar shown on category, author, and article pages.', 'np-news-metro'),
        'before_widget' => '<div id="%1$s" class="widget mb-8 p-5 bg-surface-lowest border border-border-subtle rounded-xs shadow-subtle %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="font-serif font-bold text-lg text-ink border-b-2 border-primary pb-2 mb-4">',
        'after_title'   => '</h3>',
    ));

    // Commercial Ad Placements (A1 - A7)
    $ad_zones = array(
        'ad-zone-a1' => array(
            'name' => esc_html__('Ad Zone A1: Header Leaderboard (970x90 / 728x90)', 'np-news-metro'),
            'desc' => esc_html__('Top of the website directly below the breaking news ticker.', 'np-news-metro'),
        ),
        'ad-zone-a2' => array(
            'name' => esc_html__('Ad Zone A2: Article Top Banner', 'np-news-metro'),
            'desc' => esc_html__('Appears directly under the article headline and dek.', 'np-news-metro'),
        ),
        'ad-zone-a3' => array(
            'name' => esc_html__('Ad Zone A3: In-Article Body Insert', 'np-news-metro'),
            'desc' => esc_html__('Placed midway inside long editorial stories.', 'np-news-metro'),
        ),
        'ad-zone-a4' => array(
            'name' => esc_html__('Ad Zone A4: Sidebar Top Rectangle (300x250)', 'np-news-metro'),
            'desc' => esc_html__('Top placement in the right-hand desktop sidebar.', 'np-news-metro'),
        ),
        'ad-zone-a5' => array(
            'name' => esc_html__('Ad Zone A5: Sidebar Half-Page Sticky (300x600)', 'np-news-metro'),
            'desc' => esc_html__('Sticky tall display ad unit for desktop sidebars.', 'np-news-metro'),
        ),
        'ad-zone-a6' => array(
            'name' => esc_html__('Ad Zone A6: Homepage Mid-Strip Ribbon', 'np-news-metro'),
            'desc' => esc_html__('Full width sponsorship strip between news sections.', 'np-news-metro'),
        ),
        'ad-zone-a7' => array(
            'name' => esc_html__('Ad Zone A7: Pre-Footer Bottom Leaderboard', 'np-news-metro'),
            'desc' => esc_html__('Prominent commercial banner placed above the site footer.', 'np-news-metro'),
        ),
    );

    foreach ($ad_zones as $id => $info) {
        register_sidebar(array(
            'name'          => $info['name'],
            'id'            => $id,
            'description'   => $info['desc'],
            'before_widget' => '<div id="%1$s" class="ad-placement-wrapper %2$s">',
            'after_widget'  => '</div>',
            'before_title'  => '<span class="hidden">',
            'after_title'   => '</span>',
        ));
    }
}
add_action('widgets_init', 'np_news_register_sidebars');
