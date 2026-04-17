<?php
/**
 * Admin Search Page - Version Pro
 * Features: Bulk import, filters, sorting, duplicate detection, auto sync
 */

if (!defined('ABSPATH')) {
    exit;
}

$api = inaricom_dk()->api;
$has_token = $api && $api->has_valid_token();

// Get existing DigiKey part numbers to detect duplicates
$existing_products = [];
if (class_exists('WooCommerce')) {
    $args = [
        'post_type' => 'product',
        'posts_per_page' => -1,
        'meta_key' => '_digikey_part_number',
        'meta_compare' => 'EXISTS',
        'fields' => 'ids'
    ];
    $products = get_posts($args);
    foreach ($products as $product_id) {
        $dk_part = get_post_meta($product_id, '_digikey_part_number', true);
        if ($dk_part) {
            $existing_products[$dk_part] = $product_id;
        }
    }
}

// Get product categories for filter
$categories = get_terms([
    'taxonomy' => 'product_cat',
    'hide_empty' => false
]);
?>

<div class="wrap inaricom-dk-admin">
    <h1>
        <span class="dashicons dashicons-search"></span>
        Recherche Produits DigiKey
        <span class="title-count" id="dk-selection-count" style="display: none; background: #2271b1; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 14px; margin-left: 10px;">0 sélectionné(s)</span>
    </h1>
    
    <?php if (!$has_token): ?>
        <div class="notice notice-warning">
            <p>⚠️ Veuillez d'abord <a href="<?php echo admin_url('admin.php?page=inaricom-digikey'); ?>">configurer et autoriser l'API</a>.</p>
        </div>
    <?php else: ?>
    
    <div class="inaricom-dk-search-container">
        
        <!-- Search Form -->
        <div class="inaricom-dk-card">
            <h2>🔍 Rechercher un produit</h2>
            <div class="search-form" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;">
                <div>
                    <label for="dk-search-input"><strong>Mot-clé</strong></label><br>
                    <input type="text" 
                           id="dk-search-input" 
                           class="regular-text" 
                           placeholder="Jetson Orin, Raspberry Pi..."
                           style="width: 300px;">
                </div>
                <div>
                    <label for="dk-search-limit"><strong>Limite</strong></label><br>
                    <select id="dk-search-limit">
                        <option value="25">25</option>
                        <option value="50" selected>50</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <div>
                    <label for="dk-filter-manufacturer"><strong>Fabricant</strong></label><br>
                    <select id="dk-filter-manufacturer" style="min-width: 150px;">
                        <option value="">Tous</option>
                    </select>
                </div>
                <div>
                    <label for="dk-filter-price-min"><strong>Prix min</strong></label><br>
                    <input type="number" id="dk-filter-price-min" style="width: 80px;" placeholder="0">
                </div>
                <div>
                    <label for="dk-filter-price-max"><strong>Prix max</strong></label><br>
                    <input type="number" id="dk-filter-price-max" style="width: 80px;" placeholder="∞">
                </div>
                <div>
                    <button type="button" id="dk-search-btn" class="button button-primary button-large">
                        🔍 Rechercher
                    </button>
                </div>
            </div>
            
            <div class="search-suggestions" style="margin-top: 15px;">
                <strong>Suggestions :</strong>
                <button type="button" class="suggestion-tag" data-search="Jetson Orin">Jetson Orin</button>
                <button type="button" class="suggestion-tag" data-search="Jetson AGX">Jetson AGX</button>
                <button type="button" class="suggestion-tag" data-search="Raspberry Pi 5">Raspberry Pi 5</button>
                <button type="button" class="suggestion-tag" data-search="Coral USB">Coral USB</button>
                <button type="button" class="suggestion-tag" data-search="Hailo-8">Hailo-8</button>
                <button type="button" class="suggestion-tag" data-search="NVIDIA">NVIDIA</button>
                <button type="button" class="suggestion-tag" data-search="Intel Neural">Intel Neural</button>
            </div>
        </div>
        
        <!-- Results -->
        <div class="inaricom-dk-card" id="dk-results-container" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <h2 style="margin: 0;">Résultats <span id="dk-results-count"></span></h2>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <label>Trier par:</label>
                    <select id="dk-sort-by">
                        <option value="relevance">Pertinence</option>
                        <option value="price-asc">Prix ↑</option>
                        <option value="price-desc">Prix ↓</option>
                        <option value="stock-desc">Stock ↓</option>
                        <option value="name-asc">Nom A-Z</option>
                    </select>
                    <label style="margin-left: 15px;">
                        <input type="checkbox" id="dk-hide-imported"> Masquer déjà importés
                    </label>
                </div>
            </div>
            
            <!-- Bulk Actions -->
            <div id="dk-bulk-actions" style="margin: 15px 0; padding: 10px; background: #f0f0f1; border-radius: 4px; display: none;">
                <label>
                    <input type="checkbox" id="dk-select-all"> <strong>Tout sélectionner</strong>
                </label>
                <span style="margin: 0 15px;">|</span>
                <label for="dk-bulk-category">Catégorie:</label>
                <?php
                wp_dropdown_categories([
                    'taxonomy' => 'product_cat',
                    'name' => 'bulk_category',
                    'id' => 'dk-bulk-category',
                    'show_option_none' => '-- Sélectionner --',
                    'hide_empty' => false
                ]);
                ?>
                <button type="button" id="dk-bulk-import-btn" class="button button-primary" style="margin-left: 10px;">
                    📦 Importer la sélection (<span id="dk-bulk-count">0</span>)
                </button>
            </div>
            
            <div id="dk-results-loading" style="display: none; padding: 20px; text-align: center;">
                <span class="spinner is-active" style="float: none;"></span> Recherche en cours...
            </div>
            
            <div id="dk-results-scroll" style="max-height: 700px; overflow-y: auto; display: none;">
                <table class="wp-list-table widefat fixed striped" id="dk-results-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;"><input type="checkbox" id="dk-select-all-header"></th>
                            <th style="width: 70px;">Image</th>
                            <th style="width: 200px;">Référence</th>
                            <th>Description</th>
                            <th style="width: 100px;">Prix CHF</th>
                            <th style="width: 70px;">Stock</th>
                            <th style="width: 130px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="dk-results-body">
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Import Modal -->
        <div id="dk-import-modal" class="inaricom-dk-modal" style="display: none;">
            <div class="modal-content" style="max-width: 600px;">
                <span class="modal-close">&times;</span>
                <h2>📦 Importer le produit</h2>
                <div id="dk-import-preview"></div>
                <form id="dk-import-form">
                    <input type="hidden" name="part_number" id="import-part-number">
                    <input type="hidden" name="product_data" id="import-product-data">
                    <table class="form-table">
                        <tr>
                            <th>Nom du produit</th>
                            <td><input type="text" name="product_name" id="import-product-name" class="regular-text" style="width: 100%;"></td>
                        </tr>
                        <tr>
                            <th>Prix final (avec marge)</th>
                            <td>
                                <input type="number" name="final_price" id="import-final-price" class="small-text" step="0.01"> CHF
                                <p class="description">Prix DigiKey + <?php echo get_option('inaricom_dk_markup_percent', 15); ?>% de marge</p>
                            </td>
                        </tr>
                        <tr>
                            <th>Catégorie</th>
                            <td>
                                <?php
                                wp_dropdown_categories([
                                    'taxonomy' => 'product_cat',
                                    'name' => 'product_category',
                                    'id' => 'import-category',
                                    'show_option_none' => '-- Sélectionner --',
                                    'hide_empty' => false
                                ]);
                                ?>
                            </td>
                        </tr>
                    </table>
                    <p>
                        <button type="submit" class="button button-primary button-large">
                            ✅ Créer le produit WooCommerce
                        </button>
                    </p>
                </form>
            </div>
        </div>
        
        <!-- Bulk Import Progress Modal -->
        <div id="dk-bulk-modal" class="inaricom-dk-modal" style="display: none;">
            <div class="modal-content" style="max-width: 500px;">
                <h2>📦 Import en masse</h2>
                <div id="dk-bulk-progress">
                    <div style="background: #f0f0f1; border-radius: 4px; height: 30px; margin: 20px 0;">
                        <div id="dk-bulk-progress-bar" style="background: #2271b1; height: 100%; border-radius: 4px; width: 0%; transition: width 0.3s;"></div>
                    </div>
                    <p id="dk-bulk-status" style="text-align: center;">Préparation...</p>
                </div>
                <div id="dk-bulk-results" style="display: none; max-height: 300px; overflow-y: auto;">
                    <h3>Résultats</h3>
                    <ul id="dk-bulk-results-list"></ul>
                </div>
                <p style="text-align: center; margin-top: 20px;">
                    <button type="button" id="dk-bulk-close" class="button" style="display: none;">Fermer</button>
                </p>
            </div>
        </div>
        
    </div>
    
    <?php endif; ?>
</div>

<style>
.suggestion-tag {
    background: #f0f0f1;
    border: 1px solid #c3c4c7;
    border-radius: 3px;
    padding: 5px 10px;
    margin: 2px;
    cursor: pointer;
}
.suggestion-tag:hover {
    background: #2271b1;
    color: #fff;
    border-color: #2271b1;
}
.inaricom-dk-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
}
.modal-content {
    background: #fff;
    padding: 20px 30px;
    border-radius: 8px;
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}
.modal-close {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 24px;
    cursor: pointer;
    color: #666;
}
.modal-close:hover {
    color: #000;
}
.in-stock { color: #00a32a; font-weight: bold; }
.out-of-stock { color: #d63638; }
.already-imported { 
    background: #d4edda !important; 
}
.already-imported td {
    opacity: 0.7;
}
.badge-imported {
    display: inline-block;
    background: #00a32a;
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 3px;
    margin-left: 5px;
}
.badge-new {
    display: inline-block;
    background: #2271b1;
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 3px;
    margin-left: 5px;
}
#dk-results-body tr:hover {
    background: #f6f7f7;
}
.product-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
}
</style>

<script>
jQuery(document).ready(function($) {
    const markup = <?php echo get_option('inaricom_dk_markup_percent', 15); ?>;
    const existingProducts = <?php echo json_encode($existing_products); ?>;
    
    let searchResults = [];
    let filteredResults = [];
    let selectedProducts = new Set();
    
    // Escape HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Generate better product title
    function generateTitle(product) {
        // Priority: description > manufacturer + part number
        if (product.description && product.description.length > 5) {
            // Clean up description for title
            let title = product.description;
            // Capitalize first letter of each word
            title = title.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
            // Limit length
            if (title.length > 80) {
                title = title.substring(0, 77) + '...';
            }
            return title;
        }
        return (product.manufacturer || 'Product') + ' ' + (product.manufacturerPartNumber || product.partNumber || '');
    }
    
    // Check if product already imported
    function isImported(partNumber) {
        return existingProducts.hasOwnProperty(partNumber);
    }
    
    // Get edit URL for existing product
    function getEditUrl(partNumber) {
        if (existingProducts[partNumber]) {
            return '<?php echo admin_url('post.php?action=edit&post='); ?>' + existingProducts[partNumber];
        }
        return null;
    }
    
    // Sort products
    function sortProducts(products, sortBy) {
        const sorted = [...products];
        switch(sortBy) {
            case 'price-asc':
                sorted.sort((a, b) => (parseFloat(a.unitPrice) || 0) - (parseFloat(b.unitPrice) || 0));
                break;
            case 'price-desc':
                sorted.sort((a, b) => (parseFloat(b.unitPrice) || 0) - (parseFloat(a.unitPrice) || 0));
                break;
            case 'stock-desc':
                sorted.sort((a, b) => (parseInt(b.quantityAvailable) || 0) - (parseInt(a.quantityAvailable) || 0));
                break;
            case 'name-asc':
                sorted.sort((a, b) => (a.description || '').localeCompare(b.description || ''));
                break;
        }
        return sorted;
    }
    
    // Filter products
    function filterProducts(products) {
        let filtered = [...products];
        
        // Manufacturer filter
        const mfr = $('#dk-filter-manufacturer').val();
        if (mfr) {
            filtered = filtered.filter(p => p.manufacturer === mfr);
        }
        
        // Price filter
        const minPrice = parseFloat($('#dk-filter-price-min').val()) || 0;
        const maxPrice = parseFloat($('#dk-filter-price-max').val()) || Infinity;
        filtered = filtered.filter(p => {
            const price = (parseFloat(p.unitPrice) || 0) * (1 + markup / 100);
            return price >= minPrice && price <= maxPrice;
        });
        
        // Hide imported
        if ($('#dk-hide-imported').is(':checked')) {
            filtered = filtered.filter(p => !isImported(p.partNumber));
        }
        
        return filtered;
    }
    
    // Render results
    function renderResults() {
        const sortBy = $('#dk-sort-by').val();
        filteredResults = filterProducts(searchResults);
        filteredResults = sortProducts(filteredResults, sortBy);
        
        const tbody = $('#dk-results-body');
        tbody.empty();
        selectedProducts.clear();
        updateSelectionCount();
        
        if (filteredResults.length === 0) {
            tbody.append('<tr><td colspan="7">Aucun résultat trouvé</td></tr>');
            $('#dk-bulk-actions').hide();
            return;
        }
        
        $('#dk-bulk-actions').show();
        
        // Populate manufacturer filter
        const manufacturers = [...new Set(searchResults.map(p => p.manufacturer).filter(Boolean))].sort();
        const currentMfr = $('#dk-filter-manufacturer').val();
        $('#dk-filter-manufacturer').html('<option value="">Tous</option>');
        manufacturers.forEach(mfr => {
            $('#dk-filter-manufacturer').append($('<option></option>').val(mfr).text(mfr));
        });
        $('#dk-filter-manufacturer').val(currentMfr);
        
        filteredResults.forEach(function(product, index) {
            const price = parseFloat(product.unitPrice) || 0;
            const priceWithMarkup = (price * (1 + markup / 100)).toFixed(2);
            const stock = parseInt(product.quantityAvailable) || 0;
            const stockClass = stock > 0 ? 'in-stock' : 'out-of-stock';
            const imported = isImported(product.partNumber);
            
            const row = $('<tr></tr>');
            if (imported) {
                row.addClass('already-imported');
            }
            row.attr('data-index', index);
            
            // Checkbox
            const checkCell = $('<td></td>');
            if (!imported) {
                const checkbox = $('<input type="checkbox" class="product-checkbox">')
                    .attr('data-index', index);
                checkCell.append(checkbox);
            } else {
                checkCell.html('<span style="color: #00a32a;">✓</span>');
            }
            row.append(checkCell);
            
            // Image
            row.append($('<td></td>').html(
                product.imageUrl 
                    ? '<img src="' + escapeHtml(product.imageUrl) + '" style="max-width: 50px; max-height: 50px;">' 
                    : '-'
            ));
            
            // Reference + Badge
            let refHtml = '<strong>' + escapeHtml(product.partNumber) + '</strong>';
            if (imported) {
                refHtml += '<span class="badge-imported">Importé</span>';
            }
            refHtml += '<br><small>' + escapeHtml(product.manufacturer) + '</small>';
            if (product.manufacturerPartNumber && product.manufacturerPartNumber !== product.partNumber) {
                refHtml += '<br><small style="color: #666;">' + escapeHtml(product.manufacturerPartNumber) + '</small>';
            }
            row.append($('<td></td>').html(refHtml));
            
            // Description
            let descHtml = escapeHtml(product.description);
            if (product.category) {
                descHtml += '<br><small style="color: #2271b1;">📁 ' + escapeHtml(product.category) + '</small>';
            }
            row.append($('<td></td>').html(descHtml));
            
            // Price
            row.append($('<td></td>').html(
                '<strong>' + priceWithMarkup + '</strong><br>' +
                '<small style="color: #666;">(' + price.toFixed(2) + ' + ' + markup + '%)</small>'
            ));
            
            // Stock + Lead time
            let stockHtml = '<span class="' + stockClass + '">' + stock + '</span>';
            if (stock === 0 && product.manufacturerLeadWeeks) {
                stockHtml += '<br><small style="color: #856404;">⏳ ' + product.manufacturerLeadWeeks + ' sem.</small>';
            } else if (stock > 0) {
                stockHtml += '<br><small style="color: #28a745;">🚚 2-4j</small>';
            }
            if (product.shippingEstimate && product.shippingEstimate.message) {
                stockHtml += '<br><small style="color: #666;">' + escapeHtml(product.shippingEstimate.message) + '</small>';
            }
            row.append($('<td></td>').html(stockHtml));
            
            // Actions
            const actionsCell = $('<td></td>');
            if (imported) {
                const editBtn = $('<a class="button button-small">✏️ Éditer</a>')
                    .attr('href', getEditUrl(product.partNumber))
                    .attr('target', '_blank');
                actionsCell.append(editBtn);
            } else {
                const importBtn = $('<button type="button" class="button button-small button-primary import-btn">➕</button>')
                    .attr('data-index', index)
                    .attr('title', 'Importer');
                actionsCell.append(importBtn);
            }
            
            if (product.datasheetUrl) {
                const datasheetBtn = $('<a class="button button-small" title="Datasheet">📄</a>')
                    .attr('href', product.datasheetUrl)
                    .attr('target', '_blank')
                    .css('margin-left', '3px');
                actionsCell.append(datasheetBtn);
            }
            
            row.append(actionsCell);
            tbody.append(row);
        });
        
        $('#dk-results-count').text('(' + filteredResults.length + '/' + searchResults.length + ')');
    }
    
    // Update selection count
    function updateSelectionCount() {
        const count = selectedProducts.size;
        $('#dk-bulk-count').text(count);
        $('#dk-selection-count').text(count + ' sélectionné(s)').toggle(count > 0);
        $('#dk-bulk-import-btn').prop('disabled', count === 0);
    }
    
    // Search function
    function searchDigiKey() {
        const keyword = $('#dk-search-input').val();
        const limit = $('#dk-search-limit').val();
        
        if (!keyword) {
            alert('Veuillez entrer un mot-clé');
            return;
        }
        
        $('#dk-results-container').show();
        $('#dk-results-loading').show();
        $('#dk-results-scroll').hide();
        $('#dk-bulk-actions').hide();
        searchResults = [];
        selectedProducts.clear();
        
        $.ajax({
            url: inaricomDK.restUrl + 'search',
            method: 'POST',
            headers: { 'X-WP-Nonce': inaricomDK.nonce },
            data: JSON.stringify({ keyword: keyword, limit: parseInt(limit) }),
            contentType: 'application/json',
            success: function(response) {
                $('#dk-results-loading').hide();
                
                if (response.error) {
                    alert('Erreur: ' + response.error);
                    return;
                }
                
                searchResults = response.products || [];
                renderResults();
                $('#dk-results-scroll').show();
            },
            error: function(xhr) {
                $('#dk-results-loading').hide();
                alert('Erreur de recherche: ' + (xhr.responseJSON?.message || xhr.responseText));
            }
        });
    }
    
    // Event: Search
    $('#dk-search-btn').on('click', searchDigiKey);
    $('#dk-search-input').on('keypress', function(e) {
        if (e.which === 13) searchDigiKey();
    });
    
    // Event: Suggestions
    $('.suggestion-tag').on('click', function() {
        $('#dk-search-input').val($(this).data('search'));
        searchDigiKey();
    });
    
    // Event: Sort & Filter
    $('#dk-sort-by, #dk-filter-manufacturer, #dk-hide-imported').on('change', renderResults);
    $('#dk-filter-price-min, #dk-filter-price-max').on('input', function() {
        clearTimeout(window.priceFilterTimeout);
        window.priceFilterTimeout = setTimeout(renderResults, 500);
    });
    
    // Event: Checkbox selection
    $(document).on('change', '.product-checkbox', function() {
        const index = parseInt($(this).attr('data-index'));
        if ($(this).is(':checked')) {
            selectedProducts.add(index);
        } else {
            selectedProducts.delete(index);
        }
        updateSelectionCount();
    });
    
    // Event: Select all
    $('#dk-select-all, #dk-select-all-header').on('change', function() {
        const checked = $(this).is(':checked');
        $('#dk-select-all, #dk-select-all-header').prop('checked', checked);
        
        $('.product-checkbox').each(function() {
            $(this).prop('checked', checked);
            const index = parseInt($(this).attr('data-index'));
            if (checked) {
                selectedProducts.add(index);
            } else {
                selectedProducts.delete(index);
            }
        });
        updateSelectionCount();
    });
    
    // Event: Single import modal
    $(document).on('click', '.import-btn', function() {
        const index = parseInt($(this).attr('data-index'));
        const product = filteredResults[index];
        
        if (!product) {
            alert('Erreur: produit non trouvé');
            return;
        }
        
        const price = parseFloat(product.unitPrice) || 0;
        const priceWithMarkup = (price * (1 + markup / 100)).toFixed(2);
        const stock = parseInt(product.quantityAvailable) || 0;
        const title = generateTitle(product);
        
        $('#import-part-number').val(product.partNumber || '');
        $('#import-product-name').val(title);
        $('#import-final-price').val(priceWithMarkup);
        $('#import-product-data').val(JSON.stringify(product));
        
        let previewHtml = '<div style="display: flex; gap: 20px; margin-bottom: 20px;">';
        if (product.imageUrl) {
            previewHtml += '<img src="' + escapeHtml(product.imageUrl) + '" style="max-width: 100px; max-height: 100px; object-fit: contain;">';
        }
        previewHtml += '<div>';
        previewHtml += '<strong>' + escapeHtml(product.partNumber) + '</strong><br>';
        previewHtml += '<span style="color: #666;">' + escapeHtml(product.manufacturer) + '</span><br>';
        previewHtml += escapeHtml(product.description) + '<br>';
        previewHtml += '<small>Stock DigiKey: ' + stock + '</small>';
        previewHtml += '</div></div>';
        
        $('#dk-import-preview').html(previewHtml);
        $('#dk-import-modal').show();
    });
    
    // Event: Close modals
    $('.modal-close').on('click', function() {
        $(this).closest('.inaricom-dk-modal').hide();
    });
    $(document).on('click', '.inaricom-dk-modal', function(e) {
        if (e.target === this) $(this).hide();
    });
    
    // Event: Single import submit
    $('#dk-import-form').on('submit', function(e) {
        e.preventDefault();
        
        const $btn = $(this).find('button[type="submit"]');
        $btn.text('⏳ Création...').prop('disabled', true);
        
        $.post(inaricomDK.ajaxUrl, {
            action: 'inaricom_dk_import_product',
            nonce: inaricomDK.ajaxNonce,
            part_number: $('#import-part-number').val(),
            product_name: $('#import-product-name').val(),
            final_price: $('#import-final-price').val(),
            category: $('#import-category').val(),
            product_data: $('#import-product-data').val()
        }, function(response) {
            $btn.text('✅ Créer le produit WooCommerce').prop('disabled', false);
            
            if (response.success) {
                // Add to existing products
                const partNumber = $('#import-part-number').val();
                existingProducts[partNumber] = response.data.product_id;
                
                alert('✅ Produit créé avec succès !');
                $('#dk-import-modal').hide();
                renderResults(); // Refresh to show "imported" badge
                
                if (response.data?.edit_url) {
                    window.open(response.data.edit_url, '_blank');
                }
            } else {
                alert('❌ Erreur: ' + (response.data || 'Erreur inconnue'));
            }
        }).fail(function() {
            $btn.text('✅ Créer le produit WooCommerce').prop('disabled', false);
            alert('❌ Erreur de connexion');
        });
    });
    
    // Event: Bulk import
    $('#dk-bulk-import-btn').on('click', async function() {
        const category = $('#dk-bulk-category').val();
        if (!category || category === '-1') {
            alert('Veuillez sélectionner une catégorie pour l\'import en masse');
            return;
        }
        
        const toImport = Array.from(selectedProducts).map(i => filteredResults[i]).filter(Boolean);
        if (toImport.length === 0) {
            alert('Aucun produit sélectionné');
            return;
        }
        
        if (!confirm('Importer ' + toImport.length + ' produit(s) dans la catégorie sélectionnée ?')) {
            return;
        }
        
        // Show progress modal
        $('#dk-bulk-modal').show();
        $('#dk-bulk-progress').show();
        $('#dk-bulk-results').hide();
        $('#dk-bulk-close').hide();
        
        const results = [];
        let success = 0, failed = 0;
        
        for (let i = 0; i < toImport.length; i++) {
            const product = toImport[i];
            const progress = Math.round(((i + 1) / toImport.length) * 100);
            
            $('#dk-bulk-progress-bar').css('width', progress + '%');
            $('#dk-bulk-status').text('Import ' + (i + 1) + '/' + toImport.length + ': ' + (product.partNumber || 'produit'));
            
            try {
                const response = await $.post(inaricomDK.ajaxUrl, {
                    action: 'inaricom_dk_import_product',
                    nonce: inaricomDK.ajaxNonce,
                    part_number: product.partNumber,
                    product_name: generateTitle(product),
                    final_price: (parseFloat(product.unitPrice || 0) * (1 + markup / 100)).toFixed(2),
                    category: category,
                    product_data: JSON.stringify(product)
                });
                
                if (response.success) {
                    success++;
                    existingProducts[product.partNumber] = response.data.product_id;
                    results.push({ product: product.partNumber, status: 'success', message: 'Créé' });
                } else {
                    failed++;
                    results.push({ product: product.partNumber, status: 'error', message: response.data || 'Erreur' });
                }
            } catch (err) {
                failed++;
                results.push({ product: product.partNumber, status: 'error', message: 'Erreur réseau' });
            }
            
            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Show results
        $('#dk-bulk-status').text('Terminé ! ' + success + ' succès, ' + failed + ' échec(s)');
        
        const resultsList = $('#dk-bulk-results-list');
        resultsList.empty();
        results.forEach(r => {
            const icon = r.status === 'success' ? '✅' : '❌';
            resultsList.append('<li>' + icon + ' ' + escapeHtml(r.product) + ' - ' + escapeHtml(r.message) + '</li>');
        });
        
        $('#dk-bulk-results').show();
        $('#dk-bulk-close').show();
        
        // Refresh results table
        selectedProducts.clear();
        renderResults();
    });
    
    // Event: Close bulk modal
    $('#dk-bulk-close').on('click', function() {
        $('#dk-bulk-modal').hide();
    });
});
</script>
