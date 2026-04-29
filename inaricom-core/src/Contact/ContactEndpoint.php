<?php
/**
 * ContactEndpoint — endpoint REST custom pour le formulaire de contact React island.
 *
 * Bypasse WPForms (qui imposait son styling cyan + html WordPress).
 * Le React form (contact.tsx) POST en JSON, on valide + envoie un email + reponse JSON.
 *
 * Endpoint : POST /wp-json/inaricom/v1/contact
 * Body JSON : { firstname, lastname, email, subject, message, structure, honeypot }
 * Headers   : X-WP-Nonce (nonce wp_rest cree cote front via wp_create_nonce('wp_rest'))
 *
 * Securite :
 * - Nonce WP REST verifie automatiquement par permission_callback custom
 * - Rate limit basique : 3 messages / 10min / IP via transients
 * - Honeypot : si le champ 'honeypot' est rempli, on simule un succes mais on ne fait rien
 * - Sanitization stricte par champ
 * - Email destinataire : option WP 'inaricom_contact_recipient' avec fallback admin_email
 *
 * @package Inaricom\Core\Contact
 */

declare(strict_types=1);

namespace Inaricom\Core\Contact;

if (!defined('ABSPATH')) {
    exit;
}

final class ContactEndpoint
{
    private const NAMESPACE = 'inaricom/v1';
    private const ROUTE = '/contact';

    private const RATE_LIMIT_MAX = 3;
    private const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 min

    public function register(): void
    {
        add_action('rest_api_init', [$this, 'register_route']);
    }

    public function register_route(): void
    {
        register_rest_route(
            self::NAMESPACE,
            self::ROUTE,
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'handle_submission'],
                'permission_callback' => [$this, 'check_permission'],
                'args'                => $this->get_args_schema(),
            ]
        );
    }

    /**
     * Permission : public, mais on verifie le nonce WP REST manuellement
     * pour garantir que la requete vient bien de notre frontend.
     */
    public function check_permission(\WP_REST_Request $request): bool
    {
        $nonce = $request->get_header('X-WP-Nonce') ?? $request->get_header('x_wp_nonce');
        if (!$nonce) {
            return false;
        }
        return (bool) wp_verify_nonce($nonce, 'wp_rest');
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function get_args_schema(): array
    {
        return [
            'firstname' => [
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => fn($v) => is_string($v) && strlen(trim($v)) > 0 && strlen($v) <= 100,
            ],
            'lastname' => [
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => fn($v) => is_string($v) && strlen(trim($v)) > 0 && strlen($v) <= 100,
            ],
            'email' => [
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_email',
                'validate_callback' => fn($v) => is_string($v) && is_email($v),
            ],
            'subject' => [
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => fn($v) => is_string($v) && strlen(trim($v)) > 0 && strlen($v) <= 200,
            ],
            'message' => [
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_textarea_field',
                'validate_callback' => fn($v) => is_string($v) && strlen(trim($v)) >= 10 && strlen($v) <= 5000,
            ],
            'structure' => [
                'required'          => false,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => fn($v) => in_array($v, ['', 'particulier', 'independant', 'tpe', 'pme', 'autre'], true),
                'default'           => '',
            ],
            'honeypot' => [
                'required'          => false,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            ],
        ];
    }

    /**
     * Handle POST submission.
     */
    public function handle_submission(\WP_REST_Request $request): \WP_REST_Response
    {
        $params = $request->get_json_params() ?: $request->get_params();

        // Honeypot : si le champ est rempli, on fait semblant de succeder
        // (les bots croient avoir gagne, on log + drop)
        if (!empty($params['honeypot'])) {
            error_log('[Inaricom contact] Honeypot triggered, IP=' . $this->get_client_ip());
            return new \WP_REST_Response(['success' => true, 'spam_drop' => true], 200);
        }

        // Rate limit par IP
        $ip_key = 'inari_contact_ratelimit_' . md5($this->get_client_ip());
        $count = (int) get_transient($ip_key);
        if ($count >= self::RATE_LIMIT_MAX) {
            return new \WP_REST_Response(
                [
                    'success' => false,
                    'code'    => 'rate_limited',
                    'message' => 'Trop de messages envoyes. Reessayez dans quelques minutes.',
                ],
                429
            );
        }
        set_transient($ip_key, $count + 1, self::RATE_LIMIT_WINDOW_SECONDS);

        // Sanitize already done par validate_callback / sanitize_callback
        $firstname = (string) ($params['firstname'] ?? '');
        $lastname  = (string) ($params['lastname'] ?? '');
        $email     = (string) ($params['email'] ?? '');
        $subject   = (string) ($params['subject'] ?? '');
        $message   = (string) ($params['message'] ?? '');
        $structure = (string) ($params['structure'] ?? '');

        // Compose email
        $recipient = (string) get_option('inaricom_contact_recipient', '');
        if (!is_email($recipient)) {
            $recipient = (string) get_option('admin_email', '');
        }
        if (!is_email($recipient)) {
            return new \WP_REST_Response(
                [
                    'success' => false,
                    'code'    => 'no_recipient',
                    'message' => 'Configuration serveur invalide.',
                ],
                500
            );
        }

        $structure_label = $this->structure_label($structure);
        $email_subject = sprintf('[Inaricom contact] %s', wp_strip_all_tags($subject));
        $email_body = sprintf(
            "Nouveau message via le formulaire de contact Inaricom.\n\n" .
                "Prenom : %s\n" .
                "Nom : %s\n" .
                "Email : %s\n" .
                "Structure : %s\n" .
                "Sujet : %s\n\n" .
                "Message :\n%s\n\n" .
                "---\n" .
                "Soumis depuis : %s\n" .
                "IP (anonymisee) : %s\n" .
                "User-Agent : %s\n",
            $firstname,
            $lastname,
            $email,
            $structure_label !== '' ? $structure_label : 'Non specifiee',
            $subject,
            $message,
            esc_url(home_url('/contact/')),
            $this->anonymize_ip($this->get_client_ip()),
            substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown'), 0, 200)
        );

        $headers = [
            sprintf('Reply-To: %s <%s>', $firstname . ' ' . $lastname, $email),
            'Content-Type: text/plain; charset=UTF-8',
        ];

        $sent = wp_mail($recipient, $email_subject, $email_body, $headers);

        if (!$sent) {
            error_log('[Inaricom contact] wp_mail failed for ' . $email);
            return new \WP_REST_Response(
                [
                    'success' => false,
                    'code'    => 'send_failed',
                    'message' => 'L\'envoi a echoue. Reessayez ou contactez-nous directement.',
                ],
                500
            );
        }

        // Hook pour CRM/log custom plus tard
        do_action('inaricom_contact_submitted', [
            'firstname' => $firstname,
            'lastname'  => $lastname,
            'email'     => $email,
            'subject'   => $subject,
            'message'   => $message,
            'structure' => $structure,
        ]);

        return new \WP_REST_Response(
            [
                'success' => true,
                'message' => 'Message envoye. Reponse sous 48h ouvres.',
            ],
            200
        );
    }

    /**
     * Map structure key -> label lisible humain.
     */
    private function structure_label(string $key): string
    {
        $map = [
            'particulier'  => 'Particulier',
            'independant'  => 'Independant / freelance',
            'tpe'          => 'TPE (1-9 salaries)',
            'pme'          => 'PME (10-249 salaries)',
            'autre'        => 'Autre (association, collectivite, autre)',
        ];
        return $map[$key] ?? '';
    }

    /**
     * Get client IP en respectant Cloudflare / proxies.
     * Reutilise la logique du plugin inaricom-security qui fait pareil.
     */
    private function get_client_ip(): string
    {
        $candidates = [
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_REAL_IP',
            'HTTP_X_FORWARDED_FOR',
            'REMOTE_ADDR',
        ];
        foreach ($candidates as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = trim(explode(',', (string) $_SERVER[$key])[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        return '0.0.0.0';
    }

    /**
     * Tronque les 2 derniers octets IPv4 / le suffixe IPv6 pour log RGPD-friendly.
     */
    private function anonymize_ip(string $ip): string
    {
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $parts = explode('.', $ip);
            $parts[2] = 'x';
            $parts[3] = 'x';
            return implode('.', $parts);
        }
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $parts = explode(':', $ip);
            return implode(':', array_slice($parts, 0, 4)) . ':xxxx:xxxx:xxxx:xxxx';
        }
        return 'unknown';
    }
}
