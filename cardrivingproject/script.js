// ===================================================================
// DRIVING SCHOOL MANAGEMENT SYSTEM - MAIN JAVASCRIPT
// ===================================================================

const PACKAGES = { 'Basic': 4999, 'Standard': 7999, 'Premium': 11999 };

document.addEventListener('DOMContentLoaded', () => {
  seedDemoData();
  initTheme();
  initMobileMenu();
  initFadeAnimations();
  initForms();
  initDashboard();
  initAdminPanel();
  updateAuthUI();
});

// ===================================================================
// THEME TOGGLE
// ===================================================================
function initTheme() {
  const saved = localStorage.getItem('dsms-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('dsms-theme', next);
      updateThemeIcon(next);
    });
  });
}

function updateThemeIcon(theme) {
  document.querySelectorAll('.theme-toggle i').forEach(icon => {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  });
}

// ===================================================================
// MOBILE MENU
// ===================================================================
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    toggle.querySelector('i').className = navLinks.classList.contains('active')
      ? 'fas fa-times' : 'fas fa-bars';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      toggle.querySelector('i').className = 'fas fa-bars';
    });
  });
}

// ===================================================================
// SCROLL FADE ANIMATIONS
// ===================================================================
function initFadeAnimations() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

// ===================================================================
// TOAST NOTIFICATION
// ===================================================================
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ===================================================================
// VALIDATION HELPERS
// ===================================================================

// ── Core rules ──
function validateName(v) { return /^[a-zA-Z\s]{2,50}$/.test(v.trim()); }
function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
function validateMobile(v) { return /^\d{10}$/.test(v.trim()); }
function validateAge(v) { const a = parseInt(v); return !isNaN(a) && a >= 18 && a <= 100; }

// Password: min 6 chars, at least 1 letter AND 1 number
function validatePassword(v) {
  return v.length >= 6 && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);
}

// ── Field UI helpers ──
function showFieldError(input, message) {
  const group = input.closest('.form-group');
  if (!group) return;
  input.classList.add('input-error');
  input.classList.remove('input-success');
  group.classList.add('has-error');
  group.classList.remove('has-success');
  const errEl = group.querySelector('.error-message');
  if (errEl) { errEl.textContent = message; errEl.classList.add('visible'); }
}

function showFieldSuccess(input) {
  const group = input.closest('.form-group');
  if (!group) return;
  input.classList.remove('input-error');
  input.classList.add('input-success');
  group.classList.remove('has-error');
  group.classList.add('has-success');
  const errEl = group.querySelector('.error-message');
  if (errEl) { errEl.classList.remove('visible'); }
}

function clearFieldError(input) {
  const group = input.closest('.form-group');
  if (!group) return;
  input.classList.remove('input-error', 'input-success');
  group.classList.remove('has-error', 'has-success');
  const errEl = group.querySelector('.error-message');
  if (errEl) errEl.classList.remove('visible');
}

function clearAllErrors(form) {
  form.querySelectorAll('.input-error, .input-success').forEach(el => el.classList.remove('input-error', 'input-success'));
  form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error', 'has-success'));
  form.querySelectorAll('.error-message').forEach(el => el.classList.remove('visible'));
}

// ===================================================================
// FORM INITIALIZATION
// ===================================================================
function initForms() {

  // ── 1. REAL-TIME CHARACTER BLOCKING ──────────────────────────────
  // Name fields: silently block numbers & special characters as typed
  document.querySelectorAll('[data-validate="name"]').forEach(input => {
    input.addEventListener('keypress', (e) => {
      // Allow letters (any case), spaces, and control keys
      if (!/[a-zA-Z\s]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    });
    // Also strip on paste
    input.addEventListener('input', () => {
      const cleaned = input.value.replace(/[^a-zA-Z\s]/g, '');
      if (cleaned !== input.value) input.value = cleaned;
    });
  });

  // Mobile fields: block everything except digits
  document.querySelectorAll('[data-validate="mobile"]').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (!/[0-9]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    });
    input.addEventListener('input', () => {
      const cleaned = input.value.replace(/\D/g, '').slice(0, 10);
      if (cleaned !== input.value) input.value = cleaned;
    });
  });

  // ── 2. REAL-TIME BLUR VALIDATION (per field) ─────────────────────
  document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('blur', () => {
      validateSingleField(input);
    });
    input.addEventListener('focus', () => clearFieldError(input));
  });

  // ── 3. CONTACT FORM ──────────────────────────────────────────────
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateContactForm(contactForm)) { saveFormData('contacts', contactForm); showToast('Your message has been sent successfully!'); contactForm.reset(); }
    });
  }

  // Enquiry Form
  const enquiryForm = document.getElementById('enquiryForm');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateEnquiryForm(enquiryForm)) { saveFormData('enquiries', enquiryForm); showToast('Your enquiry has been submitted successfully!'); enquiryForm.reset(); }
    });
  }

  // ==========================================================
  // Signup Form  →  POST to backend/signup.php
  // ==========================================================
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateSignupForm(signupForm)) return;

      const data = Object.fromEntries(new FormData(signupForm));
      const submitBtn = signupForm.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

      try {
        const res = await fetch('backend/signup.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.fullName,
            email: data.email,
            mobile: data.mobile,
            password: data.password
          })
        });
        const json = await res.json();

        if (json.success) {
          showToast(json.message);
          setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
          showToast(json.message, 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
      } catch (err) {
        showToast('Cannot reach server. Make sure XAMPP is running.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
      }
    });
  }

  // ==========================================================
  // Unified Login Form  →  POST to backend/login.php
  // Role-based redirect: admin → admin.html, user → dashboard.html
  // ==========================================================
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('[name="email"]').value.trim();
      const password = loginForm.querySelector('[name="password"]').value;

      if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }

      const submitBtn = loginForm.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

      try {
        const res = await fetch('backend/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const json = await res.json();

        if (json.success) {
          // Store session info in localStorage for UI purposes
          if (json.role === 'admin') {
            localStorage.setItem('dsms-admin', 'true');
            localStorage.removeItem('dsms-current-user');
            localStorage.removeItem('isLoggedIn');
          } else {
            localStorage.setItem('dsms-current-user', JSON.stringify(json.user));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.removeItem('dsms-admin');
          }
          showToast(json.message);
          setTimeout(() => window.location.href = json.redirect, 1000);
        } else {
          showToast(json.message, 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
      } catch (err) {
        showToast('Cannot reach server. Make sure XAMPP is running.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
      }
    });
  }

  // Admin Login Form on admin.html — routes through backend/login.php (same as unified login)
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = adminLoginForm.querySelector('[name="email"]').value.trim();
      const password = adminLoginForm.querySelector('[name="password"]').value;

      if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }

      const submitBtn = adminLoginForm.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

      try {
        const res = await fetch('backend/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const json = await res.json();

        if (json.success && json.role === 'admin') {
          localStorage.setItem('dsms-admin', 'true');
          localStorage.removeItem('dsms-current-user');
          localStorage.removeItem('isLoggedIn');
          showToast('Admin login successful!');
          setTimeout(() => {
            document.getElementById('adminLoginSection').style.display = 'none';
            document.getElementById('adminDashboardSection').style.display = 'flex';
            loadAdminData();
          }, 800);
        } else if (json.success && json.role !== 'admin') {
          showToast('Access denied. This login is for admins only.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Admin Login';
        } else {
          showToast(json.message || 'Invalid credentials.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Admin Login';
        }
      } catch (err) {
        showToast('Cannot reach server. Make sure XAMPP is running.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Admin Login';
      }
    });
  }

  // Password toggle
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.className = `toggle-pw fas ${isPassword ? 'fa-eye-slash' : 'fa-eye'}`;
    });
  });
}

// ===================================================================
// SINGLE-FIELD VALIDATOR (called on blur for each input)
// ===================================================================
function validateSingleField(input) {
  const type = input.dataset.validate;
  const val = input.value;

  if (!val && input.hasAttribute('required')) {
    showFieldError(input, 'This field is required.');
    return false;
  }
  if (!val) return true; // optional & empty → skip

  switch (type) {
    case 'name':
      if (!validateName(val)) { showFieldError(input, '❌ Only letters and spaces allowed (2–50 characters).'); return false; }
      showFieldSuccess(input); return true;

    case 'email':
      if (!validateEmail(val)) { showFieldError(input, '❌ Enter a valid email address (e.g. name@gmail.com).'); return false; }
      showFieldSuccess(input); return true;

    case 'mobile':
      if (val.length < 10) { showFieldError(input, '❌ Mobile number must be exactly 10 digits.'); return false; }
      if (!/^\d{10}$/.test(val)) { showFieldError(input, '❌ Only digits allowed — no spaces or symbols.'); return false; }
      showFieldSuccess(input); return true;

    case 'password':
      if (val.length < 6) { showFieldError(input, '❌ Password must be at least 6 characters.'); return false; }
      if (!/[a-zA-Z]/.test(val)) { showFieldError(input, '❌ Password must contain at least one letter.'); return false; }
      if (!/[0-9]/.test(val)) { showFieldError(input, '❌ Password must contain at least one number.'); return false; }
      showFieldSuccess(input); return true;

    case 'age':
      if (!validateAge(val)) { showFieldError(input, '❌ Age must be between 18 and 100.'); return false; }
      showFieldSuccess(input); return true;
  }

  return true;
}

// ===================================================================
// FORM-LEVEL VALIDATORS
// ===================================================================
function validateContactForm(form) {
  clearAllErrors(form);
  let valid = true;
  const name = form.querySelector('[name="fullName"]');
  const email = form.querySelector('[name="email"]');
  const mobile = form.querySelector('[name="mobile"]');
  const message = form.querySelector('[name="message"]');

  if (!name.value.trim()) { showFieldError(name, 'Full name is required.'); valid = false; }
  else if (!validateName(name.value)) { showFieldError(name, 'Only letters and spaces allowed.'); valid = false; }
  else showFieldSuccess(name);

  if (!email.value.trim()) { showFieldError(email, 'Email address is required.'); valid = false; }
  else if (!validateEmail(email.value)) { showFieldError(email, 'Enter a valid email (e.g. abc@gmail.com).'); valid = false; }
  else showFieldSuccess(email);

  if (!mobile.value.trim()) { showFieldError(mobile, 'Mobile number is required.'); valid = false; }
  else if (!validateMobile(mobile.value)) { showFieldError(mobile, 'Must be exactly 10 digits, numbers only.'); valid = false; }
  else showFieldSuccess(mobile);

  if (!message.value.trim()) { showFieldError(message, 'Please write your message.'); valid = false; }
  else showFieldSuccess(message);

  return valid;
}

function validateEnquiryForm(form) {
  clearAllErrors(form);
  let valid = true;
  const name = form.querySelector('[name="fullName"]');
  const email = form.querySelector('[name="email"]');
  const mobile = form.querySelector('[name="mobile"]');
  const message = form.querySelector('[name="enquiry"]');

  if (!name.value.trim()) { showFieldError(name, 'Full name is required.'); valid = false; }
  else if (!validateName(name.value)) { showFieldError(name, 'Only letters and spaces allowed.'); valid = false; }
  else showFieldSuccess(name);

  if (!email.value.trim()) { showFieldError(email, 'Email address is required.'); valid = false; }
  else if (!validateEmail(email.value)) { showFieldError(email, 'Enter a valid email (e.g. abc@gmail.com).'); valid = false; }
  else showFieldSuccess(email);

  if (!mobile.value.trim()) { showFieldError(mobile, 'Mobile number is required.'); valid = false; }
  else if (!validateMobile(mobile.value)) { showFieldError(mobile, 'Must be exactly 10 digits, numbers only.'); valid = false; }
  else showFieldSuccess(mobile);

  if (!message || !message.value.trim()) { showFieldError(message, 'Please write your enquiry message.'); valid = false; }
  else showFieldSuccess(message);

  return valid;
}

function validateSignupForm(form) {
  clearAllErrors(form);
  let valid = true;
  const name = form.querySelector('[name="fullName"]');
  const email = form.querySelector('[name="email"]');
  const mobile = form.querySelector('[name="mobile"]');
  const password = form.querySelector('[name="password"]');
  const confirmPassword = form.querySelector('[name="confirmPassword"]');

  if (!name.value.trim()) { showFieldError(name, 'Full name is required.'); valid = false; }
  else if (!validateName(name.value)) { showFieldError(name, 'Name must contain only letters and spaces.'); valid = false; }
  else showFieldSuccess(name);

  if (!email.value.trim()) { showFieldError(email, 'Email address is required.'); valid = false; }
  else if (!validateEmail(email.value)) { showFieldError(email, 'Enter a valid email (e.g. you@gmail.com).'); valid = false; }
  else showFieldSuccess(email);

  if (!mobile.value.trim()) { showFieldError(mobile, 'Mobile number is required.'); valid = false; }
  else if (!validateMobile(mobile.value)) { showFieldError(mobile, 'Must be exactly 10 digits, numbers only.'); valid = false; }
  else showFieldSuccess(mobile);

  if (!password.value) { showFieldError(password, 'Password is required.'); valid = false; }
  else if (password.value.length < 6) { showFieldError(password, 'Password must be at least 6 characters.'); valid = false; }
  else if (!/[a-zA-Z]/.test(password.value)) { showFieldError(password, 'Password must include at least one letter.'); valid = false; }
  else if (!/[0-9]/.test(password.value)) { showFieldError(password, 'Password must include at least one number.'); valid = false; }
  else showFieldSuccess(password);

  if (!confirmPassword.value) { showFieldError(confirmPassword, 'Please confirm your password.'); valid = false; }
  else if (password.value !== confirmPassword.value) { showFieldError(confirmPassword, 'Passwords do not match.'); valid = false; }
  else if (valid) showFieldSuccess(confirmPassword);

  return valid;
}

function saveFormData(key, form) {
  const data = Object.fromEntries(new FormData(form));
  data.id = Date.now(); data.date = new Date().toLocaleDateString('en-IN');
  const list = JSON.parse(localStorage.getItem(`dsms-${key}`) || '[]');
  list.push(data); localStorage.setItem(`dsms-${key}`, JSON.stringify(list));
}

// ===================================================================
// AUTH UI UPDATE — Shows Login btn when logged out, Dashboard+Logout when logged in.
// ===================================================================
function updateAuthUI() {
  const user = JSON.parse(localStorage.getItem('dsms-current-user'));
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const isAdmin = localStorage.getItem('dsms-admin') === 'true';

  const loggedIn = (user && isLoggedIn) || isAdmin;

  // --- LOGGED IN ---
  if (loggedIn) {
    // Hide all Login buttons
    document.querySelectorAll('.nav-auth-btn.login-btn, #navLoginBtn, #mobileAuthBtns')
      .forEach(el => el && (el.style.display = 'none'));

    // Inject a Dashboard + Logout button into .nav-actions (once only)
    if (!document.getElementById('navDashboardBtn')) {
      const navActions = document.querySelector('.nav-actions');
      if (navActions) {
        const dashHref = isAdmin ? 'admin.html' : 'dashboard.html';
        const dashLabel = isAdmin ? '<i class="fas fa-user-shield"></i> Admin Panel' : '<i class="fas fa-tachometer-alt"></i> Dashboard';

        const dashBtn = document.createElement('a');
        dashBtn.id = 'navDashboardBtn';
        dashBtn.href = dashHref;
        dashBtn.className = 'nav-auth-btn signup-btn';
        dashBtn.innerHTML = dashLabel;

        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'navLogoutBtn';
        logoutBtn.className = 'nav-auth-btn logout-btn';
        logoutBtn.style.cssText = 'border:1.5px solid #ef4444;color:#ef4444;cursor:pointer;background:transparent;';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.addEventListener('click', performLogout);

        // Insert before menu-toggle
        const menuToggle = navActions.querySelector('.menu-toggle');
        navActions.insertBefore(dashBtn, menuToggle || null);
        navActions.insertBefore(logoutBtn, menuToggle || null);
      }
    }

    // Also add to mobile menu (once only)
    if (!document.getElementById('mobileLogoutBtn')) {
      const mobileAuth = document.querySelector('.mobile-auth');
      if (mobileAuth) {
        mobileAuth.innerHTML = '';
        const dashHref = isAdmin ? 'admin.html' : 'dashboard.html';
        const dashLabel = isAdmin ? '<i class="fas fa-user-shield"></i> Admin Panel' : '<i class="fas fa-tachometer-alt"></i> Dashboard';
        mobileAuth.innerHTML = `
          <a href="${dashHref}" class="nav-auth-btn signup-btn" style="flex:1;">${dashLabel}</a>
          <button id="mobileLogoutBtn" class="nav-auth-btn login-btn"
            style="border-color:#ef4444;color:#ef4444;cursor:pointer;flex:1;"
            onclick="performLogout()">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>`;
      }
    }

    // Hero section: swap Get Started → My Dashboard
    const heroAuth = document.getElementById('heroAuthSection');
    const heroLoggedIn = document.getElementById('heroLoggedInSection');
    if (heroAuth) heroAuth.style.display = 'none';
    if (heroLoggedIn) {
      heroLoggedIn.style.display = 'flex';
      const heroDash = document.getElementById('heroDashboardBtn');
      if (heroDash && isAdmin) {
        heroDash.href = 'admin.html';
        heroDash.innerHTML = '<i class="fas fa-user-shield"></i> Admin Panel';
      }
    }

  } else {
    // --- NOT LOGGED IN --- make sure Login btn is visible
    document.querySelectorAll('.nav-auth-btn.login-btn, #navLoginBtn')
      .forEach(el => el && (el.style.display = ''));
  }
}

// ===================================================================
// LOGOUT
// ===================================================================
function performLogout() {
  localStorage.removeItem('dsms-current-user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('dsms-admin');
  localStorage.removeItem('dsms-current-application');
  showToast('Logged out successfully!');
  setTimeout(() => window.location.href = 'index.html', 800);
}

// ===================================================================
// USER DASHBOARD
// ===================================================================
let selectedPaymentType = null;

function initDashboard() {
  const dashboard = document.querySelector('.dashboard-layout');
  if (!dashboard || document.getElementById('adminDashboardSection')) return;

  const user = JSON.parse(localStorage.getItem('dsms-current-user'));
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!user || !isLoggedIn) { window.location.href = 'login.html'; return; }

  // Set user info
  document.querySelectorAll('.display-user-name').forEach(el => el.textContent = user.name);
  document.querySelectorAll('.display-user-email').forEach(el => el.textContent = user.email);
  document.querySelectorAll('.display-user-mobile').forEach(el => el.textContent = user.mobile || '');
  document.querySelectorAll('.user-avatar').forEach(el => {
    if (!el.querySelector('i')) el.textContent = user.name.charAt(0).toUpperCase();
  });

  // Sidebar navigation
  const sidebarLinks = document.querySelectorAll('.sidebar-menu a[data-page]');
  const pages = document.querySelectorAll('.dashboard-page');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.page;
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      pages.forEach(p => p.classList.remove('active'));
      document.getElementById(target)?.classList.add('active');

      if (target === 'editProfilePage') prefillEditProfile();
      if (target === 'paymentPage') loadPaymentPage();

      document.querySelector('.sidebar')?.classList.remove('open');
    });
  });

  // Sidebar toggle for mobile
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
  }

  // Application Form
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateApplyForm(applyForm)) {
        const data = Object.fromEntries(new FormData(applyForm));
        data.id = 'REG' + Date.now().toString().slice(-6);
        data.userId = user.id;
        data.userName = user.name;
        data.userEmail = user.email;
        data.status = 'Pending';
        data.date = new Date().toLocaleDateString('en-IN');
        data.paymentStatus = 'Pending';
        data.amountPaid = 0;
        data.totalAmount = PACKAGES[data.package] || 4999;

        const apps = JSON.parse(localStorage.getItem('dsms-applications') || '[]');
        apps.push(data);
        localStorage.setItem('dsms-applications', JSON.stringify(apps));
        localStorage.setItem('dsms-current-application', data.id);

        showToast('Application submitted! Proceed to payment.');
        // Switch to payment page
        document.querySelectorAll('.sidebar-menu a').forEach(l => l.classList.remove('active'));
        document.querySelector('[data-page="paymentPage"]')?.classList.add('active');
        document.querySelectorAll('.dashboard-page').forEach(p => p.classList.remove('active'));
        document.getElementById('paymentPage')?.classList.add('active');
        loadPaymentPage();
      }
    });
  }

  // File upload
  const fileUpload = document.querySelector('.file-upload');
  const fileInput = document.getElementById('documentUpload');
  if (fileUpload && fileInput) {
    fileUpload.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const name = fileInput.files[0]?.name || '';
      const nameDisplay = fileUpload.querySelector('.file-name');
      if (nameDisplay) nameDisplay.textContent = name;
    });
  }

  // Load history and payment page
  loadUserHistory();
  loadPaymentPage();

  // Edit Profile Form
  const editProfileForm = document.getElementById('editProfileForm');
  if (editProfileForm) {
    prefillEditProfile();
    editProfileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearAllErrors(editProfileForm);
      const newName = editProfileForm.querySelector('[name="editName"]').value;
      const newMobile = editProfileForm.querySelector('[name="editMobile"]').value;
      const newEmail = editProfileForm.querySelector('[name="editEmail"]').value;
      let valid = true;
      if (!validateName(newName)) { showFieldError(editProfileForm.querySelector('[name="editName"]'), 'Only letters and spaces allowed'); valid = false; }
      if (!validateMobile(newMobile)) { showFieldError(editProfileForm.querySelector('[name="editMobile"]'), 'Enter valid 10-digit number'); valid = false; }
      if (!validateEmail(newEmail)) { showFieldError(editProfileForm.querySelector('[name="editEmail"]'), 'Enter a valid email'); valid = false; }
      if (!valid) return;

      const currentUser = JSON.parse(localStorage.getItem('dsms-current-user'));
      currentUser.name = newName; currentUser.mobile = newMobile; currentUser.email = newEmail;
      localStorage.setItem('dsms-current-user', JSON.stringify(currentUser));
      const users = JSON.parse(localStorage.getItem('dsms-users') || '[]');
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) { users[idx].name = newName; users[idx].mobile = newMobile; users[idx].email = newEmail; localStorage.setItem('dsms-users', JSON.stringify(users)); }
      document.querySelectorAll('.display-user-name').forEach(el => el.textContent = newName);
      document.querySelectorAll('.display-user-email').forEach(el => el.textContent = newEmail);
      document.querySelectorAll('.display-user-mobile').forEach(el => el.textContent = newMobile);
      showToast('Profile updated successfully!');
    });
  }

  // Change Password Form
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearAllErrors(changePasswordForm);
      const oldPw = changePasswordForm.querySelector('[name="oldPassword"]').value;
      const newPw = changePasswordForm.querySelector('[name="newPassword"]').value;
      const confirmPw = changePasswordForm.querySelector('[name="confirmNewPassword"]').value;
      const currentUser = JSON.parse(localStorage.getItem('dsms-current-user'));
      let valid = true;
      if (oldPw !== currentUser.password) { showFieldError(changePasswordForm.querySelector('[name="oldPassword"]'), 'Old password is incorrect'); valid = false; }
      if (!validatePassword(newPw)) { showFieldError(changePasswordForm.querySelector('[name="newPassword"]'), 'Minimum 6 characters required'); valid = false; }
      if (newPw !== confirmPw) { showFieldError(changePasswordForm.querySelector('[name="confirmNewPassword"]'), 'Passwords do not match'); valid = false; }
      if (oldPw === newPw) { showFieldError(changePasswordForm.querySelector('[name="newPassword"]'), 'New password must be different'); valid = false; }
      if (!valid) return;

      currentUser.password = newPw;
      localStorage.setItem('dsms-current-user', JSON.stringify(currentUser));
      const users = JSON.parse(localStorage.getItem('dsms-users') || '[]');
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) { users[idx].password = newPw; localStorage.setItem('dsms-users', JSON.stringify(users)); }
      showToast('Password changed successfully!');
      changePasswordForm.reset();
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => { e.preventDefault(); performLogout(); });
  }
}

function prefillEditProfile() {
  const user = JSON.parse(localStorage.getItem('dsms-current-user'));
  if (!user) return;
  const n = document.querySelector('[name="editName"]'), m = document.querySelector('[name="editMobile"]'), e = document.querySelector('[name="editEmail"]');
  if (n) n.value = user.name || '';
  if (m) m.value = user.mobile || '';
  if (e) e.value = user.email || '';
}

function validateApplyForm(form) {
  clearAllErrors(form); let valid = true;
  const name = form.querySelector('[name="fullName"]'), age = form.querySelector('[name="age"]'), gender = form.querySelector('[name="gender"]'), pkg = form.querySelector('[name="package"]');
  if (name && !validateName(name.value)) { showFieldError(name, 'Only letters allowed'); valid = false; }
  if (age && !validateAge(age.value)) { showFieldError(age, 'Must be 18 or above'); valid = false; }
  if (gender && !gender.value) { showFieldError(gender, 'Please select gender'); valid = false; }
  if (pkg && !pkg.value) { showFieldError(pkg, 'Please select a package'); valid = false; }
  return valid;
}

// ===================================================================
// PAYMENT SYSTEM (User Dashboard)
// ===================================================================
function loadPaymentPage() {
  const user = JSON.parse(localStorage.getItem('dsms-current-user'));
  if (!user) return;

  const noAppMsg = document.getElementById('noApplicationMsg');
  const payOptions = document.getElementById('paymentOptions');
  if (!noAppMsg || !payOptions) return;

  // Find the latest application for this user
  const apps = JSON.parse(localStorage.getItem('dsms-applications') || '[]');
  const currentAppId = localStorage.getItem('dsms-current-application');
  let app = null;

  if (currentAppId) {
    app = apps.find(a => a.id === currentAppId);
  }
  if (!app) {
    // Find latest unpaid/partial app
    app = apps.filter(a => a.userId === user.id && a.paymentStatus !== 'Completed').pop();
  }

  if (!app) {
    noAppMsg.style.display = 'block';
    payOptions.style.display = 'none';
    return;
  }

  noAppMsg.style.display = 'none';
  payOptions.style.display = 'block';

  const totalAmt = app.totalAmount || PACKAGES[app.package] || 4999;
  const amountPaid = app.amountPaid || 0;

  // Update info
  document.getElementById('payPkgName').textContent = app.package;
  document.getElementById('payTotalAmt').textContent = `₹${totalAmt.toLocaleString('en-IN')}`;

  const statusEl = document.getElementById('payCurrentStatus');
  statusEl.textContent = app.paymentStatus;
  statusEl.className = 'status-badge ' + app.paymentStatus.toLowerCase();

  // Show/hide sections based on status
  const typeCard = document.getElementById('paymentTypeCard');
  const confirmCard = document.getElementById('paymentConfirmCard');
  const remainCard = document.getElementById('payRemainingCard');
  const completeCard = document.getElementById('paymentCompleteCard');

  typeCard.style.display = 'none';
  confirmCard.style.display = 'none';
  remainCard.style.display = 'none';
  completeCard.style.display = 'none';

  if (app.paymentStatus === 'Completed') {
    completeCard.style.display = 'block';
  } else if (app.paymentStatus === 'Partial') {
    const remaining = totalAmt - amountPaid;
    document.getElementById('remainingAmt').textContent = `₹${remaining.toLocaleString('en-IN')}`;
    remainCard.style.display = 'block';
  } else {
    // Pending - show payment options
    typeCard.style.display = 'block';
    document.getElementById('fullPayAmt').textContent = `₹${totalAmt.toLocaleString('en-IN')}`;
    const advanceAmt = Math.round(totalAmt / 2);
    document.getElementById('advancePayAmt').textContent = `₹${advanceAmt.toLocaleString('en-IN')}`;
  }
}

function selectPaymentType(type) {
  selectedPaymentType = type;
  const user = JSON.parse(localStorage.getItem('dsms-current-user'));
  const apps = JSON.parse(localStorage.getItem('dsms-applications') || '[]');
  const currentAppId = localStorage.getItem('dsms-current-application');
  let app = currentAppId ? apps.find(a => a.id === currentAppId) : apps.filter(a => a.userId === user.id && a.paymentStatus === 'Pending').pop();

  if (!app) return;

  const totalAmt = app.totalAmount || PACKAGES[app.package] || 4999;

  // Highlight selected
  document.getElementById('optFullPay').classList.toggle('selected', type === 'full');
  document.getElementById('optAdvancePay').classList.toggle('selected', type === 'advance');

  // Show confirm card
  const confirmCard = document.getElementById('paymentConfirmCard');
  confirmCard.style.display = 'block';

  if (type === 'full') {
    document.getElementById('payingAmount').textContent = `₹${totalAmt.toLocaleString('en-IN')}`;
    document.getElementById('paymentTypeLabel').textContent = '💳 Full Payment';
  } else {
    const advAmt = Math.round(totalAmt / 2);
    document.getElementById('payingAmount').textContent = `₹${advAmt.toLocaleString('en-IN')}`;
    document.getElementById('paymentTypeLabel').textContent = '⏳ Advance Payment (50%)';
  }

  confirmCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function confirmPaymentAction() {
  const user = JSON.parse(localStorage.getItem('dsms-current-user'));
  const apps = JSON.parse(localStorage.getItem('dsms-applications') || '[]');
  const currentAppId = localStorage.getItem('dsms-current-application');
  let app = currentAppId ? apps.find(a => a.id === currentAppId) : apps.filter(a => a.userId === user.id && a.paymentStatus === 'Pending').pop();

  if (!app) return;

  const totalAmt = app.totalAmount || PACKAGES[app.package] || 4999;

  if (selectedPaymentType === 'full') {
    app.paymentStatus = 'Completed';
    app.amountPaid = totalAmt;
    showToast('Full payment confirmed successfully!');
  } else {
    const advAmt = Math.round(totalAmt / 2);
    app.paymentStatus = 'Partial';
    app.amountPaid = advAmt;
    showToast('Advance payment confirmed! Pay remaining after training.');
  }

  // Update in storage
  const idx = apps.findIndex(a => a.id === app.id);
  if (idx !== -1) apps[idx] = app;
  localStorage.setItem('dsms-applications', JSON.stringify(apps));

  // Reload page
  setTimeout(() => loadPaymentPage(), 1000);
}

function payRemainingAmount() {
  const user = JSON.parse(localStorage.getItem('dsms-current-user'));
  const apps = JSON.parse(localStorage.getItem('dsms-applications') || '[]');
  const app = apps.filter(a => a.userId === user.id && a.paymentStatus === 'Partial').pop();

  if (!app) return;

  const totalAmt = app.totalAmount || PACKAGES[app.package] || 4999;
  app.paymentStatus = 'Completed';
  app.amountPaid = totalAmt;

  const idx = apps.findIndex(a => a.id === app.id);
  if (idx !== -1) apps[idx] = app;
  localStorage.setItem('dsms-applications', JSON.stringify(apps));
  localStorage.removeItem('dsms-current-application');

  showToast('Remaining payment confirmed! Payment is now complete.');
  setTimeout(() => loadPaymentPage(), 1000);
}

function goToPayRemaining(appId) {
  localStorage.setItem('dsms-current-application', appId);
  document.querySelectorAll('.sidebar-menu a').forEach(l => l.classList.remove('active'));
  document.querySelector('[data-page="paymentPage"]')?.classList.add('active');
  document.querySelectorAll('.dashboard-page').forEach(p => p.classList.remove('active'));
  document.getElementById('paymentPage')?.classList.add('active');
  loadPaymentPage();
}

function loadUserHistory() {
  const user = JSON.parse(localStorage.getItem('dsms-current-user'));
  if (!user) return;

  const apps = JSON.parse(localStorage.getItem('dsms-applications') || '[]').filter(a => a.userId === user.id);
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;

  if (apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:40px;color:var(--text-muted)">
      <i class="fas fa-inbox" style="font-size:2rem;margin-bottom:10px;display:block"></i>No applications yet</td></tr>`;
    return;
  }

  tbody.innerHTML = apps.map(app => {
    const actionBtn = app.paymentStatus === 'Partial'
      ? `<button class="btn btn-warning btn-sm" onclick="goToPayRemaining('${app.id}')"><i class="fas fa-rupee-sign"></i> Pay Remaining</button>`
      : (app.paymentStatus === 'Pending' ? `<button class="btn btn-primary btn-sm" onclick="goToPayRemaining('${app.id}')"><i class="fas fa-credit-card"></i> Pay Now</button>` : '<span style="color:var(--success)"><i class="fas fa-check"></i> Done</span>');

    return `<tr>
      <td><strong>${app.id}</strong></td>
      <td>${app.fullName || app.userName}</td>
      <td>${app.package}</td>
      <td>${app.date}</td>
      <td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td>
      <td><span class="status-badge ${app.paymentStatus.toLowerCase()}">${app.paymentStatus}</span></td>
      <td>${actionBtn}</td>
    </tr>`;
  }).join('');
}

// ===================================================================
// ADMIN PANEL
// ===================================================================
function initAdminPanel() {
  const adminSection = document.getElementById('adminDashboardSection');
  if (!adminSection) return;

  if (localStorage.getItem('dsms-admin') === 'true') {
    document.getElementById('adminLoginSection').style.display = 'none';
    adminSection.style.display = 'flex';
    loadAdminData();
  }

  // Sidebar nav
  const sidebarLinks = adminSection.querySelectorAll('.sidebar-menu a[data-page]');
  const pages = adminSection.querySelectorAll('.dashboard-page');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.page;
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      pages.forEach(p => p.classList.remove('active'));
      adminSection.querySelector('#' + target)?.classList.add('active');
      document.querySelector('.sidebar')?.classList.remove('open');
    });
  });

  // Sidebar toggle
  const sidebarToggle = adminSection.querySelector('.sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => adminSection.querySelector('.sidebar').classList.toggle('open'));
  }

  // Admin logout
  const adminLogout = document.getElementById('adminLogoutBtn');
  if (adminLogout) {
    adminLogout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('dsms-admin');
      showToast('Admin logged out successfully!');
      setTimeout(() => window.location.reload(), 800);
    });
  }

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.tabs-container') || btn.parentElement.parentElement;
      group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      const parent = group.parentElement;
      parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      parent.querySelector('#' + target)?.classList.add('active');
    });
  });

  // Search
  const searchBtn = document.getElementById('adminSearchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const regNum = document.getElementById('adminSearchInput')?.value.trim();
      const resultDiv = document.getElementById('searchResult');
      if (!regNum) { showToast('Please enter a registration number', 'error'); return; }
      const apps = JSON.parse(localStorage.getItem('dsms-applications') || '[]');
      const found = apps.find(a => a.id === regNum);
      if (found && resultDiv) {
        const total = found.totalAmount || PACKAGES[found.package] || 4999;
        const paid = found.amountPaid || 0;
        resultDiv.innerHTML = `
          <div class="card" style="margin-top:20px">
            <h3 style="margin-bottom:16px"><i class="fas fa-user-check text-primary-color"></i> User Found</h3>
            <p><strong>Reg No:</strong> ${found.id}</p>
            <p><strong>Name:</strong> ${found.fullName || found.userName}</p>
            <p><strong>Package:</strong> ${found.package}</p>
            <p><strong>Date:</strong> ${found.date}</p>
            <p><strong>App Status:</strong> <span class="status-badge ${found.status.toLowerCase()}">${found.status}</span></p>
            <p><strong>Payment:</strong> <span class="status-badge ${found.paymentStatus.toLowerCase()}">${found.paymentStatus}</span></p>
            <p><strong>Total:</strong> ₹${total.toLocaleString('en-IN')} | <strong>Paid:</strong> ₹${paid.toLocaleString('en-IN')}</p>
          </div>`;
      } else if (resultDiv) {
        resultDiv.innerHTML = `<div class="empty-state" style="padding:30px"><i class="fas fa-search"></i><h3>No results found</h3><p>No user found with "${regNum}"</p></div>`;
      }
    });
  }
}

// ===================================================================
// ADMIN DATA LOADING
// ===================================================================
function loadAdminData() {
  const users = JSON.parse(localStorage.getItem('dsms-users') || '[]');
  const apps = JSON.parse(localStorage.getItem('dsms-applications') || '[]');
  const enquiries = JSON.parse(localStorage.getItem('dsms-enquiries') || '[]');
  const contacts = JSON.parse(localStorage.getItem('dsms-contacts') || '[]');

  // Stats
  updateStat('totalUsers', users.length);
  updateStat('totalApps', apps.length);
  updateStat('approvedApps', apps.filter(a => a.status === 'Approved').length);
  updateStat('pendingApps', apps.filter(a => a.status === 'Pending').length);
  updateStat('totalEnquiries', enquiries.length + contacts.length);

  // Calculate revenue from paid amounts
  const totalRevenue = apps.reduce((sum, a) => sum + (a.amountPaid || 0), 0);
  updateStat('totalRevenue', totalRevenue);

  // Overview table (with actions)
  renderAdminAppTable('allUsersTable', apps, true);

  // Tab tables
  renderAdminAppTable('newUsersTable', apps.filter(a => a.status === 'Pending'), true, true);
  renderAdminAppTableSimple('approvedUsersTable', apps.filter(a => a.status === 'Approved'));
  renderAdminAppTableSimple('cancelledUsersTable', apps.filter(a => a.status === 'Cancelled'));
  renderAdminAppTable('allUsersTable2', apps, true);

  // Payment tables
  renderAdminPaymentTables(apps);

  // Enquiries
  renderEnquiries(enquiries, contacts);
}

function updateStat(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = id === 'totalRevenue' ? '₹' + value.toLocaleString('en-IN') : value;
  }
}

function renderAdminAppTable(tableId, apps, showActions = false, pendingOnly = false) {
  const tbody = document.getElementById(tableId);
  if (!tbody) return;

  if (apps.length === 0) {
    const cols = showActions ? 8 : 7;
    tbody.innerHTML = `<tr><td colspan="${cols}" class="text-center" style="padding:30px;color:var(--text-muted)">No records found</td></tr>`;
    return;
  }

  tbody.innerHTML = apps.map(app => {
    let actions = '';
    if (showActions) {
      if (app.status === 'Pending') {
        actions = `<td><div class="admin-action-btns">
          <button class="btn btn-success" onclick="adminApprove('${app.id}')"><i class="fas fa-check"></i> Approve</button>
          <button class="btn btn-danger" onclick="adminCancel('${app.id}')"><i class="fas fa-times"></i> Cancel</button>
        </div></td>`;
      } else {
        actions = `<td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td>`;
      }
    }

    if (pendingOnly) {
      return `<tr>
        <td><strong>${app.id}</strong></td>
        <td>${app.fullName || app.userName}</td>
        <td>${app.userEmail || ''}</td>
        <td>${app.package || '-'}</td>
        <td>${app.date}</td>
        <td><span class="status-badge ${app.paymentStatus.toLowerCase()}">${app.paymentStatus}</span></td>
        ${actions}
      </tr>`;
    }

    return `<tr>
      <td><strong>${app.id}</strong></td>
      <td>${app.fullName || app.userName}</td>
      <td>${app.userEmail || ''}</td>
      <td>${app.package || '-'}</td>
      <td>${app.date}</td>
      <td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td>
      <td><span class="status-badge ${app.paymentStatus.toLowerCase()}">${app.paymentStatus}</span></td>
      ${actions}
    </tr>`;
  }).join('');
}

function renderAdminAppTableSimple(tableId, apps) {
  const tbody = document.getElementById(tableId);
  if (!tbody) return;

  if (apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:30px;color:var(--text-muted)">No records found</td></tr>`;
    return;
  }

  tbody.innerHTML = apps.map(app => `<tr>
    <td><strong>${app.id}</strong></td>
    <td>${app.fullName || app.userName}</td>
    <td>${app.userEmail || ''}</td>
    <td>${app.package || '-'}</td>
    <td>${app.date}</td>
    <td><span class="status-badge ${app.paymentStatus.toLowerCase()}">${app.paymentStatus}</span></td>
    <td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td>
  </tr>`).join('');
}

// ===================================================================
// ADMIN APPROVE / CANCEL
// ===================================================================
function adminApprove(appId) {
  const apps = JSON.parse(localStorage.getItem('dsms-applications') || '[]');
  const idx = apps.findIndex(a => a.id === appId);
  if (idx !== -1) {
    apps[idx].status = 'Approved';
    localStorage.setItem('dsms-applications', JSON.stringify(apps));
    showToast(`Application ${appId} has been Approved!`);
    loadAdminData();
  }
}

function adminCancel(appId) {
  const apps = JSON.parse(localStorage.getItem('dsms-applications') || '[]');
  const idx = apps.findIndex(a => a.id === appId);
  if (idx !== -1) {
    apps[idx].status = 'Cancelled';
    localStorage.setItem('dsms-applications', JSON.stringify(apps));
    showToast(`Application ${appId} has been Cancelled.`, 'error');
    loadAdminData();
  }
}

// ===================================================================
// ADMIN PAYMENT TABLES
// ===================================================================
function renderAdminPaymentTables(apps) {
  const fullPaid = apps.filter(a => a.paymentStatus === 'Completed');
  const partial = apps.filter(a => a.paymentStatus === 'Partial');
  const remaining = apps.filter(a => a.paymentStatus === 'Pending' || a.paymentStatus === 'Partial');

  // Full payment table
  const fullBody = document.getElementById('fullPaymentTable');
  if (fullBody) {
    if (fullPaid.length === 0) {
      fullBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:30px;color:var(--text-muted)">No records</td></tr>`;
    } else {
      fullBody.innerHTML = fullPaid.map(app => {
        const total = app.totalAmount || PACKAGES[app.package] || 4999;
        return `<tr><td>${app.id}</td><td>${app.fullName || app.userName}</td><td>${app.package}</td><td>₹${total.toLocaleString('en-IN')}</td><td>₹${(app.amountPaid || total).toLocaleString('en-IN')}</td><td><span class="status-badge completed">Completed</span></td></tr>`;
      }).join('');
    }
  }

  // Partial payment table
  const partialBody = document.getElementById('partialPaymentTable');
  if (partialBody) {
    if (partial.length === 0) {
      partialBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:30px;color:var(--text-muted)">No partial payments</td></tr>`;
    } else {
      partialBody.innerHTML = partial.map(app => {
        const total = app.totalAmount || PACKAGES[app.package] || 4999;
        const paid = app.amountPaid || 0;
        const rem = total - paid;
        return `<tr><td>${app.id}</td><td>${app.fullName || app.userName}</td><td>${app.package}</td><td>₹${total.toLocaleString('en-IN')}</td><td>₹${paid.toLocaleString('en-IN')}</td><td>₹${rem.toLocaleString('en-IN')}</td><td><span class="status-badge partial">Partial</span></td></tr>`;
      }).join('');
    }
  }

  // Remaining payment table
  const remainBody = document.getElementById('remainingPaymentTable');
  if (remainBody) {
    if (remaining.length === 0) {
      remainBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:30px;color:var(--text-muted)">No pending payments</td></tr>`;
    } else {
      remainBody.innerHTML = remaining.map(app => {
        const total = app.totalAmount || PACKAGES[app.package] || 4999;
        const paid = app.amountPaid || 0;
        const rem = total - paid;
        return `<tr><td>${app.id}</td><td>${app.fullName || app.userName}</td><td>${app.package}</td><td>₹${total.toLocaleString('en-IN')}</td><td>₹${rem.toLocaleString('en-IN')}</td><td><span class="status-badge ${app.paymentStatus.toLowerCase()}">${app.paymentStatus}</span></td></tr>`;
      }).join('');
    }
  }
}

function renderEnquiries(enquiries, contacts) {
  const container = document.getElementById('enquiriesList');
  if (!container) return;
  const all = [...enquiries.map(e => ({ ...e, type: 'Enquiry' })), ...contacts.map(c => ({ ...c, type: 'Contact' }))];
  if (all.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><h3>No enquiries yet</h3><p>Enquiries submitted by users will appear here</p></div>`;
    return;
  }
  container.innerHTML = all.map(item => `
    <div class="enquiry-card">
      <div class="enquiry-header"><h4><i class="fas fa-user"></i> ${item.fullName || 'Unknown'}</h4><span class="date">${item.date || 'N/A'}</span></div>
      <div class="enquiry-body">
        <p><i class="fas fa-envelope"></i> ${item.email || ''}</p>
        <p><i class="fas fa-phone"></i> ${item.mobile || ''}</p>
        <p style="margin-top:8px">${item.enquiry || item.message || ''}</p>
      </div>
      <div class="reply-section">
        <textarea placeholder="Type your reply here..."></textarea>
        <button class="btn btn-primary btn-sm" onclick="showToast('Reply sent successfully!')"><i class="fas fa-paper-plane"></i> Send Reply</button>
      </div>
    </div>
  `).join('');
}

// ===================================================================
// DEMO DATA SEEDER
// ===================================================================
function seedDemoData() {
  if (localStorage.getItem('dsms-users')?.length > 2) return;

  const demoUsers = [
    { id: 1001, name: 'Rahul Sharma', email: 'rahul@example.com', mobile: '9876543210', password: 'rahul123', createdAt: '2025-01-15' },
    { id: 1002, name: 'Priya Singh', email: 'priya@example.com', mobile: '9876543211', password: 'priya123', createdAt: '2025-02-20' },
    { id: 1003, name: 'Amit Kumar', email: 'amit@example.com', mobile: '9876543212', password: 'amit1234', createdAt: '2025-03-10' }
  ];

  const demoApps = [
    { id: 'REG100001', userId: 1001, userName: 'Rahul Sharma', userEmail: 'rahul@example.com', fullName: 'Rahul Sharma', gender: 'Male', age: '22', package: 'Standard', date: '15/01/2025', status: 'Approved', paymentStatus: 'Completed', totalAmount: 7999, amountPaid: 7999 },
    { id: 'REG100002', userId: 1002, userName: 'Priya Singh', userEmail: 'priya@example.com', fullName: 'Priya Singh', gender: 'Female', age: '25', package: 'Premium', date: '20/02/2025', status: 'Approved', paymentStatus: 'Partial', totalAmount: 11999, amountPaid: 6000 },
    { id: 'REG100003', userId: 1003, userName: 'Amit Kumar', userEmail: 'amit@example.com', fullName: 'Amit Kumar', gender: 'Male', age: '19', package: 'Basic', date: '10/03/2025', status: 'Pending', paymentStatus: 'Pending', totalAmount: 4999, amountPaid: 0 }
  ];

  const demoEnquiries = [
    { id: 2001, fullName: 'Neha Patel', email: 'neha@example.com', mobile: '9988776655', enquiry: 'I want to know about weekend batches. Are they available?', date: '05/03/2025' },
    { id: 2002, fullName: 'Vikram Joshi', email: 'vikram@example.com', mobile: '8877665544', enquiry: 'What documents are required for enrollment?', date: '12/03/2025' }
  ];

  localStorage.setItem('dsms-users', JSON.stringify(demoUsers));
  localStorage.setItem('dsms-applications', JSON.stringify(demoApps));
  localStorage.setItem('dsms-enquiries', JSON.stringify(demoEnquiries));
}
