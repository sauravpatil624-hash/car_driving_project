<?php
// ============================================================
// EMERGENCY SESSION RESET — DrivePro
// Use when locked out by "Too many failed attempts"
// Visit: http://localhost/cardrivingproject/backend/reset_session.php
// DELETE this file after use!
// ============================================================
session_start();

$before_attempts = $_SESSION['login_attempts'] ?? 0;
$before_locked = $_SESSION['login_locked_at'] ?? null;

$_SESSION['login_attempts'] = 0;
$_SESSION['login_locked_at'] = null;
session_regenerate_id(true);

echo "<!DOCTYPE html><html><head>
<meta charset='UTF-8'>
<title>Session Reset — DrivePro</title>
<style>
  body { font-family: monospace; background: #1e1e2e; color: #cdd6f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .box { background: #313244; border-radius: 12px; padding: 32px 40px; max-width: 480px; text-align: center; }
  h2  { color: #a6e3a1; margin: 0 0 16px; font-size: 1.4rem; }
  p   { margin: 8px 0; font-size: 0.95rem; }
  .warn { color: #f38ba8; margin-top: 20px; font-size: 0.85rem; }
  a   { display: inline-block; margin-top: 20px; background: #89b4fa; color: #1e1e2e; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
</style></head><body>
<div class='box'>
  <h2>✅ Session Cleared!</h2>
  <p>Previous failed attempts: <strong>{$before_attempts}</strong></p>
  <p>Locked at timestamp: <strong>" . ($before_locked ? date('H:i:s', $before_locked) : 'N/A') . "</strong></p>
  <p>Login attempts counter has been reset to <strong>0</strong>.</p>
  <a href='../login.html'>→ Go to Login Page</a>
  <p class='warn'>⚠️ Delete this file after use:<br>backend/reset_session.php</p>
</div></body></html>";
?>