<?php
/**
 * AJAX Handlers
 */

if (!defined('ABSPATH')) {
    exit;
}

// Import product from DigiKey
add_action('wp_ajax_inaricom_dk_import_product', 'inaricom_dk_ajax_import_product');
function inaricom_dk_ajax_import_product() {
    check_ajax_referer('inaricom_dk_nonce', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Permission denied');
    }
    
    $part_number = sanitize_text_field($_POST['part_number']);
    $product_name = sanitize_text_field($_POST['product_name']);
    $final_price = floatval($_POST['final_price']);
    $category = intval($_POST['category']);
    
    // Get product details from DigiKey
    $api = inaricom_dk()->api;
    $dk_product = $api->get_product_details($part_number);
    
    if (isset($dk_product['error'])) {
        wp_send_json_error($dk_product['error']);
    }
    
    // Create WooCommerce product
    $product = new WC_Product_Simple();
    
    $product->set_name($product_name);
    $product->set_status('publish');
    $product->set_catalog_visibility('visible');
    $product->set_description($dk_product['detailedDescription'] ?? $dk_product['description']);
    $product->set_short_description($dk_product['description']);
    $product->set_sku($part_number);
    $product->set_regular_price($final_price);
    $product->set_manage_stock(true);
    $product->set_stock_quantity($dk_product['quantityAvailable'] ?? 0);
    $product->set_stock_status($dk_product['quantityAvailable'] > 0 ? 'instock' : 'outofstock');
    
    // Set category
    if ($category > 0) {
        $product->set_category_ids([$category]);
    }
    
    // Save product
    $product_id = $product->save();
    
    // Save DigiKey meta
    update_post_meta($product_id, '_digikey_part_number', $part_number);
    update_post_meta($product_id, '_digikey_manufacturer', $dk_product['manufacturer'] ?? '');
    update_post_meta($product_id, '_digikey_last_sync', time());
    
    // Save shipping/lead time info
    if (!empty($dk_product['manufacturerLeadWeeks'])) {
        update_post_meta($product_id, '_digikey_lead_weeks', $dk_product['manufacturerLeadWeeks']);
    }
    if (!empty($dk_product['shippingEstimate'])) {
        update_post_meta($product_id, '_digikey_shipping_estimate', $dk_product['shippingEstimate']);
    }
    if (!empty($dk_product['dateLastBuyChance'])) {
        update_post_meta($product_id, '_digikey_last_buy_date', $dk_product['dateLastBuyChance']);
    }
    
    // Download and set product image
    if (!empty($dk_product['imageUrl'])) {
        $image_id = inaricom_dk_sideload_image($dk_product['imageUrl'], $product_id, $product_name);
        if ($image_id) {
            $product->set_image_id($image_id);
            $product->save();
        }
    }
    
    // Save parameters as attributes
    if (!empty($dk_product['parameters'])) {
        $attributes = [];
        foreach ($dk_product['parameters'] as $name => $value) {
            $attribute = new WC_Product_Attribute();
            $attribute->set_name(sanitize_title($name));
            $attribute->set_options([$value]);
            $attribute->set_visible(true);
            $attributes[] = $attribute;
        }
        $product->set_attributes($attributes);
        $product->save();
    }
    
    wp_send_json_success([
        'product_id' => $product_id,
        'edit_url' => get_edit_post_link($product_id, 'raw')
    ]);
}

// Sync all products
add_action('wp_ajax_inaricom_dk_sync_all', 'inaricom_dk_ajax_sync_all');
function inaricom_dk_ajax_sync_all() {
    check_ajax_referer('inaricom_dk_nonce', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Permission denied');
    }
    
    inaricom_dk()->sync_all_prices();
    update_option('inaricom_dk_last_sync', time());
    
    wp_send_json_success([
        'message' => 'Synchronisation terminée'
    ]);
}

// Sync single product
add_action('wp_ajax_inaricom_dk_sync_single', 'inaricom_dk_ajax_sync_single');
function inaricom_dk_ajax_sync_single() {
    check_ajax_referer('inaricom_dk_nonce', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Permission denied');
    }
    
    $product_id = intval($_POST['product_id']);
    $part_number = sanitize_text_field($_POST['part_number']);
    
    $api = inaricom_dk()->api;
    $details = $api->get_product_details($part_number);
    
    if (isset($details['error'])) {
        wp_send_json_error($details['error']);
    }
    
    $product = wc_get_product($product_id);
    if (!$product) {
        wp_send_json_error('Produit non trouvé');
    }
    
    $markup = get_option('inaricom_dk_markup_percent', 15);
    $final_price = $details['unitPrice'] * (1 + $markup / 100);
    
    $product->set_regular_price($final_price);
    $product->set_price($final_price);
    $product->set_stock_quantity($details['quantityAvailable']);
    $product->set_stock_status($details['quantityAvailable'] > 0 ? 'instock' : 'outofstock');
    $product->save();
    
    update_post_meta($product_id, '_digikey_last_sync', time());
    
    // Update shipping/lead time info
    if (!empty($details['manufacturerLeadWeeks'])) {
        update_post_meta($product_id, '_digikey_lead_weeks', $details['manufacturerLeadWeeks']);
    }
    if (!empty($details['shippingEstimate'])) {
        update_post_meta($product_id, '_digikey_shipping_estimate', $details['shippingEstimate']);
    }
    
    wp_send_json_success([
        'price_html' => $product->get_price_html(),
        'stock' => $details['quantityAvailable'],
        'updated' => date('d/m H:i')
    ]);
}

/**
 * Helper: Sideload image from URL
 */
function inaricom_dk_sideload_image($url, $post_id, $desc = '') {
    require_once(ABSPATH . 'wp-admin/includes/media.php');
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/image.php');
    
    $tmp = download_url($url);
    
    if (is_wp_error($tmp)) {
        return false;
    }
    
    $file_array = [
        'name' => basename(parse_url($url, PHP_URL_PATH)),
        'tmp_name' => $tmp
    ];
    
    $id = media_handle_sideload($file_array, $post_id, $desc);
    
    if (is_wp_error($id)) {
        @unlink($tmp);
        return false;
    }
    
    return $id;
}
