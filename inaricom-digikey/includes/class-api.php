<?php
/**
 * DigiKey API Handler
 * 
 * @package Inaricom_DigiKey
 */

if (!defined('ABSPATH')) {
    exit;
}

class Inaricom_DK_API {
    
    private $client_id;
    private $client_secret;
    private $access_token;
    private $token_expires;
    
    // API Endpoints
    private $auth_url = 'https://api.digikey.com/v1/oauth2/authorize';
    private $token_url = 'https://api.digikey.com/v1/oauth2/token';
    private $api_base = 'https://api.digikey.com';
    
    public function __construct() {
        $this->client_id = get_option('inaricom_dk_client_id', '');
        $this->client_secret = get_option('inaricom_dk_client_secret', '');
        $this->access_token = get_option('inaricom_dk_access_token', '');
        $this->token_expires = get_option('inaricom_dk_token_expires', 0);
    }
    
    /**
     * Check if API is configured
     */
    public function is_configured() {
        return !empty($this->client_id) && !empty($this->client_secret);
    }
    
    /**
     * Check if we have a valid token
     */
    public function has_valid_token() {
        return !empty($this->access_token) && time() < $this->token_expires;
    }
    
    /**
     * Get OAuth authorization URL
     */
    public function get_auth_url() {
        $callback = rest_url('inaricom/v1/digikey-callback');
        
        $params = [
            'response_type' => 'code',
            'client_id' => $this->client_id,
            'redirect_uri' => $callback,
        ];
        
        return $this->auth_url . '?' . http_build_query($params);
    }
    
    /**
     * Exchange authorization code for access token
     */
    public function exchange_code_for_token($code) {
        $callback = rest_url('inaricom/v1/digikey-callback');
        
        $response = wp_remote_post($this->token_url, [
            'body' => [
                'code' => $code,
                'client_id' => $this->client_id,
                'client_secret' => $this->client_secret,
                'redirect_uri' => $callback,
                'grant_type' => 'authorization_code'
            ],
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded'
            ]
        ]);
        
        if (is_wp_error($response)) {
            error_log('DigiKey OAuth Error: ' . $response->get_error_message());
            return false;
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['access_token'])) {
            $this->access_token = $body['access_token'];
            $this->token_expires = time() + $body['expires_in'] - 60;
            
            update_option('inaricom_dk_access_token', $this->access_token);
            update_option('inaricom_dk_token_expires', $this->token_expires);
            
            if (isset($body['refresh_token'])) {
                update_option('inaricom_dk_refresh_token', $body['refresh_token']);
            }
            
            return true;
        }
        
        error_log('DigiKey Token Error: ' . print_r($body, true));
        return false;
    }
    
    /**
     * Refresh access token
     */
    public function refresh_token() {
        $refresh_token = get_option('inaricom_dk_refresh_token', '');
        
        if (empty($refresh_token)) {
            return false;
        }
        
        $response = wp_remote_post($this->token_url, [
            'body' => [
                'client_id' => $this->client_id,
                'client_secret' => $this->client_secret,
                'refresh_token' => $refresh_token,
                'grant_type' => 'refresh_token'
            ],
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded'
            ]
        ]);
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['access_token'])) {
            $this->access_token = $body['access_token'];
            $this->token_expires = time() + $body['expires_in'] - 60;
            
            update_option('inaricom_dk_access_token', $this->access_token);
            update_option('inaricom_dk_token_expires', $this->token_expires);
            
            if (isset($body['refresh_token'])) {
                update_option('inaricom_dk_refresh_token', $body['refresh_token']);
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Ensure we have a valid token
     */
    private function ensure_token() {
        if (!$this->has_valid_token()) {
            return $this->refresh_token();
        }
        return true;
    }
    
    /**
     * Make API request
     */
    private function request($endpoint, $method = 'GET', $body = null) {
        if (!$this->ensure_token()) {
            return ['error' => 'No valid token. Please re-authorize.'];
        }
        
        // Get configurable locale settings
        $locale_site = get_option('inaricom_dk_locale_site', 'CH');
        $locale_language = get_option('inaricom_dk_locale_language', 'fr');
        $locale_currency = get_option('inaricom_dk_locale_currency', 'CHF');
        
        $args = [
            'method' => $method,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->access_token,
                'X-DIGIKEY-Client-Id' => $this->client_id,
                'X-DIGIKEY-Locale-Site' => $locale_site,
                'X-DIGIKEY-Locale-Language' => $locale_language,
                'X-DIGIKEY-Locale-Currency' => $locale_currency,
                'Content-Type' => 'application/json'
            ],
            'timeout' => 30
        ];
        
        // Store original body for potential retry
        $original_body = $body;
        
        if ($body && $method === 'POST') {
            $args['body'] = json_encode($body);
        }
        
        $response = wp_remote_request($this->api_base . $endpoint, $args);
        
        if (is_wp_error($response)) {
            return ['error' => $response->get_error_message()];
        }
        
        $code = wp_remote_retrieve_response_code($response);
        $response_body = json_decode(wp_remote_retrieve_body($response), true);
        
        if ($code === 401) {
            // Token expired, try refresh (use original_body, not response_body!)
            if ($this->refresh_token()) {
                return $this->request($endpoint, $method, $original_body);
            }
            return ['error' => 'Authentication failed'];
        }
        
        if ($code >= 400) {
            return ['error' => 'API Error: ' . ($response_body['message'] ?? 'Unknown error'), 'code' => $code];
        }
        
        return $response_body;
    }
    
    /**
     * Search products by keyword
     */
    public function search_products($keyword, $limit = 10) {
        // Get configurable marketplace filter
        $exclude_marketplace = get_option('inaricom_dk_exclude_marketplace', 'yes') === 'yes';
        
        $body = [
            'Keywords' => $keyword,
            'RecordCount' => min($limit, 50),
            'RecordStartPosition' => 0,
            'ExcludeMarketPlaceProducts' => $exclude_marketplace,
            'Sort' => [
                'SortOption' => 'SortByDigiKeyPartNumber',
                'Direction' => 'Ascending'
            ]
        ];
        
        $response = $this->request('/products/v4/search/keyword', 'POST', $body);
        
        // DEBUG: Log raw response to see actual structure
        error_log('=== DIGIKEY RAW RESPONSE ===');
        error_log('Keywords: ' . $keyword);
        error_log('Exclude Marketplace: ' . ($exclude_marketplace ? 'YES' : 'NO'));
        error_log('Locale Site: ' . get_option('inaricom_dk_locale_site', 'CH'));
        if (isset($response['Products']) && !empty($response['Products'])) {
            $first = $response['Products'][0];
            error_log('First product keys: ' . implode(', ', array_keys($first)));
            error_log('First product JSON: ' . json_encode($first, JSON_PRETTY_PRINT));
        } else {
            error_log('No Products in response. Response keys: ' . (is_array($response) ? implode(', ', array_keys($response)) : 'not array'));
            error_log('Full response: ' . json_encode($response));
        }
        error_log('=== END DEBUG ===');
        
        if (isset($response['error'])) {
            return $response;
        }
        
        // Format results
        $products = [];
        if (isset($response['Products'])) {
            foreach ($response['Products'] as $product) {
                $products[] = $this->format_product($product);
            }
        }
        
        return [
            'products' => $products,
            'total' => $response['ProductsCount'] ?? 0
        ];
    }
    
    /**
     * Get product details by part number
     */
    public function get_product_details($part_number) {
        $response = $this->request('/products/v4/search/' . urlencode($part_number) . '/productdetails');
        
        if (isset($response['error'])) {
            return $response;
        }
        
        if (isset($response['Product'])) {
            return $this->format_product($response['Product']);
        }
        
        return null;
    }
    
    /**
     * Format product data for WooCommerce (API v4 structure)
     */
    private function format_product($product) {
        // Get DigiKey part number from ProductVariations (v4 structure)
        $digikey_part = '';
        $stock = 0;
        
        if (!empty($product['ProductVariations'])) {
            $variation = $product['ProductVariations'][0];
            $digikey_part = $variation['DigiKeyProductNumber'] ?? '';
            $stock = $variation['QuantityAvailable'] ?? 0;
        }
        
        // Extract description (v4: nested in Description object)
        $description = '';
        $detailed = '';
        if (isset($product['Description'])) {
            if (is_array($product['Description'])) {
                $description = $product['Description']['ProductDescription'] ?? '';
                $detailed = $product['Description']['DetailedDescription'] ?? '';
            } else {
                $description = $product['Description'];
            }
        }
        
        // Get manufacturer name
        $manufacturer = '';
        if (isset($product['Manufacturer'])) {
            if (is_array($product['Manufacturer'])) {
                $manufacturer = $product['Manufacturer']['Name'] ?? '';
            } else {
                $manufacturer = $product['Manufacturer'];
            }
        }
        
        // Get category
        $category = '';
        if (isset($product['Category'])) {
            if (is_array($product['Category'])) {
                $category = $product['Category']['Name'] ?? '';
            } else {
                $category = $product['Category'];
            }
        }
        
        // Get lead time info (v4 fields)
        $manufacturer_lead_weeks = $product['ManufacturerLeadWeeks'] ?? null;
        $date_last_buy = $product['DateLastBuyChance'] ?? null;
        
        // Parse date if valid
        if ($date_last_buy && strpos($date_last_buy, '0001-01-01') !== false) {
            $date_last_buy = null; // Invalid/default date
        }
        
        return [
            'partNumber' => $digikey_part,
            'manufacturerPartNumber' => $product['ManufacturerProductNumber'] ?? '',
            'manufacturer' => $manufacturer,
            'description' => $description,
            'detailedDescription' => $detailed,
            'unitPrice' => floatval($product['UnitPrice'] ?? 0),
            'currency' => 'CHF',
            'quantityAvailable' => intval($stock),
            'minimumOrderQuantity' => 1,
            'productUrl' => $product['ProductUrl'] ?? '',
            'datasheetUrl' => $product['DatasheetUrl'] ?? '',
            'imageUrl' => $product['PhotoUrl'] ?? '',
            'category' => $category,
            'parameters' => $this->format_parameters($product['Parameters'] ?? []),
            // Lead time & shipping info
            'manufacturerLeadWeeks' => $manufacturer_lead_weeks,
            'dateLastBuyChance' => $date_last_buy,
            'shippingEstimate' => $this->get_shipping_estimate($stock, $manufacturer_lead_weeks)
        ];
    }
    
    /**
     * Get shipping estimate based on stock and country settings
     */
    private function get_shipping_estimate($stock, $lead_weeks = null) {
        $shipping_config = get_option('inaricom_dk_shipping_config', $this->get_default_shipping_config());
        $default_country = get_option('inaricom_dk_default_country', 'CH');
        
        $country_config = $shipping_config[$default_country] ?? $shipping_config['CH'];
        
        if ($stock > 0) {
            // In stock: DigiKey ships + delivery time
            return [
                'status' => 'in_stock',
                'min_days' => $country_config['min_days'],
                'max_days' => $country_config['max_days'],
                'message' => sprintf('Livraison %d-%d jours ouvrés', $country_config['min_days'], $country_config['max_days']),
                'ship_from' => 'DigiKey (USA)',
                'free_threshold' => $country_config['free_threshold'],
                'shipping_cost' => $country_config['shipping_cost']
            ];
        } else {
            // Out of stock: manufacturer lead time + shipping
            $lead_days = $lead_weeks ? intval($lead_weeks) * 7 : null;
            return [
                'status' => 'backorder',
                'lead_weeks' => $lead_weeks,
                'lead_days' => $lead_days,
                'min_days' => $lead_days ? $lead_days + $country_config['min_days'] : null,
                'max_days' => $lead_days ? $lead_days + $country_config['max_days'] : null,
                'message' => $lead_weeks 
                    ? sprintf('Délai fabricant: %s semaines + livraison', $lead_weeks)
                    : 'Délai à confirmer',
                'ship_from' => 'Fabricant → DigiKey → Destination'
            ];
        }
    }
    
    /**
     * Get default shipping configuration by country
     */
    public function get_default_shipping_config() {
        return [
            'CH' => [
                'name' => 'Suisse',
                'min_days' => 2,
                'max_days' => 4,
                'free_threshold' => 54,
                'shipping_cost' => 20,
                'currency' => 'CHF',
                'incoterms' => 'CPT'
            ],
            'FR' => [
                'name' => 'France',
                'min_days' => 3,
                'max_days' => 5,
                'free_threshold' => 50,
                'shipping_cost' => 18,
                'currency' => 'EUR',
                'incoterms' => 'DDP'
            ],
            'DE' => [
                'name' => 'Allemagne',
                'min_days' => 2,
                'max_days' => 4,
                'free_threshold' => 50,
                'shipping_cost' => 18,
                'currency' => 'EUR',
                'incoterms' => 'DDP'
            ],
            'IT' => [
                'name' => 'Italie',
                'min_days' => 3,
                'max_days' => 5,
                'free_threshold' => 50,
                'shipping_cost' => 18,
                'currency' => 'EUR',
                'incoterms' => 'DDP'
            ],
            'BE' => [
                'name' => 'Belgique',
                'min_days' => 2,
                'max_days' => 4,
                'free_threshold' => 50,
                'shipping_cost' => 18,
                'currency' => 'EUR',
                'incoterms' => 'DDP'
            ],
            'NL' => [
                'name' => 'Pays-Bas',
                'min_days' => 2,
                'max_days' => 4,
                'free_threshold' => 50,
                'shipping_cost' => 18,
                'currency' => 'EUR',
                'incoterms' => 'DDP'
            ],
            'AT' => [
                'name' => 'Autriche',
                'min_days' => 2,
                'max_days' => 4,
                'free_threshold' => 50,
                'shipping_cost' => 18,
                'currency' => 'EUR',
                'incoterms' => 'DDP'
            ],
            'ES' => [
                'name' => 'Espagne',
                'min_days' => 3,
                'max_days' => 6,
                'free_threshold' => 50,
                'shipping_cost' => 18,
                'currency' => 'EUR',
                'incoterms' => 'DDP'
            ],
            'UK' => [
                'name' => 'Royaume-Uni',
                'min_days' => 3,
                'max_days' => 5,
                'free_threshold' => 33,
                'shipping_cost' => 12,
                'currency' => 'GBP',
                'incoterms' => 'DDP'
            ]
        ];
    }
    
    /**
     * Format product parameters (v4 structure)
     */
    private function format_parameters($params) {
        if (empty($params) || !is_array($params)) {
            return [];
        }
        
        $formatted = [];
        foreach ($params as $param) {
            // v4 structure uses ParameterId and ValueId, but also has text versions
            $name = $param['ParameterText'] ?? $param['ParameterName'] ?? '';
            $value = $param['ValueText'] ?? $param['Value'] ?? '';
            
            if (!empty($name)) {
                $formatted[$name] = $value;
            }
        }
        return $formatted;
    }
    
    /**
     * Get product stock status
     */
    public function get_stock($part_number) {
        $details = $this->get_product_details($part_number);
        
        if (isset($details['error'])) {
            return $details;
        }
        
        return [
            'partNumber' => $details['partNumber'],
            'quantityAvailable' => $details['quantityAvailable'],
            'unitPrice' => $details['unitPrice'],
            'inStock' => $details['quantityAvailable'] > 0
        ];
    }
}
