#!/bin/bash
# Comprendre comment le plugin custom-css-js injecte
grep -rn "readfile\|file_get_contents\|wp_head\|the_content" ~/inaricom.com/web-staging/wp-content/plugins/custom-css-js/includes/ 2>&1 | head -20
