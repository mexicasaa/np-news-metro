<?php
/**
 * Template 11: Author Profile & Journalist Archive
 *
 * @package NP_News_Metro
 */

get_header();

$curauth = (get_query_var('author_name')) ? get_user_by('slug', get_query_var('author_name')) : get_userdata(get_query_var('author'));
?>

<div class="space-y-10 max-w-4xl mx-auto">
    <!-- Breadcrumbs -->
    <?php np_render_breadcrumbs(); ?>

    <!-- Author Profile Hero Card -->
    <section class="bg-surface-lowest border border-border-subtle rounded-xs p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-secondary-gold shadow-md shrink-0">
            <?php echo get_avatar($curauth->ID, 120, '', $curauth->display_name, array('class' => 'w-full h-full object-cover')); ?>
        </div>

        <div class="flex-1 text-center sm:text-left">
            <div class="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                <h1 class="font-serif font-black text-2xl sm:text-3xl text-ink">
                    <?php echo esc_html($curauth->display_name); ?>
                </h1>
                <span class="bg-secondary-fixed/60 text-secondary-dark text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                    <?php esc_html_e('VERIFIED JOURNALIST', 'np-news-metro'); ?>
                </span>
            </div>

            <p class="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                <?php echo get_user_meta($curauth->ID, 'role_title', true) ? esc_html(get_user_meta($curauth->ID, 'role_title', true)) : esc_html__('Senior Editorial Correspondent &middot; NP News Metro', 'np-news-metro'); ?>
            </p>

            <p class="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-4">
                <?php echo $curauth->description ? esc_html($curauth->description) : esc_html__('Reports on Indian politics, policy regulations, macroeconomic governance, and institutions.', 'np-news-metro'); ?>
            </p>

            <div class="pt-3 border-t border-border-subtle flex items-center justify-center sm:justify-start gap-4 text-xs text-ink-muted">
                <span><strong><?php echo count_user_posts($curauth->ID); ?></strong> <?php esc_html_e('Articles Published', 'np-news-metro'); ?></span>
                <?php if ($curauth->user_email) : ?>
                    <span>&bull;</span>
                    <a href="mailto:<?php echo esc_attr($curauth->user_email); ?>" class="hover:text-primary transition-colors"><?php echo esc_html($curauth->user_email); ?></a>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Articles Stream by this Author -->
    <section>
        <h2 class="font-serif font-black text-xl text-ink pb-3 border-b-2 border-primary mb-6">
            <?php printf(esc_html__('Reporting & Columns by %s', 'np-news-metro'), esc_html($curauth->display_name)); ?>
        </h2>

        <?php if (have_posts()) : ?>
            <div class="space-y-4">
                <?php while (have_posts()) : the_post(); ?>
                    <?php get_template_part('template-parts/cards/card-horizontal'); ?>
                <?php endwhile; ?>
            </div>

            <!-- Pagination -->
            <?php np_render_pagination(); ?>

        <?php else : ?>
            <div class="p-8 text-center bg-surface-lowest border border-border-subtle">
                <p class="text-ink-secondary text-sm"><?php esc_html_e('No articles published by this author yet.', 'np-news-metro'); ?></p>
            </div>
        <?php endif; ?>
    </section>
</div>

<?php
get_footer();
