/**
 * Inaricom DigiKey Admin JavaScript
 */

(function($) {
    'use strict';
    
    // Wait for document ready
    $(document).ready(function() {
        
        // Toggle password visibility
        $('#inaricom_dk_client_secret').on('focus', function() {
            $(this).attr('type', 'text');
        }).on('blur', function() {
            $(this).attr('type', 'password');
        });
        
        // Confirm before re-authorization
        $('a[href*="oauth2/authorize"]').on('click', function(e) {
            if (!confirm('Vous allez être redirigé vers DigiKey pour autoriser l\'accès. Continuer ?')) {
                e.preventDefault();
            }
        });
        
    });
    
})(jQuery);
