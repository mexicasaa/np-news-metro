<?php
/**
 * Custom Template Tags and Editorial Helper Functions
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Get Formatted Reading Time for an Article
 */
function np_get_reading_time($post_id = null) {
    if (!$post_id) $post_id = get_the_ID();
    $content = get_post_field('post_content', $post_id);
    $word_count = str_word_count(strip_tags($content));
    $minutes = ceil($word_count / 200);
    return max(1, $minutes) . ' ' . esc_html__('min read', 'np-news-metro');
}

/**
 * Get Formatted Publication / Update Time
 */
function np_get_formatted_time($post_id = null) {
    if (!$post_id) $post_id = get_the_ID();
    $published_time = get_the_time('U', $post_id);
    $current_time = current_time('timestamp');
    $time_diff = $current_time - $published_time;

    if ($time_diff < 3600) {
        $mins = max(1, floor($time_diff / 60));
        return sprintf(_n('%d min ago', '%d mins ago', $mins, 'np-news-metro'), $mins);
    } elseif ($time_diff < 86400) {
        $hours = floor($time_diff / 3600);
        return sprintf(_n('%d hr ago', '%d hrs ago', $hours, 'np-news-metro'), $hours);
    } else {
        return get_the_date('M d, Y', $post_id);
    }
}

/**
 * Render Category Badge with Editorial Styling
 */
function np_the_category_badge($post_id = null, $extra_classes = '') {
    if (!$post_id) $post_id = get_the_ID();
    $categories = get_the_category($post_id);

    if (!empty($categories)) {
        $cat = $categories[0];
        $cat_link = get_category_link($cat->term_id);
        $slug = strtolower($cat->slug);
        
        $color_class = 'text-primary bg-slate-100 hover:bg-slate-200';
        if ($slug === 'politics' || $slug === 'india') {
            $color_class = 'text-editorial-navy bg-slate-100 hover:bg-slate-200';
        } elseif ($slug === 'business' || $slug === 'economy') {
            $color_class = 'text-secondary-dark bg-secondary-fixed/50 hover:bg-secondary-fixed';
        } elseif ($slug === 'world' || $slug === 'technology') {
            $color_class = 'text-sky-900 bg-sky-50 hover:bg-sky-100';
        }

        echo sprintf(
            '<a href="%s" class="inline-block uppercase tracking-wider font-bold text-[11px] px-2 py-0.5 rounded-xs transition-colors %s %s">%s</a>',
            esc_url($cat_link),
            esc_attr($color_class),
            esc_attr($extra_classes),
            esc_html($cat->name)
        );
    }
}

/**
 * Get Story Dek or Excerpt
 */
function np_get_dek($post_id = null, $length = 22) {
    if (!$post_id) $post_id = get_the_ID();
    $dek = get_post_meta($post_id, '_np_post_dek', true);
    if (!empty($dek)) {
        return esc_html($dek);
    }
    return wp_trim_words(get_the_excerpt($post_id), $length, '...');
}

/**
 * Get Post Thumbnail or Reliable Editorial Fallback Image
 */
function np_get_thumbnail_url($post_id = null, $size = 'np-card-medium') {
    if (!$post_id) $post_id = get_the_ID();
    if (has_post_thumbnail($post_id)) {
        return get_the_post_thumbnail_url($post_id, $size);
    }
    // High quality fallback news placeholder
    return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200';
}

/**
 * Post View Count System (Tracks article page views)
 */
function np_set_post_views($post_id) {
    $count_key = '_np_post_views_count';
    $count = get_post_meta($post_id, $count_key, true);
    if ($count == '') {
        $count = 0;
        delete_post_meta($post_id, $count_key);
        add_post_meta($post_id, $count_key, '1');
    } else {
        $count++;
        update_post_meta($post_id, $count_key, $count);
    }
}

function np_get_post_views($post_id = null) {
    if (!$post_id) $post_id = get_the_ID();
    $count = get_post_meta($post_id, '_np_post_views_count', true);
    if ($count == '') {
        return '1.2K';
    }
    if ($count > 1000) {
        return round($count / 1000, 1) . 'K';
    }
    return $count;
}

/**
 * Render Editorial Breadcrumbs
 */
function np_render_breadcrumbs() {
    if (is_front_page()) return;

    echo '<nav aria-label="Breadcrumb" class="text-xs text-ink-muted flex items-center gap-1.5 flex-wrap py-2">';
    echo '<a href="' . esc_url(home_url('/')) . '" class="hover:text-primary transition-colors">' . esc_html__('Home', 'np-news-metro') . '</a>';
    echo '<span class="text-slate-400">/</span>';

    if (is_category()) {
        $cat = get_queried_object();
        echo '<span class="text-ink font-semibold">' . esc_html($cat->name) . '</span>';
    } elseif (is_single()) {
        $cats = get_the_category();
        if (!empty($cats)) {
            echo '<a href="' . esc_url(get_category_link($cats[0]->term_id)) . '" class="hover:text-primary transition-colors">' . esc_html($cats[0]->name) . '</a>';
            echo '<span class="text-slate-400">/</span>';
        }
        echo '<span class="text-ink font-semibold truncate max-w-xs sm:max-w-md">' . esc_html(get_the_title()) . '</span>';
    } elseif (is_author()) {
        echo '<span class="text-ink font-semibold">' . esc_html(get_the_author()) . '</span>';
    } elseif (is_search()) {
        echo '<span class="text-ink font-semibold">' . sprintf(esc_html__('Search: "%s"', 'np-news-metro'), get_search_query()) . '</span>';
    } elseif (is_page()) {
        echo '<span class="text-ink font-semibold">' . esc_html(get_the_title()) . '</span>';
    } elseif (is_post_type_archive('video')) {
        echo '<span class="text-ink font-semibold">' . esc_html__('Videos', 'np-news-metro') . '</span>';
    } elseif (is_post_type_archive('gallery')) {
        echo '<span class="text-ink font-semibold">' . esc_html__('Photos', 'np-news-metro') . '</span>';
    }
    echo '</nav>';
}

/**
 * Editorial Pagination
 */
function np_render_pagination($custom_query = null) {
    global $wp_query;
    $query = $custom_query ? $custom_query : $wp_query;
    $total_pages = $query->max_num_pages;

    if ($total_pages > 1) {
        $current_page = max(1, get_query_var('paged'));
        echo '<nav class="flex items-center justify-center gap-2 my-10" aria-label="Pagination">';
        
        echo paginate_links(array(
            'base'         => str_replace(999999999, '%#%', esc_url(get_pagenum_link(999999999))),
            'total'        => $total_pages,
            'current'      => $current_page,
            'prev_text'    => '&larr; ' . esc_html__('Previous', 'np-news-metro'),
            'next_text'    => esc_html__('Next', 'np-news-metro') . ' &rarr;',
            'type'         => 'plain',
            'before_page_number' => '<span class="px-3.5 py-1.5 border border-border-subtle rounded-xs text-sm font-semibold hover:bg-primary hover:text-white transition-colors">',
            'after_page_number'  => '</span>',
        ));
        
        echo '</nav>';
    }
}
