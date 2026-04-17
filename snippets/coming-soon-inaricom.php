<?php
/**
 * Inaricom — Coming Soon (Red Team)
 * Snippets → Ajouter → coller → activer
 *
 * Version : 2026-04-17 (REST API bypass pour WooCommerce MCP)
 * Source : snippet prod Code Snippets, patch minimal 2 lignes REST.
 */
add_action('template_redirect', 'inaricom_custom_coming_soon', 5);

function inaricom_custom_coming_soon() {
    if (get_option('woocommerce_coming_soon') !== 'yes') return;
    if (is_user_logged_in() && current_user_can('manage_options')) return;
    if (isset($_GET['woo-share']) || isset($_COOKIE['woo-share'])) return;
    // Laisser passer les requêtes REST API (WooCommerce MCP, WP REST, etc.)
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false) return;
    if (strpos($_SERVER['REQUEST_URI'], '?rest_route=') !== false) return;
    if (is_admin() || wp_doing_ajax() || wp_doing_cron()) return;
    if (strpos($_SERVER['REQUEST_URI'], 'wp-login') !== false) return;

    header('HTTP/1.1 503 Service Temporarily Unavailable');
    header('Retry-After: 86400');
    header('Content-Type: text/html; charset=UTF-8');

    $custom_logo_id = get_theme_mod('custom_logo');
    $logo_url = $custom_logo_id ? wp_get_attachment_image_url($custom_logo_id, 'medium') : '';
    ?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inaricom</title>
    <meta name="robots" content="noindex, nofollow">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#0A0A0F;--card:rgba(255,255,255,0.03);--border:rgba(255,255,255,0.06);--red:#E31E24;--glow:rgba(227,30,36,0.15);--glow2:rgba(227,30,36,0.3);--text:#EFEBE8;--dim:rgba(239,235,232,0.5);--muted:rgba(239,235,232,0.25)}
        html,body{height:100%}
        body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
        body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);background-size:60px 60px;pointer-events:none}
        body::after{content:'';position:fixed;top:-40%;left:50%;transform:translateX(-50%);width:800px;height:800px;background:radial-gradient(circle,var(--glow),transparent 70%);pointer-events:none}
        .c{position:relative;z-index:1;text-align:center;max-width:600px;padding:2rem}
        .logo{margin-bottom:3rem}
        .logo img{height:60px;width:auto;filter:drop-shadow(0 0 30px var(--glow))}
        .lt{font-size:2.2rem;font-weight:700;letter-spacing:-.03em}
        .lt b{color:var(--red);font-weight:700}
        .badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;background:var(--card);border:1px solid var(--border);font-size:.75rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);margin-bottom:2.5rem;backdrop-filter:blur(10px)}
        .dot{width:6px;height:6px;border-radius:50%;background:var(--red);box-shadow:0 0 8px var(--glow2);animation:p 2s ease-in-out infinite}
        @keyframes p{0%,100%{opacity:1}50%{opacity:.4}}
        h1{font-size:clamp(1.8rem,5vw,3rem);font-weight:700;line-height:1.15;letter-spacing:-.03em;margin-bottom:1.5rem}
        h1 em{font-style:normal;background:linear-gradient(135deg,var(--red),#ff4d52);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .desc{font-size:1.05rem;line-height:1.7;color:var(--dim);font-weight:300}
        .date{display:inline-flex;align-items:center;gap:10px;padding:12px 24px;border-radius:12px;background:var(--card);border:1px solid var(--border);font-family:'JetBrains Mono',monospace;font-size:1rem;font-weight:500;margin:2.5rem 0 3rem;backdrop-filter:blur(10px)}
        .date span{color:var(--red);font-size:1.2rem}
        .sep{width:40px;height:1px;background:linear-gradient(90deg,transparent,var(--red),transparent);margin:0 auto 2rem}
        .sig{font-size:.95rem;color:var(--dim)}
        .sig strong{color:var(--red);font-weight:600}
        .mail{margin-top:2.5rem}
        .mail a{display:inline-flex;align-items:center;gap:8px;color:var(--dim);text-decoration:none;font-family:'JetBrains Mono',monospace;font-size:.85rem;padding:10px 20px;border-radius:10px;background:var(--card);border:1px solid var(--border);backdrop-filter:blur(10px);transition:all .3s}
        .mail a:hover{border-color:var(--red);color:var(--text);box-shadow:0 0 20px var(--glow)}
        .mail svg{width:14px;height:14px;fill:currentColor;flex-shrink:0}
        .f{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);font-size:.7rem;color:var(--muted);letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}
        @media(max-width:600px){.c{padding:1.5rem}.date{font-size:.85rem;padding:10px 18px}}
    </style>
</head>
<body>
<div class="c">
    <div class="logo">
        <?php if ($logo_url): ?>
            <img src="<?php echo esc_url($logo_url); ?>" alt="Inaricom">
        <?php else: ?>
            <span class="lt">INARI<b>COM</b></span>
        <?php endif; ?>
    </div>
    <div class="badge"><span class="dot"></span>En transformation</div>
    <h1>Nous revenons en juillet<br>avec encore plus de <em>moyens</em>.</h1>
    <p class="desc">Inaricom est en pleine transformation.<br>On se retrouve très vite.</p>
    <div class="date"><span>→</span> Juillet 2026</div>
    <div class="sep"></div>
    <p class="sig">— Your <strong>Red Team</strong></p>
    <div class="mail">
        <a href="mailto:security@inaricom.com">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            security@inaricom.com
        </a>
    </div>
</div>
<div class="f">Fribourg, Suisse</div>
</body>
</html>
    <?php exit;
}
