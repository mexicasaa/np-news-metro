<?php
/**
 * Auto-Setup Starter Content & Categories upon Theme Switch
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

function np_news_setup_starter_categories() {
    $categories = array(
        'India'         => 'Comprehensive national reporting from every state and union territory.',
        'Politics'      => 'Parliamentary debates, election insights, and policy investigations.',
        'Business'      => 'Corporate strategies, stock markets, manufacturing, and trade.',
        'Economy'       => 'Macroeconomic trends, GDP, fiscal policies, and tax reforms.',
        'World'         => 'Global diplomacy, international conflicts, and geopolitical shifts.',
        'Technology'    => 'Digital infrastructure, AI governance, semiconductors, and cybersecurity.',
        'Sports'        => 'Cricket, Olympic sports, badminton, football, and grassroots talent.',
        'Entertainment' => 'Cinema, OTT reviews, theater, and arts across regional industries.',
        'Lifestyle'     => 'Health, sustainable living, urban architecture, and travel.',
        'Opinion'       => 'Uncompromising editorial commentary, scholarly analysis, and guest columns.',
    );

    foreach ($categories as $cat_name => $cat_desc) {
        $slug = sanitize_title($cat_name);
        $term = get_term_by('slug', $slug, 'category');
        if (!$term) {
            wp_insert_term($cat_name, 'category', array(
                'description' => $cat_desc,
                'slug'        => $slug,
            ));
        }
    }
}
add_action('after_switch_theme', 'np_news_setup_starter_categories');
