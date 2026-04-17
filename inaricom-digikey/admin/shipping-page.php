<?php
/**
 * Shipping Configuration Page
 */

if (!defined('ABSPATH')) {
    exit;
}

$api = inaricom_dk()->api;
$shipping_config = get_option('inaricom_dk_shipping_config', $api->get_default_shipping_config());
$default_country = get_option('inaricom_dk_default_country', 'CH');

// Handle form submission
if (isset($_POST['save_shipping_config']) && check_admin_referer('inaricom_dk_shipping_nonce')) {
    $new_config = [];
    
    foreach ($_POST['shipping'] as $code => $data) {
        $new_config[sanitize_text_field($code)] = [
            'name' => sanitize_text_field($data['name']),
            'min_days' => intval($data['min_days']),
            'max_days' => intval($data['max_days']),
            'free_threshold' => floatval($data['free_threshold']),
            'shipping_cost' => floatval($data['shipping_cost']),
            'currency' => sanitize_text_field($data['currency']),
            'incoterms' => sanitize_text_field($data['incoterms'])
        ];
    }
    
    update_option('inaricom_dk_shipping_config', $new_config);
    update_option('inaricom_dk_default_country', sanitize_text_field($_POST['default_country']));
    
    echo '<div class="notice notice-success is-dismissible"><p>✅ Configuration sauvegardée !</p></div>';
    
    $shipping_config = $new_config;
    $default_country = sanitize_text_field($_POST['default_country']);
}
?>

<div class="wrap inaricom-dk-admin">
    <h1>
        <span class="dashicons dashicons-airplane"></span>
        Configuration Livraison DigiKey
    </h1>
    
    <p class="description">
        Configurez les délais de livraison estimés par pays. Ces informations seront affichées sur les fiches produits.
    </p>
    
    <form method="post">
        <?php wp_nonce_field('inaricom_dk_shipping_nonce'); ?>
        
        <div class="inaricom-dk-card" style="margin-top: 20px;">
            <h2>🌍 Pays par défaut</h2>
            <p>
                <select name="default_country" id="default_country">
                    <?php foreach ($shipping_config as $code => $config): ?>
                        <option value="<?php echo esc_attr($code); ?>" <?php selected($default_country, $code); ?>>
                            <?php echo esc_html($config['name']); ?> (<?php echo esc_html($code); ?>)
                        </option>
                    <?php endforeach; ?>
                </select>
                <span class="description">Pays affiché par défaut sur les fiches produit</span>
            </p>
        </div>
        
        <div class="inaricom-dk-card" style="margin-top: 20px;">
            <h2>📦 Délais par pays</h2>
            
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th style="width: 80px;">Code</th>
                        <th>Pays</th>
                        <th style="width: 100px;">Min (jours)</th>
                        <th style="width: 100px;">Max (jours)</th>
                        <th style="width: 120px;">Seuil gratuit</th>
                        <th style="width: 120px;">Frais port</th>
                        <th style="width: 80px;">Devise</th>
                        <th style="width: 80px;">Incoterms</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($shipping_config as $code => $config): ?>
                    <tr>
                        <td>
                            <strong><?php echo esc_html($code); ?></strong>
                        </td>
                        <td>
                            <input type="text" 
                                   name="shipping[<?php echo esc_attr($code); ?>][name]" 
                                   value="<?php echo esc_attr($config['name']); ?>"
                                   class="regular-text">
                        </td>
                        <td>
                            <input type="number" 
                                   name="shipping[<?php echo esc_attr($code); ?>][min_days]" 
                                   value="<?php echo esc_attr($config['min_days']); ?>"
                                   min="1" max="30"
                                   class="small-text">
                        </td>
                        <td>
                            <input type="number" 
                                   name="shipping[<?php echo esc_attr($code); ?>][max_days]" 
                                   value="<?php echo esc_attr($config['max_days']); ?>"
                                   min="1" max="60"
                                   class="small-text">
                        </td>
                        <td>
                            <input type="number" 
                                   name="shipping[<?php echo esc_attr($code); ?>][free_threshold]" 
                                   value="<?php echo esc_attr($config['free_threshold']); ?>"
                                   min="0" step="0.01"
                                   class="small-text">
                        </td>
                        <td>
                            <input type="number" 
                                   name="shipping[<?php echo esc_attr($code); ?>][shipping_cost]" 
                                   value="<?php echo esc_attr($config['shipping_cost']); ?>"
                                   min="0" step="0.01"
                                   class="small-text">
                        </td>
                        <td>
                            <select name="shipping[<?php echo esc_attr($code); ?>][currency]">
                                <option value="CHF" <?php selected($config['currency'], 'CHF'); ?>>CHF</option>
                                <option value="EUR" <?php selected($config['currency'], 'EUR'); ?>>EUR</option>
                                <option value="GBP" <?php selected($config['currency'], 'GBP'); ?>>GBP</option>
                                <option value="USD" <?php selected($config['currency'], 'USD'); ?>>USD</option>
                            </select>
                        </td>
                        <td>
                            <select name="shipping[<?php echo esc_attr($code); ?>][incoterms]">
                                <option value="DDP" <?php selected($config['incoterms'], 'DDP'); ?>>DDP</option>
                                <option value="CPT" <?php selected($config['incoterms'], 'CPT'); ?>>CPT</option>
                                <option value="DAP" <?php selected($config['incoterms'], 'DAP'); ?>>DAP</option>
                            </select>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            
            <p class="description" style="margin-top: 15px;">
                <strong>Incoterms:</strong><br>
                • <strong>DDP</strong> = Delivered Duty Paid (droits et taxes payés par DigiKey)<br>
                • <strong>CPT</strong> = Carriage Paid To (droits et taxes à payer à la livraison)<br>
                • <strong>DAP</strong> = Delivered at Place (livré sans dédouanement)
            </p>
        </div>
        
        <div class="inaricom-dk-card" style="margin-top: 20px;">
            <h2>ℹ️ Informations DigiKey</h2>
            <table class="form-table">
                <tr>
                    <th>Entrepôt principal</th>
                    <td>Thief River Falls, Minnesota, USA</td>
                </tr>
                <tr>
                    <th>Temps préparation</th>
                    <td>1-3 jours ouvrés (commandes avant 20h CT)</td>
                </tr>
                <tr>
                    <th>Transporteurs</th>
                    <td>FedEx, DHL, UPS (selon destination)</td>
                </tr>
                <tr>
                    <th>Suivi colis</th>
                    <td>Inclus sur toutes les commandes</td>
                </tr>
            </table>
        </div>
        
        <p class="submit">
            <input type="submit" name="save_shipping_config" class="button button-primary button-large" value="💾 Sauvegarder la configuration">
            <a href="<?php echo admin_url('admin.php?page=inaricom-digikey'); ?>" class="button button-secondary">Retour</a>
        </p>
    </form>
</div>

<style>
.inaricom-dk-card {
    background: #fff;
    border: 1px solid #ccd0d4;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 1px 1px rgba(0,0,0,.04);
}
.inaricom-dk-card h2 {
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}
.wp-list-table input.small-text {
    width: 70px;
}
.wp-list-table select {
    width: 100%;
}
</style>
