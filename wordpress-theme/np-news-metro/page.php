<?php
/**
 * Template 13: Static Information Page (About, Contact, Policies, Ethics)
 *
 * @package NP_News_Metro
 */

get_header();

while (have_posts()) : the_post();
?>

<div class="max-w-4xl mx-auto space-y-8">
    <!-- Breadcrumbs -->
    <?php np_render_breadcrumbs(); ?>

    <header class="border-b-2 border-primary pb-6">
        <h1 class="font-serif font-black text-3xl sm:text-5xl text-ink leading-tight mb-2">
            <?php the_title(); ?>
        </h1>
        <p class="text-xs text-ink-muted">
            <?php esc_html_e('Last updated:', 'np-news-metro'); ?> <?php echo get_the_modified_date('F j, Y'); ?> &bull; <?php bloginfo('name'); ?>
        </p>
    </header>

    <!-- Static Page Navigation Tabs -->
    <nav class="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted border-b border-border-subtle">
        <a href="<?php echo esc_url(home_url('/about')); ?>" class="px-3 py-1.5 rounded-xs bg-slate-100 hover:bg-primary hover:text-white transition-colors"><?php esc_html_e('About Newsroom', 'np-news-metro'); ?></a>
        <a href="<?php echo esc_url(home_url('/editorial-team')); ?>" class="px-3 py-1.5 rounded-xs bg-slate-100 hover:bg-primary hover:text-white transition-colors"><?php esc_html_e('Editorial Board', 'np-news-metro'); ?></a>
        <a href="<?php echo esc_url(home_url('/ethics-policy')); ?>" class="px-3 py-1.5 rounded-xs bg-slate-100 hover:bg-primary hover:text-white transition-colors"><?php esc_html_e('Code of Ethics', 'np-news-metro'); ?></a>
        <a href="<?php echo esc_url(home_url('/corrections')); ?>" class="px-3 py-1.5 rounded-xs bg-slate-100 hover:bg-primary hover:text-white transition-colors"><?php esc_html_e('Corrections Policy', 'np-news-metro'); ?></a>
        <a href="<?php echo esc_url(home_url('/contact')); ?>" class="px-3 py-1.5 rounded-xs bg-slate-100 hover:bg-primary hover:text-white transition-colors"><?php esc_html_e('Contact & Grievance', 'np-news-metro'); ?></a>
    </nav>

    <!-- Main Content -->
    <article id="post-<?php the_ID(); ?>" <?php post_class('bg-surface-lowest border border-border-subtle p-6 sm:p-10 rounded-xs shadow-subtle'); ?>>
        <div class="gutenberg-content font-sans text-ink leading-relaxed text-base sm:text-lg">
            <?php the_content(); ?>
        </div>
    </article>
</div>

<?php
endwhile;

get_footer();
