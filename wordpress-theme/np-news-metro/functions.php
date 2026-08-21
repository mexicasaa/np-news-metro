<?php
/**
 * NP News Metro Theme Functions
 *
 * @package NP_News_Metro
 * @version 1.0.1
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

define('NP_THEME_VERSION', '1.0.1');
define('NP_THEME_DIR', get_template_directory());
define('NP_THEME_URI', get_template_directory_uri());

// 1. Theme Setup, Image Sizes, Enqueues & Menus
require_once NP_THEME_DIR . '/inc/theme-setup.php';

// 2. Custom Post Types (Videos, Galleries) & Taxonomies
require_once NP_THEME_DIR . '/inc/custom-post-types.php';

// 3. Custom Meta Boxes (Deks, Takeaways, Corrections, Breaking, Opinion, Transcripts)
require_once NP_THEME_DIR . '/inc/custom-meta-boxes.php';

// 4. Template Tags & Helper Functions (Reading Time, Views, Share Buttons, Badges)
require_once NP_THEME_DIR . '/inc/template-tags.php';

// 5. Widget Areas & Commercial Ad Slots (A1 to A7)
require_once NP_THEME_DIR . '/inc/widget-areas.php';

// 6. Starter Content & Demo Setup
require_once NP_THEME_DIR . '/inc/sample-data.php';
