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

    // Localize product data for WooCommerce integration
    rwl_localize_product_data();
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

/**
 * Register a shortcode for product details element
 */
function rwl_product_shortcode()
{
    if (rwl_is_woocommerce_active() && is_product()) {
        return '<div id="product-element"></div>';
    }
    return '';
}
add_shortcode('product_details', 'rwl_product_shortcode');

/**
 * Check if WooCommerce is active
 */
function rwl_is_woocommerce_active()
{
    return class_exists('WooCommerce');
}

/**
 * Get current product data if on product page
 */
function rwl_get_product_data()
{
    if (!rwl_is_woocommerce_active()) {
        return null;
    }

    global $product;

    if (is_product() && $product && is_a($product, 'WC_Product')) {
        // Get basic product data
        $product_data = [
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'slug' => $product->get_slug(),
            'permalink' => get_permalink($product->get_id()),
            'type' => $product->get_type(),
            'status' => $product->get_status(),
            'featured' => $product->is_featured(),
            'catalog_visibility' => $product->get_catalog_visibility(),
            'description' => $product->get_description(),
            'short_description' => $product->get_short_description(),
            'sku' => $product->get_sku(),
            'price' => $product->get_price(),
            'regular_price' => $product->get_regular_price(),
            'sale_price' => $product->get_sale_price(),
            'date_on_sale_from' => $product->get_date_on_sale_from(),
            'date_on_sale_to' => $product->get_date_on_sale_to(),
            'price_html' => $product->get_price_html(),
            'on_sale' => $product->is_on_sale(),
            'purchasable' => $product->is_purchasable(),
            'total_sales' => $product->get_total_sales(),
            'virtual' => $product->is_virtual(),
            'downloadable' => $product->is_downloadable(),
            'downloads' => $product->get_downloads(),
            'download_limit' => $product->get_download_limit(),
            'download_expiry' => $product->get_download_expiry(),
            'external_url' => method_exists($product, 'get_product_url') ? $product->get_product_url() : '',
            'button_text' => method_exists($product, 'get_button_text') ? $product->get_button_text() : '',
            'tax_status' => $product->get_tax_status(),
            'tax_class' => $product->get_tax_class(),
            'manage_stock' => $product->get_manage_stock(),
            'stock_quantity' => $product->get_stock_quantity(),
            'stock_status' => $product->get_stock_status(),
            'backorders' => $product->get_backorders(),
            'backorders_allowed' => $product->backorders_allowed(),
            'backordered' => $product->is_on_backorder(),
            'sold_individually' => $product->is_sold_individually(),
            'weight' => $product->get_weight(),
            'dimensions' => [
                'length' => $product->get_length(),
                'width' => $product->get_width(),
                'height' => $product->get_height(),
            ],
            'shipping_required' => $product->needs_shipping(),
            'shipping_taxable' => $product->is_shipping_taxable(),
            'shipping_class' => $product->get_shipping_class(),
            'shipping_class_id' => $product->get_shipping_class_id(),
            'reviews_allowed' => $product->get_reviews_allowed(),
            'average_rating' => $product->get_average_rating(),
            'rating_count' => $product->get_rating_count(),
            'related_ids' => wc_get_related_products($product->get_id()),
            'upsell_ids' => $product->get_upsell_ids(),
            'cross_sell_ids' => $product->get_cross_sell_ids(),
            'parent_id' => $product->get_parent_id(),
            'purchase_note' => $product->get_purchase_note(),
            'categories' => [],
            'tags' => [],
            'images' => [],
            'attributes' => [],
            'default_attributes' => $product->get_default_attributes(),
            'variations' => $product->get_type() === 'variable' ? $product->get_children() : [],
            'grouped_products' => $product->get_type() === 'grouped' ? $product->get_children() : [],
            'menu_order' => $product->get_menu_order(),
            'meta_data' => $product->get_meta_data(),
            'date_created' => $product->get_date_created() ? $product->get_date_created()->format('c') : '',
            'date_created_gmt' => $product->get_date_created() ? $product->get_date_created()->format('c') : '',
            'date_modified' => $product->get_date_modified() ? $product->get_date_modified()->format('c') : '',
            'date_modified_gmt' => $product->get_date_modified() ? $product->get_date_modified()->format('c') : '',
        ];

        // Get categories
        $categories = get_the_terms($product->get_id(), 'product_cat');
        if ($categories && !is_wp_error($categories)) {
            $product_data['categories'] = array_map(function ($category) {
                return [
                    'id' => $category->term_id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ];
            }, $categories);
        }

        // Get tags
        $tags = get_the_terms($product->get_id(), 'product_tag');
        if ($tags && !is_wp_error($tags)) {
            $product_data['tags'] = array_map(function ($tag) {
                return [
                    'id' => $tag->term_id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                ];
            }, $tags);
        }

        // Get images
        $attachment_ids = $product->get_gallery_image_ids();
        array_unshift($attachment_ids, $product->get_image_id());
        $attachment_ids = array_filter($attachment_ids);

        foreach ($attachment_ids as $attachment_id) {
            if ($attachment_id) {
                $image = wp_get_attachment_image_src($attachment_id, 'full');
                if ($image) {
                    $product_data['images'][] = [
                        'id' => $attachment_id,
                        'date_created' => get_the_date('c', $attachment_id),
                        'date_created_gmt' => get_the_date('c', $attachment_id),
                        'date_modified' => get_the_modified_date('c', $attachment_id),
                        'date_modified_gmt' => get_the_modified_date('c', $attachment_id),
                        'src' => $image[0],
                        'name' => get_the_title($attachment_id),
                        'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
                        'position' => 0,
                    ];
                }
            }
        }

        // Get attributes
        $attributes = $product->get_attributes();
        foreach ($attributes as $attribute) {
            if (is_a($attribute, 'WC_Product_Attribute')) {
                $product_data['attributes'][] = [
                    'id' => 0,
                    'name' => wc_attribute_label($attribute->get_name()),
                    'position' => $attribute->get_position(),
                    'visible' => $attribute->get_visible(),
                    'variation' => $attribute->get_variation(),
                    'options' => $attribute->is_taxonomy() ?
                        wc_get_product_terms($product->get_id(), $attribute->get_name(), array('fields' => 'names')) :
                        $attribute->get_options(),
                ];
            }
        }

        return $product_data;
    }

    return null;
}

/**
 * Add product data to frontend if on product page
 */
function rwl_localize_product_data()
{
    if (!rwl_is_woocommerce_active()) {
        return;
    }

    $product_data = rwl_get_product_data();
    $page_data = [
        'isProductPage' => is_product(),
        'product' => $product_data,
    ];

    wp_localize_script('rwl-react-frontend.js', 'rwlProductData', $page_data);

    // Add WooCommerce add to cart parameters for AJAX
    if (is_product()) {
        wp_localize_script('rwl-react-frontend.js', 'rwl_ajax_params', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'wc_ajax_url' => WC_AJAX::get_endpoint('%%endpoint%%'),
            'add_to_cart_nonce' => wp_create_nonce('add_to_cart'),
        ]);
    }
}
add_action('wp_enqueue_scripts', 'rwl_localize_product_data');

/**
 * Handle AJAX add to cart with custom options
 */
function rwl_ajax_add_to_cart()
{
    // Check nonce for security
    if (!wp_verify_nonce($_POST['nonce'], 'add_to_cart')) {
        wp_die('Security check failed');
    }

    $product_id = intval($_POST['product_id']);
    $quantity = intval($_POST['quantity']);
    $size = sanitize_text_field($_POST['size']);
    $fragrance = sanitize_text_field($_POST['fragrance']);

    // Validate inputs
    if ($product_id <= 0 || $quantity <= 0) {
        wp_send_json_error('Invalid product or quantity');
        return;
    }

    // Get the product
    $product = wc_get_product($product_id);
    if (!$product) {
        wp_send_json_error('Product not found');
        return;
    }

    // Check if product is purchasable
    if (!$product->is_purchasable()) {
        wp_send_json_error('Product is not purchasable');
        return;
    }

    // Check stock
    if (!$product->has_enough_stock($quantity)) {
        wp_send_json_error('Not enough stock available');
        return;
    }

    // Prepare cart item data with custom options
    $cart_item_data = [
        'rwl_custom_size' => $size,
        'rwl_custom_fragrance' => $fragrance,
        'rwl_custom_options' => [
            'size' => $size,
            'fragrance' => $fragrance
        ]
    ];

    // Add to cart
    $cart_item_key = WC()->cart->add_to_cart($product_id, $quantity, 0, [], $cart_item_data);

    if ($cart_item_key) {
        // Success response
        wp_send_json_success([
            'message' => 'Product added to cart successfully',
            'cart_item_key' => $cart_item_key,
            'cart_count' => WC()->cart->get_cart_contents_count(),
            'cart_total' => WC()->cart->get_cart_total(),
            'fragments' => apply_filters('woocommerce_add_to_cart_fragments', [])
        ]);
    } else {
        wp_send_json_error('Failed to add product to cart');
    }
}
add_action('wp_ajax_rwl_add_to_cart', 'rwl_ajax_add_to_cart');
add_action('wp_ajax_nopriv_rwl_add_to_cart', 'rwl_ajax_add_to_cart');

/**
 * Display custom options in cart and checkout
 */
function rwl_display_custom_options_in_cart($item_data, $cart_item)
{
    if (isset($cart_item['rwl_custom_options'])) {
        $options = $cart_item['rwl_custom_options'];

        if (!empty($options['size'])) {
            $item_data[] = [
                'key' => __('Size', 'rwl-plugin'),
                'value' => $options['size'],
                'display' => $options['size'],
            ];
        }

        if (!empty($options['fragrance'])) {
            $item_data[] = [
                'key' => __('Fragrance', 'rwl-plugin'),
                'value' => $options['fragrance'],
                'display' => $options['fragrance'],
            ];
        }
    }

    return $item_data;
}
add_filter('woocommerce_get_item_data', 'rwl_display_custom_options_in_cart', 10, 2);

/**
 * Save custom options to order items
 */
function rwl_save_custom_options_to_order_items($item, $cart_item_key, $values, $order)
{
    if (isset($values['rwl_custom_options'])) {
        $options = $values['rwl_custom_options'];

        if (!empty($options['size'])) {
            $item->add_meta_data(__('Size', 'rwl-plugin'), $options['size']);
        }

        if (!empty($options['fragrance'])) {
            $item->add_meta_data(__('Fragrance', 'rwl-plugin'), $options['fragrance']);
        }
    }
}
add_action('woocommerce_checkout_create_order_line_item', 'rwl_save_custom_options_to_order_items', 10, 4);

/**
 * Handle AJAX wishlist functionality
 */
function rwl_ajax_toggle_wishlist()
{
    // Check nonce for security
    if (!wp_verify_nonce($_POST['nonce'], 'wishlist_toggle')) {
        wp_die('Security check failed');
    }

    $product_id = intval($_POST['product_id']);
    $user_id = get_current_user_id();

    if ($user_id === 0) {
        wp_send_json_error('User must be logged in');
        return;
    }

    // Get current wishlist
    $wishlist = get_user_meta($user_id, 'rwl_wishlist', true);
    if (!is_array($wishlist)) {
        $wishlist = [];
    }

    $is_in_wishlist = in_array($product_id, $wishlist);

    if ($is_in_wishlist) {
        // Remove from wishlist
        $wishlist = array_diff($wishlist, [$product_id]);
        $action = 'removed';
    } else {
        // Add to wishlist
        $wishlist[] = $product_id;
        $action = 'added';
    }

    // Update wishlist
    update_user_meta($user_id, 'rwl_wishlist', $wishlist);

    wp_send_json_success([
        'action' => $action,
        'is_in_wishlist' => !$is_in_wishlist,
        'wishlist_count' => count($wishlist)
    ]);
}
add_action('wp_ajax_rwl_toggle_wishlist', 'rwl_ajax_toggle_wishlist');
add_action('wp_ajax_nopriv_rwl_toggle_wishlist', 'rwl_ajax_toggle_wishlist');