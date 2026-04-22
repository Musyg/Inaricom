#!/bin/bash
F=/home/toriispo/inaricom.com/web-staging/wp-content/uploads/custom-css-js/347.css
echo "=== TAILLE + DATE ==="
ls -la "$F"
echo ""
echo "=== WRAPPER ==="
head -3 "$F"
echo "..."
tail -3 "$F"
echo ""
echo "=== COMPTES SWAP LOGO ==="
echo -n "content: url...Design-sans-titre   : "; grep -c "content: url.*Design-sans-titre" "$F"
echo -n "background-image...Design-sans-titre: "; grep -c "background-image.*Design-sans-titre" "$F"
echo -n ".theme-or img.custom-logo           : "; grep -c "theme-or img.custom-logo" "$F"
echo -n ".theme-neutre img.custom-logo       : "; grep -c "theme-neutre img.custom-logo" "$F"
echo -n ".theme-rouge .site-branding         : "; grep -c "theme-rouge .site-branding .brand" "$F"
echo ""
echo "=== LES 4 contentURL PAR THEME ==="
grep -nE "data-theme=\"(or|bleu|vert|neutre)\" .site-logo img" "$F"
echo ""
echo "=== PATTERN HACK opacity:0 ==="
grep -nE "^\.theme-(or|bleu|vert|neutre) img\.custom-logo," "$F"
echo ""
echo "=== HTML RENDERED VERIF ==="
AUTH='staging:InaStg-Kx7m9vR2@pL'
URL=https://staging.inaricom.com
HTML=$(curl -s -u "$AUTH" "$URL/")
echo -n "Design-sans-titre dans HTML homepage : "; echo "$HTML" | grep -c "Design-sans-titre"
echo -n "section 60e dans HTML                : "; echo "$HTML" | grep -c "60e. LOGO"
echo -n "data-theme=neutre dans body/html     : "; echo "$HTML" | grep -oE 'data-theme="[^"]*"' | head -3
