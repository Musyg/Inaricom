<?php
/**
 * Admin Sync Page
 */

if (!defined('ABSPATH')) {
    exit;
}

$api = inaricom_dk()->api;
$has_token = $api && $api->has_valid_token();

// Get linked products
$linked_products = get_posts([
    'post_type' => 'product',
    'meta_key' => '_digikey_part_number',
    'meta_compare' => 'EXISTS',
    'posts_per_page' => -1
]);
?>

<div class="wrap inaricom-dk-admin">
    <h1>
        <span class="dashicons dashicons-update"></span>
        Synchronisation DigiKey
    </h1>
    
    <?php if (!$has_token): ?>
        <div class="notice notice-warning">
            <p>⚠️ Veuillez d'abord <a href="<?php echo admin_url('admin.php?page=inaricom-digikey'); ?>">configurer et autoriser l'API</a>.</p>
        </div>
    <?php else: ?>
    
    <div class="inaricom-dk-grid">
        
        <!-- Sync Actions -->
        <div class="inaricom-dk-card">
            <h2>Actions de synchronisation</h2>
            <p>La synchronisation met à jour les prix et stocks depuis DigiKey.</p>
            
            <div class="sync-actions">
                <button type="button" id="sync-all-btn" class="button button-primary button-large">
                    🔄 Synchroniser tous les produits (<?php echo count($linked_products); ?>)
                </button>
                
                <p class="description">
                    Dernière synchronisation: 
                    <strong>
                        <?php 
                        $last_sync = get_option('inaricom_dk_last_sync', 0);
                        echo $last_sync ? date('d/m/Y H:i:s', $last_sync) : 'Jamais';
                        ?>
                    </strong>
                </p>
            </div>
            
            <div id="sync-progress" style="display: none; margin-top: 20px;">
                <div class="progress-bar">
                    <div class="progress-fill" id="sync-progress-fill"></div>
                </div>
                <p id="sync-status">Synchronisation en cours...</p>
            </div>
        </div>
        
        <!-- Sync Schedule -->
        <div class="inaricom-dk-card">
            <h2>Planification</h2>
            <p>La synchronisation automatique s'exécute toutes les 12 heures.</p>
            
            <?php
            $next_sync = wp_next_scheduled('inaricom_dk_sync_prices');
            ?>
            <p>
                <strong>Prochaine sync automatique:</strong><br>
                <?php echo $next_sync ? date('d/m/Y H:i:s', $next_sync) : 'Non planifiée'; ?>
            </p>
            
            <p>
                <strong>Marge appliquée:</strong> <?php echo get_option('inaricom_dk_markup_percent', 15); ?>%
            </p>
        </div>
        
        <!-- Linked Products -->
        <div class="inaricom-dk-card full-width">
            <h2>Produits liés à DigiKey (<?php echo count($linked_products); ?>)</h2>
            
            <?php if (empty($linked_products)): ?>
                <p>Aucun produit n'est encore lié à DigiKey.</p>
                <p><a href="<?php echo admin_url('admin.php?page=inaricom-digikey-search'); ?>" class="button">
                    ➕ Importer des produits
                </a></p>
            <?php else: ?>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Réf. DigiKey</th>
                            <th>Prix actuel</th>
                            <th>Stock</th>
                            <th>Dernière màj</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($linked_products as $post): 
                            $product = wc_get_product($post->ID);
                            $part_number = get_post_meta($post->ID, '_digikey_part_number', true);
                            $last_update = get_post_meta($post->ID, '_digikey_last_sync', true);
                        ?>
                            <tr data-product-id="<?php echo $post->ID; ?>">
                                <td>
                                    <a href="<?php echo get_edit_post_link($post->ID); ?>">
                                        <?php echo $product->get_name(); ?>
                                    </a>
                                </td>
                                <td>
                                    <code><?php echo esc_html($part_number); ?></code>
                                </td>
                                <td class="product-price">
                                    <?php echo $product->get_price_html(); ?>
                                </td>
                                <td class="product-stock">
                                    <?php 
                                    $stock = $product->get_stock_quantity();
                                    $status = $product->get_stock_status();
                                    echo $stock !== null ? $stock : ($status === 'instock' ? 'En stock' : 'Rupture');
                                    ?>
                                </td>
                                <td class="product-updated">
                                    <?php echo $last_update ? date('d/m H:i', $last_update) : '-'; ?>
                                </td>
                                <td>
                                    <button type="button" class="button sync-single-btn" data-id="<?php echo $post->ID; ?>" data-part="<?php echo esc_attr($part_number); ?>">
                                        🔄 Sync
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
        
    </div>
    
    <?php endif; ?>
</div>

<script>
jQuery(document).ready(function($) {
    
    // Sync all products
    $('#sync-all-btn').on('click', function() {
        const btn = $(this);
        btn.prop('disabled', true);
        
        $('#sync-progress').show();
        
        $.post(inaricomDK.ajaxUrl, {
            action: 'inaricom_dk_sync_all',
            nonce: inaricomDK.nonce
        }, function(response) {
            btn.prop('disabled', false);
            
            if (response.success) {
                $('#sync-status').html('✅ ' + response.data.message);
                $('#sync-progress-fill').css('width', '100%');
                
                // Reload page after 2 seconds
                setTimeout(function() {
                    location.reload();
                }, 2000);
            } else {
                $('#sync-status').html('❌ Erreur: ' + response.data);
            }
        });
    });
    
    // Sync single product
    $('.sync-single-btn').on('click', function() {
        const btn = $(this);
        const productId = btn.data('id');
        const partNumber = btn.data('part');
        const row = btn.closest('tr');
        
        btn.prop('disabled', true).text('⏳');
        
        $.post(inaricomDK.ajaxUrl, {
            action: 'inaricom_dk_sync_single',
            nonce: inaricomDK.nonce,
            product_id: productId,
            part_number: partNumber
        }, function(response) {
            btn.prop('disabled', false).text('🔄 Sync');
            
            if (response.success) {
                const data = response.data;
                row.find('.product-price').html(data.price_html);
                row.find('.product-stock').text(data.stock);
                row.find('.product-updated').text(data.updated);
                row.addClass('updated');
                setTimeout(() => row.removeClass('updated'), 2000);
            } else {
                alert('Erreur: ' + response.data);
            }
        });
    });
    
});
</script>

<style>
.progress-bar {
    width: 100%;
    height: 20px;
    background: #ddd;
    border-radius: 10px;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #E31E24, #FF4D4D);
    width: 0%;
    transition: width 0.5s ease;
}
tr.updated {
    background: rgba(34, 197, 94, 0.1) !important;
}
</style>
