<?php
/**
 * Plugin Name: Inaricom DigiKey Integration
 * Plugin URI: https://inaricom.com
 * Description: Intégration API DigiKey pour synchronisation produits, prix et stock en temps réel
 * Version: 1.0.0
 * Author: Inaricom
 * Author URI: https://inaricom.com
 * Text Domain: inaricom-digikey
 * Requires at least: 6.0
 * Requires PHP: 8.0
 * WC requires at least: 8.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Constants
define('INARICOM_DK_VERSION', '1.0.0');
define('INARICOM_DK_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('INARICOM_DK_PLUGIN_URL', plugin_dir_url(__FILE__));

// Autoload classes
spl_autoload_register(function ($class) {
    $prefix = 'Inaricom_DK_';
    if (strpos($class, $prefix) !== 0) {
        return;
    }
    $relative_class = substr($class, strlen($prefix));
    $file = INARICOM_DK_PLUGIN_DIR . 'includes/class-' . strtolower(str_replace('_', '-', $relative_class)) . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

/**
 * Main Plugin Class
 */
class Inaricom_DigiKey {
    
    private static $instance = null;
    public $api = null;
    
    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function __construct() {
        $this->init_hooks();
    }
    
    private function init_hooks() {
        add_action('plugins_loaded', [$this, 'init']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'admin_styles']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
        
        // WooCommerce hooks
        add_action('woocommerce_product_options_pricing', [$this, 'add_digikey_field']);
        add_action('woocommerce_process_product_meta', [$this, 'save_digikey_field']);
        add_filter('woocommerce_get_price_html', [$this, 'maybe_update_price'], 10, 2);
        
        // Frontend: Display shipping info on product page
        add_action('woocommerce_single_product_summary', [$this, 'display_shipping_info'], 25);
        add_action('wp_enqueue_scripts', [$this, 'frontend_styles']);
        
        // Cron for sync
        add_action('inaricom_dk_sync_prices', [$this, 'sync_all_prices']);
        
        if (!wp_next_scheduled('inaricom_dk_sync_prices')) {
            wp_schedule_event(time(), 'twicedaily', 'inaricom_dk_sync_prices');
        }
    }
    
    public function init() {
        require_once INARICOM_DK_PLUGIN_DIR . 'includes/class-api.php';
        require_once INARICOM_DK_PLUGIN_DIR . 'includes/class-ajax-handlers.php';
        $this->api = new Inaricom_DK_API();
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'DigiKey Integration',
            'DigiKey',
            'manage_options',
            'inaricom-digikey',
            [$this, 'render_admin_page'],
            'dashicons-cart',
            56
        );
        
        add_submenu_page(
            'inaricom-digikey',
            'Recherche Produits',
            'Recherche',
            'manage_options',
            'inaricom-digikey-search',
            [$this, 'render_search_page']
        );
        
        add_submenu_page(
            'inaricom-digikey',
            'Synchronisation',
            'Sync',
            'manage_options',
            'inaricom-digikey-sync',
            [$this, 'render_sync_page']
        );
        
        add_submenu_page(
            'inaricom-digikey',
            'Livraison',
            'Livraison',
            'manage_options',
            'inaricom-digikey-shipping',
            [$this, 'render_shipping_page']
        );
    }
    
    public function register_settings() {
        register_setting('inaricom_dk_settings', 'inaricom_dk_client_id');
        register_setting('inaricom_dk_settings', 'inaricom_dk_client_secret');
        register_setting('inaricom_dk_settings', 'inaricom_dk_markup_percent', [
            'default' => 15,
            'sanitize_callback' => 'absint'
        ]);
        register_setting('inaricom_dk_settings', 'inaricom_dk_auto_sync', [
            'default' => 1,
            'sanitize_callback' => 'absint'
        ]);
        
        // Locale & Marketplace settings
        register_setting('inaricom_dk_settings', 'inaricom_dk_locale_site', [
            'default' => 'CH',
            'sanitize_callback' => 'sanitize_text_field'
        ]);
        register_setting('inaricom_dk_settings', 'inaricom_dk_locale_language', [
            'default' => 'fr',
            'sanitize_callback' => 'sanitize_text_field'
        ]);
        register_setting('inaricom_dk_settings', 'inaricom_dk_locale_currency', [
            'default' => 'CHF',
            'sanitize_callback' => 'sanitize_text_field'
        ]);
        register_setting('inaricom_dk_settings', 'inaricom_dk_exclude_marketplace', [
            'default' => 'yes',
            'sanitize_callback' => 'sanitize_text_field'
        ]);
    }
    
    public function admin_styles($hook) {
        if (strpos($hook, 'inaricom-digikey') === false) {
            return;
        }
        wp_enqueue_style(
            'inaricom-dk-admin',
            INARICOM_DK_PLUGIN_URL . 'assets/admin.css',
            [],
            INARICOM_DK_VERSION
        );
        wp_enqueue_script(
            'inaricom-dk-admin',
            INARICOM_DK_PLUGIN_URL . 'assets/admin.js',
            ['jquery'],
            INARICOM_DK_VERSION,
            true
        );
        wp_localize_script('inaricom-dk-admin', 'inaricomDK', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wp_rest'),
            'ajaxNonce' => wp_create_nonce('inaricom_dk_nonce'),
            'restUrl' => rest_url('inaricom/v1/')
        ]);
    }
    
    public function register_rest_routes() {
        register_rest_route('inaricom/v1', '/digikey-callback', [
            'methods' => 'GET',
            'callback' => [$this, 'handle_oauth_callback'],
            'permission_callback' => '__return_true'
        ]);
        
        register_rest_route('inaricom/v1', '/search', [
            'methods' => 'POST',
            'callback' => [$this, 'rest_search_products'],
            'permission_callback' => function() {
                return current_user_can('manage_options');
            }
        ]);
        
        register_rest_route('inaricom/v1', '/product/(?P<part_number>[a-zA-Z0-9-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'rest_get_product'],
            'permission_callback' => function() {
                return current_user_can('manage_options');
            }
        ]);
        
        // DEBUG endpoint - temporary
        register_rest_route('inaricom/v1', '/debug-search', [
            'methods' => 'GET',
            'callback' => [$this, 'debug_search'],
            'permission_callback' => function() {
                return current_user_can('manage_options');
            }
        ]);
    }
    
    public function debug_search($request) {
        $keyword = $request->get_param('q') ?? 'Raspberry Pi 5';
        $exclude_marketplace = get_option('inaricom_dk_exclude_marketplace', 'yes') === 'yes';
        $locale_site = get_option('inaricom_dk_locale_site', 'CH');
        
        $body = [
            'Keywords' => $keyword,
            'RecordCount' => 5,
            'RecordStartPosition' => 0,
            'ExcludeMarketPlaceProducts' => $exclude_marketplace,
        ];
        
        // Make raw request to see exactly what API returns
        $api = $this->api;
        if (!$api->has_valid_token()) {
            return new WP_REST_Response(['error' => 'No valid token'], 401);
        }
        
        $args = [
            'method' => 'POST',
            'headers' => [
                'Authorization' => 'Bearer ' . get_option('inaricom_dk_access_token'),
                'X-DIGIKEY-Client-Id' => get_option('inaricom_dk_client_id'),
                'X-DIGIKEY-Locale-Site' => $locale_site,
                'X-DIGIKEY-Locale-Language' => get_option('inaricom_dk_locale_language', 'fr'),
                'X-DIGIKEY-Locale-Currency' => get_option('inaricom_dk_locale_currency', 'CHF'),
                'Content-Type' => 'application/json'
            ],
            'body' => json_encode($body),
            'timeout' => 30
        ];
        
        $response = wp_remote_post('https://api.digikey.com/products/v4/search/keyword', $args);
        
        if (is_wp_error($response)) {
            return new WP_REST_Response(['error' => $response->get_error_message()], 500);
        }
        
        $raw = json_decode(wp_remote_retrieve_body($response), true);
        
        // Extract key info
        $debug = [
            'config' => [
                'locale_site' => $locale_site,
                'exclude_marketplace' => $exclude_marketplace,
                'keyword' => $keyword,
            ],
            'response_keys' => is_array($raw) ? array_keys($raw) : 'not_array',
            'products_count' => $raw['ProductsCount'] ?? 'N/A',
            'exact_matches' => $raw['ExactMatches'] ?? 'N/A',
        ];
        
        if (!empty($raw['Products'])) {
            $first = $raw['Products'][0];
            $debug['first_product'] = [
                'keys' => array_keys($first),
                'full_data' => $first
            ];
        } else {
            $debug['products'] = 'EMPTY or missing';
            $debug['raw_response'] = $raw;
        }
        
        return new WP_REST_Response($debug, 200);
    }
    
    public function handle_oauth_callback($request) {
        $code = $request->get_param('code');
        if ($code && $this->api) {
            $result = $this->api->exchange_code_for_token($code);
            if ($result) {
                wp_redirect(admin_url('admin.php?page=inaricom-digikey&auth=success'));
                exit;
            }
        }
        wp_redirect(admin_url('admin.php?page=inaricom-digikey&auth=error'));
        exit;
    }
    
    public function rest_search_products($request) {
        $keyword = sanitize_text_field($request->get_param('keyword'));
        $limit = absint($request->get_param('limit')) ?: 10;
        
        if (!$this->api) {
            return new WP_Error('no_api', 'API not initialized', ['status' => 500]);
        }
        
        $results = $this->api->search_products($keyword, $limit);
        return rest_ensure_response($results);
    }
    
    public function rest_get_product($request) {
        $part_number = sanitize_text_field($request->get_param('part_number'));
        
        if (!$this->api) {
            return new WP_Error('no_api', 'API not initialized', ['status' => 500]);
        }
        
        $product = $this->api->get_product_details($part_number);
        return rest_ensure_response($product);
    }
    
    // WooCommerce Integration
    public function add_digikey_field() {
        woocommerce_wp_text_input([
            'id' => '_digikey_part_number',
            'label' => 'DigiKey Part Number',
            'description' => 'Numéro de pièce DigiKey pour sync auto prix/stock',
            'desc_tip' => true
        ]);
    }
    
    public function save_digikey_field($post_id) {
        $part_number = isset($_POST['_digikey_part_number']) 
            ? sanitize_text_field($_POST['_digikey_part_number']) 
            : '';
        update_post_meta($post_id, '_digikey_part_number', $part_number);
    }
    
    public function maybe_update_price($price_html, $product) {
        // Check if auto-sync is on and product has DigiKey part number
        $part_number = get_post_meta($product->get_id(), '_digikey_part_number', true);
        if (!$part_number || !get_option('inaricom_dk_auto_sync')) {
            return $price_html;
        }
        
        // Check cache
        $cache_key = 'inaricom_dk_price_' . md5($part_number);
        $cached = get_transient($cache_key);
        
        if ($cached === false && $this->api) {
            // Fetch fresh price (async would be better for production)
            $details = $this->api->get_product_details($part_number);
            if ($details && isset($details['unitPrice'])) {
                $markup = get_option('inaricom_dk_markup_percent', 15);
                $final_price = $details['unitPrice'] * (1 + $markup / 100);
                set_transient($cache_key, $final_price, 6 * HOUR_IN_SECONDS);
                
                // Update WooCommerce price
                $product->set_price($final_price);
                $product->set_regular_price($final_price);
            }
        }
        
        return $price_html;
    }
    
    public function sync_all_prices() {
        $products = wc_get_products([
            'meta_key' => '_digikey_part_number',
            'meta_compare' => 'EXISTS',
            'limit' => -1
        ]);
        
        foreach ($products as $product) {
            $part_number = get_post_meta($product->get_id(), '_digikey_part_number', true);
            if ($part_number && $this->api) {
                $details = $this->api->get_product_details($part_number);
                if ($details && isset($details['unitPrice'])) {
                    $markup = get_option('inaricom_dk_markup_percent', 15);
                    $final_price = $details['unitPrice'] * (1 + $markup / 100);
                    
                    $product->set_price($final_price);
                    $product->set_regular_price($final_price);
                    $product->save();
                    
                    // Update stock
                    if (isset($details['quantityAvailable'])) {
                        $product->set_stock_quantity($details['quantityAvailable']);
                        $product->set_stock_status($details['quantityAvailable'] > 0 ? 'instock' : 'outofstock');
                        $product->save();
                    }
                    
                    // Update shipping/lead time info
                    $product_id = $product->get_id();
                    if (!empty($details['manufacturerLeadWeeks'])) {
                        update_post_meta($product_id, '_digikey_lead_weeks', $details['manufacturerLeadWeeks']);
                    }
                    if (!empty($details['shippingEstimate'])) {
                        update_post_meta($product_id, '_digikey_shipping_estimate', $details['shippingEstimate']);
                    }
                    update_post_meta($product_id, '_digikey_last_sync', time());
                }
            }
        }
    }
    
    public function render_admin_page() {
        include INARICOM_DK_PLUGIN_DIR . 'admin/settings-page.php';
    }
    
    public function render_search_page() {
        include INARICOM_DK_PLUGIN_DIR . 'admin/search-page.php';
    }
    
    public function render_sync_page() {
        include INARICOM_DK_PLUGIN_DIR . 'admin/sync-page.php';
    }
    
    public function render_shipping_page() {
        include INARICOM_DK_PLUGIN_DIR . 'admin/shipping-page.php';
    }
    
    /**
     * Frontend: Display shipping info on product page
     */
    public function display_shipping_info() {
        global $product;
        
        if (!$product) {
            return;
        }
        
        $part_number = get_post_meta($product->get_id(), '_digikey_part_number', true);
        if (!$part_number) {
            return; // Not a DigiKey product
        }
        
        // Get stored shipping estimate or calculate fresh
        $shipping = get_post_meta($product->get_id(), '_digikey_shipping_estimate', true);
        $lead_weeks = get_post_meta($product->get_id(), '_digikey_lead_weeks', true);
        $stock = $product->get_stock_quantity();
        
        // Get shipping config
        $default_country = get_option('inaricom_dk_default_country', 'CH');
        $shipping_config = get_option('inaricom_dk_shipping_config', 
            $this->api ? $this->api->get_default_shipping_config() : []
        );
        $country_config = $shipping_config[$default_country] ?? $shipping_config['CH'] ?? null;
        
        if (!$country_config) {
            return;
        }
        
        // Build shipping info
        $is_in_stock = $stock > 0;
        
        echo '<div class="inaricom-dk-shipping-info">';
        
        if ($is_in_stock) {
            // In stock
            echo '<div class="shipping-badge in-stock">';
            echo '<span class="shipping-icon">🚚</span>';
            echo '<span class="shipping-text">';
            echo '<strong>Livraison ' . esc_html($country_config['min_days']) . '-' . esc_html($country_config['max_days']) . ' jours</strong>';
            echo '<small>' . esc_html($country_config['name']) . '</small>';
            echo '</span>';
            echo '</div>';
            
            // Free shipping threshold
            $cart_total = WC()->cart ? WC()->cart->get_cart_contents_total() : 0;
            $threshold = $country_config['free_threshold'];
            $currency = $country_config['currency'];
            
            if ($cart_total >= $threshold) {
                echo '<div class="shipping-badge free">';
                echo '<span class="shipping-icon">✅</span>';
                echo '<span class="shipping-text">Livraison gratuite</span>';
                echo '</div>';
            } else {
                $remaining = $threshold - $cart_total;
                echo '<div class="shipping-badge threshold">';
                echo '<span class="shipping-icon">💡</span>';
                echo '<span class="shipping-text">';
                printf(
                    'Livraison gratuite dès %s %s',
                    esc_html(number_format($threshold, 0)),
                    esc_html($currency)
                );
                echo '</span>';
                echo '</div>';
            }
        } else {
            // Backorder
            echo '<div class="shipping-badge backorder">';
            echo '<span class="shipping-icon">⏳</span>';
            echo '<span class="shipping-text">';
            if ($lead_weeks) {
                echo '<strong>Délai fabricant: ' . esc_html($lead_weeks) . ' semaines</strong>';
                $total_min = (intval($lead_weeks) * 7) + $country_config['min_days'];
                $total_max = (intval($lead_weeks) * 7) + $country_config['max_days'];
                echo '<small>+ livraison ' . $country_config['min_days'] . '-' . $country_config['max_days'] . ' jours</small>';
            } else {
                echo '<strong>Délai à confirmer</strong>';
                echo '<small>Contactez-nous pour une estimation</small>';
            }
            echo '</span>';
            echo '</div>';
        }
        
        // DigiKey badge
        echo '<div class="shipping-badge digikey">';
        echo '<span class="shipping-icon">📦</span>';
        echo '<span class="shipping-text">';
        echo '<small>Expédié par DigiKey (USA)</small>';
        echo '</span>';
        echo '</div>';
        
        echo '</div>';
    }
    
    /**
     * Frontend styles
     */
    public function frontend_styles() {
        if (!is_product()) {
            return;
        }
        
        wp_add_inline_style('woocommerce-general', '
            .inaricom-dk-shipping-info {
                margin: 15px 0;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #28a745;
            }
            .shipping-badge {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            .shipping-badge:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }
            .shipping-badge:first-child {
                padding-top: 0;
            }
            .shipping-icon {
                font-size: 1.3em;
                flex-shrink: 0;
            }
            .shipping-text {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .shipping-text strong {
                color: #333;
            }
            .shipping-text small {
                color: #666;
                font-size: 0.85em;
            }
            .shipping-badge.in-stock {
                color: #28a745;
            }
            .shipping-badge.backorder {
                color: #856404;
            }
            .shipping-badge.backorder .shipping-text strong {
                color: #856404;
            }
            .shipping-badge.free {
                color: #28a745;
            }
            .shipping-badge.threshold {
                color: #17a2b8;
            }
            .shipping-badge.digikey {
                color: #666;
            }
            
            /* Dark theme support */
            .dark-theme .inaricom-dk-shipping-info,
            body.dark .inaricom-dk-shipping-info {
                background: rgba(40, 167, 69, 0.1);
                border-color: #28a745;
            }
            .dark-theme .shipping-text strong,
            body.dark .shipping-text strong {
                color: #fff;
            }
            .dark-theme .shipping-text small,
            body.dark .shipping-text small {
                color: #aaa;
            }
            .dark-theme .shipping-badge,
            body.dark .shipping-badge {
                border-color: rgba(255,255,255,0.1);
            }
        ');
    }
}

// Initialize
function inaricom_dk() {
    return Inaricom_DigiKey::instance();
}
inaricom_dk();
