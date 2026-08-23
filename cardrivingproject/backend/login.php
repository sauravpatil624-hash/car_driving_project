<?php
// ============================================================
// LOGIN — DrivePro
// POST: email, password
// Returns JSON with role → frontend redirects to correct dashboard
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); die(json_encode(['success' => false, 'message' => 'Method not allowed'])); }

require_once 'db.php';

// ---- Brute-force protection (time-based, auto-resets after 2 minutes) ----
session_start();

$LOCKOUT_MAX     = 5;       // max failed attempts
$LOCKOUT_SECONDS = 120;     // lockout duration in seconds (2 minutes)

$attempts   = $_SESSION['login_attempts']  ?? 0;
$lockedAt   = $_SESSION['login_locked_at'] ?? null;

// If locked, check if the window has expired
if ($attempts >= $LOCKOUT_MAX && $lockedAt !== null) {
    $elapsed   = time() - $lockedAt;
    $remaining = $LOCKOUT_SECONDS - $elapsed;

    if ($remaining > 0) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => "Too many failed attempts. Please wait {$remaining} second(s) and try again."
        ]);
        exit;
    }

    // Lockout window expired — reset counters automatically
    $_SESSION['login_attempts']  = 0;
    $_SESSION['login_locked_at'] = null;
    $attempts = 0;
}

// ---- Read input ----
$raw      = json_decode(file_get_contents('php://input'), true);
$email    = trim($raw['email']    ?? $_POST['email']    ?? '');
$password =      $raw['password'] ?? $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

// ---- Lookup user ----
$db   = getDB();
$stmt = $db->prepare('SELECT id, name, email, password, mobile, role FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

// ---- Verify password ----
if (!$user || !password_verify($password, $user['password'])) {
    $newAttempts = $attempts + 1;
    $_SESSION['login_attempts'] = $newAttempts;
    // Record when the lockout started (only on the 5th failure)
    if ($newAttempts >= $LOCKOUT_MAX && $lockedAt === null) {
        $_SESSION['login_locked_at'] = time();
    }
    http_response_code(401);
    $remaining_attempts = max(0, $LOCKOUT_MAX - $newAttempts);
    $msg = $remaining_attempts > 0
        ? "Invalid email or password. {$remaining_attempts} attempt(s) remaining."
        : "Too many failed attempts. Please wait 2 minutes and try again.";
    echo json_encode(['success' => false, 'message' => $msg]);
    exit;
}

// Reset attempts on success
$_SESSION['login_attempts']  = 0;
$_SESSION['login_locked_at'] = null;

// ---- Store session ----
$_SESSION['user_id']   = $user['id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_role'] = $user['role'];

// ---- Return safe user data (never return the hashed password) ----
echo json_encode([
    'success'  => true,
    'message'  => 'Login successful!',
    'role'     => $user['role'],             // "user" or "admin"
    'redirect' => $user['role'] === 'admin' ? 'admin.html' : 'dashboard.html',
    'user'     => [
        'id'     => $user['id'],
        'name'   => $user['name'],
        'email'  => $user['email'],
        'mobile' => $user['mobile'],
        'role'   => $user['role'],
    ]
]);
