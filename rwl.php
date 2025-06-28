<?php
/**
 * Plugin Name: React Wordpress Layer
 * Plugin URI: https://example.com/rwl-plugin
 * Description: A simple plugin that appends an HTML element with the ID 'rwl-element'.
 * Version: 1.0
 * Author: Omar Hosam
 * Author URI: https://example.com
 * Text Domain: rwl-plugin
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Enqueue scripts and styles for the plugin
 */
function rwl_enqueue_scripts()
{
    $dist_dir = dirname(__FILE__) . '/dist';

    // Check if the dist directory exists
    if (!file_exists($dist_dir)) {
        error_log('React Wordpress Layer: The dist directory does not exist');
        return;
    }

    // Enqueue the React app CSS files (built with Bun)
    $css_files = glob($dist_dir . '/*.css');
    if (!empty($css_files)) {
        foreach ($css_files as $css_file) {
            $file_name = basename($css_file);
            wp_enqueue_style(
                "rwl-react-{$file_name}",
                plugin_dir_url(__FILE__) . "dist/{$file_name}",
                [],
                '1.0'
            );
        }
    }

    // Enqueue the React app JS files (built with Bun)
    $js_files = glob($dist_dir . '/*.js');
    if (!empty($js_files)) {
        $frontend_files = [];

        // First load any dependency scripts
        foreach ($js_files as $js_file) {
            $file_name = basename($js_file);
            if ($file_name === 'frontend.js' || $file_name === 'feedback-frontend.js') {
                $frontend_files[] = $js_file;
                continue;
            }

            wp_enqueue_script(
                "rwl-react-{$file_name}",
                plugin_dir_url(__FILE__) . "dist/{$file_name}",
                [],
                '1.0',
                true
            );
        }

        // Then load the frontend scripts last to ensure dependencies are available
        foreach ($frontend_files as $frontend_file) {
            $file_name = basename($frontend_file);
            wp_enqueue_script(
                "rwl-react-{$file_name}",
                plugin_dir_url(__FILE__) . "dist/{$file_name}",
                [],
                '1.0',
                true
            );
        }
    }
}
add_action('wp_enqueue_scripts', 'rwl_enqueue_scripts');

/**
 * Add the HTML element to the footer
 */
function rwl_add_element_to_footer()
{
    echo '<div id="rwl-element"></div>';
}
add_action('wp_footer', 'rwl_add_element_to_footer');


/**
 * Register a shortcode for feedback element
 */
function rwl_feedback_shortcode()
{
    return '<div id="feedback-element"></div>';
}
add_shortcode('feedback', 'rwl_feedback_shortcode');