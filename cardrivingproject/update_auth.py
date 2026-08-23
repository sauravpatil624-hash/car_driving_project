import os
import glob
import re

css_addition = """
/* ========== AUTH DROPDOWN ========== */
.auth-dropdown {
  position: relative;
  display: inline-block;
}
.auth-dropdown .dropbtn {
  font-family: inherit;
}
.auth-dropdown .dropdown-content {
  display: none;
  position: absolute;
  background-color: var(--bg-card);
  min-width: 180px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  border-radius: var(--radius-sm);
  top: 100%;
  right: 0;
  margin-top: 5px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.auth-dropdown .dropdown-content a {
  color: var(--text-primary);
  padding: 12px 16px;
  text-decoration: none;
  display: flex !important;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  transition: var(--transition);
}
.auth-dropdown .dropdown-content a:hover {
  background-color: var(--primary-glow);
  color: var(--primary);
}
.auth-dropdown:hover .dropdown-content {
  display: block;
}
"""

css_path = 'style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

if 'AUTH DROPDOWN' not in css_content:
    css_content = css_content.replace('/* ========== NAV', css_addition + '\n/* ========== NAV')
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css_content)

html_files = glob.glob('*.html')

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_mobile = """        <div class="mobile-auth" id="mobileAuthBtns">
          <a href="login.html" class="btn btn-outline btn-sm"><i class="fas fa-sign-in-alt"></i> Login</a>
          <div class="auth-dropdown">
            <button class="btn btn-primary btn-sm dropbtn" style="display:flex;align-items:center;gap:6px;">Sign In <i class="fas fa-caret-down"></i></button>
            <div class="dropdown-content">
              <a href="signup.html"><i class="fas fa-user-plus"></i> Create Account</a>
            </div>
          </div>
          <a href="admin.html" class="btn btn-sm btn-admin" style="background:#ef4444;color:white;border:none;"><i class="fas fa-user-shield"></i> Admin Login</a>
        </div>"""
    
    content = re.sub(
        r'<div class="mobile-auth" id="mobileAuthBtns">.*?</div>\s*</div>\s*<div class="nav-actions',
        new_mobile + '\n      </div>\n\n      <div class="nav-actions',
        content,
        flags=re.DOTALL
    )

    new_nav = """      <div class="nav-actions">
        <button class="theme-toggle" aria-label="Toggle theme">
          <i class="fas fa-moon"></i>
        </button>
        <a href="login.html" class="nav-auth-btn login-btn"><i class="fas fa-sign-in-alt"></i> Login</a>
        <div class="auth-dropdown">
          <button class="nav-auth-btn signup-btn dropbtn" style="cursor:pointer; display:flex; align-items:center; gap:6px;">Sign In <i class="fas fa-caret-down"></i></button>
          <div class="dropdown-content">
            <a href="signup.html"><i class="fas fa-user-plus"></i> Create Account</a>
          </div>
        </div>
        <a href="admin.html" class="nav-auth-btn" style="background:linear-gradient(135deg,#ef4444,#b91c1c);color:white;border:none;"><i class="fas fa-user-shield"></i> Admin Login</a>
        <button class="menu-toggle" aria-label="Menu">
          <i class="fas fa-bars"></i>
        </button>
      </div>"""

    content = re.sub(
        r'<div class="nav-actions">.*?</div>\s*</div>',
        new_nav + '\n    </div>',
        content,
        flags=re.DOTALL
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
