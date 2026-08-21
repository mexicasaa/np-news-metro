<?php
/**
 * The Header template for NP News Metro
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="page" class="site min-h-screen flex flex-col justify-between overflow-x-hidden">
    
    <!-- 1. Utility Top Bar -->
    <?php get_template_part('template-parts/header/utility-bar'); ?>

    <!-- 2. Main Brand Header -->
    <?php get_template_part('template-parts/header/main-header'); ?>

    <!-- 3. Primary Navigation -->
    <?php get_template_part('template-parts/header/primary-nav'); ?>

    <!-- 4. Financial Markets Live Ticker -->
    <?php get_template_part('template-parts/header/markets-ticker'); ?>

    <!-- 5. Breaking News Bar -->
    <?php get_template_part('template-parts/header/breaking-bar'); ?>

    <!-- 6. Top Header Leaderboard Ad (Zone A1) -->
    <div class="max-w-site mx-auto px-4 w-full">
        <?php get_template_part('template-parts/commercial/ad-slot', null, array('zone' => 'A1')); ?>
    </div>

    <!-- Main Content Area Open -->
    <main id="primary" class="site-main flex-1 w-full max-w-site mx-auto px-4 py-4 sm:py-6">
