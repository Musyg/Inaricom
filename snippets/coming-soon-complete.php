
/**
 * HTML de la page Coming Soon
 * CSS inline compact pour eviter les problemes WAF Cloudflare / SwissCenter sur save
 */
function inaricom_coming_soon_html( $logo_url, $contact, $return_date ) {
    ob_start(); ?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Inaricom — Retour <?php echo esc_html( $return_date ); ?></title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0A0A0F;--bg2:#12121A;--red:#E31E24;--red-dark:#B8161B;--text:#F0F0F5;--text-soft:#B6B0B4;--text-muted:#8A8A9A;--border:#2A2A35}
body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;line-height:1.6;overflow-x:hidden}
.bg-gradient{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at top right,rgba(227,30,36,.08),transparent 60%),radial-gradient(ellipse at bottom left,rgba(227,30,36,.04),transparent 70%);z-index:0}
.container{position:relative;z-index:1;max-width:640px;width:100%;text-align:center}
.logo{width:72px;height:72px;margin:0 auto 2.5rem;filter:drop-shadow(0 0 2px rgba(255,255,255,.6))}
.badge{display:inline-block;padding:.35rem .9rem;font-size:.75rem;letter-spacing:.18em;text-transform:uppercase;color:var(--red);border:1px solid rgba(227,30,36,.35);border-radius:999px;margin-bottom:1.75rem;background:rgba(227,30,36,.05)}
h1{font-size:clamp(2rem,5vw,3.25rem);font-weight:600;letter-spacing:-.02em;margin-bottom:1.25rem;line-height:1.15}
h1 .accent{color:var(--red)}
.subtitle{font-size:1.125rem;color:var(--text-soft);margin-bottom:2.5rem;max-width:32rem;margin-left:auto;margin-right:auto}
.card{background:rgba(18,18,22,.6);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:2rem;margin-bottom:2rem}
.card-label{font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:var(--text-muted);margin-bottom:.75rem}
.card-value{font-size:1.25rem;color:var(--text)}
.card a{color:var(--red);text-decoration:none;border-bottom:1px solid rgba(227,30,36,.35);padding-bottom:1px;transition:border-color .2s}
.card a:hover{border-bottom-color:var(--red)}
.signature{margin-top:3rem;color:var(--text-muted);font-size:.875rem;letter-spacing:.05em}
.signature strong{color:var(--red);font-weight:500;letter-spacing:.1em;text-transform:uppercase;font-size:.75rem}
@media(max-width:640px){.container{padding:1rem}.card{padding:1.5rem}}
</style>
</head>
<body>
<div class="bg-gradient"></div>
<main class="container">
<svg class="logo" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="#E31E24" aria-label="Inaricom"><path d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z M32 14 L16 22 L16 42 L32 50 L48 42 L48 22 Z M32 22 L40 26 L40 38 L32 42 L24 38 L24 26 Z"/></svg>
<div class="badge">Red Team Operations</div>
<h1>Retour en <span class="accent"><?php echo esc_html( $return_date ); ?></span><br>avec encore plus de ressources.</h1>
<p class="subtitle">Inaricom refond son offre pour vous proposer un service de cybersecurite et d'IA exploitable, mesurable, souverain. Rendez-vous tres bientot.</p>
<div class="card">
<div class="card-label">Urgence securite uniquement</div>
<div class="card-value"><a href="mailto:<?php echo esc_attr( $contact ); ?>"><?php echo esc_html( $contact ); ?></a></div>
</div>
<div class="signature">— <strong>Your Red Team</strong></div>
</main>
</body>
</html>
<?php
    return ob_get_clean();
}
