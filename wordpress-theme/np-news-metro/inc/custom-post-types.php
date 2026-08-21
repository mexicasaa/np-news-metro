<?php
/**
 * Register Custom Post Types and Taxonomies (Videos, Galleries)
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

function np_news_register_custom_post_types() {
    // 1. Videos CPT
    $video_labels = array(
        'name'                  => _x('Videos', 'Post Type General Name', 'np-news-metro'),
        'singular_name'         => _x('Video', 'Post Type Singular Name', 'np-news-metro'),
        'menu_name'             => __('Videos', 'np-news-metro'),
        'name_admin_bar'        => __('Video', 'np-news-metro'),
        'archives'              => __('Video Hub', 'np-news-metro'),
        'all_items'             => __('All Videos', 'np-news-metro'),
        'add_new_item'          => __('Add New Video', 'np-news-metro'),
        'add_new'               => __('Add New', 'np-news-metro'),
        'new_item'              => __('New Video', 'np-news-metro'),
        'edit_item'             => __('Edit Video', 'np-news-metro'),
        'update_item'           => __('Update Video', 'np-news-metro'),
        'view_item'             => __('View Video', 'np-news-metro'),
        'search_items'          => __('Search Videos', 'np-news-metro'),
    );
    $video_args = array(
        'label'                 => __('Video', 'np-news-metro'),
        'description'           => __('Video reporting, explainers, and interviews', 'np-news-metro'),
        'labels'                => $video_labels,
        'supports'              => array('title', 'editor', 'thumbnail', 'excerpt', 'comments', 'author', 'custom-fields'),
        'taxonomies'            => array('video_category', 'post_tag'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 5,
        'menu_icon'             => 'dashicons-video-alt3',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => 'videos',
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
    );
    register_post_type('video', $video_args);

    // 2. Photo Galleries CPT
    $gallery_labels = array(
        'name'                  => _x('Photo Galleries', 'Post Type General Name', 'np-news-metro'),
        'singular_name'         => _x('Photo Gallery', 'Post Type Singular Name', 'np-news-metro'),
        'menu_name'             => __('Photo Galleries', 'np-news-metro'),
        'name_admin_bar'        => __('Gallery', 'np-news-metro'),
        'archives'              => __('Photo Hub', 'np-news-metro'),
        'all_items'             => __('All Galleries', 'np-news-metro'),
        'add_new_item'          => __('Add New Gallery', 'np-news-metro'),
        'add_new'               => __('Add New', 'np-news-metro'),
        'edit_item'             => __('Edit Gallery', 'np-news-metro'),
        'view_item'             => __('View Gallery', 'np-news-metro'),
        'search_items'          => __('Search Galleries', 'np-news-metro'),
    );
    $gallery_args = array(
        'label'                 => __('Gallery', 'np-news-metro'),
        'description'           => __('Visual journalism photo essays and picture galleries', 'np-news-metro'),
        'labels'                => $gallery_labels,
        'supports'              => array('title', 'editor', 'thumbnail', 'excerpt', 'author'),
        'taxonomies'            => array('gallery_category', 'post_tag'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 6,
        'menu_icon'             => 'dashicons-format-gallery',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => 'photos',
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
    );
    register_post_type('gallery', $gallery_args);

    // Taxonomies: Video Category
    register_taxonomy('video_category', array('video'), array(
        'hierarchical'      => true,
        'labels'            => array(
            'name'          => __('Video Categories', 'np-news-metro'),
            'singular_name' => __('Video Category', 'np-news-metro'),
        ),
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array('slug' => 'video-category'),
        'show_in_rest'      => true,
    ));

    // Taxonomies: Gallery Category
    register_taxonomy('gallery_category', array('gallery'), array(
        'hierarchical'      => true,
        'labels'            => array(
            'name'          => __('Gallery Categories', 'np-news-metro'),
            'singular_name' => __('Gallery Category', 'np-news-metro'),
        ),
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array('slug' => 'gallery-category'),
        'show_in_rest'      => true,
    ));
}
add_action('init', 'np_news_register_custom_post_types');
