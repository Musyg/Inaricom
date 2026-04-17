<?php
/**
 * Admin Settings Page
 */

if (!defined('ABSPATH')) {
    exit;
}

$api = inaricom_dk()->api;
$is_configured = $api && $api->is_configured();
$has_token = $api && $api->has_valid_token();
$auth_status = isset($_GET['auth']) ? $_GET['auth'] : '';
?>

<div class="wrap inaricom-dk-admin">
    <h1>
        <span class="dashicons dashicons-cart"></span>
        DigiKey Integration
    </h1>
    
    <?php if ($auth_status === 'success'): ?>
        <div class="notice notice-success is-dismissible">
            <p>✅ Autorisation DigiKey réussie ! L'API est maintenant connectée.</p>
        </div>
    <?php elseif ($auth_status === 'error'): ?>
        <div class="notice notice-error is-dismissible">
            <p>❌ Erreur d'autorisation. Veuillez réessayer.</p>
        </div>
    <?php endif; ?>
    
    <div class="inaricom-dk-grid">
        
        <!-- Status Card -->
        <div class="inaricom-dk-card">
            <h2>Statut de connexion</h2>
            <div class="status-indicator <?php echo $has_token ? 'connected' : 'disconnected'; ?>">
                <span class="status-dot"></span>
                <span class="status-text">
                    <?php echo $has_token ? 'Connecté' : 'Non connecté'; ?>
                </span>
            </div>
            
            <?php if ($is_configured && !$has_token): ?>
                <p>API configurée mais non autorisée.</p>
                <a href="<?php echo esc_url($api->get_auth_url()); ?>" class="button button-primary button-large">
                    🔐 Autoriser DigiKey
                </a>
            <?php elseif ($has_token): ?>
                <p>✅ Prêt pour la synchronisation</p>
                <p class="description">
                    Token valide jusqu'au: <?php echo wp_date('d/m/Y H:i', get_option('inaricom_dk_token_expires', 0)); ?>
                </p>
            <?php else: ?>
                <p>Configurez vos clés API ci-dessous.</p>
            <?php endif; ?>
        </div>
        
        <!-- Settings Card -->
        <div class="inaricom-dk-card">
            <h2>Configuration API</h2>
            <form method="post" action="options.php">
                <?php settings_fields('inaricom_dk_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="inaricom_dk_client_id">Client ID</label>
                        </th>
                        <td>
                            <input type="text" 
                                   id="inaricom_dk_client_id" 
                                   name="inaricom_dk_client_id" 
                                   value="<?php echo esc_attr(get_option('inaricom_dk_client_id', '')); ?>" 
                                   class="regular-text"
                                   placeholder="Votre Client ID DigiKey">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="inaricom_dk_client_secret">Client Secret</label>
                        </th>
                        <td>
                            <input type="password" 
                                   id="inaricom_dk_client_secret" 
                                   name="inaricom_dk_client_secret" 
                                   value="<?php echo esc_attr(get_option('inaricom_dk_client_secret', '')); ?>" 
                                   class="regular-text"
                                   placeholder="Votre Client Secret DigiKey">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="inaricom_dk_markup_percent">Marge (%)</label>
                        </th>
                        <td>
                            <input type="number" 
                                   id="inaricom_dk_markup_percent" 
                                   name="inaricom_dk_markup_percent" 
                                   value="<?php echo esc_attr(get_option('inaricom_dk_markup_percent', 15)); ?>" 
                                   class="small-text"
                                   min="0"
                                   max="100">
                            <p class="description">Marge appliquée sur le prix DigiKey</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="inaricom_dk_auto_sync">Sync automatique</label>
                        </th>
                        <td>
                            <label>
                                <input type="checkbox" 
                                       id="inaricom_dk_auto_sync" 
                                       name="inaricom_dk_auto_sync" 
                                       value="1"
                                       <?php checked(get_option('inaricom_dk_auto_sync', 1), 1); ?>>
                                Synchroniser automatiquement les prix (2x/jour)
                            </label>
                        </td>
                    </tr>
                </table>
                
                <h3 style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                    🌍 Configuration Locale & Marketplace
                </h3>
                <p class="description" style="margin-bottom: 15px;">
                    Ces paramètres affectent les résultats de recherche et les prix affichés.
                    <strong>Important :</strong> Si vous ne trouvez pas certains produits (ex: Raspberry Pi), 
                    essayez de changer la locale ou d'inclure les produits Marketplace.
                </p>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="inaricom_dk_locale_site">Locale Site (Pays)</label>
                        </th>
                        <td>
                            <select id="inaricom_dk_locale_site" name="inaricom_dk_locale_site" class="regular-text">
                                <?php
                                $current_site = get_option('inaricom_dk_locale_site', 'CH');
                                $sites = [
                                    'CH' => '🇨🇭 Suisse (CH)',
                                    'DE' => '🇩🇪 Allemagne (DE)', 
                                    'FR' => '🇫🇷 France (FR)',
                                    'US' => '🇺🇸 États-Unis (US)',
                                    'UK' => '🇬🇧 Royaume-Uni (UK)',
                                    'AT' => '🇦🇹 Autriche (AT)',
                                    'BE' => '🇧🇪 Belgique (BE)',
                                    'NL' => '🇳🇱 Pays-Bas (NL)',
                                    'IT' => '🇮🇹 Italie (IT)',
                                    'ES' => '🇪🇸 Espagne (ES)',
                                ];
                                foreach ($sites as $code => $label) {
                                    printf(
                                        '<option value="%s" %s>%s</option>',
                                        esc_attr($code),
                                        selected($current_site, $code, false),
                                        esc_html($label)
                                    );
                                }
                                ?>
                            </select>
                            <p class="description">
                                Affecte les restrictions produits et le stock affiché. 
                                Essayez <strong>US</strong> ou <strong>DE</strong> si des produits manquent.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="inaricom_dk_locale_language">Langue</label>
                        </th>
                        <td>
                            <select id="inaricom_dk_locale_language" name="inaricom_dk_locale_language">
                                <?php
                                $current_lang = get_option('inaricom_dk_locale_language', 'fr');
                                $languages = [
                                    'fr' => '🇫🇷 Français',
                                    'en' => '🇬🇧 English',
                                    'de' => '🇩🇪 Deutsch',
                                    'it' => '🇮🇹 Italiano',
                                    'es' => '🇪🇸 Español',
                                ];
                                foreach ($languages as $code => $label) {
                                    printf(
                                        '<option value="%s" %s>%s</option>',
                                        esc_attr($code),
                                        selected($current_lang, $code, false),
                                        esc_html($label)
                                    );
                                }
                                ?>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="inaricom_dk_locale_currency">Devise</label>
                        </th>
                        <td>
                            <select id="inaricom_dk_locale_currency" name="inaricom_dk_locale_currency">
                                <?php
                                $current_currency = get_option('inaricom_dk_locale_currency', 'CHF');
                                $currencies = [
                                    'CHF' => '🇨🇭 CHF - Franc suisse',
                                    'EUR' => '🇪🇺 EUR - Euro',
                                    'USD' => '🇺🇸 USD - Dollar US',
                                    'GBP' => '🇬🇧 GBP - Livre sterling',
                                ];
                                foreach ($currencies as $code => $label) {
                                    printf(
                                        '<option value="%s" %s>%s</option>',
                                        esc_attr($code),
                                        selected($current_currency, $code, false),
                                        esc_html($label)
                                    );
                                }
                                ?>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="inaricom_dk_exclude_marketplace">Produits Marketplace</label>
                        </th>
                        <td>
                            <label>
                                <input type="checkbox" 
                                       id="inaricom_dk_exclude_marketplace" 
                                       name="inaricom_dk_exclude_marketplace" 
                                       value="yes"
                                       <?php checked(get_option('inaricom_dk_exclude_marketplace', 'yes'), 'yes'); ?>>
                                Exclure les produits Marketplace (vendeurs tiers)
                            </label>
                            <p class="description">
                                <strong>⚠️ Important :</strong> Certains produits populaires (Raspberry Pi, etc.) 
                                sont parfois uniquement disponibles via Marketplace. 
                                <strong>Décochez cette option</strong> si vous ne trouvez pas certains produits.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Enregistrer'); ?>
            </form>
        </div>
        
        <!-- Quick Stats -->
        <div class="inaricom-dk-card full-width">
            <h2>Statistiques</h2>
            <div class="stats-grid">
                <?php
                $linked_products = get_posts([
                    'post_type' => 'product',
                    'meta_key' => '_digikey_part_number',
                    'meta_compare' => 'EXISTS',
                    'posts_per_page' => -1,
                    'fields' => 'ids'
                ]);
                ?>
                <div class="stat-box">
                    <span class="stat-number"><?php echo count($linked_products); ?></span>
                    <span class="stat-label">Produits liés</span>
                </div>
                <div class="stat-box">
                    <span class="stat-number"><?php echo get_option('inaricom_dk_markup_percent', 15); ?>%</span>
                    <span class="stat-label">Marge configurée</span>
                </div>
                <div class="stat-box">
                    <span class="stat-number">
                        <?php 
                        $last_sync = get_option('inaricom_dk_last_sync', 0);
                        echo $last_sync ? date('d/m H:i', $last_sync) : 'Jamais';
                        ?>
                    </span>
                    <span class="stat-label">Dernière sync</span>
                </div>
            </div>
        </div>
        
        <!-- Quick Links -->
        <div class="inaricom-dk-card full-width">
            <h2>Liens rapides</h2>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                <a href="<?php echo admin_url('admin.php?page=inaricom-digikey-search'); ?>" class="button button-primary">
                    🔍 Rechercher produits
                </a>
                <a href="<?php echo admin_url('admin.php?page=inaricom-digikey-sync'); ?>" class="button button-secondary">
                    🔄 Synchronisation
                </a>
                <a href="<?php echo admin_url('admin.php?page=inaricom-digikey-shipping'); ?>" class="button button-secondary">
                    🚚 Configuration livraison
                </a>
            </div>
        </div>
        
    </div>
</div>
