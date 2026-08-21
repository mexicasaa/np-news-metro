<?php
/**
 * Native Custom Meta Boxes (Zero external plugins required)
 * Compatible with standard WordPress post editor
 *
 * @package NP_News_Metro
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register Meta Boxes for Posts and Videos
 */
function np_news_add_meta_boxes() {
    // 1. Post Editorial Details (Dek, Flags, Key Points, Corrections)
    add_meta_box(
        'np_post_editorial_meta',
        __('Editorial Controls & Takeaways', 'np-news-metro'),
        'np_news_render_post_meta_box',
        'post',
        'normal',
        'high'
    );

    // 2. Video Details
    add_meta_box(
        'np_video_meta_box',
        __('Video Details & Transcript', 'np-news-metro'),
        'np_news_render_video_meta_box',
        'video',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'np_news_add_meta_boxes');

/**
 * Render Post Editorial Meta Box
 */
function np_news_render_post_meta_box($post) {
    wp_nonce_field('np_save_post_meta', 'np_post_meta_nonce');

    $dek              = get_post_meta($post->ID, '_np_post_dek', true);
    $key_takeaways    = get_post_meta($post->ID, '_np_key_takeaways', true);
    $is_lead          = get_post_meta($post->ID, '_np_is_lead', true);
    $is_breaking      = get_post_meta($post->ID, '_np_is_breaking', true);
    $is_opinion       = get_post_meta($post->ID, '_np_is_opinion', true);
    $is_sponsored     = get_post_meta($post->ID, '_np_is_sponsored', true);
    $sponsor_name     = get_post_meta($post->ID, '_np_sponsor_name', true);
    $correction_date  = get_post_meta($post->ID, '_np_correction_date', true);
    $correction_text  = get_post_meta($post->ID, '_np_correction_text', true);
    $image_credit     = get_post_meta($post->ID, '_np_image_credit', true);
    ?>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
        <div style="grid-column: span 2;">
            <label style="font-weight: 600; display: block; margin-bottom: 5px;">
                <?php esc_html_e('Article Dek / Sub-headline', 'np-news-metro'); ?>
            </label>
            <input type="text" name="np_post_dek" value="<?php echo esc_attr($dek); ?>" style="width: 100%; padding: 8px; font-size: 14px;" placeholder="<?php esc_attr_e('Crisp 1-2 line summary displayed below the main headline', 'np-news-metro'); ?>" />
        </div>

        <div style="grid-column: span 2;">
            <label style="font-weight: 600; display: block; margin-bottom: 5px;">
                <?php esc_html_e('Key Takeaways (Enter each bullet point on a new line)', 'np-news-metro'); ?>
            </label>
            <textarea name="np_key_takeaways" rows="4" style="width: 100%; padding: 8px;" placeholder="<?php esc_attr_e('Point 1: Key cabinet clearance of ₹1.2 lakh crore...\nPoint 2: Expected completion timeline is 2029...\nPoint 3: High speed port connectivity.', 'np-news-metro'); ?>"><?php echo esc_textarea($key_takeaways); ?></textarea>
        </div>

        <div style="background: #f9f9f9; padding: 12px; border: 1px solid #e0e0e0; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0;"><?php esc_html_e('Editorial Badges & Placement', 'np-news-metro'); ?></h4>
            <p><label><input type="checkbox" name="np_is_lead" value="1" <?php checked($is_lead, '1'); ?> /> <strong><?php esc_html_e('Homepage Lead Story (Hero Placement)', 'np-news-metro'); ?></strong></label></p>
            <p><label><input type="checkbox" name="np_is_breaking" value="1" <?php checked($is_breaking, '1'); ?> /> <span style="color: #BA1A1A; font-weight: 600;"><?php esc_html_e('Breaking News Alert (Urgent Red Banner)', 'np-news-metro'); ?></span></label></p>
            <p><label><input type="checkbox" name="np_is_opinion" value="1" <?php checked($is_opinion, '1'); ?> /> <strong><?php esc_html_e('Opinion / Column Article', 'np-news-metro'); ?></strong></label></p>
            <p><label><input type="checkbox" name="np_is_sponsored" value="1" <?php checked($is_sponsored, '1'); ?> /> <?php esc_html_e('Sponsored Content', 'np-news-metro'); ?></label></p>
            <p>
                <input type="text" name="np_sponsor_name" value="<?php echo esc_attr($sponsor_name); ?>" placeholder="<?php esc_attr_e('Sponsor / Brand Partner Name', 'np-news-metro'); ?>" style="width: 100%; margin-top: 4px;" />
            </p>
        </div>

        <div style="background: #f9f9f9; padding: 12px; border: 1px solid #e0e0e0; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0;"><?php esc_html_e('Editorial Corrections & Image Credit', 'np-news-metro'); ?></h4>
            <p>
                <label style="font-size: 12px; font-weight: 600;"><?php esc_html_e('Lead Image Credit / Agency:', 'np-news-metro'); ?></label>
                <input type="text" name="np_image_credit" value="<?php echo esc_attr($image_credit); ?>" placeholder="e.g. PTI / PIB / Reuters" style="width: 100%;" />
            </p>
            <p>
                <label style="font-size: 12px; font-weight: 600;"><?php esc_html_e('Correction Date:', 'np-news-metro'); ?></label>
                <input type="date" name="np_correction_date" value="<?php echo esc_attr($correction_date); ?>" style="width: 100%;" />
            </p>
            <p>
                <label style="font-size: 12px; font-weight: 600;"><?php esc_html_e('Correction Notice Note:', 'np-news-metro'); ?></label>
                <textarea name="np_correction_text" rows="2" style="width: 100%;" placeholder="<?php esc_attr_e('Note on any factual correction made post-publishing.', 'np-news-metro'); ?>"><?php echo esc_textarea($correction_text); ?></textarea>
            </p>
        </div>
    </div>
    <?php
}

/**
 * Render Video Meta Box
 */
function np_news_render_video_meta_box($post) {
    wp_nonce_field('np_save_video_meta', 'np_video_meta_nonce');

    $video_url    = get_post_meta($post->ID, '_np_video_url', true);
    $duration     = get_post_meta($post->ID, '_np_video_duration', true);
    $presenter    = get_post_meta($post->ID, '_np_video_presenter', true);
    $transcript   = get_post_meta($post->ID, '_np_video_transcript', true);
    ?>
    <div style="margin-top: 10px;">
        <p>
            <label style="font-weight: 600; display: block; margin-bottom: 4px;"><?php esc_html_e('Video Embed URL (YouTube, Vimeo, or Direct MP4):', 'np-news-metro'); ?></label>
            <input type="url" name="np_video_url" value="<?php echo esc_url($video_url); ?>" style="width: 100%; padding: 6px;" placeholder="https://www.youtube.com/watch?v=..." />
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <p>
                <label style="font-weight: 600; display: block; margin-bottom: 4px;"><?php esc_html_e('Duration (MM:SS):', 'np-news-metro'); ?></label>
                <input type="text" name="np_video_duration" value="<?php echo esc_attr($duration); ?>" style="width: 100%; padding: 6px;" placeholder="04:25" />
            </p>
            <p>
                <label style="font-weight: 600; display: block; margin-bottom: 4px;"><?php esc_html_e('Host / Presenter Name:', 'np-news-metro'); ?></label>
                <input type="text" name="np_video_presenter" value="<?php echo esc_attr($presenter); ?>" style="width: 100%; padding: 6px;" placeholder="Rohan Sen" />
            </p>
        </div>
        <p>
            <label style="font-weight: 600; display: block; margin-bottom: 4px;"><?php esc_html_e('Timestamped Transcript (Format: MM:SS - Text per line):', 'np-news-metro'); ?></label>
            <textarea name="np_video_transcript" rows="6" style="width: 100%; padding: 8px;" placeholder="00:00 - Introduction to the semiconductor initiative&#10;01:15 - Breakdown of fiscal allocations&#10;03:40 - Global supply chain impact"><?php echo esc_textarea($transcript); ?></textarea>
        </p>
    </div>
    <?php
}

/**
 * Save Post & Video Meta Data
 */
function np_news_save_custom_meta($post_id) {
    // Post Meta Saving
    if (isset($_POST['np_post_meta_nonce']) && wp_verify_nonce($_POST['np_post_meta_nonce'], 'np_save_post_meta')) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        $fields = array(
            'np_post_dek'         => '_np_post_dek',
            'np_key_takeaways'    => '_np_key_takeaways',
            'np_sponsor_name'     => '_np_sponsor_name',
            'np_correction_date'  => '_np_correction_date',
            'np_correction_text'  => '_np_correction_text',
            'np_image_credit'     => '_np_image_credit',
        );

        foreach ($fields as $key => $meta_key) {
            if (isset($_POST[$key])) {
                update_post_meta($post_id, $meta_key, sanitize_text_field($_POST[$key]));
            }
        }

        // Checkboxes
        $checkboxes = array(
            'np_is_lead'      => '_np_is_lead',
            'np_is_breaking'  => '_np_is_breaking',
            'np_is_opinion'   => '_np_is_opinion',
            'np_is_sponsored' => '_np_is_sponsored',
        );

        foreach ($checkboxes as $key => $meta_key) {
            $value = isset($_POST[$key]) ? '1' : '0';
            update_post_meta($post_id, $meta_key, $value);
        }
    }

    // Video Meta Saving
    if (isset($_POST['np_video_meta_nonce']) && wp_verify_nonce($_POST['np_video_meta_nonce'], 'np_save_video_meta')) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        if (isset($_POST['np_video_url'])) {
            update_post_meta($post_id, '_np_video_url', esc_url_raw($_POST['np_video_url']));
        }
        if (isset($_POST['np_video_duration'])) {
            update_post_meta($post_id, '_np_video_duration', sanitize_text_field($_POST['np_video_duration']));
        }
        if (isset($_POST['np_video_presenter'])) {
            update_post_meta($post_id, '_np_video_presenter', sanitize_text_field($_POST['np_video_presenter']));
        }
        if (isset($_POST['np_video_transcript'])) {
            update_post_meta($post_id, '_np_video_transcript', sanitize_textarea_field($_POST['np_video_transcript']));
        }
    }
}
add_action('save_post', 'np_news_save_custom_meta');
