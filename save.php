<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

const DATA_FILE = __DIR__ . '/data.json';
const MIN_TOKEN_LENGTH = 64;

$secretFile = getenv('ISHIKU_SETUP_SECRET_FILE') ?: '/run/secrets/ishiku_setup_secret';
$secret = '';
if (is_readable($secretFile)) {
    $secret = trim((string) file_get_contents($secretFile));
}
if ($secret === '') {
    $secret = trim((string) (getenv('ISHIKU_SETUP_SECRET') ?: getenv('DV2_SHARED_SECRET') ?: ''));
}
$provided = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Nur POST erlaubt.']);
    exit;
}

if ($secret === '' || !is_string($provided) || !hash_equals($secret, $provided)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Ungueltiges Shared Secret.']);
    exit;
}

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Ungueltiger Request.']);
    exit;
}

$payload = json_decode($raw, true, flags: JSON_THROW_ON_ERROR);
$token = $payload['token'] ?? '';
if (!is_string($token) || strlen($token) < MIN_TOKEN_LENGTH || !preg_match('/^[A-Za-z0-9+\/=._:-]+$/', $token)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Token is missing or too short.']);
    exit;
}

$out = json_encode([
    'token' => $token,
    'updated' => gmdate('c'),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

$tmp = DATA_FILE . '.tmp';
if (file_put_contents($tmp, $out, LOCK_EX) === false || !rename($tmp, DATA_FILE)) {
    @unlink($tmp);
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'data.json could not be written.']);
    exit;
}

http_response_code(200);
echo json_encode(['ok' => true, 'updated' => gmdate('c')]);
