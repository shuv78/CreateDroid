/* ============================================================
   Screen: Login
   Full login with ID+Password OR Phone+Password toggle,
   version badge, fingerprint button, error messages
   ============================================================ */

App.registerScreen('login', {
    render: function() {
        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;background:var(--color-bg);">' +
                '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:var(--space-xl);">' +
                    // Logo / Brand
                    '<div style="text-align:center;margin-bottom:var(--space-xl);">' +
                        '<div style="width:80px;height:80px;border-radius:20px;background:var(--color-primary);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:40px;color:var(--color-text-inverse);box-shadow:0 8px 24px rgba(0,0,0,0.2);">&#x1F310;</div>' +
                        '<h1 style="font-size:var(--font-size-title1);font-weight:700;color:var(--color-text);margin-bottom:4px;">' + App.t('login.title') + '</h1>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);">' + App.t('login.subtitle') + '</p>' +
                    '</div>' +

                    // Login method toggle
                    '<div class="segmented-control" id="login-method-toggle">' +
                        '<div class="segment active" data-method="email">' + App.t('login.loginWithEmail') + '</div>' +
                        '<div class="segment" data-method="phone">' + App.t('login.loginWithPhone') + '</div>' +
                    '</div>' +

                    // Email login form
                    '<div id="login-email-form">' +
                        '<div class="input-group">' +
                            '<label for="login-email">' + App.t('login.emailLabel') + '</label>' +
                            '<input type="email" id="login-email" class="input-field" placeholder="' + App.t('login.emailPlaceholder') + '" autocomplete="email" autocapitalize="off" />' +
                        '</div>' +
                    '</div>' +

                    // Phone login form (hidden by default)
                    '<div id="login-phone-form" style="display:none;">' +
                        '<div class="input-group">' +
                            '<label for="login-phone">' + App.t('login.phoneLabel') + '</label>' +
                            '<input type="tel" id="login-phone" class="input-field" placeholder="' + App.t('login.phonePlaceholder') + '" autocomplete="tel" />' +
                        '</div>' +
                    '</div>' +

                    // Password
                    '<div class="input-group">' +
                        '<label for="login-password">' + App.t('login.passwordLabel') + '</label>' +
                        '<input type="password" id="login-password" class="input-field" placeholder="' + App.t('login.passwordPlaceholder') + '" autocomplete="current-password" />' +
                    '</div>' +

                    // Error message
                    '<div id="login-error" style="display:none;padding:12px;background:rgba(218,54,51,0.1);border:1px solid rgba(218,54,51,0.3);border-radius:var(--radius-sm);margin-bottom:var(--space-md);color:var(--color-error);font-size:var(--font-size-footnote);text-align:center;"></div>' +

                    // Login button
                    '<button class="btn btn-primary" style="width:100%;margin-bottom:12px;" id="login-button">' + App.t('login.loginButton') + '</button>' +

                    // Forgot password
                    '<button class="btn btn-outline" style="width:100%;margin-bottom:12px;" id="login-forgot">' + App.t('login.forgotPassword') + '</button>' +

                    // Biometric (placeholder)
                    '<div style="text-align:center;margin-bottom:var(--space-md);">' +
                        '<button id="login-biometric" style="width:48px;height:48px;border-radius:50%;background:var(--color-bg-input);border:1px solid var(--color-border);cursor:pointer;font-size:24px;display:inline-flex;align-items:center;justify-content:center;">&#x1F9B5;</button>' +
                    '</div>' +

                    // Register link
                    '<div style="text-align:center;">' +
                        '<span style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('login.noAccount') + '</span> ' +
                        '<a href="#" id="login-register-link" style="font-size:var(--font-size-footnote);color:var(--color-text-link);text-decoration:none;font-weight:600;">' + App.t('login.registerLink') + '</a>' +
                    '</div>' +
                '</div>' +

                // Version badge
                '<div style="text-align:center;padding:8px;padding-bottom:calc(8px + env(safe-area-inset-bottom, 0));">' +
                    '<span style="font-size:11px;color:var(--color-text-medium);">v' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.0.0') + '</span>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        var method = 'email';
        var emailForm = document.getElementById('login-email-form');
        var phoneForm = document.getElementById('login-phone-form');
        var segments = document.querySelectorAll('.segment');
        var loginBtn = document.getElementById('login-button');
        var errorDiv = document.getElementById('login-error');
        var forgotBtn = document.getElementById('login-forgot');

        // Toggle login method
        segments.forEach(function(seg) {
            seg.addEventListener('click', function() {
                segments.forEach(function(s) { s.classList.remove('active'); });
                seg.classList.add('active');
                method = seg.getAttribute('data-method');
                if (emailForm) emailForm.style.display = (method === 'email') ? '' : 'none';
                if (phoneForm) phoneForm.style.display = (method === 'phone') ? '' : 'none';
                if (errorDiv) errorDiv.style.display = 'none';
            });
        });

        // Login action
        function doLogin() {
            if (errorDiv) errorDiv.style.display = 'none';

            var email = document.getElementById('login-email');
            var phone = document.getElementById('login-phone');
            var password = document.getElementById('login-password');

            var identifier = (method === 'email')
                ? (email ? email.value.trim() : '')
                : (phone ? phone.value.trim() : '');
            var pass = password ? password.value : '';

            // Validation
            if (!identifier) {
                showError(method === 'email' ? 'Please enter your email' : 'Please enter your phone number');
                return;
            }
            if (!pass) {
                showError('Please enter your password');
                return;
            }

            loginBtn.disabled = true;
            loginBtn.textContent = 'Signing in...';

            var loginPromise;
            if (method === 'email') {
                loginPromise = Auth.loginWithEmail(identifier, pass);
            } else {
                loginPromise = Auth.loginWithPhone(identifier, pass);
            }

            loginPromise
                .then(function(user) {
                    Utils.showSuccess('Welcome back!');
                    App.showScreen('dashboard');
                })
                .catch(function(error) {
                    showError(error.message || 'Login failed. Please try again.');
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Sign In';
                });
        }

        function showError(msg) {
            if (errorDiv) {
                errorDiv.textContent = msg;
                errorDiv.style.display = 'block';
            } else {
                Utils.showErrorToast(msg);
            }
        }

        // Login button
        if (loginBtn) {
            loginBtn.addEventListener('click', doLogin);
        }

        // Enter key support
        var inputs = ['login-email', 'login-phone', 'login-password'].map(function(id) {
            return document.getElementById(id);
        });
        inputs.forEach(function(inp) {
            if (inp) {
                inp.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') doLogin();
                });
            }
        });

        // Forgot password
        if (forgotBtn) {
            forgotBtn.addEventListener('click', function() {
                var email = document.getElementById('login-email');
                var emailVal = email ? email.value.trim() : '';
                if (!emailVal || !Utils.isValidEmail(emailVal)) {
                    showError('Please enter a valid email first');
                    return;
                }
                Auth.resetPassword(emailVal)
                    .then(function(msg) {
                        Utils.showSuccess(msg);
                    })
                    .catch(function(error) {
                        showError(error.message);
                    });
            });
        }

        // Register link
        var registerLink = document.getElementById('login-register-link');
        if (registerLink) {
            registerLink.addEventListener('click', function(e) {
                e.preventDefault();
                App.showDialog('Register', 'Registration form would appear here.', [
                    { text: 'OK', primary: true }
                ]);
            });
        }

        // Biometric
        var bioBtn = document.getElementById('login-biometric');
        if (bioBtn) {
            bioBtn.addEventListener('click', function() {
                Utils.showInfo('Biometric login - implement with cordova-plugin-fingerprint-aio');
            });
        }
    },
    destroy: function() {}
});
