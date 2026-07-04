/* ============================================================
   Screen: Settings
   Dark mode toggle, language select, app info, about button
   ============================================================ */

App.registerScreen('settings', {
    render: function() {
        var currentLang = App.getLanguage();
        var currentTheme = Utils.getStorage('app_theme', 'dark');

        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;background:var(--color-bg);">' +
                '<div class="nav-bar">' +
                    '<button class="nav-back" id="settings-back">&#x2190; ' + App.t('app.back') + '</button>' +
                    '<div class="nav-title">' + App.t('settings.title') + '</div>' +
                '</div>' +

                '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;">' +
                    // Appearance section
                    '<div style="padding:var(--space-md) var(--space-lg) var(--space-xs);">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);">' + App.t('settings.appearance') + '</h3>' +
                    '</div>' +

                    // Theme selector
                    '<div class="list-item" style="cursor:default;">' +
                        '<div class="item-content">' +
                            '<div class="item-title">' + App.t('settings.theme') + '</div>' +
                        '</div>' +
                        '<div style="display:flex;gap:4px;">' +
                            '<button class="theme-selector-btn" data-theme="light" style="padding:6px 12px;border-radius:var(--radius-sm);border:1px solid var(--color-border);font-size:var(--font-size-footnote);cursor:pointer;background:' + (currentTheme === 'light' ? 'var(--color-primary)' : 'transparent') + ';color:' + (currentTheme === 'light' ? 'var(--color-text-inverse)' : 'var(--color-text)') + ';">' + App.t('settings.themeLight') + '</button>' +
                            '<button class="theme-selector-btn" data-theme="dark" style="padding:6px 12px;border-radius:var(--radius-sm);border:1px solid var(--color-border);font-size:var(--font-size-footnote);cursor:pointer;background:' + (currentTheme === 'dark' ? 'var(--color-primary)' : 'transparent') + ';color:' + (currentTheme === 'dark' ? 'var(--color-text-inverse)' : 'var(--color-text)') + ';">' + App.t('settings.themeDark') + '</button>' +
                        '</div>' +
                    '</div>' +

                    // Language selector
                    '<div class="list-item" style="cursor:default;">' +
                        '<div class="item-content">' +
                            '<div class="item-title">' + App.t('settings.language') + '</div>' +
                        '</div>' +
                        '<div style="display:flex;gap:4px;">' +
                            '<button class="lang-selector-btn" data-lang="en" style="padding:6px 12px;border-radius:var(--radius-sm);border:1px solid var(--color-border);font-size:var(--font-size-footnote);cursor:pointer;background:' + (currentLang === 'en' ? 'var(--color-primary)' : 'transparent') + ';color:' + (currentLang === 'en' ? 'var(--color-text-inverse)' : 'var(--color-text)') + ';">' + App.t('settings.languageEn') + '</button>' +
                            '<button class="lang-selector-btn" data-lang="bn" style="padding:6px 12px;border-radius:var(--radius-sm);border:1px solid var(--color-border);font-size:var(--font-size-footnote);cursor:pointer;background:' + (currentLang === 'bn' ? 'var(--color-primary)' : 'transparent') + ';color:' + (currentLang === 'bn' ? 'var(--color-text-inverse)' : 'var(--color-text)') + ';">' + App.t('settings.languageBn') + '</button>' +
                        '</div>' +
                    '</div>' +

                    // Notifications section
                    '<div style="padding:var(--space-md) var(--space-lg) var(--space-xs);margin-top:var(--space-md);">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);">' + App.t('settings.notifications') + '</h3>' +
                    '</div>' +

                    '<div class="list-item" style="cursor:pointer;" id="settings-notifications">' +
                        '<div class="item-content">' +
                            '<div class="item-title">' + App.t('notifications.title') + '</div>' +
                            '<div class="item-subtitle">' + App.t('notifications.enablePush') + '</div>' +
                        '</div>' +
                        '<span style="color:var(--color-text-medium);font-size:20px;">&#x203A;</span>' +
                    '</div>' +

                    // Info section
                    '<div style="padding:var(--space-md) var(--space-lg) var(--space-xs);margin-top:var(--space-md);">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);">' + App.t('settings.appInfo') + '</h3>' +
                    '</div>' +

                    '<div class="list-item" style="cursor:pointer;" id="settings-about">' +
                        '<div class="item-content">' +
                            '<div class="item-title">' + App.t('settings.about') + '</div>' +
                            '<div class="item-subtitle">' + App.t('settings.appVersion') + ' ' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '?') + '</div>' +
                        '</div>' +
                        '<span style="color:var(--color-text-medium);font-size:20px;">&#x203A;</span>' +
                    '</div>' +

                    '<div class="list-item" style="cursor:pointer;" id="settings-privacy">' +
                        '<div class="item-content">' +
                            '<div class="item-title">' + App.t('settings.privacyPolicy') + '</div>' +
                        '</div>' +
                        '<span style="color:var(--color-text-medium);font-size:20px;">&#x203A;</span>' +
                    '</div>' +

                    '<div class="list-item" style="cursor:pointer;" id="settings-terms">' +
                        '<div class="item-content">' +
                            '<div class="item-title">' + App.t('settings.termsOfService') + '</div>' +
                        '</div>' +
                        '<span style="color:var(--color-text-medium);font-size:20px;">&#x203A;</span>' +
                    '</div>' +

                    '<div class="list-item" style="cursor:pointer;" id="settings-clear-cache">' +
                        '<div class="item-content">' +
                            '<div class="item-title">' + App.t('settings.clearCache') + '</div>' +
                        '</div>' +
                    '</div>' +

                    // Bottom spacing
                    '<div style="height:var(--space-xl);"></div>' +
                '</div>' +

                // Tab Bar
                '<div class="tab-bar">' +
                    '<div class="tab-item" data-tab="dashboard">&#x1F3E0;<span>' + App.t('dashboard.title') + '</span></div>' +
                    '<div class="tab-item" data-tab="list">&#x1F4CB;<span>' + App.t('list.title') + '</span></div>' +
                    '<div class="tab-item" data-tab="chat">&#x1F4AC;<span>Chat</span></div>' +
                    '<div class="tab-item active" data-tab="settings">&#x2699;&#xFE0F;<span>' + App.t('settings.title') + '</span></div>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        // Back
        document.getElementById('settings-back').addEventListener('click', function() { App.goBack(); });

        // Theme selectors
        document.querySelectorAll('.theme-selector-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var theme = btn.getAttribute('data-theme');
                Utils.setStorage('app_theme', theme);
                // Reload theme CSS
                var link = document.getElementById('theme-link');
                if (link) {
                    link.href = 'css/theme-' + theme + '.css';
                }
                // Refresh screen to update button highlights
                App.showScreen('settings');
            });
        });

        // Language selectors
        document.querySelectorAll('.lang-selector-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var lang = btn.getAttribute('data-lang');
                App.setLanguage(lang);
                // Reload translations
                _loadTranslations(lang);
                // Refresh screen
                App.showScreen('settings');
            });
        });

        // Navigate to notifications
        document.getElementById('settings-notifications').addEventListener('click', function() {
            App.loadFeature('notifications', document.createElement('div'));
            Utils.showInfo('Notification settings');
        });

        // About
        document.getElementById('settings-about').addEventListener('click', function() {
            App.showScreen('about');
        });

        // Privacy
        document.getElementById('settings-privacy').addEventListener('click', function() {
            App.showScreen('privacy');
        });

        // Terms
        document.getElementById('settings-terms').addEventListener('click', function() {
            App.showScreen('terms');
        });

        // Clear cache
        document.getElementById('settings-clear-cache').addEventListener('click', function() {
            App.showDialog(App.t('settings.clearCache'), App.t('settings.clearCacheConfirm'), [
                { text: App.t('app.cancel') },
                { text: App.t('settings.clearCache'), primary: true, onClick: function() {
                    Utils.clearStorage();
                    Utils.setStorage('onboarding_done', true);
                    Utils.setStorage('app_language', App.getLanguage());
                    Utils.setStorage('app_theme', Utils.getStorage('app_theme', 'dark'));
                    Utils.showSuccess(App.t('settings.cacheCleared'));
                }}
            ]);
        });

        // Tab bar
        document.querySelectorAll('.tab-item').forEach(function(tab) {
            tab.addEventListener('click', function() {
                var t = tab.getAttribute('data-tab');
                switch (t) {
                    case 'dashboard': App.showScreen('dashboard'); break;
                    case 'list': App.showScreen('list'); break;
                    case 'chat': App.showScreen('detail', { feature: 'chat' }); break;
                    case 'settings': break;
                }
            });
        });
    },
    destroy: function() {}
});

function _loadTranslations(lang) {
    // Load JSON translation files
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'i18n/' + lang + '.json', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                var trans = JSON.parse(xhr.responseText);
                App.setTranslations(trans);
            } catch (e) {
                console.warn('Translation parse error:', e);
            }
        } else {
            // Try English as fallback
            if (lang !== 'en') _loadTranslations('en');
        }
    };
    xhr.onerror = function() {
        console.warn('Failed to load translations');
    };
    xhr.send();
}
