<?php
/**
 * Theme Setup, Enqueues, Image Sizes & Navigation Menus
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!function_exists('np_news_theme_setup')) {
    function np_news_theme_setup() {
        // Translation support
        load_theme_textdomain('np-news-metro', NP_THEME_DIR . '/languages');

        // Core WordPress Features
        add_theme_support('title-tag');
        add_theme_support('post-thumbnails');
        add_theme_support('automatic-feed-links');
        add_theme_support('responsive-embeds');
        add_theme_support('align-wide');
        add_theme_support('editor-styles');
        add_editor_style('assets/css/editor-style.css');

        add_theme_support('html5', array(
            'search-form',
            'comment-form',
            'comment-list',
            'gallery',
            'caption',
            'style',
            'script',
        ));

        // Custom Logo support
        add_theme_support('custom-logo', array(
            'height'      => 60,
            'width'       => 280,
            'flex-height' => true,
            'flex-width'  => true,
            'header-text' => array('site-title', 'site-description'),
        ));

        // Register Custom Image Sizes for Editorial Layouts
        add_image_size('np-hero', 1200, 675, true);        // 16:9 Lead stories
        add_image_size('np-card-large', 800, 450, true);   // 16:9 Featured grid
        add_image_size('np-card-medium', 600, 338, true);  // 16:9 Standard stories
        add_image_size('np-card-thumb', 320, 213, true);   // 3:2 Side & compact cards
        add_image_size('np-avatar', 200, 200, true);       // 1:1 Journalist avatars

        // Register Navigation Menus
        register_nav_menus(array(
            'primary-menu'     => esc_html__('Primary Editorial Menu', 'np-news-metro'),
            'top-utility-menu' => esc_html__('Top Utility Menu', 'np-news-metro'),
            'footer-sections'  => esc_html__('Footer Sections Menu', 'np-news-metro'),
            'footer-legal'     => esc_html__('Footer Legal & Policies Menu', 'np-news-metro'),
        ));
    }
}
add_action('after_setup_theme', 'np_news_theme_setup');

/**
 * Enqueue Theme Stylesheets and JavaScript
 */
function np_news_enqueue_scripts() {
    // 1. Google Fonts: Playfair Display + Inter
    wp_enqueue_style(
        'np-google-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&display=swap',
        array(),
        null
    );

    // 2. Main Compiled Tailwind Stylesheet
    wp_enqueue_style(
        'np-theme-styles',
        NP_THEME_URI . '/assets/css/theme.css',
        array(),
        NP_THEME_VERSION
    );

    // 3. Theme Style.css (Metadata & Fallbacks)
    wp_enqueue_style(
        'np-style-fallback',
        get_stylesheet_uri(),
        array('np-theme-styles'),
        NP_THEME_VERSION
    );

    // 4. Vanilla JavaScript for Interactivity
    wp_enqueue_script(
        'np-theme-js',
        NP_THEME_URI . '/assets/js/theme.js',
        array(),
        NP_THEME_VERSION,
        true
    );

    // Localize Script for AJAX & Translation Strings
    wp_localize_script('np-theme-js', 'npNewsData', array(
        'ajaxUrl'   => admin_url('admin-ajax.php'),
        'nonce'     => wp_create_nonce('np_news_nonce'),
        'siteUrl'   => home_url('/'),
        'copiedMsg' => esc_html__('Link copied to clipboard!', 'np-news-metro'),
    ));

    // WordPress Comments Reply JS
    if (is_singular() && comments_open() && get_option('thread_comments')) {
        wp_enqueue_script('comment-reply');
    }
}
add_action('wp_enqueue_scripts', 'np_news_enqueue_scripts');

/**
 * Custom Body Classes
 */
function np_news_body_classes($classes) {
    $classes[] = 'bg-canvas text-ink antialiased font-sans';
    if (is_singular('post')) {
        $is_breaking = get_post_meta(get_the_ID(), '_np_is_breaking', true);
        $is_opinion  = get_post_meta(get_the_ID(), '_np_is_opinion', true);
        if ($is_breaking) {
            $classes[] = 'article-breaking-layout';
        } elseif ($is_opinion) {
            $classes[] = 'article-opinion-layout';
        } else {
            $classes[] = 'article-standard-layout';
        }
    }
    return $classes;
}
add_filter('body_class', 'np_news_body_classes');
