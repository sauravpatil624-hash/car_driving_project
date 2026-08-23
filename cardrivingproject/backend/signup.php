<?php
// ============================================================
// SIGNUP — DrivePro
// POST: name, email, password, mobile
// Returns JSON response
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); die(json_encode(['success' => false, 'message' => 'Method not allowed'])); }

require_once 'db.php';

// ---- Read + sanitise input ----
$raw = json_decode(file_get_contents('php://input'), true);

// Support both JSON body AND form-encoded body
$name     = trim($raw['name']     ?? $_POST['name']     ?? '');
$email    = trim($raw['email']    ?? $_POST['email']    ?? '');
$password =      $raw['password'] ?? $_POST['password'] ?? '';
$mobile   = trim($raw['mobile']   ?? $_POST['mobile']   ?? '');

// ---- Server-side validation ----
$errors = [];

if (empty($name) || !preg_match('/^[a-zA-Z\s]{2,50}$/', $name)) {
    $errors[] = 'Name must be 2–50 letters only.';
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Enter a valid email address.';
}
if (strlen($password) < 6) {
    $errors[] = 'Password must be at least 6 characters.';
}
if (!empty($mobile) && !preg_match('/^\d{10}$/', $mobile)) {
    $errors[] = 'Mobile must be a 10-digit number.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ---- Check if email already exists ----
$db   = getDB();
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);

if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email is already registered.']);
    exit;
}

// ---- Hash password and insert user ----
$hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

$insert = $db->prepare(
    'INSERT INTO users (name, email, password, mobile, role, created_at)
     VALUES (?, ?, ?, ?, "user", NOW())'
);
$insert->execute([$name, $email, $hashedPassword, $mobile]);

$userId = $db->lastInsertId();

echo json_encode([
    'success' => true,
    'message' => 'Account created successfully! Please login.',
    'user'    => ['id' => $userId, 'name' => $name, 'email' => $email]
]);
